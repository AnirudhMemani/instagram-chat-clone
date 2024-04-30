import { useSocket } from "@/hooks/useSocket";
import { LargeScreenInbox } from "./LargeScreenInbox";
import { isChatModalVisibleAtom } from "@/state/global";
import { useRecoilValue } from "recoil";
import { NewChatModal } from "@/components/NewChatModal";

const Inbox: React.FC = (): JSX.Element => {
    const socket = useSocket();
    const isChatModalVisible = useRecoilValue(isChatModalVisibleAtom);

    return (
        <>
            <LargeScreenInbox socket={socket} />
            {isChatModalVisible && <NewChatModal socket={socket} />}
        </>
    );
};

export default Inbox;
