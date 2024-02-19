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
                        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={showTimestamps}
                            onCheckedChange={setShowTimestamps}
                        >
                            Timestamps
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="max-h-[55vh] whitespace-pre-wrap">
                {transcript.text}
            </div>
        </ScrollArea>
    );
}
