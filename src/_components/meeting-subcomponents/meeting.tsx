import { useState, useCallback } from "react";
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion";
import { api } from "~/trpc/react";
import { Input } from "../ui/name-input";
import { debounce } from "lodash";
import MeetingBody from "./meeting-body";
import { stringifyDate } from "./utils";

export default function MeetingComponent(meeting: Meeting) {
    const [isHighlighted, setHighlighted] = useState<boolean>(false);
    const [name, setName] = useState<string>(meeting.name);

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
                            className={`absolute left-0 top-0 z-30 h-full w-full bg-transparent ${isHighlighted ? "underline" : ""}`}
                            onChange={(event) => {
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
                <MeetingBody meeting={meeting} />
            </AccordionContent>
        </AccordionItem>
    );
}
