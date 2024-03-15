import { ScrollArea } from "../ui/scroll-area";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { type DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { cn } from "~/lib/utils";
import { MarkdownComponent } from "~/styles/markdown-component";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type Checked = DropdownMenuCheckboxItemProps["checked"];

interface SummaryBodyProps {
    summary: SummaryWithUnknownStatus | undefined;
    className?: string;
}

export default function SummaryBody({ summary, className }: SummaryBodyProps) {
    if (!summary) {
        return <div>No Transcription found!</div>;
    }

    function isSummaryDone(
        summary: SummaryWithUnknownStatus,
    ): summary is FullSummary {
        return summary.status === "done";
    }

    if (!isSummaryDone(summary)) {
        return <div>Summary isn't ready yet! How do you see this?</div>;
    }

    return (
        <div className={cn("relative", className)}>
            <ScrollArea className="w-full pr-10">
                <MarkdownComponent text={summary.summary} />
            </ScrollArea>
            <div className=" absolute right-1 top-0 w-10">
                <Button
                    className="hover:bg-slate-200"
                    variant="ghost"
                    onClick={async () => {
                        await navigator.clipboard.writeText(summary.summary);
                    }}
                >
                    <FontAwesomeIcon icon={faCopy} />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <DotsHorizontalIcon />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>View Settings</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {/* <DropdownMenuCheckboxItem
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
                        </DropdownMenuCheckboxItem> */}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
