import { TMessage, TParticipant } from "@/state/chat";

export type TGroupExistsResponse = {
    existingGroups: {
        id: string;
        name: string;
        picture: string;
        createdBy: {
            id: string;
            username: string;
        };
        participants: {
            id: string;
            username: string;
            fullName: string;
            profilePic: string;
        }[];
    }[];
};

export type TLatestMessage = {
    id: string;
    content: string;
    sentAt: Date;
    sentBy: TParticipant;
    readBy: TParticipant[];
};

export type TGetInboxResponse =
    | {
          isGroup: true;
          name: string;
          picture: string;
          hasRead: boolean;
          chatRoomId: string;
          participants: TParticipant[];
          latestMessage: TLatestMessage;
      }
    | {
          isGroup: false;
          hasRead: boolean;
          chatRoomId: string;
          participants: TParticipant[];
          latestMessage: TLatestMessage;
      };

export type TNewMesageResponse = {
    message: string;
    messageDetails: {
        chatRoomId: string;
        isGroup: boolean;
        hasRead: boolean;
        roomType: "GROUP" | "DIRECT_MESSAGE";
        name: string;
        picture: string;
        participants: {
            id: string;
            username: string;
            fullName: string;
            profilePic: string;
        }[];
        latestMessage: TMessage | null;
    };
};

export type TReadMessageResponse = {
    message: string;
    readerId: string;
    chatRoomId: string;
};
