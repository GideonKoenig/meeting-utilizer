import { createClient } from "@deepgram/sdk";

export const meetingRouter = createTRPCRouter({
    getAllOwned: protectedProcedure.query(async ({ ctx }) => {
        const meetings: Meeting[] = await ctx.db.meeting.findMany({
            where: { createdBy: { id: ctx.session.user.id } },
        });
        return meetings;
    }),
});
