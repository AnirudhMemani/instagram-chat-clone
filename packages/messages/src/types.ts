export interface IMessage {
    type: string;
    payload: any;
}

export interface IStartConvoMessage extends IMessage {
    payload: {
        userDetails: {
            id: string;
            fullName: string;
        }[];
        groupDetails: {
            name: string;
            profilePic: any;
            pictureName: string;
        };
    };
}
