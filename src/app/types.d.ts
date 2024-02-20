type Meeting = {
    id: string;
    name: string;
    url: string;
    createdAt: Date;
};

type Transcript = {
    id: string;
    createdAt: Date;
    transcript: [
        {
            startTime: number;
            endTime: number;
            speakerId: number;
            sentence: string;
        },
    ];
    text: string;
    meetingId: string;
    rawResponse: JSON;
};
