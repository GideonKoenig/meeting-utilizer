import * as Dialog from "../ui/dialog";
import { api } from "~/trpc/react";
import { type MutableRefObject, useRef, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useUploadFile } from "~/hooks/use-upload-file";
import { FileUploader } from "../ui/file-uploader-field";

import { FFmpeg } from "@ffmpeg/ffmpeg";

async function load(ffmpegRef: MutableRefObject<FFmpeg>) {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    const ffmpeg = ffmpegRef.current;

    // ffmpeg.on("log", ({ message }) => {
    //     console.log(message);
    // });
    await ffmpeg.load({
        coreURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.js`,
            "text/javascript",
        ),
        wasmURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.wasm`,
            "application/wasm",
        ),
    });
}

export default function MeetingForm() {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const utils = api.useUtils();

    const ffmpegRef = useRef(new FFmpeg());
    useEffect(() => {
        load(ffmpegRef).catch(console.error);
    }, []);

    /*
     * This function is constructed in a probably to complicated way.
     * It creates a function factory, that the uploadthing hook will pass
     * a progress update function into. This factory function is being passed
     * to the uploadthing hook which uses it before it starts to upload the files
     */
    const convertAndCompress = (
        progressFunction: (
            progress: number,
            name: string,
            offset: number,
        ) => void,
    ) => {
        return async (file: File): Promise<File> => {
            const ffmpeg = ffmpegRef.current;
            ffmpeg.on("progress", ({ progress, time }) => {
                progressFunction((progress * 100) / 2, file.name, 0);
            });
            await ffmpeg.writeFile(file.name, await fetchFile(file));
            await ffmpeg.exec([
                "-i",
                file.name,
                "-b:a",
                "128k",
                `${file.name}.mp3`,
            ]);
            const mp3Data = await ffmpeg.readFile(`${file.name}.mp3`);
            const audioBlob = new Blob([mp3Data], { type: "audio/mp3" });
            return new File(
                [audioBlob],
                `${file.name.substring(0, file.name.lastIndexOf("."))}.mp3`,
                { type: "audio/mp3" },
            );
        };
    };

    const { uploadFiles, progresses, isUploading } = useUploadFile(
        "generalUploader",
        convertAndCompress,
        {},
    );

    return (
        <Dialog.Dialog open={open} onOpenChange={setOpen}>
            <Dialog.DialogTrigger
                disabled={!session}
                className={`flex-grow justify-center border-2 p-4 text-center text-2xl ${session ? "hover:bg-slate-50" : ""} ${!session ? " text-slate-300" : ""}`}
            >
                +
            </Dialog.DialogTrigger>
            <Dialog.DialogContent>
                <Dialog.DialogHeader>
                    <Dialog.DialogTitle>Add a Meeting</Dialog.DialogTitle>
                    <Dialog.DialogDescription>
                        Create a new meeting entry.
                    </Dialog.DialogDescription>
                </Dialog.DialogHeader>
                <FileUploader
                    accept={{ "audio/*": [], "video/*": [] }}
                    multiple
                    maxFiles={100}
                    maxSize={1024 * 1024 * 1024 * 2} // 2GB - Files will get compressed before upload, so the size is not that important
                    progresses={progresses}
                    onUpload={async (files: File[]) => {
                        await uploadFiles(files);
                    }}
                    onClientUploadComplete={async () => {
                        await utils.meeting.getAllOwned.invalidate();
                        setOpen(false);
                    }}
                    disabled={isUploading}
                />
                {/* <UploadButton
                    content={{
                        button: ({ ready }: { ready: boolean }) => {
                            return ready ? (
                                "Select Files"
                            ) : (
                                <FontAwesomeIcon
                                    className={
                                        "mr-1.5 h-5 w-5 text-muted-foreground text-white opacity-80"
                                    }
                                    icon={faCircleNotch}
                                    spin
                                />
                            );
                        },
                        allowedContent: ({ fileTypes }) => {
                            const capitalizedTypes = fileTypes.map(
                                (types) =>
                                    types.charAt(0).toUpperCase() +
                                    types.slice(1),
                            );
                            const lastElement = capitalizedTypes.pop();
                            return capitalizedTypes.length
                                ? `${capitalizedTypes.join(", ")} and ${lastElement} Files`
                                : `${lastElement} Files`;
                        },
                    }}
                    appearance={{
                        button: () => {
                            const className = `bg-cyan-500 ut-readying:bg-cyan-500 focus-within:ring-cyan-500 ${ready ? "cursor-pointer" : "cursor-not-allowed"}`;
                            return className;
                        },
                    }}
                    endpoint="generalUploader"
                    onBeforeUploadBegin={(files: File[]) => {
                        console.log("test");
                        setPreprocessCurrentFile(0);
                        setUploadCurrentFile(0);
                        setMaxFilecount(files.length);
                        return Promise.all(
                            files.map(async (file) => {
                                return convertAndCompress(file, ffmpegRef);
                            }),
                        );
                    }}
                    onClientUploadComplete={async () => {
                        await utils.meeting.getAllOwned.invalidate();
                        // setOpen(false);
                        // Todo: Uncomment this window closing
                    }}
                    onUploadError={(error: Error) => {
                        alert(`ERROR! ${error.message}`);
                    }}
                /> */}
            </Dialog.DialogContent>
        </Dialog.Dialog>
    );
}
