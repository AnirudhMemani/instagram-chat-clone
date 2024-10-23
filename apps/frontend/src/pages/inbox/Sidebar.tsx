import DarkModeToggle from "@/components/DarkModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { NAVIGATION_ROUTES, handleUserLogout } from "@/utils/constants";
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
        <div className={cn("w-full lg:h-dvh lg:w-fit", className)}>
            <div className="flex h-full w-full justify-center gap-6 border-t border-gray-950 py-3 lg:w-fit lg:flex-col lg:border-r lg:px-6 lg:py-0 dark:border-gray-700">
                <Home
                    className="size-10 cursor-pointer select-none active:brightness-50"
                    aria-disabled={isLoading}
                    onClick={() => navigate(NAVIGATION_ROUTES.INBOX, { replace: true })}
                />
                <DropdownMenu>
                    <DropdownMenuTrigger disabled={isLoading}>
                        <Avatar className="select-none">
                            <AvatarImage src={user.profilePic} />
                            <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-start border-0 px-2 text-sm"
                                disabled={isLoading}
                                onClick={() =>
                                    setAlertModalMetadata({
                                        visible: true,
                                        title: "Are you sure you want to logout?",
                                        positiveTitle: "Logout",
                                        positiveOnClick: () => handleUserLogout(navigate),
                                    })
                                }
                            >
                                Logout
                            </Button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DarkModeToggle />
            </div>
        </div>
    );
};

export default Sidebar;
