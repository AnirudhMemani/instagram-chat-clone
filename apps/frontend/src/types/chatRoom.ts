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
