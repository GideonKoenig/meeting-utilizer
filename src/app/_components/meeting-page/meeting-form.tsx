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
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Progress } from "../ui/progress";

async function load(ffmpegRef: MutableRefObject<FFmpeg>) {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
        // console.log(message);
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

export default function MeetingForm() {
    const { data: session } = useSession();

    const ffmpegRef = useRef(new FFmpeg());
    useEffect(() => {
        load(ffmpegRef).catch(console.error);
    }, []);

    const utils = api.useUtils();
    const [open, setOpen] = useState(false);

    const [ready, setReady] = useState<"ready" | "readying" | "uploading">(
        "readying",
    );

    const [preprocessProgresss, setPreprocessProgress] = useState(0);
    const [uploadProgresss, setUploadProgress] = useState(0);

    const [maxFilecount, setMaxFilecount] = useState(0);

    const [preprocessCurrentFile, setPreprocessCurrentFile] = useState(0);
    const incrementPreprocessCurrentFile = () => {
        setPreprocessCurrentFile(preprocessCurrentFile + 1);
    };
    const [uploadCurrentFile, setUploadCurrentFile] = useState(0);

    const convertAndCompress = async (
        file: File,
        ffmpegRef: MutableRefObject<FFmpeg>,
    ): Promise<File> => {
        console.log("TEST");
        // setPreprocessCurrentFile(preprocessCurrentFile + 1); // probably is a race condition. add a settimeout
        incrementPreprocessCurrentFile();
        const ffmpeg = ffmpegRef.current;
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
                <div className="my-4">
                    <h3 className=" text-lg font-semibold">Status</h3>
                    <div className=" flex flex-col text-sm">
                        <div className="flex flex-row items-center gap-3">
                            <span className="min-w-20">Preprocess</span>
                            <div className="min-w-11">{`${preprocessCurrentFile.toString().padStart(3, " ")} / ${maxFilecount.toString().padStart(3, " ")}`}</div>
                            <Progress
                                className="h-3 flex-grow"
                                value={preprocessProgresss}
                            />
                        </div>
                        <div className="flex flex-row items-center gap-3">
                            <span className="min-w-20">Upload</span>
                            <div className="min-w-11">{`${uploadCurrentFile.toString().padStart(3, " ")} / ${maxFilecount.toString().padStart(3, " ")}`}</div>
                            <Progress
                                className="h-3 flex-grow"
                                value={uploadProgresss}
                            />
                        </div>
                    </div>
                </div>
                <UploadButton
                    content={{
                        button: ({ ready }) => {
                            return ready ? (
                                "Select Files"
                            ) : (
                                <FontAwesomeIcon
                                    className={
                                        " mr-1.5 h-5 w-5 text-muted-foreground text-white opacity-80"
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
                    }}
                    onUploadProgress={(progress) => {
                        setUploadProgress(progress);
                    }}
                    onUploadBegin={() => {
                        setUploadCurrentFile(maxFilecount);
                    }}
                    onUploadError={(error: Error) => {
                        alert(`ERROR! ${error.message}`);
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
