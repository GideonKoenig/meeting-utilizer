import { api } from "~/trpc/react";
import { ScrollArea } from "./ui/scroll-area";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState } from "react";
import { type DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";

type Checked = DropdownMenuCheckboxItemProps["checked"];

interface TrnanscriptBodyProps {
    meetingId: string;
    className: string;
}

export default function TranscriptBody({
    meetingId,
    className,
}: TrnanscriptBodyProps) {
    const [showTimestamps, setShowTimestamps] = useState<Checked>(true);
    const [showSpeaker, setShowSpeaker] = useState<Checked>(true);

    const transcript: Transcript | undefined = api.transcript.get.useQuery({
        meetingId: meetingId,
    }).data;

    if (!transcript) {
        return <div>No Transcription found!</div>;
    }

    return (
        <ScrollArea className={className}>
            <div className=" absolute right-3 top-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <DotsHorizontalIcon />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>View Settings</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={showTimestamps}
                            onCheckedChange={setShowTimestamps}
                        >
                            Timestamps
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={showSpeaker}
                            onCheckedChange={setShowSpeaker}
                        >
                            Speaker
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="max-h-[55vh]">
                {transcript.transcript.map((paragraph, index) => {
                    return (
                        <div
                            key={index.toString()}
                            className="flex flex-row gap-2"
                        >
                            {showTimestamps && (
                                <div className="whitespace-pre">
                                    {stringifyTimestamp(paragraph.startTime)}
                                    {" - "}
                                    {stringifyTimestamp(paragraph.endTime)}
                                </div>
                            )}

                            {showSpeaker && (
                                <div className="whitespace-pre">{`Speaker ${paragraph.speakerId}`}</div>
                            )}
                            <div className="whitespace-pre-wrap">
                                {paragraph.sentence}
                            </div>
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
}

function stringifyTimestamp(seconds: number): string {
    const hours: number = Math.floor(seconds / 3600);
    const minutes: number = Math.floor((seconds % 3600) / 60);
    const remainingSeconds: number = seconds % 60;

    return `${hours.toString()}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toFixed(2).padStart(5, "0")}`;
}
