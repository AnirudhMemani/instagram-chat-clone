import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type TGroupBarsProps = {
    name: string;
    picture?: string;
    participants: {
        id: string;
        username: string;
        profilePic: string;
    }[];
    onClick?: () => void;
};

const GroupBars: React.FC<TGroupBarsProps> = ({ name, picture, participants, onClick }): JSX.Element => {
    const getAvatarFallback = (name: string) => {
        const parts = name.split(" ");

        if (parts.length > 1) {
            return parts[0].slice(0, 1).toUpperCase() + parts[1].slice(0, 1).toUpperCase();
        }

        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div
            className="flex w-full cursor-pointer items-center px-6 py-2 hover:bg-[rgba(30,41,59,0.5)] active:scale-[0.98]"
            onClick={onClick}
        >
            <div className="flex w-full flex-grow items-center gap-3">
                <Avatar className="size-12">
                    <AvatarImage src={picture} />
                    <AvatarFallback>{getAvatarFallback(name)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1 text-sm">
                    <p>{name}</p>
                    <div className="flex items-center">
                        {participants.length &&
                            participants.slice(0, 5).map((member, index) => (
                                <Avatar className="size-4" key={`${member.id}${index}`}>
                                    <AvatarImage src={member.profilePic} />
                                    <AvatarFallback>{getAvatarFallback(member.username)}</AvatarFallback>
                                </Avatar>
                            ))}
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center rounded-full bg-green-400/90 p-2" />
        </div>
    );
};

export default GroupBars;
