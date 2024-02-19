type Meeting = {
    id: string;
    name: string;
    url: string;
    createdAt: Date;
};

type Transcript = {
    id: string;
    createdAt: Date;
    text: string;
    meetingId: string;
    rawResponse: string;
};
