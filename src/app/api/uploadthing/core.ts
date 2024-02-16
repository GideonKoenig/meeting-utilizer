import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

const f = createUploadthing();

export const ourFileRouter = {
    audioUploader: f({ audio: { maxFileSize: "4MB", maxFileCount: 20 } })
        .middleware(async ({ req }) => {
            const session = await getServerAuthSession();

            if (!session) throw new UploadThingError("Unauthorized");
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            const meeting = await db.meeting.create({
                data: {
                    name: file.name,
                    url: file.url,
                    createdBy: { connect: { id: metadata.userId } },
                },
            });

            await db.meetingToUser.create({
                data: {
                    meeting: { connect: { id: meeting.id } },
                    user: { connect: { id: metadata.userId } },
                },
            });

            return {
                ...meeting,
                createdAt: meeting.createdAt
                    .toLocaleString("en-GB", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    })
                    .replace(", ", "  ")
                    .replace("/", "."),
            } as Meeting;
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
