"use client";

import NavMenu from "~/components/layouts/main-navigation-menu";
import MeetingContainer from "~/components/meeting-page/meeting-container";
import MeetingForm from "~/components/meeting-page/meeting-form";

export default function Home() {
    return (
        <main>
            <NavMenu />
            <div className="flex p-4">
                <MeetingForm></MeetingForm>
            </div>

            <div className="flex flex-col p-4">
                <MeetingContainer></MeetingContainer>
            </div>
            {/* <ToggleGroup
                type="single"
                variant={"outline"}
                className="h-full"
                defaultValue="a"
            >
                <ToggleGroupItem value="a">Transcript</ToggleGroupItem>
                <ToggleGroupItem value="b">Summary</ToggleGroupItem>
                <ToggleGroupItem value="c">Statistics</ToggleGroupItem>
            </ToggleGroup> */}
        </main>
    );
}
