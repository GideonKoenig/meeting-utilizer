import { createTRPCRouter } from "~/server/api/trpc";
import { meetingRouter } from "./routers/meeting";
import { transcriptRouter } from "./routers/transcript";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    meeting: meetingRouter,
    transcript: transcriptRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
