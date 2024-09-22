import { Edit } from "lucide-react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { ChatPreviewBox, TChatPreviewBoxProps } from "./ChatPreviewBox";
import { isChatModalVisibleAtom } from "@/state/global";
import { UserLoadingSkeleton } from "@/components/UserLoadingSkeleton";
import { useEffect, useState } from "react";
import { GET_DM } from "@instachat/messages/messages";
import { IMessage } from "@instachat/messages/types";
import { userAtom } from "@/state/user";
import { getMessageAge } from "@/utils/constants";

interface ISender {
	id: string;
	fullName: string;
	profilePic: string;
}

interface ILatestMessage {
	content: string;
	contentType: "ATTACHMENT" | "TEXT";
	sentAt: string;
	sentBy: ISender;
}

interface IUserDms {
	id: string;
	read: boolean;
	latestMessage: ILatestMessage;
}

const DirectMessage: React.FC<{ socket: WebSocket | null }> = ({
	socket,
}): JSX.Element => {
	const [dm, setDm] = useState<IUserDms[]>([]);
	const user = useRecoilValue(userAtom);
	// @ts-ignore
	const chatPreview: TChatPreviewBoxProps[] = [
		{
			messageAge: "2hr",
			profilePic: user.profilePic,
			recentMessage: "Hello",
			fullName: "roman_.reigns",
			unReadMessage: false,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
		{
			messageAge: "10hr",
			profilePic: user.profilePic,
			recentMessage: "You have sent an attachment",
			fullName: "Shrii",
			unReadMessage: true,
		},
	];

	const setIsChatModalVisible = useSetRecoilState(isChatModalVisibleAtom);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		if (!socket) {
			return;
		}

		socket.onmessage = (event) => {
			const message = JSON.parse(event.data) as IMessage;
			if (message.type === GET_DM) {
				setIsLoading(false);
				if (!message.payload.DM) {
					setDm([]);
					return;
				}
				setDm(message.payload.DM);
			}
		};

		const getUserDM = {
			type: GET_DM,
			payload: {
				take: 20,
				skip: 0,
			},
		};

		socket.send(JSON.stringify(getUserDM));
		setIsLoading(true);
	}, [socket]);

	const getLatestMessage = (userDms: IUserDms) => {
		if (userDms.latestMessage.contentType === "ATTACHMENT") {
			return userDms.latestMessage.sentBy.id === user.id
				? "You sent an attachment"
				: `${userDms.latestMessage.sentBy.fullName.split(" ")[0]} sent an attachment`;
		}

		return userDms.latestMessage.content;
	};

	return (
		<div className="h-dvh w-full overflow-y-hidden lg:w-[450px] xl:w-[550px] border-r border-gray-700">
			<div className="font-bold px-6">
				<div className="flex justify-between items-center pt-9 pb-3">
					<h2 className="text-xl">{user.username}</h2>
					<Edit
						className="size-6 cursor-pointer active:scale-95"
						onClick={() => setIsChatModalVisible(true)}
						aria-disabled={isLoading}
					/>
				</div>
				<h2 className="pt-3 pb-5">Messages</h2>
			</div>
			<div className="flex h-dvh overflow-y-scroll scrollbar pl-6 flex-col gap-4 w-full">
				{dm && dm.length > 0 ? (
					dm.map((_, index) => (
						<ChatPreviewBox
							key={index}
							messageAge={getMessageAge(_.latestMessage.sentAt)}
							profilePic={_.latestMessage.sentBy.profilePic}
							recentMessage={getLatestMessage(_)}
							fullName={_.latestMessage.sentBy.fullName}
							unReadMessage={_.read}
						/>
					))
				) : isLoading ? (
					<div className="flex flex-col gap-4 mr-2">
						{Array.from({ length: 10 }, (_, index) => (
							<UserLoadingSkeleton key={index} />
						))}
					</div>
				) : (
					<div>You do not have any DMs</div>
				)}
			</div>
		</div>
	);
};

export default DirectMessage;
