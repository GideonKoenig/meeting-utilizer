import { type DeepgramClient, createClient } from "@deepgram/sdk";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { env } from "~/env";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { api } from "~/trpc/server";

export const transcriptRouter = createTRPCRouter({
    get: protectedProcedure
        .input(z.object({ meetingId: z.string() }))
        .query(async ({ ctx, input }) => {
            const transcript: Transcript | null =
                await ctx.db.transcript.findFirst({
                    where: { meeting: { id: input.meetingId } },
                });

            return transcript ? transcript : undefined;
        }),
    create: protectedProcedure
        .input(z.object({ meetingId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const deepgram: DeepgramClient = createClient(env.DEEPGRAM_API_KEY);
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
                        smart_format: true,
                        // punctuate: undefined, // included in smart_format
                        // paragraphs: undefined, // included in smart_format                        version: "latest",
                        // language: undefined,
                        detect_language: true,
                        // profanity_filter: false,
                        // redact: false, // english only - not sure though
                        diarize: true,
                        // filler_words: false,
                        // multichannel: false,
                        // numerals: false, // english only
                        // search: undefined,
                        // replace: undefined, // max is 200
                        // callback: undefined,
                        // keywords: [], // max 50
                        // tag: undefined,
                        // detect_entities: false, // english only - beta feature
                        // topics: false, // english only
                        // detect_topics: false, // seems to be the same as topics - keep in sync
                        // custom_topic: undefined,
                        // custom_intent_mode: undefined,
                        // summarize: false, // english only
                        // utterances: false, // not sure what this is
                        // utt_split: undefined, // default is 0.8 (s)
                    },
                );

            if (error) {
                error.message = `${error.name}: ${error.message}`;
                throw error;
            }

            /* The Type definition from deepgram is imperfect */
            const resultTyped: CustomResponseType =
                result as CustomResponseType;

            // console.dir(result, { depth: null });

            const paragraphs =
                resultTyped.results.channels[0]?.alternatives[0]?.paragraphs
                    ?.paragraphs;

            const transcriptText = !paragraphs
                ? ""
                : paragraphs
                      .map((paragraph) => {
                          const speaker = paragraph.speaker;
                          const start = stringifyTimestamp(paragraph.start);
                          const end = stringifyTimestamp(paragraph.end);
                          const text = paragraph.sentences
                              .map((sentence) => {
                                  return sentence.text;
                              })
                              .join(" ");

                          return `${start} - ${end} Speaker ${speaker}: ${text}`;
                      })
                      .join("\n");

            const transcript: Transcript = await ctx.db.transcript.create({
                data: {
                    text: transcriptText,
                    meeting: { connect: { id: input.meetingId } },
                    rawResponse: JSON.stringify(result),
                },
            });

            return transcript;
        }),
    /* This has to be done differently. The logic should get extracted into a function that is called by both endpoints*/
    // getOrCreate: protectedProcedure
    //     .input(z.object({ meetingId: z.string() }))
    //     .mutation(async ({ ctx, input }) => {
    //         const entry: Transcript | null = transcriptRouter.get({
    //             meetingId: input.meetingId,
    //         });

    //         if (entry) {
    //             return entry;
    //         }
    //         return null;

    //         // const tmp = await api.
    //     }),
});

function stringifyTimestamp(seconds: number): string {
    const hours: number = Math.floor(seconds / 3600);
    const minutes: number = Math.floor((seconds % 3600) / 60);
    const remainingSeconds: number = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toFixed(2).padStart(5, "0")}`;
}

type CustomResponseType = typeof samnpleResponseForTypeDefinition;

const samnpleResponseForTypeDefinition = {
    metadata: {
        transaction_key: "deprecated",
        request_id: "c02b9124-6283-4ade-bc88-ed81c91c9732",
        sha256: "4f72cd1c359d041edb232a65dcb749903357b49688878bbacd2731dad3ba5431",
        created: "2024-02-18T15:17:37.407Z",
        duration: 4.92,
        channels: 1,
        models: ["5dfee07e-f258-48ad-8238-c7454cc20964"],
        model_info: {
            "5dfee07e-f258-48ad-8238-c7454cc20964": {
                name: "2-general-nova",
                version: "2023-11-27.5762",
                arch: "nova-2",
            },
        },
    },
    results: {
        channels: [
            {
                alternatives: [
                    {
                        transcript: "Test, hallo, guten Morgen.",
                        confidence: 0.99316406,
                        words: [
                            {
                                word: "test",
                                start: 0.96,
                                end: 1.46,
                                confidence: 0.82470703,
                                speaker: 0,
                                speaker_confidence: 1,
                                punctuated_word: "Test,",
                            },
                            {
                                word: "hallo",
                                start: 1.52,
                                end: 2.02,
                                confidence: 0.8059082,
                                speaker: 0,
                                speaker_confidence: 1,
                                punctuated_word: "hallo,",
                            },
                            {
                                word: "guten",
                                start: 2.24,
                                end: 2.72,
                                confidence: 0.99902344,
                                speaker: 0,
                                speaker_confidence: 1,
                                punctuated_word: "guten",
                            },
                            {
                                word: "morgen",
                                start: 2.72,
                                end: 3.22,
                                confidence: 0.99316406,
                                speaker: 0,
                                speaker_confidence: 1,
                                punctuated_word: "Morgen.",
                            },
                        ],
                        paragraphs: {
                            transcript:
                                "\nSpeaker 0: Test, hallo, guten Morgen.",
                            paragraphs: [
                                {
                                    sentences: [
                                        {
                                            text: "Test, hallo, guten Morgen.",
                                            start: 0.96,
                                            end: 3.22,
                                        },
                                    ],
                                    speaker: 0,
                                    num_words: 4,
                                    start: 0.96,
                                    end: 3.22,
                                },
                            ],
                        },
                    },
                ],
                detected_language: "de",
                language_confidence: 0.99291784,
            },
        ],
    },
};
