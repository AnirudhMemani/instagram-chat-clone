export interface IMessage<TPayload = any> {
    type: string;
    payload: TPayload;
    status?: number;
    success?: boolean;
}

export interface IStartConvoMessageRequest
    extends IMessage<{
        selectedUsers: {
            id: string;
            fullName: string;
        }[];
        groupDetails: {
            name: string;
            profilePic: any;
            pictureName: string;
        };
    }> {}

export interface IRoomExistsRequest
    extends IMessage<{
        selectedUsers: {
            id: string;
        }[];
    }> {}

export interface IGetChatRoomById
    extends IMessage<{
        chatRoomId: string;
    }> {}

export interface IUpdateChatRoomName
    extends IMessage<{
        chatRoomId: string;
        groupName: string;
    }> {}

export interface ILeaveGroupChat
    extends IMessage<{
        chatRoomId: string;
    }> {}

export interface ITransferSuperAdminAndLeaveGroupChat
    extends IMessage<{
        newSuperAdminId: string;
        chatRoomId: string;
    }> {}

export interface IRemoveUserFromGroupChat
    extends IMessage<{
        chatRoomId: string;
        removeUserId: string;
    }> {}

export interface IAddUserToGroupChat
    extends IMessage<{
        chatRoomId: string;
        addUsersId: string[];
    }> {}
