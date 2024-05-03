import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";
import { z } from "zod";
import { env } from "~/env";
import {
    addMessage,
    createMessage,
    getMessages,
} from "~/server/api/routers/chat-utils";
import { NextResponse } from "next/server";
import { getServerAuthSession } from "~/server/auth";

export const maxDuration = 300;

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
const ChatRequestData = z.object({
    messages: z.array(
        z.object({
            id: z.string().optional(),
            createdAt: z.date().optional(),
            content: z.string(),
            role: z.enum(["system", "user", "assistant"]),
        }),
    ),
    model: z.string(),
    chatId: z.string(),
    newChat: z.boolean(),
});
export type ChatRequestBody = Omit<z.infer<typeof ChatRequestData>, "messages">;

export async function POST(req: Request) {
    const session = await getServerAuthSession();
    if (!session) {
        return NextResponse.json(
            { message: "User must be logged in!" },
            { status: 401 },
        );
    }

    const result = ChatRequestData.safeParse(await req.json());
    if (!result.success) {
        return new Response(JSON.stringify({ error: result.error.errors }), {
            status: 400,
        });
    }

    const { model, messages, chatId, newChat } = result.data;
    const currentMessage = messages[messages.length - 1]!;

    await addMessage(
        chatId,
        createMessage(currentMessage.role, currentMessage.content),
    );

    const stream = await openai.chat.completions.create({
        model: model,
        messages: newChat
            ? (await getMessages(chatId)).map((message) => {
                  return { content: message.content, role: message.role };
              })
            : messages,
        stream: true,
    });

    return new StreamingTextResponse(
        OpenAIStream(stream, {
            onCompletion: async (message: string) => {
                await addMessage(chatId, createMessage("assistant", message));
            },
        }),
    );
}
