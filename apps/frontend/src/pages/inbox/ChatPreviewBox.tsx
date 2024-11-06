import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Dot } from "lucide-react";

export type TChatPreviewBoxProps = {
    name: string;
    avatar: string;
    message: string;
    messageAge: string;
    hasRead?: boolean;
    onClick?: () => void;
};

export const ChatPreviewBox: React.FC<TChatPreviewBoxProps> = ({
    messageAge,
    avatar,
    message,
    name,
    onClick,
    hasRead = false,
}): JSX.Element => {
    return (
        <div className="flex w-full cursor-pointer items-center justify-between" onClick={onClick}>
            <div className="flex items-center gap-3">
                <Avatar className="size-14">
                    <AvatarImage src={avatar} />
                    <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                    <p className={cn("line-clamp-1 text-ellipsis text-sm", !hasRead ? "font-bold" : "font-normal")}>
                        {name}
                    </p>
                    <div className="flex items-center text-xs">
                        <p
                            className={cn(
                                "line-clamp-1 text-ellipsis after:px-1 after:text-gray-400 after:content-['·']",
                                !hasRead ? "font-bold" : "text-gray-400"
                            )}
                        >
                            {message}
                        </p>
                        <span className="text-gray-400">{messageAge}</span>
                    </div>
                </div>
            </div>
            {!hasRead && <Dot className="size-12 text-blue-400" />}
        </div>
    );
};
