type TranscriptParagraph = {
    startTime: number;
    endTime: number;
    speakerId: number;
    sentence: string;
};

type BaseTranscript = {
    id: string;
    meetingId: string;
    status: Status;
};

type FullTranscript = BaseTranscript & {
    createdAt: Date;
    model: string;
    transcriptParagraphs: TranscriptParagraph[];
    text: string;
    rawResponse: JSON;
};

type DBTranscript = Omit<BaseTranscript, "status"> & {
    createdAt: Date | null;
    model: string | null;
    transcriptParagraphs: string | null;
    text: string | null;
    rawResponse: string | null;
    status: string;
};

type ReadyPendingTranscript = Pick<
    BaseTranscript,
    "id" | "meetingId" | "status"
>;

type ErrorTranscript = Partial<FullTranscript>;

type Transcript<Status> = Status extends "done"
    ? FullTranscript
    : Status extends "ready" | "pending" | "blocked"
      ? ReadyPendingTranscript
      : Status extends "error"
        ? ErrorTranscript
        : never;

type TranscriptWithUnknownStatus = Transcript<
    "done" | "pending" | "ready" | "blocked" | "error"
>;
