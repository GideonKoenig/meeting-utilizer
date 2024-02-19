import { useState } from "react";
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";
import { api } from "~/trpc/react";
import { ReloadIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import TranscriptBody from "./meeting-body-transcript";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function MeetingComponent(meeting: Meeting) {
    const [isHighlighted, setHighlighted] = useState<boolean>(false);

    const utils = api.useUtils();
    const deleteMutation = api.meeting.delete.useMutation();
    const transcribeMutation = api.transcript.create.useMutation();

    return (
        <AccordionItem value={meeting.id} className="relative px-4">
            <AccordionTrigger onHover={setHighlighted}>
                <div className="flex w-60 flex-col items-start">
                    <span
                        className={`text-lg font-bold ${isHighlighted ? "underline" : ""}`}
                    >
                        {meeting.name}
                    </span>
                    <span className="whitespace-pre text-sm text-gray-600">
                        {stringifyDate(meeting.createdAt)}
                    </span>
                </div>
                <div className="flex flex-grow"></div>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-3">
                <div className=" flex gap-2">
                    <Button asChild variant={"secondary"}>
                        <Link href={meeting.url} target="_blank">
                            Original
                        </Link>
                    </Button>
                    <Button variant={"secondary"}>Dummy</Button>
                    <Button
                        variant={"secondary"}
                        disabled={transcribeMutation.isLoading}
                        onClick={async () => {
                            await transcribeMutation.mutateAsync({
                                meetingId: meeting.id,
                            });
                            await utils.transcript.get.invalidate({
                                meetingId: meeting.id,
                            });
                        }}
                    >
                        {transcribeMutation.isLoading && (
                            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Transcript
                    </Button>
                    <div className="flex-grow"></div>
                    <Button
                        variant={"destructive"}
                        disabled={deleteMutation.isLoading}
                        onClick={async () => {
                            await deleteMutation.mutateAsync({
                                meetingId: meeting.id,
                            });
                            await utils.meeting.getAllOwned.invalidate();
                        }}
                    >
                        {deleteMutation.isLoading && (
                            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Delete
                    </Button>
                </div>

                <Tabs defaultValue="transcript">
                    <TabsList>
                        <TabsTrigger value="transcript">Transcript</TabsTrigger>
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                        <TabsTrigger value="statistics">Statistics</TabsTrigger>
                    </TabsList>
                    <TabsContent value="transcript" className="px-2">
                        <TranscriptBody
                            meetingId={meeting.id}
                            className="py-2"
                        />
                    </TabsContent>
                    <TabsContent value="summary" className="px-2">
                        Nothing to see here, yet!
                    </TabsContent>
                    <TabsContent value="statistics" className="px-2">
                        Nothing to see here, yet!
                    </TabsContent>
                </Tabs>
            </AccordionContent>
        </AccordionItem>
    );
}

function stringifyDate(date: Date): string {
    return date
        .toLocaleString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })
        .replaceAll(", ", "  ")
        .replaceAll("/", ".");
}
