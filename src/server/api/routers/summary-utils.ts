import { db } from "~/server/db";

export async function createSummarySkeleton(meetingId: string) {
    const status: Status = "blocked";
    const summary = await db.summary.create({
        data: {
            meeting: { connect: { id: meetingId } },
            status: status,
        },
    });

    return summary;
}

export function parseFromDB(summary: DBSummary): SummaryWithUnknownStatus {
    switch (summary.status) {
        case "done":
            return {
                ...summary,
                createdAt: new Date(summary.createdAt!),
                rawResponse: summary.rawResponse
                    ? (JSON.parse(summary.rawResponse) as JSON)
                    : {},
            } as Summary<"done">;
        case "pending":
        case "ready":
        case "blocked":
            return {
                id: summary.id,
                meetingId: summary.meetingId,
                status: summary.status,
            } as Summary<"pending" | "ready" | "blocked">;
        case "error":
            return {
                ...summary,
                createdAt: summary.createdAt
                    ? new Date(summary.createdAt)
                    : undefined,
                rawResponse: summary.rawResponse
                    ? (JSON.parse(summary.rawResponse) as JSON)
                    : undefined,
            } as Summary<"error">;
        default:
            throw new Error("Unsupported status");
    }
}
