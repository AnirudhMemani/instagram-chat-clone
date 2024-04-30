import DirectMessage from "./DirectMessages";
import Sidebar from "./Sidebar";
import { StartChatPrompt } from "./StartChatPrompt";
import React from "react";
import { useRecoilValue } from "recoil";
import { pageTypeAtom } from "@/state/global";
import GroupDetailsPage from "../group/GroupDetailsPage";
import { ChatRoom } from "./ChatRoom";

export const LargeScreenInbox: React.FC<{ socket: WebSocket | null }> = ({
    socket,
}) => {
    const pageType = useRecoilValue(pageTypeAtom);

    const getPage = (): JSX.Element => {
        switch (pageType) {
            case "StartChatPrompt":
                return <StartChatPrompt />;
            case "GroupDetailsPage":
                return <GroupDetailsPage socket={socket} />;
            case "ChatRoom":
                return <ChatRoom />;
            default:
                return <StartChatPrompt />;
        }
    };

    return (
        <div className="hidden lg:flex h-dvh w-full">
            <Sidebar className="lg:block hidden" />
            <DirectMessage socket={socket} />
            {getPage()}
        </div>
    );
};
