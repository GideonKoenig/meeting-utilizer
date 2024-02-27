import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { createMeeting } from "~/server/api/routers/meeting";
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
            const meeting = await createMeeting(
                file.url,
                file.name,
                metadata.userId,
            );
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
