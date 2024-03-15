import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
    addMessage,
    createChat,
    createMessage,
    parseFromDB,
} from "./chat-utils";
import { parseFromDB as parseTranscriptFromDB } from "./transcript-utils";

export const chatRouter = createTRPCRouter({
    getList: protectedProcedure
        .input(z.object({ meetingId: z.string() }))
        .query(async ({ ctx, input }) => {
            const chatList = await ctx.db.chat.findMany({
                where: { meeting: { id: input.meetingId } },
            });

            if (!chatList) {
                return undefined;
            }

            return chatList.map((chat) => {
                return parseFromDB(chat);
            });
        }),
    get: protectedProcedure
        .input(z.object({ chatId: z.string() }))
        .query(async ({ ctx, input }) => {
            const chat = await ctx.db.chat.findFirst({
                where: { id: input.chatId },
            });

            if (!chat) {
                return undefined;
            }

            return parseFromDB(chat);
        }),
    create: protectedProcedure
        .input(
            z.object({
                meetingId: z.string(),
                name: z.string().optional(),
                model: z.string().optional(),
            }),
        )
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

            function isTranscriptDone(
                transcript: TranscriptWithUnknownStatus,
            ): transcript is FullTranscript {
                return transcript.status === "done";
            }
            const transcriptParsed = parseTranscriptFromDB(transcript);

            if (!isTranscriptDone(transcriptParsed)) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Transcript for meeting <${input.meetingId}>} isn't ready yet.`,
                });
            }

            const chat = await createChat(
                input.meetingId,
                input.name,
                input.model,
            );
            return parseFromDB(
                await addMessage(
                    parseFromDB(chat).id,
                    createMessage(
                        "system",
                        `Here is the transcript:\n${transcriptParsed.text}`,
                    ),
                ),
            );
        }),
    addMessage: protectedProcedure
        .input(
            z.object({
                chatId: z.string(),
                content: z.string(),
                role: z.enum(["system", "user", "assistant"]),
            }),
        )
        .mutation(async ({ input }) => {
            await addMessage(
                input.chatId,
                createMessage(input.role, input.content),
            );
            return { message: "success" };
        }),
});
