import { StartChatPrompt } from "./StartChatPrompt";
import DirectMessage from "./DirectMessages";
import Sidebar from "./Sidebar";
import { NewChatModal } from "@/components/NewChatModal";

const Inbox: React.FC = (): JSX.Element => {
    return (
        <>
            <div className="flex lg:flex-row flex-col h-dvh w-full">
                <Sidebar className="lg:block hidden" />
                <DirectMessage />
                <StartChatPrompt />
                <Sidebar className="lg:hidden bottom-0 z-20" />
                <NewChatModal />
            </div>
        </>
    );
};

export default Inbox;
