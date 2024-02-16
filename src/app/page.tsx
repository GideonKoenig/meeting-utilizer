"use client";
import NavMenu from "./_components/main-navigation-menu";
import MeetingContainer from "./_components/meeting-container";
import MeetingForm from "./_components/meeting-form";
import { ToggleGroup, ToggleGroupItem } from "./_components/ui/toggle-group";

export default function Home() {
    return (
        <main>
            <NavMenu />
            <div className="flex p-4">
                <MeetingForm></MeetingForm>
            </div>

            <div className="flex min-h-screen flex-col p-4">
                <MeetingContainer></MeetingContainer>
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
