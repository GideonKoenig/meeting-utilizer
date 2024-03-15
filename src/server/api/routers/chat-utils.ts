import { db } from "~/server/db";
import { customAlphabet } from "nanoid/non-secure";

export type Message = {
    content: string;
    role: "system" | "user" | "assistant";
    id: string;
    createdAt?: Date | undefined;
};

export async function createChat(
    meetingId: string,
    name?: string,
    model = "gpt-4-turbo-preview",
): Promise<DBChat> {
    const chat = await db.chat.create({
        data: {
            meeting: { connect: { id: meetingId } },
            name: name ?? "New Chat",
            messages: JSON.stringify([]),
            model: model,
        },
    });

    return chat;
}

export async function getMessages(chatId: string) {
    const chat = await db.chat.findFirst({
        where: { id: chatId },
    });

    if (!chat) {
        throw new Error(`BAD_REQUEST - Unable to locate chat <${chatId}>}.`);
    }

    return parseFromDB(chat).messages;
}

export async function addMessage(chatId: string, message: Message) {
    const chat = await db.chat.findFirst({
        where: { id: chatId },
    });

    if (!chat) {
        throw new Error(`BAD_REQUEST - Unable to locate chat <${chatId}>}.`);
    }

    const newMessageList = [...parseFromDB(chat).messages, message];
    return await db.chat.update({
        where: { id: chatId },
        data: {
            messages: JSON.stringify(newMessageList),
        },
    });
}

export function parseFromDB(chat: DBChat): Chat<Message> {
    return {
        ...chat,
        messages: JSON.parse(chat.messages) as Message[],
    } as Chat<Message>;
}

export function createMessage(
    role: "system" | "user" | "assistant",
    message: string,
): Message {
    return {
        id: nanoid(),
        createdAt: new Date(),
        content: message,
        role: role,
    };
}

export const systemPrompt =
    "You are a helpful assistant, that likes to talk a lot.";

export const nanoid = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    7,
);
