"use client";

import { type Message } from "ai";
import { useChat } from "ai/react";
import { Dispatch, SetStateAction, useEffect } from "react";
import { type ChatRequestBody } from "~/app/api/chat/route";
import { api } from "~/trpc/react";

interface ChatProps {
    meetingId: string;
    chatId: string | undefined;
    addNewChatToList: (chat: Chat<Message>) => void;
    chatActive: Chat<Message> | undefined;
    setChatActive: Dispatch<SetStateAction<Chat<Message> | undefined>>;
}

export default function Chat({
    chatId,
    meetingId,
    addNewChatToList,
    chatActive,
    setChatActive,
}: ChatProps) {
    const chat: Chat<Message> | undefined = api.chat.get.useQuery(
        {
            chatId: chatId!,
        },
        { enabled: !!chatId },
    ).data;

    const utils = api.useUtils();
    const chatCreate = api.chat.create.useMutation();
    const chatSetMessages = api.chat.setMessages.useMutation();

    const messageBody: ChatRequestBody = {
        model: "gpt-4-turbo-preview",
        chatId: chatActive?.id,
    };
    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        stop,
        isLoading,
    } = useChat({
        id: chat?.id,
        body: messageBody,
        sendExtraMessageFields: false,
        initialMessages: chat ? chat.messages : [],
        onFinish: (message: Message) => {
            console.dir(messages);
            console.log(messages[0]?.content);
            if (chatActive) {
                const mess = test();
                chatSetMessages.mutate({
                    chatId: chatActive.id,
                    messages: mess,
                });
            }
        },
    });

    const test = () => {
        return messages;
    };

    return (
        <div>
            <span>
                {chat?.id}
                <br />
            </span>
            <button
                onClick={(event) => {
                    stop();
                    if (chatActive) {
                        console.log("chat active found, mutating");
                        console.log(`${chatActive.id}`);
                        chatSetMessages.mutate({
                            chatId: chatActive.id,
                            messages: messages,
                        });
                    }
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
                <form
                    onSubmit={async (
                        event: React.FormEvent<HTMLFormElement>,
                    ) => {
                        event.preventDefault();
                        if (!chat) {
                            const newChat: Chat<Message> | undefined =
                                await chatCreate.mutateAsync({
                                    meetingId: meetingId,
                                });
                            addNewChatToList(newChat);
                            setChatActive(newChat);
                            messageBody.chatId = newChat.id;
                        }
                        handleSubmit(event);
                    }}
                >
                    <label>
                        Say something...
                        <input value={input} onChange={handleInputChange} />
                    </label>
                    <button type="submit">Send</button>
                </form>
            </div>
        </div>
    );
}
