"use client";

import { useChat } from "ai/react";
import {
    useRef,
    type ChangeEvent,
    type Dispatch,
    type SetStateAction,
} from "react";
import { type Message } from "~/server/api/routers/chat-utils";
import { api } from "~/trpc/react";
import { ScrollArea } from "./scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { useSession } from "next-auth/react";

interface ChatProps {
    meetingId: string;
    chatId: string | undefined;
    setChatActive: Dispatch<SetStateAction<Chat<Message> | undefined>>;
}

export default function Chat({ chatId, meetingId, setChatActive }: ChatProps) {
    const utils = api.useUtils();
    const chat = api.chat.get.useQuery(
        {
            chatId: chatId!,
        },
        { enabled: !!chatId },
    ).data;
    const scrollareaRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const chatCreate = api.chat.create.useMutation();
    const chatAddMessage = api.chat.addMessage.useMutation();
    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        stop,
        setMessages,
        isLoading,
    } = useChat({
        id: chat?.id,
        body: { model: "gpt-4-turbo-preview" },
        sendExtraMessageFields: false,
        initialMessages: chat ? chat.messages : [],
    });

    const { data: session } = useSession();
    const avatar: string = session
        ? session.user.image ?? ""
        : "./images/avatar-default.svg";

    return (
        <div className="flex h-full flex-col p-2">
            <ScrollArea ref={scrollareaRef} className="flex-grow pr-3">
                <ul className="grid gap-5 pb-7">
                    {messages
                        .filter((message) => {
                            return ["user", "assistant"].includes(message.role);
                        })
                        .map((message, index) => (
                            <li key={index}>
                                <div className="flex flex-row items-center">
                                    {message.role === "user" ? (
                                        <>
                                            <Avatar className="mr-1 flex h-5 w-5">
                                                <AvatarImage
                                                    src={avatar}
                                                    alt="@profilpicture"
                                                />
                                                <AvatarFallback>
                                                    {session?.user.name?.slice(
                                                        0,
                                                        2,
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className=" text-base font-bold">
                                                User
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Avatar className="mr-1 flex h-5 w-5">
                                                <AvatarImage
                                                    src={
                                                        "./images/chatgpt-logo.svg"
                                                    }
                                                    alt="@NewChatIcon"
                                                />
                                            </Avatar>
                                            <span className=" text-base font-bold">
                                                AI{" "}
                                            </span>
                                        </>
                                    )}
                                </div>
                                <div className="whitespace-pre-wrap pl-2">
                                    {message.content}
                                </div>
                            </li>
                        ))}
                </ul>
            </ScrollArea>
            <form
                ref={formRef}
                autoComplete="off"
                className="flex w-full flex-row"
                onSubmit={async (event: React.FormEvent<HTMLFormElement>) => {
                    event.preventDefault();
                    let newChat: Chat<Message> | undefined = undefined;
                    if (!chat) {
                        newChat = await chatCreate.mutateAsync({
                            meetingId: meetingId,
                        });
                        setChatActive(newChat);
                        await utils.chat.getList.invalidate();
                        await Promise.resolve(
                            // This is called async, so the Message is applied after the rerender from creating the new chat
                            setMessages(newChat.messages),
                        );
                    }
                    handleSubmit(event, {
                        options: {
                            body: {
                                chatId: newChat ? newChat.id : chat?.id,
                                newChat: !!newChat,
                            },
                        },
                    });
                }}
            >
                <div className=" flex flex-grow flex-row gap-2 rounded-lg border-2 p-2">
                    <textarea
                        className=" flex-grow resize-none bg-transparent focus-visible:outline-none"
                        placeholder="Ask me something..."
                        value={input}
                        data-lpignore="true"
                        rows={1}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                formRef.current!.requestSubmit();
                            }
                        }}
                        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                            event.target.style.height = `20px`;
                            const height = Math.min(
                                event.target.scrollHeight,
                                9 * 20,
                            );
                            event.target.style.height = `${height}px`;
                            handleInputChange(event);
                        }}
                    />
                    <button hidden={isLoading} type="submit">
                        Send
                    </button>
                    <button
                        hidden={!isLoading}
                        onClick={() => {
                            stop();
                            if (chat) {
                                chatAddMessage.mutate({
                                    chatId: chat.id,
                                    content:
                                        messages[messages.length - 1]!.content,
                                    role: "assistant",
                                });
                            }
                        }}
                    >
                        Stop
                    </button>
                </div>
            </form>
        </div>
    );
}
