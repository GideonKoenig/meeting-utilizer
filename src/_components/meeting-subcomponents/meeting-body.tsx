import { ReloadIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import TranscriptBody from "./meeting-body-transcript";
import { api } from "~/trpc/react";
import { getStatusIcon, usePersistedState } from "./utils";
import SummaryBody from "./meeting-body-summary";
import ChatBody from "./meeting-body-chat";

type MeetingBodyProps = {
    meeting: Meeting;
};

export default function MeetingBody({ meeting }: MeetingBodyProps) {
    const [activeTab, setActiveTab] = usePersistedState<string>(
        `activeTab - ${meeting.id}`,
        "",
    );

    const utils = api.useUtils();
    const meetingDelete = api.meeting.delete.useMutation();

    const transcriptCreate = api.transcript.populate.useMutation();
    const transcriptSetStatus = api.transcript.setStatus.useMutation();
    const transcript: TranscriptWithUnknownStatus | undefined =
        api.transcript.get.useQuery({
            meetingId: meeting.id,
        }).data;

    const summaryCreate = api.summary.populate.useMutation();
    const summarySetStatus = api.summary.setStatus.useMutation();
    const summary: SummaryWithUnknownStatus | undefined =
        api.summary.get.useQuery({
            meetingId: meeting.id,
        }).data;

    return (
        <>
            <div className=" flex gap-2">
                <Button asChild variant={"secondary"}>
                    <Link href={meeting.url} target="_blank">
                        Original
                    </Link>
                </Button>
                <div className="flex-grow"></div>
                <Button
                    variant={"destructive"}
                    disabled={meetingDelete.isLoading}
                    onClick={async () => {
                        await meetingDelete.mutateAsync({
                            meetingId: meeting.id,
                        });
                        await utils.meeting.getAllOwned.invalidate();
                    }}
                >
                    {meetingDelete.isLoading && (
                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Delete
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger
                        value="transcript"
                        disabled={
                            (transcript?.status != "done" &&
                                transcript?.status != "ready") ||
                            transcriptCreate.isLoading
                        }
                        onMouseDown={async (event) => {
                            if (transcript?.status == "ready") {
                                event.preventDefault();
                                event.stopPropagation();
                                await transcriptSetStatus.mutateAsync({
                                    meetingId: meeting.id,
                                    status: "pending",
                                });
                                await utils.transcript.get.invalidate({
                                    meetingId: meeting.id,
                                });
                                await transcriptCreate.mutateAsync({
                                    meetingId: meeting.id,
                                });
                                await utils.transcript.get.invalidate({
                                    meetingId: meeting.id,
                                });
                                await utils.summary.get.invalidate({
                                    meetingId: meeting.id,
                                });
                                setActiveTab("transcript");
                            }
                        }}
                    >
                        {getStatusIcon(transcript?.status)}
                        Transcript
                    </TabsTrigger>
                    <TabsTrigger
                        value="summary"
                        disabled={
                            (summary?.status != "done" &&
                                summary?.status != "ready") ||
                            summaryCreate.isLoading
                        }
                        onMouseDown={async (event) => {
                            if (summary?.status == "ready") {
                                event.preventDefault();
                                event.stopPropagation();
                                await summarySetStatus.mutateAsync({
                                    meetingId: meeting.id,
                                    status: "pending",
                                });
                                await utils.summary.get.invalidate({
                                    meetingId: meeting.id,
                                });
                                await summaryCreate.mutateAsync({
                                    meetingId: meeting.id,
                                });
                                await utils.summary.get.invalidate({
                                    meetingId: meeting.id,
                                });
                                setActiveTab("summary");
                            }
                        }}
                    >
                        {getStatusIcon(summary?.status)}
                        Summary
                    </TabsTrigger>
                    <TabsTrigger value="statistics" disabled={true}>
                        {getStatusIcon(undefined)}
                        Statistics
                    </TabsTrigger>
                    <TabsTrigger
                        value="chat"
                        disabled={transcript?.status != "done"}
                    >
                        {getStatusIcon(
                            transcript?.status == "done" ? "done" : "blocked",
                        )}
                        Chat
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="transcript">
                    <TranscriptBody transcript={transcript} />
                </TabsContent>
                <TabsContent value="summary" className="px-2">
                    <SummaryBody summary={summary} />
                </TabsContent>
                <TabsContent value="statistics" className="px-2">
                    Nothing to see here, yet!
                </TabsContent>
                <TabsContent value="chat" className="px-2">
                    <ChatBody meetingId={meeting.id} />
                </TabsContent>
            </Tabs>
        </>
    );
}
