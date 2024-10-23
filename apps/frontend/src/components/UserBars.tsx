import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { TUsersSchema } from "./NewChatModal";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export interface IUserBarsProps extends TUsersSchema {
    isSelected?: boolean;
    onClick: () => void;
}

export const UserBars: React.FC<IUserBarsProps> = ({ fullName, profilePic, username, isSelected = false, onClick }) => {
    return (
        <div
            className="flex w-full cursor-pointer items-center px-6 py-2 hover:bg-[rgba(30,41,59,0.5)] active:scale-[0.98]"
            onClick={onClick}
        >
            <div className="flex w-full flex-grow items-center gap-3">
                <Avatar className="size-12">
                    <AvatarImage src={profilePic} />
                    <AvatarFallback>{fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                    <p>{fullName}</p>
                    <p className="text-gray-400">{username}</p>
                </div>
            </div>
            <div
                className={cn(
                    "border-input flex items-center justify-center rounded-full border",
                    !isSelected && "bg-transparent p-3"
                )}
            >
                <Check className={cn(isSelected ? "bg-secondary border-input size-6 rounded-full border" : "hidden")} />
            </div>
        </div>
    );
};
