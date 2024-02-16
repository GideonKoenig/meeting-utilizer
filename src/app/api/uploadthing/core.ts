import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

const f = createUploadthing({
    errorFormatter: (err) => {
        console.log("Error uploading file", err.message);
        console.log("  - Above error caused by:", err.cause);

        return { message: err.message };
    },
});

export const ourFileRouter = {
    audioUploader: f({ audio: { maxFileSize: "2GB", maxFileCount: 20 } })
        .middleware(async () => {
            const session = await getServerAuthSession();

            if (!session) throw new UploadThingError("Unauthorized");
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            const meeting = await db.meeting.create({
                data: {
                    id: file.url.substring(file.url.lastIndexOf("/") + 1),
                    name: file.name,
                    url: file.url,
                    createdBy: { connect: { id: metadata.userId } },
                    // createdAt: new Date(
                    //     new Date().setDate(new Date().getDate() - 10),
                    // ),
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
