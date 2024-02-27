import { useState, useCallback, useMemo } from "react";
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
import { Input } from "./ui/name-input";
import { debounce } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleCheck,
    faPlay,
    faCircleXmark,
    faCircleNotch,
    faXmark,
    faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";

function getStatusIcon(status: string | undefined): JSX.Element {
    switch (status) {
        case "ready":
            return (
                <FontAwesomeIcon
                    className=" pr-1.5 text-blue-600"
                    icon={faPlay}
                />
            );
        case "loading":
            return (
                <FontAwesomeIcon
                    className=" mr-1.5 text-muted-foreground"
                    icon={faCircleNotch}
                    spin
                />
            );
        case "done":
            return (
                <FontAwesomeIcon
                    className=" pr-1.5 text-green-600"
                    icon={faCircleCheck}
                />
            );

        case "error":
            return (
                <FontAwesomeIcon
                    className=" pr-1.5 text-red-600"
                    icon={faXmark}
                />
            );
        default:
            return (
                <FontAwesomeIcon
                    className=" pr-1.5 text-muted-foreground"
                    icon={faCircleXmark}
                />
            );
    }
}

export default function MeetingComponent(meeting: Meeting) {
    const [isHighlighted, setHighlighted] = useState<boolean>(false);
    const [name, setName] = useState<string>(meeting.name);

    const utils = api.useUtils();
    const meetingDeleteMutation = api.meeting.delete.useMutation();
    const transcriptCreateMutation = api.transcript.create.useMutation();
    const meetingRenameMutation = api.meeting.rename.useMutation();
    const meetingRenameDebounced = useCallback(
        debounce((newName: string) => {
            meetingRenameMutation.mutate({
                meetingId: meeting.id,
                newName: newName,
            });
        }, 500),
        [],
    );

    const transcript: Transcript | undefined = api.transcript.get.useQuery({
        meetingId: meeting.id,
    }).data;

    return (
        <AccordionItem value={meeting.id} className="relative px-4">
            <AccordionTrigger onHover={setHighlighted}>
                <div className="flex flex-col items-start">
                    <div
                        className={`relative z-20 whitespace-pre text-lg font-bold text-transparent`}
                    >
                        {name}
                        <Input
                            type="text"
                            defaultValue={name}
                            className={`absolute left-0 top-0 z-30 h-full w-full bg-transparent ${isHighlighted ? "underline" : "no-underline"}`}
                            onChange={(event: any) => {
                                setName(event.target.value);
                                meetingRenameDebounced(event.target.value);
                            }}
                            onKeyUp={(event) => {
                                if (
                                    event.key === " " ||
                                    event.key === "Spacebar"
                                ) {
                                    event.preventDefault();
                                    // event.stopPropagation();
                                }
                            }}
                        />
                    </div>
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
                        disabled={transcriptCreateMutation.isLoading}
                        onClick={async () => {
                            await transcriptCreateMutation.mutateAsync({
                                meetingId: meeting.id,
                            });
                            await utils.transcript.get.invalidate({
                                meetingId: meeting.id,
                            });
                        }}
                    >
                        {transcriptCreateMutation.isLoading && (
                            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Transcript
                    </Button>
                    <div className="flex-grow"></div>
                    <Button
                        variant={"destructive"}
                        disabled={meetingDeleteMutation.isLoading}
                        onClick={async () => {
                            await meetingDeleteMutation.mutateAsync({
                                meetingId: meeting.id,
                            });
                            await utils.meeting.getAllOwned.invalidate();
                        }}
                    >
                        {meetingDeleteMutation.isLoading && (
                            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Delete
                    </Button>
                </div>

                <Tabs>
                    <TabsList>
                        <TabsTrigger value="transcript">
                            <FontAwesomeIcon
                                className=" pr-1.5 text-green-600"
                                icon={faCircleCheck}
                            />
                            <FontAwesomeIcon
                                className=" mr-1.5 text-muted-foreground"
                                icon={faCircleNotch}
                                spin
                            />
                            <FontAwesomeIcon
                                className=" pr-1.5 text-red-600"
                                // icon={faXmark}
                                icon={faCircleExclamation}
                            />
                            Transcript
                        </TabsTrigger>
                        <TabsTrigger value="summary">
                            <FontAwesomeIcon
                                className=" pr-1.5 text-blue-600"
                                icon={faPlay}
                            />
                            Summary
                        </TabsTrigger>
                        <TabsTrigger value="statistics">
                            <FontAwesomeIcon
                                className=" pr-1.5 text-muted-foreground"
                                icon={faCircleXmark}
                            />
                            Statistics
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="transcript">
                        <TranscriptBody transcript={transcript} />
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
