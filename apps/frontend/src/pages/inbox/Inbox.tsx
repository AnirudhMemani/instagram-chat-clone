import { chatRoomAtom } from "@/state/chat";
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { StartChatPrompt } from "./StartChatPrompt";

const Inbox = () => {
    const setChatRoomDetails = useSetRecoilState(chatRoomAtom);

    useEffect(() => {
        setChatRoomDetails(null);
    }, []);

    return (
        <div className="hidden h-dvh w-full lg:flex">
            <StartChatPrompt />
        </div>
    );
};

export default Inbox;
