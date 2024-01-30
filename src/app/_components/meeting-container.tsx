"use client";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "./ui/accordion";
import Meeting from "./ui/meeting";

const testData: { id: number; name: string; date: string; time: string }[] = [
    { id: 1, name: "Meeting 1", date: "29.01.2024", time: "14:23" },
    { id: 2, name: "Meeting 2", date: "20.01.2024", time: " 16:11" },
    { id: 3, name: "Meeting 3", date: "31.01.2024", time: " 17:00" },
];

export default function MeetingContainer() {
    return (
        <>
            <span className="pl-2 text-xs">30.01.2024</span>
            <div className="flex flex-col gap-4 rounded border-2 p-4">
                <Accordion type="multiple" className="flex flex-col gap-2">
                    {testData.map((meetingData) => (
                        <Meeting
                            key={meetingData.id}
                            {...meetingData}
                        ></Meeting>
                    ))}
                </Accordion>
            </div>
        </>
    );
}
