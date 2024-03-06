"use client";

import { type Message } from "ai";
import { useChat } from "ai/react";
import { type ChatRequestBody } from "~/app/api/chat/route";
import { api } from "~/trpc/react";

interface ChatProps {
    chatId: string | undefined;
}

export default function Chat({ chatId }: ChatProps) {
    const chat: Chat<Message> | undefined = chatId
        ? api.chat.get.useQuery({
              chatId: chatId,
          }).data
        : undefined;

    const messageBody: ChatRequestBody = {
        model: "gpt-4-turbo-preview",
        chatId: chat?.id,
    };
    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        stop,
        isLoading,
    } = useChat({
        body: messageBody,
        initialMessages: chat ? chat.messages : [],
        onFinish: (message: Message) => {
            console.log(message.content);
        },
    });

    return (
        <div>
            <button
                onClick={(event) => {
                    stop();
                    console.log(messages[messages.length - 1]?.content);
                }}
            >
                Stop
            </button>
            <div>{chat ? "chat exists" : "chat doesn't exist"}</div>
            <div>
                <ul>
                    {messages.map((m, index) => (
                        <li key={index}>
                            {m.role === "user" ? "User: " : "AI: "}
                            {m.content}
                        </li>
                    ))}
                </ul>

                <form onSubmit={handleSubmit}>
                    <label>
                        Say something...
                        <input value={input} onChange={handleInputChange} />
                    </label>
                    <button type="submit">Send</button>{" "}
                </form>
            </div>
        </div>
    );
}
