import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Dot } from "lucide-react";

export type TChatPreviewBoxProps = {
    fullName: string;
    profilePic: string;
    recentMessage: string;
    messageAge: string;
    unReadMessage?: boolean;
};

export const ChatPreviewBox: React.FC<TChatPreviewBoxProps> = ({
    messageAge,
    profilePic,
    recentMessage,
    fullName,
    unReadMessage = false,
}): JSX.Element => {
    return (
        <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
                <Avatar className="size-14">
                    <AvatarImage src={profilePic} />
                    <AvatarFallback>{fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                    <p
                        className={cn(
                            "line-clamp-1 text-ellipsis text-sm",
                            unReadMessage ? "font-bold" : "font-normal"
                        )}
                    >
                        {fullName}
                    </p>
                    <div className="flex items-center text-xs">
                        <p
                            className={cn(
                                "line-clamp-1 text-ellipsis after:px-1 after:text-gray-400 after:content-['·']",
                                unReadMessage ? "font-bold" : "text-gray-400"
                            )}
                        >
                            {recentMessage}
                        </p>
                        <span className="text-gray-400">{messageAge}</span>
                    </div>
                </div>
            </div>
            {unReadMessage && <Dot className="size-12 text-blue-400" />}
        </div>
    );
};
