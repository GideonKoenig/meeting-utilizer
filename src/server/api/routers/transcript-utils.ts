import { db } from "~/server/db";

export async function createTranscriptSkeleton(meetingId: string) {
    const status: Status = "ready";
    const transcript = await db.transcript.create({
        data: {
            meeting: { connect: { id: meetingId } },
            status: status,
        },
    });

    return transcript;
}

export function parseFromDB(
    transcript: DBTranscript,
): TranscriptWithUnknownStatus {
    switch (transcript.status) {
        case "done":
            return {
                ...transcript,
                createdAt: new Date(transcript.createdAt!),
                transcriptParagraphs: transcript.transcriptParagraphs
                    ? (JSON.parse(
                          transcript.transcriptParagraphs,
                      ) as TranscriptParagraph[])
                    : [],
                rawResponse: transcript.rawResponse
                    ? (JSON.parse(transcript.rawResponse) as JSON)
                    : {},
            } as Transcript<"done">;
        case "pending":
        case "ready":
        case "blocked":
            return {
                id: transcript.id,
                meetingId: transcript.meetingId,
                status: transcript.status,
            } as Transcript<"pending" | "ready" | "blocked">;
        case "error":
            return {
                ...transcript,
                createdAt: transcript.createdAt
                    ? new Date(transcript.createdAt)
                    : undefined,
                transcriptParagraphs: transcript.transcriptParagraphs
                    ? (JSON.parse(
                          transcript.transcriptParagraphs,
                      ) as TranscriptParagraph[])
                    : undefined,
                rawResponse: transcript.rawResponse
                    ? (JSON.parse(transcript.rawResponse) as JSON)
                    : undefined,
            } as Transcript<"error">;
        default:
            throw new Error("Unsupported status");
    }
}

export function stringifyTimestamp(seconds: number): string {
    const hours: number = Math.floor(seconds / 3600);
    const minutes: number = Math.floor((seconds % 3600) / 60);
    const remainingSeconds: number = seconds % 60;

    return `${hours.toString()}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toFixed(2).padStart(5, "0")}`;
}

export type CustomResponseType = typeof samnpleResponseForTypeDefinition;

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
