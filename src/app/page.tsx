"use client";

import { useSession } from "next-auth/react";
import LandingPage from "~/components/landing-page/landing-page";
import NavMenu from "~/components/layouts/main-navigation-menu";
import MeetingContainer from "~/components/meeting-page/meeting-container";
import MeetingForm from "~/components/meeting-page/meeting-form";

export default function Home() {
    const { data: session } = useSession();

    if (session) {
        return (
            <main>
                <NavMenu />
                <div>
                    <div className="flex p-4">
                        <MeetingForm></MeetingForm>
                    </div>
                    <div className="flex flex-col p-4">
                        <MeetingContainer></MeetingContainer>
                    </div>
                </div>
            </main>
        );
    } else {
        return (
            <main>
                <NavMenu />
                <LandingPage></LandingPage>
            </main>
        )
    }
}
