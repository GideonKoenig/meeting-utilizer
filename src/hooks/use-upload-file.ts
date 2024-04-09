import { toast } from "sonner";
import type { UploadFilesOptions } from "uploadthing/types";

import { getErrorMessage } from "~/lib/handle-error";
import { uploadFiles } from "~/lib/uploadthing";
import { type OurFileRouter } from "~/app/api/uploadthing/core";
import { useState } from "react";

interface UseUploadFileProps
    extends Pick<
        UploadFilesOptions<OurFileRouter, keyof OurFileRouter>,
        "headers" | "onUploadBegin" | "onUploadProgress" | "skipPolling"
    > {}

export function useUploadFile(
    endpoint: keyof OurFileRouter,
    { ...props }: UseUploadFileProps,
) {
    const [progresses, setProgresses] = useState<Record<string, number>>({});
    const [isUploading, setIsUploading] = useState(false);

    async function uploadThings(files: File[]) {
        setIsUploading(true);
        try {
            const res = await uploadFiles(endpoint, {
                ...props,
                files,
                onUploadProgress: ({
                    file,
                    progress,
                }: {
                    file: string;
                    progress: number;
                }) => {
                    setProgresses((prev) => {
                        return {
                            ...prev,
                            [file]: progress,
                        };
                    });
                },
            });
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setProgresses({});
            setIsUploading(false);
        }
    }

    return {
        progresses,
        uploadFiles: uploadThings,
        isUploading,
    };
}
