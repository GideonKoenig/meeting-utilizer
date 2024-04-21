import { api } from "~/trpc/react";
import { useState } from "react";
import { Button } from "../../ui/button";
import { ScrollArea } from "../../ui/scroll-area";
import { Avatar, AvatarImage } from "../../ui/avatar";
import Chat from "../../ui/chat";
import { type Message } from "~/server/api/routers/chat-utils";

interface ChatBodyProps {
    meetingId: string;
}

export default function ChatBody({ meetingId }: ChatBodyProps) {
    const [chatActive, setChatActive] = useState<Chat<Message> | undefined>(
        undefined,
    );

    const chatList =
        api.chat.getList.useQuery({
            meetingId: meetingId,
        }).data ?? [];

    return (
        <div className="flex h-[55vh] w-full flex-row">
            <div className=" flex min-w-40 flex-col gap-2">
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
                                    data-selected={chat.id == chatActive?.id}
                                    className={`justify-start bg-slate-100 px-2 py-1.5 data-[selected="true"]:bg-white`}
                                    onClick={() => {
                                        setChatActive(chat);
                                    }}
                                >
                                    {chat.name}
                                </Button>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>

            <div className=" h-full flex-grow rounded border-2">
                <Chat
                    meetingId={meetingId}
                    chatId={chatActive?.id}
                    setChatActive={setChatActive}
                ></Chat>
            </div>
        </div>
    );
}
