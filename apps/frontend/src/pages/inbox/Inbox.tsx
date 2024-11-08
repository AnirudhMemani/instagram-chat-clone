import { chatRoomAtom } from "@/state/chat";
import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import DirectMessage from "./DirectMessages";
import { StartChatPrompt } from "./StartChatPrompt";

type TInboxProps = {
    socket: WebSocket | null;
};

const Inbox: React.FC<TInboxProps> = ({ socket }): JSX.Element => {
    const setChatRoomDetails = useSetRecoilState(chatRoomAtom);

    useEffect(() => {
        setChatRoomDetails(null);
    }, []);

    return (
        <React.Fragment>
            <StartChatPrompt />
            <DirectMessage socket={socket} className="lg:hidden" />
        </React.Fragment>
    );
};

export default Inbox;
