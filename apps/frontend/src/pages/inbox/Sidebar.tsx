import { Home } from "lucide-react";
import { useRecoilValue } from "recoil";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { profilePicAtom, usernameAtom } from "@/state/user";
import { useNavigate } from "react-router-dom";
import { NavigationRoutes, env, handleUserLogout } from "@/utils/constants";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { DialogBox } from "@/components/DialogBox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { loadingAtom } from "@/state/global";

type TSidebarProps = {
    className?: string;
};

const Sidebar: React.FC<TSidebarProps> = ({ className }): JSX.Element => {
    const profilePic = useRecoilValue(profilePicAtom);
    const username = useRecoilValue(usernameAtom);
    const isLoading = useRecoilValue(loadingAtom);

    const navigate = useNavigate();

    const url = env.SERVER_URL;

    return (
        <div className={cn("lg:h-dvh lg:w-fit w-full", className)}>
            <div className="flex lg:flex-col w-full lg:w-fit border-gray-950 justify-center h-full gap-6 lg:py-0 py-3 lg:px-6 border-t lg:border-r dark:border-gray-700">
                <Home
                    className="size-10 cursor-pointer"
                    aria-disabled={isLoading}
                    onClick={() =>
                        navigate(NavigationRoutes.Inbox, { replace: true })
                    }
                />
                <DropdownMenu>
                    <DropdownMenuTrigger disabled={isLoading}>
                        <Avatar>
                            <AvatarImage src={`${url}/${profilePic}`} />
                            <AvatarFallback>
                                {username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <ModeToggle />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <DialogBox
                                title="Are you sure you want to logout?"
                                positiveTitle="Logout"
                                positiveOnClick={() =>
                                    handleUserLogout(navigate)
                                }
                            >
                                <Button
                                    variant="outline"
                                    className="w-full justify-start border-0 text-sm px-2"
                                    disabled={isLoading}
                                >
                                    Logout
                                </Button>
                            </DialogBox>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

export default Sidebar;
