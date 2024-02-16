import { createClient } from "@deepgram/sdk";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { env } from "~/env";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const transcriptRouter = createTRPCRouter({
    transcribe: protectedProcedure
        .input(z.object({ meetingId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const deepgram = createClient(env.DEEPGRAM_API_KEY);
            const meeting: Meeting | null = await ctx.db.meeting.findFirst({
                where: { id: input.meetingId },
            });

            if (!meeting) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Unable to locate meeting <${input.meetingId}>}.`,
                });
            }

            const { result, error } =
                await deepgram.listen.prerecorded.transcribeUrl(
                    {
                        url: meeting.url,
                    },
                    {
                        model: "nova-2-general",
                        version: "latest",
                        language: undefined,
                        detect_language: true,
                        profanity_filter: false,
                        redact: false, // english only - not sure though
                        diarize: true,
                        smart_format: true,
                        punctuate: undefined, // included in smart_format
                        paragraphs: undefined, // included in smart_format
                        filler_words: false,
                        multichannel: false,
                        numerals: false, // english only
                        search: undefined,
                        replace: undefined, // max is 200
                        callback: undefined,
                        keywords: [], // max 50
                        tag: undefined,
                        detect_entities: false, // english only - beta feature
                        topics: false, // english only
                        detect_topics: false, // seems to be the same as topics - keep in sync
                        custom_topic: undefined,
                        custom_intent_mode: undefined,
                        summarize: false, // english only
                        utterances: false, // not sure what this is
                        utt_split: undefined, // default is 0.8 (s)
                    },
                );

            if (error) throw error;

            console.dir(result, { depth: null });

            // const meetings: Meeting[] = await ctx.db.meeting.findMany({
            //     where: { createdBy: { id: ctx.session.user.id } },
            // });
            // return meetings;
        }),
});
