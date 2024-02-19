"use client";
import { api } from "~/trpc/react";
import { Accordion } from "./ui/accordion";
import MeetingComponent from "./meeting";
import { useSession } from "next-auth/react";

export default function MeetingContainer() {
    const { data: session } = useSession();
    if (!session) {
        return <div>No Session found</div>;
        //Todo: Create proper Sign in Notification
    }

    const meetings: Meeting[] | undefined =
        api.meeting.getAllOwned.useQuery().data;

    if (!meetings) {
        return <div>Nothing to see here, yet!</div>;
        // Todo: Create proper Nothing here yet page
    }

    return (
        <div className="flex flex-col gap-5">
            {groupAndSortMeetings(meetings).map((meetingGroup) => (
                <div>
                    <span className="pl-2 text-xs">
                        {meetingGroup.date
                            .toISOString()
                            .split("T")[0]
                            ?.replaceAll("-", ".")}
                    </span>
                    <div className="flex flex-col gap-4 rounded border-2 p-4">
                        <Accordion
                            type="multiple"
                            className="flex flex-col gap-2"
                        >
                            {meetingGroup.meetings.map((meeting) => (
                                <MeetingComponent
                                    key={meeting.id}
                                    {...meeting}
                                ></MeetingComponent>
                            ))}
                        </Accordion>
                    </div>
                </div>
            ))}
        </div>
    );
}

function groupAndSortMeetings(
    meetings: Meeting[],
): { date: Date; meetings: Meeting[] }[] {
    const grouped: Record<string, Meeting[]> = meetings.reduce(
        (acc, meeting) => {
            const dateKey = meeting.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD

            if (!dateKey) {
                return acc;
            }

            acc[dateKey] = acc[dateKey] ?? [];
            acc[dateKey]!.push(meeting);
            return acc;
        },
        {} as Record<string, Meeting[]>,
    );

    Object.keys(grouped).forEach((dateKey) => {
        grouped[dateKey]!.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        );
    });

    return Object.entries(grouped)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([date, meetings]) => ({
            date: new Date(date),
            meetings,
        }));
}
