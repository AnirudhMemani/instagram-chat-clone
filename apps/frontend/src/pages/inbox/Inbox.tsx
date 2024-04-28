import { StartChatPrompt } from "./StartChatPrompt";
import DirectMessage from "./DirectMessages";
import Sidebar from "./Sidebar";
import { NewChatModal } from "@/components/NewChatModal";
import { useSocket } from "@/hooks/useSocket";

const Inbox: React.FC = (): JSX.Element => {
    const socket = useSocket();

    return (
        <>
            <div className="flex lg:flex-row flex-col h-dvh w-full">
                <Sidebar className="lg:block hidden" />
                <DirectMessage socket={socket} />
                <StartChatPrompt />
                <Sidebar className="lg:hidden bottom-0 z-20" />
                <NewChatModal socket={socket} />
            </div>
        </>
    );
};

export default Inbox;
