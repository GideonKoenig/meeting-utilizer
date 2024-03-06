import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";
import { z } from "zod";
import { type Message } from "ai";
import { env } from "~/env";

const ChatRequestData = z.object({
    messages: z.any(),
    model: z.string(),
    chatId: z.string().optional(),
});
export type ChatRequestBody = Omit<z.infer<typeof ChatRequestData>, "messages">;

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function POST(req: Request) {
    const result = ChatRequestData.safeParse(await req.json());

    if (!result.success) {
        return new Response(JSON.stringify({ error: result.error.errors }), {
            status: 400,
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { model, chatId, messages } = result.data;
    console.dir(messages);
    console.log(chatId);
    console.log(model);

    const stream = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        messages: messages,
        stream: true,
    });

    return new StreamingTextResponse(OpenAIStream(stream));
}
