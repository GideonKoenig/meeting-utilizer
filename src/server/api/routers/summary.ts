import OpenAI from "openai";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { env } from "~/env";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createSummarySkeleton, parseFromDB } from "./summary-utils";

export const summaryRouter = createTRPCRouter({
    get: protectedProcedure
        .input(z.object({ meetingId: z.string() }))
        .query(async ({ ctx, input }) => {
            const summary = await ctx.db.summary.findFirst({
                where: { meeting: { id: input.meetingId } },
            });

            if (!summary) {
                return undefined;
            }

            return parseFromDB(summary);
        }),
    setStatus: protectedProcedure
        .input(
            z.object({
                meetingId: z.string(),
                status: z.enum(["done", "pending", "error", "ready"]),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db.summary.update({
                where: {
                    meetingId: input.meetingId,
                },
                data: {
                    status: input.status,
                },
            });
        }),
    createSkeleton: protectedProcedure
        .input(z.object({ meetingId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const meeting: Meeting | null = await ctx.db.meeting.findFirst({
                where: { id: input.meetingId },
            });

            if (!meeting) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Unable to locate meeting <${input.meetingId}>}.`,
                });
            }

            await createSummarySkeleton(input.meetingId);
            return true;
        }),
    populate: protectedProcedure
        .input(z.object({ meetingId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const meeting: Meeting | null = await ctx.db.meeting.findFirst({
                where: { id: input.meetingId },
            });

            if (!meeting) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Unable to locate meeting <${input.meetingId}>}.`,
                });
            }

            const transcript = await ctx.db.transcript.findFirst({
                where: { meetingId: input.meetingId },
            });

            if (!transcript) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Unable to locate transcript for meeting <${input.meetingId}>}.`,
                });
            }

            const tmp = await ctx.db.summary.findFirst({
                where: { meetingId: input.meetingId },
            });

            if (!tmp) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Unable to locate summary for meeting <${input.meetingId}>}.`,
                });
            }

            const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

            const systemPrompt = `You are a highly skilled summarization assistant tasked with creating a detailed, flowing report from a given transcript. The format you produce is markdown.`;
            const userPrompt = `Your objective is to create a cohesive narrative that captures all key topics, points, decisions, and actions discussed throughout the following transcript. Your output should serve as a comprehensive report, offering readers a complete understanding of the transcript discussions, regardless of their attendance.\n\n${transcript.text}`;
            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                    {
                        role: "user",
                        content: `${userPrompt}\n\n${transcript.text}`,
                    },
                ],
                model: "gpt-4-turbo-preview",
            });

            const model = completion.model;
            const text = completion.choices[0]?.message.content;

            const done: Status = "done";
            const summary = await ctx.db.summary.update({
                where: {
                    meetingId: input.meetingId,
                },
                data: {
                    status: done,
                    createdAt: new Date(),
                    model: model,
                    summary: text,
                    rawResponse: JSON.stringify(completion),
                },
            });

            return parseFromDB(summary) as Summary<"done">;
        }),
});
