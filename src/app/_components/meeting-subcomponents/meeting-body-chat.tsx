import { type Message } from "ai";
import { api } from "~/trpc/react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarImage } from "../ui/avatar";
import Chat from "../ui/chat";

interface ChatBodyProps {
    meetingId: string;
}

export default function ChatBody({ meetingId }: ChatBodyProps) {
    const [chatActive, setChatActive] = useState<Chat<Message> | undefined>(
        undefined,
    );
    const [chatList, setChatList] = useState<Chat<Message>[]>([]);
    const chatListInitial: Chat<Message>[] =
        api.chat.getList.useQuery(
            {
                meetingId: meetingId,
            },
            {
                onSuccess: (data: Chat<Message>[]) => {
                    setChatList(data);
                },
            },
        ).data ?? [];

    const addNewChatToList = (chat: Chat<Message>): void => {
        setChatList([...chatList, chat]);
    };

    return (
        <div className="flex h-[55vh] flex-row">
            <div className=" flex w-52 flex-col gap-2">
                <Button
                    size="custom"
                    variant="default"
                    className="mr-3 justify-start px-2 py-1.5"
                    onClick={() => {
                        setChatActive(undefined);
                    }}
                >
                    <Avatar className="mr-1 flex h-5 w-5">
                        <AvatarImage
                            src={"./images/chatgpt-logo.svg"}
                            alt="@NewChatIcon"
                        />
                    </Avatar>
                    New Chat
                </Button>
                <ScrollArea className="pr-3">
                    <div className="flex w-full flex-col gap-1">
                        {chatList.map((chat) => {
                            return (
                                <Button
                                    key={chat.id}
                                    size="custom"
                                    variant="outline"
                                    className={`justify-start px-2 py-1.5 ${chat === chatActive ? "bg-red-500" : ""}`}
                                    onClick={() => {
                                        setChatActive(chat);
                                        console.log("Set New Chat as active");
                                    }}
                                >
                                    {chat.name}
                                </Button>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>

            <div className=" h-full w-full flex-grow rounded border-2">
                <Chat
                    meetingId={meetingId}
                    chatId={chatActive?.id}
                    addNewChatToList={addNewChatToList}
                    chatActive={chatActive}
                    setChatActive={setChatActive}
                ></Chat>
            </div>
        </div>
    );
}
