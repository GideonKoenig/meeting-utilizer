type Chat<T> = {
    id: string;
    name: string;
    createdAt: Date;
    model: string;
    messages: T[];
    meetingId: string;
};

type DBChat = Omit<Chat, "messages"> & {
    messages: string;
};
