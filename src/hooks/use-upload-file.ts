import { toast } from "sonner";
import type { UploadFilesOptions } from "uploadthing/types";

import { getErrorMessage } from "~/lib/handle-error";
import { uploadFiles } from "~/lib/uploadthing";
import { type OurFileRouter } from "~/app/api/uploadthing/core";
import { useCallback, useState } from "react";

type UseUploadFileProps = Pick<
    UploadFilesOptions<OurFileRouter, keyof OurFileRouter>,
    "headers" | "onUploadBegin" | "onUploadProgress" | "skipPolling"
>;

export function useUploadFile(
    endpoint: keyof OurFileRouter,
    preprocessConstructor: (
        progressFunction: (
            progress: number,
            name: string,
            offset: number,
        ) => void,
    ) => (file: File) => Promise<File>,
    { ...props }: UseUploadFileProps,
) {
    const [progresses, setProgresses] = useState<Record<string, number>>({});
    const [isUploading, setIsUploading] = useState(false);

    const changeProgress = useCallback(
        (progress: number, file: string, offset: number) => {
            setProgresses((prev) => {
                return {
                    ...prev,
                    [file]: progress + offset,
                };
            });
        },
        [],
    );

    const preprocess = preprocessConstructor(changeProgress);

    async function uploadThings(files: File[]) {
        setIsUploading(true);

        const filesPreprocessed = await Promise.all(
            files.map(async (file) => {
                return preprocess(file);
            }),
        );

        try {
            await uploadFiles(endpoint, {
                ...props,
                files: filesPreprocessed,
                onUploadProgress: ({
                    file,
                    progress,
                }: {
                    file: string;
                    progress: number;
                }) => {
                    changeProgress(progress / 2, file, 50);
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
