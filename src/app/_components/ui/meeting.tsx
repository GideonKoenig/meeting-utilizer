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
                        {meeting.createdAt}
                    </span>
                </div>
                <div className="flex flex-grow"></div>
            </AccordionTrigger>
            <AccordionContent>Stuff will go here.</AccordionContent>
        </AccordionItem>
    );
}
