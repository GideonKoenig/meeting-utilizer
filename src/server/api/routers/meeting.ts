import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { UTApi } from "uploadthing/server";
import { createMeeting } from "./meeting-utils";

export const meetingRouter = createTRPCRouter({
    getAllOwned: protectedProcedure.query(async ({ ctx }) => {
        const meetings: Meeting[] = await ctx.db.meeting.findMany({
            where: { createdBy: { id: ctx.session.user.id } },
        });
        return meetings;
    }),
    create: protectedProcedure
        .input(z.object({ name: z.string(), url: z.string().url() }))
        .mutation(async ({ ctx, input }) => {
            const meeting = await createMeeting(
                input.url,
                input.name,
                ctx.session.user.id,
            );

            return {
                data: {
                    ...meeting,
                },
            };
        }),
    delete: protectedProcedure
        .input(z.object({ meetingId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const utapi = new UTApi();

            const success = await utapi.deleteFiles(input.meetingId);

            if (!success) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Unable to remove resource from UPLOADTHING <${input.meetingId}>}.`,
                });
            }

            const chat = await ctx.db.chat.findFirst({
                where: { meeting: { id: input.meetingId } },
            });
            if (chat) {
                await ctx.db.chat.deleteMany({
                    where: { meetingId: input.meetingId },
                });
            }
            const summary = await ctx.db.summary.findFirst({
                where: { meeting: { id: input.meetingId } },
            });
            if (summary) {
                await ctx.db.summary.delete({
                    where: { meetingId: input.meetingId },
                });
            }
            const transcript = await ctx.db.transcript.findFirst({
                where: { meeting: { id: input.meetingId } },
            });
            if (transcript) {
                await ctx.db.transcript.delete({
                    where: { meetingId: input.meetingId },
                });
            }
            await ctx.db.meetingToUser.deleteMany({
                where: { meetingId: input.meetingId },
            });
            await ctx.db.meeting.delete({ where: { id: input.meetingId } });

            return { message: "ok" };
        }),
    rename: protectedProcedure
        .input(z.object({ meetingId: z.string(), newName: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.meeting.update({
                where: { id: input.meetingId },
                data: { name: input.newName },
            });
        }),
});
