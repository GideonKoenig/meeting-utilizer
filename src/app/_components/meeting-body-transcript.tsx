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
import { cn } from "~/lib/utils";

type Checked = DropdownMenuCheckboxItemProps["checked"];

interface TrnanscriptBodyProps {
    transcript: Transcript | undefined;
    className?: string;
}

export default function TranscriptBody({
    transcript,
    className,
}: TrnanscriptBodyProps) {
    const [showTimestamps, setShowTimestamps] = useState<Checked>(true);
    const [showSpeaker, setShowSpeaker] = useState<Checked>(true);

    if (!transcript) {
        return <div>No Transcription found!</div>;
    }

    return (
        <div className={cn("flex", className)}>
            <ScrollArea className="flex-grow">
                <div className="flex max-h-[55vh] flex-col gap-2">
                    {transcript.transcript.map((paragraph, index) => {
                        return (
                            <div
                                key={index.toString()}
                                className="flex flex-row gap-2"
                            >
                                {showTimestamps && (
                                    <div className="whitespace-pre">
                                        {stringifyTimestamp(
                                            paragraph.startTime,
                                        )}
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
            <div className="right-1 top-0 w-10">
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
        </div>
    );
}

function stringifyTimestamp(seconds: number): string {
    const hours: number = Math.floor(seconds / 3600);
    const minutes: number = Math.floor((seconds % 3600) / 60);
    const remainingSeconds: number = seconds % 60;

    return `${hours.toString()}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toFixed(2).padStart(5, "0")}`;
}
