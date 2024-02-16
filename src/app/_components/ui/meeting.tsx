import { useState } from "react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

export default function MeetingComponent(meeting: Meeting) {
    const [isHighlighted, setHighlighted] = useState<boolean>(false);

    return (
        <AccordionItem value={meeting.id.toString()} className="relative px-4">
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
            <AccordionContent>Stuff will go here.</AccordionContent>
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
