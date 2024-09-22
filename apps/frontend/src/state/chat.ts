import { atom } from "recoil";

type TParticipants = {
	id: string;
	username: string;
	fullName: string;
	profilePic: string;
};

type TAttachments = {
	id: string;
	url: string;
	contentType: string;
	size: number;
	sentAt: Date;
};

type TMessage = {
	id: string;
	content: string;
	contentType: string;
	senderId: string;
	sentAt: Date;
	editedAt: Date;
	Attachments: TAttachments[];
	readBy: TParticipants[];
	chatRoomId: string;
};

type TChatRoomAtom = {
	id: string;
	name: string;
	createdAt: Date;
	participants: TParticipants[];
	messages: TMessage[];
	isGroup: boolean;
};

type TGroupAtom = {
	id: string;
	name: string;
	picture: string;
	createdAt: Date;
	adminOf: Pick<TParticipants, "id">[];
	superAdminId: string;
	chatRoomId: string;
};

// @ts-ignore
const defaultChatRoomAtomValue: TChatRoomAtom = {
	id: "",
	name: "",
	createdAt: new Date(),
	participants: [],
	messages: [],
	isGroup: false,
};

// @ts-ignore
const defaultGroupAtomValue: TGroupAtom = {
	id: "",
	name: "",
	picture: "",
	createdAt: new Date(),
	adminOf: [],
	superAdminId: "",
	chatRoomId: "",
};

export const chatRoomAtom = atom<TChatRoomAtom | null>({
	key: "chatRoomAtom",
	default: null,
});

export const groupAtom = atom<TGroupAtom | null>({
	key: "groupAtom",
	default: null,
});
