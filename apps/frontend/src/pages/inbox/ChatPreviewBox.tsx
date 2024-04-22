import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { env } from "@/utils/constants";
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
    const url = env.SERVER_URL;

    return (
        <div className="flex justify-between items-center w-full">
            <div className="flex gap-3 items-center">
                <Avatar className="size-14">
                    <AvatarImage src={`${url}/${profilePic}`} />
                    <AvatarFallback>
                        {fullName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                    <p
                        className={cn(
                            "text-sm line-clamp-1 text-ellipsis",
                            unReadMessage ? "font-bold" : "font-normal"
                        )}
                    >
                        {fullName}
                    </p>
                    <div className="flex text-xs items-center">
                        <p
                            className={cn(
                                "after:px-1 after:text-gray-400 after:content-['·'] line-clamp-1 text-ellipsis",
                                unReadMessage ? "font-bold" : "text-gray-400"
                            )}
                        >
                            {recentMessage}
                        </p>
                        <span className="text-gray-400">{messageAge}</span>
                    </div>
                </div>
            </div>
            {unReadMessage && <Dot className="text-blue-400 size-12" />}
        </div>
    );
};
