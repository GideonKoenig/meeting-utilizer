import { useState } from "react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";
import { Button } from "./button";
import { api } from "~/trpc/react";
import { ReloadIcon } from "@radix-ui/react-icons";

export default function MeetingComponent(meeting: Meeting) {
    const [isHighlighted, setHighlighted] = useState<boolean>(false);

    const utils = api.useUtils();
    const deleteMutation = api.meeting.delete.useMutation();

    return (
        <AccordionItem value={meeting.id} className="relative px-4">
            <AccordionTrigger onHover={setHighlighted}>
                <div className="flex w-60 flex-col items-start">
                    <span
                        className={`text-lg font-bold ${isHighlighted ? "underline" : ""}`}
                    >
                        {meeting.name}
                    </span>
                    <span className="whitespace-pre text-sm text-gray-600">
                        {stringifyDate(meeting.createdAt)}
                    </span>
                </div>
                <div className="flex flex-grow"></div>
            </AccordionTrigger>
            <AccordionContent>
                <Button
                    variant={"destructive"}
                    disabled={deleteMutation.isLoading}
                    onClick={async () => {
                        await deleteMutation.mutateAsync({
                            meetingId: meeting.id,
                        });
                        await utils.meeting.getAllOwned.invalidate();
                    }}
                >
                    {deleteMutation.isLoading && (
                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Delete
                </Button>
            </AccordionContent>
        </AccordionItem>
    );
}

function stringifyDate(date: Date): string {
    return date
        .toLocaleString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })
        .replace(", ", "  ")
        .replace("/", ".");
}
