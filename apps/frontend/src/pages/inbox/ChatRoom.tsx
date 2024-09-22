import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TWebSocket } from "@/utils/types";
import { CircleAlert, EllipsisVertical, Smile } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import EmojiPicker, {
	EmojiClickData,
	SuggestionMode,
} from "emoji-picker-react";
import { Theme } from "emoji-picker-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import {
	CHANGE_GROUP_NAME,
	ERROR,
	CHATROOM_DETAILS_BY_ID,
	LEAVE_GROUP_CHAT,
	MAKE_ADMIN,
	NEW_MESSAGE,
	REMOVE_AS_ADMIN,
	SUCCESS,
} from "@instachat/messages/messages";
import { IMessage } from "@instachat/messages/types";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { chatRoomAtom, groupAtom } from "@/state/chat";
import { Button } from "@/components/ui/button";
import { EditModal } from "@/components/EditModal";
import { DialogBox } from "@/components/DialogBox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { userAtom } from "@/state/user";
import { isChatModalVisibleAtom } from "@/state/global";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import { useNavigate, useParams } from "react-router-dom";
import { NavigationRoutes } from "@/utils/constants";

export const ChatRoom: React.FC<TWebSocket> = ({ socket }): JSX.Element => {
	const [isEmojiPickerVisible, setIsEmojiPickerVisible] =
		useState<boolean>(false);
	const [message, setMessage] = useState<string>("");
	const [isRoomInfoVisible, setIsRoomInfoVisible] = useState<boolean>(false);
	const [isEditNameModalVisible, setIsEditNameModalVisible] =
		useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [chatRoomImage, setChatRoomImage] = useState<string>("");
	const [chatRoomName, setChatRoomName] = useState<string>("");

	const [chatRoomState, setChatRoomState] = useRecoilState(chatRoomAtom);
	const [groupState, setGroupState] = useRecoilState(groupAtom);
	const [newGroupName, setNewGroupName] = useState<string>("");
	const setIsChatModalVisible = useSetRecoilState(isChatModalVisibleAtom);
	const user = useRecoilValue(userAtom);

	const [isAdmin, setIsAdmin] = useState<boolean>(false);

	const messageInputRef = useRef<HTMLInputElement | null>(null);
	const emojiPickerRef = useRef<HTMLDivElement | null>(null);

	const { theme } = useTheme();
	const { id } = useParams();
	const navigate = useNavigate();

	const commonToastErrorMessage = ({
		title,
		description,
	}: {
		title?: string;
		description?: string;
	}) => {
		toast.error(title ?? "Uh oh! Something went wrong", {
			description,
		});
	};

	useEffect(() => {
		if (chatRoomState) {
			console.log("chatRoomState found in chat room component:", chatRoomState);
			setChatRoomName(groupState ? groupState.name : chatRoomState.name);
			setChatRoomImage(
				groupState
					? groupState.picture
					: chatRoomState.participants[0].profilePic !== user.profilePic
						? chatRoomState.participants[0].profilePic
						: chatRoomState.participants[1].profilePic
			);
			setIsAdmin(
				groupState
					? groupState.adminOf.some((admin) => admin.id === user.id)
					: false
			);
			if (groupState) {
				setNewGroupName(groupState.name);
			}
		}
	}, [chatRoomState]);

	useEffect(() => {
		if (!socket) {
			return;
		}

		if (!chatRoomState || id !== chatRoomState.id) {
			const getChatRoomDetailsByIdMessage = {
				type: CHATROOM_DETAILS_BY_ID,
				payload: {
					chatRoomId: id,
					userId: user.id,
				},
			};

			socket.send(JSON.stringify(getChatRoomDetailsByIdMessage));
		}

		socket.onmessage = (event) => {
			try {
				const responseMessage = JSON.parse(event.data) as IMessage;

				if (responseMessage.type === CHATROOM_DETAILS_BY_ID) {
					if (responseMessage.payload.error) {
						navigate(NavigationRoutes.Inbox, {
							replace: true,
						});
						toast.error("This DM does not exists", {
							richColors: true,
						});
						return;
					}

					const isGroup = Boolean(responseMessage.payload.groupDetails);

					setChatRoomState({
						...responseMessage.payload.chatRoomDetails,
						isGroup: isGroup,
					});

					if (isGroup) {
						setGroupState(responseMessage.payload.groupDetails);
					}
					return;
				}

				if (chatRoomState && groupState) {
					switch (responseMessage.type) {
						case CHANGE_GROUP_NAME:
							if (responseMessage.payload.result === SUCCESS) {
								setGroupState({
									...groupState,
									name: responseMessage.payload.groupName,
								});
								setChatRoomState({
									...chatRoomState,
									name: responseMessage.payload.groupName,
								});
							} else if (responseMessage.payload.result === ERROR) {
								commonToastErrorMessage({
									title: "Permission Denied",
									description:
										"Only a member of the group can change the group name",
								});
							} else {
								commonToastErrorMessage({
									description:
										"There was an issue with your request. Please try again",
								});
							}
							break;
						case LEAVE_GROUP_CHAT:
							if (responseMessage.payload.result === ERROR) {
								commonToastErrorMessage({
									description: "You are not a part of this group chat",
								});
							} else if (responseMessage.payload.result === SUCCESS) {
								const id = responseMessage.payload.userId;
								setChatRoomState({
									...chatRoomState,
									participants: chatRoomState.participants.filter(
										(participant) => participant.id !== id
									),
								});
								setGroupState({
									...groupState,
									adminOf: groupState.adminOf.filter(
										(admin) => admin.id !== id
									),
								});
							} else {
								commonToastErrorMessage({
									description:
										"There was an issue with your request. Please try again",
								});
							}
							break;
						case MAKE_ADMIN:
							if (responseMessage.payload.result === ERROR) {
								commonToastErrorMessage({});
							} else {
								const userDetails = responseMessage.payload.userDetails;
								setGroupState({
									...groupState,
									adminOf: [...groupState.adminOf, userDetails],
								});
							}
							break;
						case REMOVE_AS_ADMIN:
							if (responseMessage.payload.result === ERROR) {
								commonToastErrorMessage({});
							} else {
								const adminId = responseMessage.payload.adminId;
								setGroupState({
									...groupState,
									adminOf: groupState.adminOf.filter(
										(admin) => admin.id !== adminId
									),
								});
							}
							break;
						case NEW_MESSAGE:
							console.log("new message");
							break;
					}
				}
			} catch (error) {
				console.log(error);
				commonToastErrorMessage({
					description: "There was an issue with your request. Please try again",
				});
			} finally {
				setIsEditNameModalVisible(false);
				setIsLoading(false);
			}
		};
	}, [socket]);

	useEffect(() => {
		const closeEmojiPicker = (e: MouseEvent) => {
			if (
				emojiPickerRef.current &&
				!emojiPickerRef.current.contains(e.target as Node)
			) {
				setIsEmojiPickerVisible(false);
			}
		};

		document.addEventListener("mousedown", closeEmojiPicker);

		return () => {
			document.removeEventListener("mousedown", closeEmojiPicker);
		};
	}, []);

	const handleEmojiClick = (e: EmojiClickData) => {
		setMessage((p) => p + e.emoji);
		if (messageInputRef.current) {
			messageInputRef.current.focus();
		}
	};

	const handleAddMembers = () => {
		setIsChatModalVisible(true);
	};

	const handleSendMessage = () => {
		if (message.length < 1) {
			return;
		}

		if (!socket) {
			return;
		}

		const newMessage: IMessage = {
			type: NEW_MESSAGE,
			payload: {
				content: message,
				senderId: user.id,
				chatRoomId: chatRoomState?.id,
			},
		};

		socket.send(JSON.stringify(newMessage));
	};

	const handleChangeGroupName = async (e: FormEvent) => {
		e.preventDefault();
		if (!groupState) {
			return;
		}

		if (newGroupName.trim() === groupState.name) {
			setNewGroupName((p) => p.trim());
			setIsEditNameModalVisible(false);
			return;
		}

		try {
			if (!socket) {
				return;
			}

			setIsLoading(true);

			const changeGroupNameMessage: IMessage = {
				type: CHANGE_GROUP_NAME,
				payload: {
					chatRoomId: groupState.id,
					groupName: newGroupName,
				},
			};

			socket.send(JSON.stringify(changeGroupNameMessage));
		} catch (error) {
			console.error(error);
			commonToastErrorMessage({
				description: "Could not process your request. Please try again!",
			});
			setIsEditNameModalVisible(false);
			setIsLoading(false);
		}
	};

	const handleLeaveGroupChat = () => {
		try {
			if (!socket) {
				return;
			}

			if (!groupState) {
				return;
			}

			const leaveGroupChatMessage: IMessage = {
				type: LEAVE_GROUP_CHAT,
				payload: {
					chatRoomId: groupState.id,
				},
			};

			setIsLoading(true);
			socket.send(JSON.stringify(leaveGroupChatMessage));
		} catch (error) {
			console.log(error);
			setIsLoading(false);
			commonToastErrorMessage({
				description: "There was an issue with your request. Please try again",
			});
		}
	};

	const handleDeleteGroupChat = () => {};

	const handleRemoveUserFromGroup = () => {};

	const handleAdminStatusChange = (
		userId: string,
		action: "Make admin" | "Remove as admin"
	) => {
		try {
			if (!socket) {
				return;
			}

			if (!groupState) {
				return;
			}

			setIsLoading(true);

			if (action === "Make admin") {
				socket.send(
					JSON.stringify({
						type: MAKE_ADMIN,
						payload: {
							userId,
							groupId: groupState.id,
						},
					})
				);
				return;
			}

			if (action === "Remove as admin") {
				socket.send(
					JSON.stringify({
						type: REMOVE_AS_ADMIN,
						payload: {
							userId,
							groupId: groupState.id,
						},
					})
				);
			}
		} catch (error) {
			console.log(error);
			setIsLoading(false);
		}
	};

	if (!chatRoomState) {
		return (
			<div className="flex items-center justify-center h-dvh w-full bg-black/60">
				<ClipLoader size={30} color="#9ca3af" />
			</div>
		);
	}

	return (
		<div className="h-dvh w-full flex overflow-hidden">
			<div className="h-full w-full flex flex-col items-center overflow-hidden">
				{/* header */}
				<div className="flex items-center w-full justify-between p-4 border-b border-input">
					<div className="flex gap-3 items-center">
						<Avatar
							className="size-12 cursor-pointer select-none"
							onClick={() => setIsRoomInfoVisible((p) => !p)}
						>
							<AvatarImage src={chatRoomImage} alt="Group Image" />
							<AvatarFallback>
								{chatRoomName.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<h1
							className="font-semibold cursor-pointer select-none"
							onClick={() => setIsRoomInfoVisible((p) => !p)}
						>
							{chatRoomName}
						</h1>
					</div>
					<CircleAlert
						className={cn(
							"rotate-180 cursor-pointer active:brightness-50",
							isRoomInfoVisible && "fill-white text-black"
						)}
						onClick={() => setIsRoomInfoVisible((p) => !p)}
					/>
				</div>
				{/* messages */}
				<div className="flex-grow w-full overflow-y-scroll scrollbar"></div>
				<div className="w-[98%] flex items-center rounded-full border border-input py-2 pl-4 pr-6 my-4 gap-4">
					<div ref={emojiPickerRef} className="relative">
						<EmojiPicker
							open={isEmojiPickerVisible}
							theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
							onEmojiClick={handleEmojiClick}
							autoFocusSearch={false}
							suggestedEmojisMode={SuggestionMode.FREQUENT}
							className="!absolute bottom-[150%]"
							height={400}
						/>
						<Smile
							className="size-7 active:brightness-50 cursor-pointer"
							onClick={() => setIsEmojiPickerVisible((p) => !p)}
						/>
					</div>
					<input
						className="bg-transparent border-none outline-none w-full text-lg"
						type="text"
						id={"message"}
						placeholder="Message..."
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						ref={messageInputRef}
					/>
					<p
						className={cn(
							"text-gray-400 cursor-not-allowed select-none",
							message.length > 0 &&
								"text-blue-400 cursor-pointer active:scale-95 active:text-blue-700"
						)}
						onClick={handleSendMessage}
					>
						Send
					</p>
				</div>
			</div>
			{isRoomInfoVisible && (
				<div className="w-[550px] h-full flex flex-col border-l border-input ml-[1px]">
					<h1 className="p-6 border-b border-input text-2xl font-semibold">
						Details
					</h1>
					{chatRoomState.isGroup && (
						<div className="flex items-center justify-between p-6 border-b border-input">
							<p>Change group name</p>
							<EditModal
								title="Change group name"
								label="New group name"
								placeholder="Change name to..."
								description="Changing the name of a group chat changes it for everyone."
								value={newGroupName}
								onChange={(e) => setNewGroupName(e.target.value)}
								open={isEditNameModalVisible}
								setOpen={setIsEditNameModalVisible}
								onSubmit={handleChangeGroupName}
								submitLabel={
									!isLoading ? (
										"Save"
									) : (
										<div className={cn("flex items-center gap-2")}>
											<p>Saving...</p>
											<ClipLoader size={15} color="#0F172A" />
										</div>
									)
								}
								disabled={isLoading}
								required
							>
								<Button
									variant="outline"
									onClick={() => setIsEditNameModalVisible((p) => !p)}
								>
									Change
								</Button>
							</EditModal>
						</div>
					)}
					<div className="p-6 flex items-center justify-between">
						<p className="font-medium">
							{chatRoomState.participants.length > 2 ? "Members" : "Member"}
						</p>
						{groupState &&
							groupState.adminOf.some((admin) => admin.id === user.id) && (
								<Button
									variant="ghost"
									className="text-blue-400 cursor-pointer active:scale-95 active:text-blue-700 !p-0 hover:!bg-transparent"
									onClick={handleAddMembers}
								>
									Add people
								</Button>
							)}
					</div>
					<div className="flex flex-grow w-full flex-col gap-4 overflow-y-auto px-6">
						{chatRoomState.participants
							.map((member) => {
								const isUserAdmin =
									groupState &&
									groupState.adminOf.some((admin) => admin.id === member.id);
								const isUserSuperAdmin =
									groupState && groupState.superAdminId === member.id;
								if (!chatRoomState.isGroup && member.id === user.id) {
									return;
								}
								return (
									<div className="flex justify-between items-center w-full">
										<div className="flex gap-3 items-center">
											<Avatar className="size-16">
												<AvatarImage src={member.profilePic} />
												<AvatarFallback>
													{member.fullName.slice(0, 2).toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div className="flex flex-col gap-1">
												<p className="text-sm line-clamp-1 font-bold text-ellipsis">
													{member.username}
												</p>
												<div className="flex text-xs items-center text-gray-400 font-bold">
													{isUserAdmin && (
														<span className="after:px-1 after:text-gray-400 after:content-['·']">
															Admin
														</span>
													)}
													<p className="line-clamp-1 text-ellipsis">
														{member.fullName}
													</p>
												</div>
											</div>
										</div>
										{isAdmin && !isUserSuperAdmin && (
											<DropdownMenu>
												<DropdownMenuTrigger>
													<EllipsisVertical className="size-5 cursor-pointer active:brightness-50 select-none" />
												</DropdownMenuTrigger>
												<DropdownMenuContent>
													<DropdownMenuItem asChild>
														<DialogBox
															title="Remove from the group?"
															description={`You are about to remove ${member.fullName} from the group`}
															positiveTitle="Remove"
															negativeTitle="Cancel"
															PositiveButtonStyles="!bg-destructive dark:text-slate-200 text-black"
															positiveOnClick={handleRemoveUserFromGroup}
														>
															<Button
																variant="outline"
																className="w-full text-destructive justify-start border-0 text-sm px-2 rounde-sm"
																disabled={isLoading}
															>
																Remove from the group
															</Button>
														</DialogBox>
													</DropdownMenuItem>
													<DropdownMenuItem
														className={isUserAdmin ? "text-destructive" : ""}
														onClick={() =>
															handleAdminStatusChange(
																member.id,
																isUserAdmin ? "Remove as admin" : "Make admin"
															)
														}
													>
														{isUserAdmin ? "Remove as admin" : "Make admin"}
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										)}
									</div>
								);
							})
							.reverse()}
					</div>

					<div className="flex justify-center flex-col border-t items-start border-input p-6 gap-4 w-full">
						{chatRoomState.isGroup && (
							<>
								<DialogBox
									positiveTitle="Leave"
									negativeTitle="Cancel"
									title="Leave chat"
									description="You won't be able to send or receive messages unless someone adds you back to the chat. No one will be notified that you left the chat."
									positiveOnClick={handleLeaveGroupChat}
									PositiveButtonStyles="!bg-destructive dark:text-slate-200 text-black"
								>
									<Button
										variant="ghost"
										className="text-destructive select-none p-0 cursor-pointer hover:!bg-transparent text-base"
									>
										Leave chat
									</Button>
								</DialogBox>
								<p>
									You won't be able to send or receive messages unless someone
									adds you back to the chat. No one will be notified that you
									left the chat.
								</p>
							</>
						)}
						{(isAdmin || !chatRoomState.isGroup) && (
							<DialogBox
								positiveTitle="Delete"
								negativeTitle="Cancel"
								title="Permanently delete this chat?"
								description="This chat and all it's messages will be deleted forever."
								positiveOnClick={handleDeleteGroupChat}
								PositiveButtonStyles="!bg-destructive dark:text-slate-200 text-black"
							>
								<Button
									variant="ghost"
									className="text-destructive select-none cursor-pointer p-0 hover:!bg-transparent text-base"
								>
									Delete chat
								</Button>
							</DialogBox>
						)}
					</div>
				</div>
			)}
		</div>
	);
};
