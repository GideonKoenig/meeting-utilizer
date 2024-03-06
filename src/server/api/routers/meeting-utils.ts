import { db } from "~/server/db";
import { createTranscriptSkeleton } from "./transcript-utils";
import { createSummarySkeleton } from "./summary-utils";

export async function createMeeting(
    fileUrl: string,
    name: string,
    userId: string,
) {
    const meeting = await db.meeting.create({
        data: {
            /* Use the same Id as Uploadthing */
            id: fileUrl.substring(fileUrl.lastIndexOf("/") + 1),
            name: name,
            url: fileUrl,
            createdBy: { connect: { id: userId } },
            // createdAt: new Date(
            //     new Date().setDate(new Date().getDate() - 10),
            // ),
        },
    });

    await db.meetingToUser.create({
        data: {
            meeting: { connect: { id: meeting.id } },
            user: { connect: { id: userId } },
        },
    });

    await createTranscriptSkeleton(meeting.id);
    await createSummarySkeleton(meeting.id);

    return meeting;
}
