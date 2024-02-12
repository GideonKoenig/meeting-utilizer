"use client";
import NavMenu from "./_components/main-navigation-menu";
import MeetingContainer from "./_components/meeting-container";
import Meeting from "./_components/ui/meeting";
import MeetingForm from "./_components/ui/meeting-form";

export default function Home() {
    return (
        <main>
            <NavMenu></NavMenu>
            <div className="p-8">
                <MeetingForm></MeetingForm>
            </div>

            <div className="flex min-h-screen flex-col p-4">
                <MeetingContainer></MeetingContainer>
            </div>
        </main>
    );
}
