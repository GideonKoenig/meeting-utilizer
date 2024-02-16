import { revalidateTag } from "next/cache";
import { INTERNALS } from "next/dist/server/web/spec-extension/request";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { api } from "~/trpc/server";

const f = createUploadthing({
    errorFormatter: (err) => {
        console.log("Error uploading file", err.message);
        console.log("  - Above error caused by:", err.cause);

        return { message: err.message };
    },
});

export const ourFileRouter = {
    audioUploader: f({ audio: { maxFileSize: "4MB", maxFileCount: 20 } })
        .middleware(async () => {
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
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
