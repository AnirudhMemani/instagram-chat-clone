import { profilePicAtom, userIdAtom, usernameAtom } from "@/state/user";
import { Edit } from "lucide-react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { ChatPreviewBox, TChatPreviewBoxProps } from "./ChatPreviewBox";
import { isChatModalVisibleAtom, loadingAtom } from "@/state/global";
import { UserLoadingSkeleton } from "@/components/UserLoadingSkeleton";
import { useEffect } from "react";
import { getUserDirectMessages } from "@/api/users-api";

const DirectMessage: React.FC = (): JSX.Element => {
    const username = useRecoilValue(usernameAtom);
    const profilePic = useRecoilValue(profilePicAtom);
    const id = useRecoilValue(userIdAtom);
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
    const [isLoading, setIsLoading] = useRecoilState(loadingAtom);

    const populateDirectMessages = async () => {
        try {
            setIsLoading(true);

            await getUserDirectMessages(id);
        } catch (error) {
            //
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        populateDirectMessages();
    }, []);

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
                {chatPreview && chatPreview.length > 0 ? (
                    chatPreview.map((dm, index) => (
                        <ChatPreviewBox
                            key={index}
                            messageAge={dm.messageAge}
                            profilePic={dm.profilePic}
                            recentMessage={dm.recentMessage}
                            fullName={dm.fullName}
                            unReadMessage={dm.unReadMessage}
                        />
                    ))
                ) : (
                    <div className="flex flex-col gap-4 mr-2">
                        {Array.from({ length: 10 }, (_, index) => (
                            <UserLoadingSkeleton key={index} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DirectMessage;
