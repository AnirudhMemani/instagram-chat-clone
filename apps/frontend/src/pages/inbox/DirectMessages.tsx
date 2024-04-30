import { profilePicAtom, usernameAtom } from "@/state/user";
import { Edit } from "lucide-react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { ChatPreviewBox, TChatPreviewBoxProps } from "./ChatPreviewBox";
import { isChatModalVisibleAtom } from "@/state/global";
import { UserLoadingSkeleton } from "@/components/UserLoadingSkeleton";
import { useEffect, useState } from "react";
import { GET_DM } from "@instachat/messages/messages";
import { IMessage } from "@instachat/messages/types";

const DirectMessage: React.FC<{ socket: WebSocket | null }> = ({
    socket,
}): JSX.Element => {
    const [DM, setDM] = useState<TChatPreviewBoxProps[]>();
    const username = useRecoilValue(usernameAtom);
    const profilePic = useRecoilValue(profilePicAtom);
    // @ts-ignore
    const chatPreview: TChatPreviewBoxProps[] = [
        {
            messageAge: "2hr",
            profilePic: profilePic,
            recentMessage: "Hello",
            fullName: "roman_.reigns",
            unReadMessage: false,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
        {
            messageAge: "10hr",
            profilePic: profilePic,
            recentMessage: "You have sent an attachment",
            fullName: "Shrii",
            unReadMessage: true,
        },
    ];

    const setIsChatModalVisible = useSetRecoilState(isChatModalVisibleAtom);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!socket) {
            console.log("DirectMessage() - Socket not found");
            return;
        }

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data) as IMessage;
            if (message.type === GET_DM) {
                setDM(message.payload);
                setIsLoading(false);
            }
        };

        const getUserDM = {
            type: GET_DM,
            payload: {
                take: 20,
                skip: 0,
            },
        };

        setIsLoading(true);
        socket.send(JSON.stringify(getUserDM));

        return () => {
            socket.onmessage = null;
        };
    }, [socket]);

    return (
        <div className="h-dvh w-full overflow-y-hidden lg:w-[450px] xl:w-[550px] border-r border-gray-700">
            <div className="font-bold px-6">
                <div className="flex justify-between items-center pt-9 pb-3">
                    <h2 className="text-xl">{username}</h2>
                    <Edit
                        className="size-6 cursor-pointer active:scale-95"
                        onClick={() => setIsChatModalVisible(true)}
                        aria-disabled={isLoading}
                    />
                </div>
                <h2 className="pt-3 pb-5">Messages</h2>
            </div>
            <div className="flex h-dvh overflow-y-scroll scrollbar pl-6 flex-col gap-4 w-full">
                {DM && DM.length > 0 ? (
                    DM.map((dm, index) => (
                        <ChatPreviewBox
                            key={index}
                            messageAge={dm.messageAge}
                            profilePic={dm.profilePic}
                            recentMessage={dm.recentMessage}
                            fullName={dm.fullName}
                            unReadMessage={dm.unReadMessage}
                        />
                    ))
                ) : isLoading ? (
                    <div className="flex flex-col gap-4 mr-2">
                        {Array.from({ length: 10 }, (_, index) => (
                            <UserLoadingSkeleton key={index} />
                        ))}
                    </div>
                ) : (
                    <div>Your DMs are empty. Start a new conversation </div>
                )}
            </div>
        </div>
    );
};

export default DirectMessage;
