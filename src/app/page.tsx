"use client";
import { useState } from "react";
import NavMenu from "./_components/main-navigation-menu";
import MeetingContainer from "./_components/meeting-container";
import MeetingForm from "./_components/meeting-form";
import { ToggleGroup, ToggleGroupItem } from "./_components/ui/toggle-group";

const testData: Meeting[] = [
    {
        id: 1,
        name: "Meeting 1",
        url: "www.google.com",
        createdAt: "30.01.2024  14:23",
    },
    {
        id: 2,
        name: "Meeting 2",
        url: "www.google.com",
        createdAt: "30.01.2024  16:11",
    },
    {
        id: 3,
        name: "Meeting 3",
        url: "www.google.com",
        createdAt: "30.01.2024  17:00",
    },
];

export default function Home() {
    const [meetings, setMeetings] = useState(testData);

    return (
        <main>
            <NavMenu />
            <div className="flex p-4">
                <MeetingForm
                    meetings={meetings}
                    setMeetings={setMeetings}
                ></MeetingForm>
            </div>

            <div className="flex min-h-screen flex-col p-4">
                <MeetingContainer meetings={meetings}></MeetingContainer>
            </div>
            <ToggleGroup
                type="single"
                variant={"outline"}
                className="h-full"
                defaultValue="a"
            >
                <ToggleGroupItem value="a">Transcript</ToggleGroupItem>
                <ToggleGroupItem value="b">Summary</ToggleGroupItem>
                <ToggleGroupItem value="c">Statistics</ToggleGroupItem>
            </ToggleGroup>
        </main>
    );
}
