"use client";
import { Accordion } from "./ui/accordion";
import MeetingComponent from "./ui/meeting";

interface MeetingContainerProps {
    meetings: Meeting[];
}

export default function MeetingContainer({ meetings }: MeetingContainerProps) {
    return (
        <>
            <span className="pl-2 text-xs">30.01.2024</span>
            <div className="flex flex-col gap-4 rounded border-2 p-4">
                <Accordion type="multiple" className="flex flex-col gap-2">
                    {meetings.map((meeting) => (
                        <MeetingComponent
                            key={meeting.id}
                            {...meeting}
                        ></MeetingComponent>
                    ))}
                </Accordion>
            </div>
        </>
    );
}
