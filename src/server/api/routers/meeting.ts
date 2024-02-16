import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { url } from "inspector";

export const meetingRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({ name: z.string(), url: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            return ctx.db.meeting.create({
                data: {
                    name: input.name,
                    createdBy: { connect: { id: userId } },
                    user: {
                        create: [{ user: { connect: { id: userId } } }],
                    },
                    url: input.url,
                },
            });
        }),
});
