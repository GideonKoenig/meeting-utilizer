import { useState } from "react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";
import { Separator } from "./separator";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

export default function MeetingForm() {
    const [isHighlighted, setHighlighted] = useState<boolean>(false);

    return (
        <div className="flex border-2 p-4 font-medium">
            <div className="flex w-60 flex-col items-start">
                <span
                    className={`text-lg font-bold ${isHighlighted ? "underline" : ""}`}
                >
                    {"Neues Meeting"}
                </span>
                {/* <span className="whitespace-pre text-sm text-gray-600">{`${date}  ${time}`}</span> */}
            </div>
            <Separator orientation="vertical" />

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
            <div className="flex flex-grow"></div>
        </div>
    );
}
