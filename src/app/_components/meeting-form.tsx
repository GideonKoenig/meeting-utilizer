import { revalidateTag } from "next/cache";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { UploadButton } from "./ui/uploadthing";
import { api } from "~/trpc/react";
import { useState } from "react";

export default function MeetingForm() {
    const utils = api.useUtils();
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="flex-grow justify-center border-2 p-4 text-center text-2xl hover:bg-slate-50">
                +
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a Meeting</DialogTitle>
                    <DialogDescription>
                        Create a new meeting entry.
                    </DialogDescription>
                </DialogHeader>
                <UploadButton
                    endpoint="audioUploader"
                    onClientUploadComplete={async () => {
                        await utils.meeting.getAllOwned.invalidate();
                        setOpen(false);
                    }}
                    onUploadError={(error: Error) => {
                        alert(`ERROR! ${error.message}`);
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
