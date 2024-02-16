"use client";
import { api } from "~/trpc/react";
import { Accordion } from "./ui/accordion";
import MeetingComponent from "./ui/meeting";

export default function MeetingContainer() {
    const meetings: Meeting[] | undefined =
        api.meeting.getAllOwned.useQuery().data;

    if (!meetings) {
        return <div></div>;
    }

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
