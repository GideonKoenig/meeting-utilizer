import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createChat, parseFromDB } from "./chat-utils";
import { Message } from "ai/react";
import { Cctv } from "lucide-react";

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

            const chat = await createChat(
                input.meetingId,
                input.name,
                input.model,
            );
            return parseFromDB(chat);
        }),
    setMessages: protectedProcedure
        .input(
            z.object({
                chatId: z.string(),
                messages: z.array(z.unknown()),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const chat = await ctx.db.chat.findFirst({
                where: { id: input.chatId },
            });

            if (!chat) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Unable to locate chat <${input.chatId}>}.`,
                });
            }

            console.log("Mow the printing starts");
            console.dir(input.messages);
            console.dir(input.messages as Meeting[]);
            console.dir((input.messages as Meeting[]).toString());

            // await ctx.db.chat.update({
            //     where: { id: input.chatId },
            //     data: {
            //         messages: (input.messages as Meeting[]).toString(),
            //     },
            // });
            return { message: "success" };
        }),
});
