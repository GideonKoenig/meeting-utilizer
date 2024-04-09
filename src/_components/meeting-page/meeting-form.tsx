import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { UploadButton } from "../ui/uploadthing";
import { api } from "~/trpc/react";
import { type MutableRefObject, useRef, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

async function load(ffmpegRef: MutableRefObject<FFmpeg>) {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
        console.log(message);
    });
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

async function convertAndCompress(
    file: File,
    ffmpegRef: MutableRefObject<FFmpeg>,
): Promise<File> {
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile(file.name, await fetchFile(file));
    await ffmpeg.exec(["-i", file.name, "-b:a", "128k", `${file.name}.mp3`]);
    const mp3Data = await ffmpeg.readFile(`${file.name}.mp3`);
    const audioBlob = new Blob([mp3Data], { type: "audio/mp3" });
    return new File(
        [audioBlob],
        `${file.name.substring(0, file.name.lastIndexOf("."))}.mp3`,
        { type: "audio/mp3" },
    );
}

export default function MeetingForm() {
    const { data: session } = useSession();

    const ffmpegRef = useRef(new FFmpeg());
    useEffect(() => {
        load(ffmpegRef).catch(console.error);
    }, []);

    const utils = api.useUtils();
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                disabled={!session}
                className={`flex-grow justify-center border-2 p-4 text-center text-2xl ${session ? "hover:bg-slate-50" : ""} ${!session ? " text-slate-300" : ""}`}
            >
                +
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a Meeting</DialogTitle>
                    <DialogDescription>
                        Create a new meeting entry.
                    </DialogDescription>
                </DialogHeader>
                <UploadButton
                    endpoint="generalUploader"
                    onBeforeUploadBegin={(files: File[]) => {
                        return Promise.all(
                            files.map(async (file) => {
                                return convertAndCompress(file, ffmpegRef);
                            }),
                        );
                    }}
                    onClientUploadComplete={async () => {
                        await utils.meeting.getAllOwned.invalidate();
                        setOpen(false);
                    }}
                    onUploadError={(error: Error) => {
                        alert(`ERROR! ${error.message}`);
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
