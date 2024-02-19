import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { UTApi } from "uploadthing/server";

export const meetingRouter = createTRPCRouter({
    getAllOwned: protectedProcedure.query(async ({ ctx }) => {
        const meetings: Meeting[] = await ctx.db.meeting.findMany({
            where: { createdBy: { id: ctx.session.user.id } },
        });
        return meetings;
    }),
    // create: protectedProcedure
    //     .input(z.object({ name: z.string(), url: z.string().url() }))
    //     .mutation(async ({ ctx, input }) => {
    //         const meeting = await ctx.db.meeting.create({
    //             data: {
    //                 id: input.url.substring(input.url.lastIndexOf("/") + 1),
    //                 name: input.name,
    //                 url: input.url,
    //                 createdBy: { connect: { id: ctx.session.user.id } },
    //             },
    //         });

    //         await ctx.db.meetingToUser.create({
    //             data: {
    //                 meeting: { connect: { id: meeting.id } },
    //                 user: { connect: { id: ctx.session.user.id } },
    //             },
    //         });

    //         return {
    //             data: {
    //                 ...meeting,
    //             },
    //         };
    //     }),
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

            await ctx.db.transcript.delete({
                where: { meetingId: input.meetingId },
            });
            await ctx.db.meetingToUser.deleteMany({
                where: { meetingId: input.meetingId },
            });
            await ctx.db.meeting.delete({ where: { id: input.meetingId } });

            return { message: "ok" };
        }),
});
