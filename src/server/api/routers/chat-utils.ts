import { type Message } from "ai";
import { db } from "~/server/db";
import { customAlphabet } from "nanoid/non-secure";

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

const nanoid = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    7,
);
