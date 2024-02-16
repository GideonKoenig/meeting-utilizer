import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const meetingRouter = createTRPCRouter({
    getAllOwned: protectedProcedure.query(async ({ ctx }) => {
        const meetings: Meeting[] = await ctx.db.meeting.findMany({
            orderBy: { createdAt: "desc" },
            where: { createdBy: { id: ctx.session.user.id } },
        });
        return meetings;
    }),
    create: protectedProcedure
        .input(z.object({ name: z.string(), url: z.string().url() }))
        .mutation(async ({ ctx, input }) => {
            const meeting = await ctx.db.meeting.create({
                data: {
                    name: input.name,
                    url: input.url,
                    createdBy: { connect: { id: ctx.session.user.id } },
                },
            });

            await ctx.db.meetingToUser.create({
                data: {
                    meeting: { connect: { id: meeting.id } },
                    user: { connect: { id: ctx.session.user.id } },
                },
            });

            return {
                data: {
                    ...meeting,
                },
            };
        }),
    delete: protectedProcedure
        .input(z.object({ meetingId: z.string() }))
        .mutation(async (ctx, input) => {
            return 0;
        }),
});
