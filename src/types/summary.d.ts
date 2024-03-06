type BaseSummary = {
    id: string;
    meetingId: string;
    status: Status;
};

type FullSummary = BaseSummary & {
    createdAt: Date;
    model: string;
    summary: string;
    rawResponse: JSON;
};

type DBSummary = Omit<BaseSummary, "status"> & {
    createdAt: Date | null;
    model: string | null;
    summary: string | null;
    rawResponse: string | null;
    status: string;
};

type ReadyPendingSummary = Pick<BaseSummary, "id" | "meetingId" | "status">;

type ErrorSummary = Partial<FullSummary>;

type Summary<Status> = Status extends "done"
    ? FullSummary
    : Status extends "ready" | "pending" | "blocked"
      ? ReadyPendingSummary
      : Status extends "error"
        ? ErrorSummary
        : never;

type SummaryWithUnknownStatus = Summary<
    "done" | "pending" | "ready" | "blocked" | "error"
>;
