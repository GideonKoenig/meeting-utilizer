import { type DeepgramClient, createClient } from "@deepgram/sdk";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { env } from "~/env";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
    type CustomResponseType,
    createTranscriptSkeleton,
    parseFromDB,
    stringifyTimestamp,
} from "./transcript-utils";

export const transcriptRouter = createTRPCRouter({
    get: protectedProcedure
        .input(z.object({ meetingId: z.string() }))
        .query(async ({ ctx, input }) => {
            const transcript = await ctx.db.transcript.findFirst({
                where: { meeting: { id: input.meetingId } },
            });

            if (!transcript) {
                return undefined;
            }

            return parseFromDB(transcript);
        }),
    setStatus: protectedProcedure
        .input(
            z.object({
                meetingId: z.string(),
                status: z.enum(["done", "pending", "error", "ready"]),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db.transcript.update({
                where: {
                    meetingId: input.meetingId,
                },
                data: {
                    status: input.status,
                },
            });
        }),
    createSkeleton: protectedProcedure
        .input(z.object({ meetingId: z.string() }))
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

            await createTranscriptSkeleton(input.meetingId);
            return true;
        }),
    populate: protectedProcedure
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

            const tmp = await ctx.db.transcript.findFirst({
                where: { meetingId: input.meetingId },
            });

            if (!tmp) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Unable to locate transcript for meeting <${input.meetingId}>}.`,
                });
            }

            const { result, error } =
                await deepgram.listen.prerecorded.transcribeUrl(
                    {
                        url: meeting.url,
                    },
                    {
                        model: "nova-2-general" /* whisper-large */,
                        smart_format: true,
                        // punctuate: undefined, // included in smart_format
                        // paragraphs: undefined, // included in smart_format
                        // version: "latest",
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

            const transcriptJSON: {
                startTime: number;
                endTime: number;
                speakerId: number;
                sentence: string;
            }[] = !paragraphs
                ? []
                : paragraphs.map((paragraph) => {
                      return {
                          speakerId: paragraph.speaker,
                          startTime: paragraph.start,
                          endTime: paragraph.end,
                          sentence: paragraph.sentences
                              .map((sentence) => {
                                  return sentence.text;
                              })
                              .join(" "),
                      };
                  });

            const done: Status = "done";
            const transcript = await ctx.db.transcript.update({
                where: {
                    meetingId: input.meetingId,
                },
                data: {
                    status: done,
                    createdAt: new Date(),
                    model: "2-general-nova",
                    text: transcriptText,
                    transcriptParagraphs: JSON.stringify(transcriptJSON),
                    rawResponse: JSON.stringify(result),
                },
            });

            const summary = await ctx.db.summary.findFirst({
                where: { meetingId: input.meetingId },
            });

            if (!summary) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Unable to locate summary for meeting <${input.meetingId}>}.`,
                });
            }
            const newStatus: Status = "ready";
            await ctx.db.summary.update({
                where: { meetingId: input.meetingId },
                data: {
                    status: newStatus,
                },
            });

            return parseFromDB(transcript) as Transcript<"done">;
        }),
});
