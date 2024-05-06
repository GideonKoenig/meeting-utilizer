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

            const systemPrompt = `Du bist ein hochqualifizierter Assistent für Zusammenfassungen und hast die Aufgabe, einen detaillierten, fließenden Bericht aus einem vorgegebenen Transkript zu erstellen. Das Format, das du erzeugst, ist Markdown.`;
            const userPrompt = `Das Ziel ist es, einen zusammenhängenden Bericht zu erstellen, der alle wichtigen Themen, Punkte, Entscheidungen und Handlungen enthält, die in dem folgenden Transkript besprochen wurden. Das Ergebnis sollte ein umfassender Bericht sein, der dem Leser ein vollständiges Verständnis der Diskussionen in dem Transkript vermittelt, unabhängig davon, ob er anwesend war oder nicht.\n\n${transcript.text}`;
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
