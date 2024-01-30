"use client";
import NavMenu from "./_components/main-navigation-menu";
import MeetingContainer from "./_components/meeting-container";

export default function Home() {
    return (
        <main>
            <NavMenu></NavMenu>
            <div className="flex min-h-screen flex-col p-4">
                <MeetingContainer></MeetingContainer>
            </div>
        </main>
    );
}
