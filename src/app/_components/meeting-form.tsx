import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { UploadButton } from "./ui/uploadthing";

interface MeetingFormProps {
    meetings: Meeting[];
    setMeetings: (meetings: Meeting[]) => void;
}

export default function MeetingForm({
    meetings,
    setMeetings,
}: MeetingFormProps) {
    return (
        <Dialog>
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
                    onClientUploadComplete={(res) => {
                        const newMeetings = res.map((item) => {
                            return item.serverData;
                        });
                        setMeetings([...meetings, ...newMeetings]);
                    }}
                    onUploadError={(error: Error) => {
                        alert(`ERROR! ${error.message}`);
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
