import { useState } from "react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";
import { Separator } from "./separator";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

interface MeetingProps {
    id: number;
    name: string;
    date: string;
    time: string;
}

export default function Meeting({ id, name, date, time }: MeetingProps) {
    const [isHighlighted, setHighlighted] = useState<boolean>(false);

    return (
        <AccordionItem value={id.toString()} className="px-4">
            <AccordionTrigger onHover={setHighlighted}>
                <div className="flex w-60 flex-col items-start">
                    <span
                        className={`text-lg font-bold ${isHighlighted ? "underline" : ""}`}
                    >
                        {name}
                    </span>
                    <span className="whitespace-pre text-sm text-gray-600">{`${date}  ${time}`}</span>
                </div>
                <Separator orientation="vertical" />

                <ToggleGroup
                    type="single"
                    variant={"outline"}
                    className="h-full"
                    defaultValue="a"
                >
                    <ToggleGroupItem value="a">A</ToggleGroupItem>
                    <ToggleGroupItem value="b">B</ToggleGroupItem>
                    <ToggleGroupItem value="c">C</ToggleGroupItem>
                </ToggleGroup>
                <div className="flex flex-grow"></div>
            </AccordionTrigger>
            <AccordionContent>Stuff will go here.</AccordionContent>
        </AccordionItem>
    );
}
