import DarkModeToggle from "@/components/DarkModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { alertModalAtom, isLoadingAtom } from "@/state/global";
import { userAtom } from "@/state/user";
import { NAVIGATION_ROUTES, getAvatarFallback, handleUserLogout } from "@/utils/constants";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";

type TSidebarProps = {
    className?: string;
};

const Sidebar: React.FC<TSidebarProps> = ({ className }): JSX.Element => {
    const user = useRecoilValue(userAtom);
    const isLoading = useRecoilValue(isLoadingAtom);

    const setAlertModalMetadata = useSetRecoilState(alertModalAtom);

    const navigate = useNavigate();

    return (
        <div
            className={cn(
                "dark:bg-background bg-background z-50 w-fit max-lg:fixed max-lg:bottom-0 max-lg:w-full lg:h-dvh",
                className
            )}
        >
            <div className="flex h-full w-full items-center justify-center gap-6 border-t border-gray-950 py-3 lg:w-fit lg:flex-col lg:border-r lg:px-6 lg:py-0 dark:border-gray-700">
                <Home
                    className="size-7 cursor-pointer select-none active:brightness-50"
                    aria-disabled={isLoading}
                    onClick={() => navigate(NAVIGATION_ROUTES.INBOX, { replace: true })}
                />
                <DropdownMenu>
                    <DropdownMenuTrigger disabled={isLoading}>
                        <Avatar className="select-none">
                            <AvatarImage src={user.profilePic} />
                            <AvatarFallback>{getAvatarFallback(user.username)}</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="dark:bg-background bg-background">
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() =>
                                setAlertModalMetadata({
                                    visible: true,
                                    title: "Are you sure you want to logout?",
                                    positiveTitle: "Logout",
                                    positiveOnClick: () => handleUserLogout(navigate),
                                })
                            }
                            disabled={isLoading}
                        >
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DarkModeToggle />
            </div>
        </div>
    );
};

export default Sidebar;
