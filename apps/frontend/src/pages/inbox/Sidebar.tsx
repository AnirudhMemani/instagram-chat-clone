import { Home } from "lucide-react";
import { useRecoilValue } from "recoil";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { NavigationRoutes, handleUserLogout } from "@/utils/constants";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DialogBox } from "@/components/DialogBox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isLoadingAtom } from "@/state/global";
import DarkModeToggle from "@/components/DarkModeToggle";
import { userAtom } from "@/state/user";

type TSidebarProps = {
	className?: string;
};

const Sidebar: React.FC<TSidebarProps> = ({ className }): JSX.Element => {
	const user = useRecoilValue(userAtom);
	const isLoading = useRecoilValue(isLoadingAtom);

	const navigate = useNavigate();

	return (
		<div className={cn("lg:h-dvh lg:w-fit w-full", className)}>
			<div className="flex lg:flex-col w-full lg:w-fit border-gray-950 justify-center h-full gap-6 lg:py-0 py-3 lg:px-6 border-t lg:border-r dark:border-gray-700">
				<Home
					className="size-10 cursor-pointer active:brightness-50 select-none"
					aria-disabled={isLoading}
					onClick={() => navigate(NavigationRoutes.Inbox, { replace: true })}
				/>
				<DropdownMenu>
					<DropdownMenuTrigger disabled={isLoading}>
						<Avatar className="select-none">
							<AvatarImage src={user.profilePic} />
							<AvatarFallback>
								{user.username.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem>Profile</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<DialogBox
								title="Are you sure you want to logout?"
								positiveTitle="Logout"
								positiveOnClick={() => handleUserLogout(navigate)}
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
				<DarkModeToggle />
			</div>
		</div>
	);
};

export default Sidebar;
