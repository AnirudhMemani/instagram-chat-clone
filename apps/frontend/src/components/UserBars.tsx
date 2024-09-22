import { TUsersSchema } from "./NewChatModal";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface IUserBarsProps extends TUsersSchema {
	isSelected?: boolean;
	onClick: () => void;
}

export const UserBars: React.FC<IUserBarsProps> = ({
	fullName,
	profilePic,
	username,
	isSelected = false,
	onClick,
}) => {
	return (
		<div
			className="w-full px-6 flex items-center cursor-pointer hover:bg-[rgba(30,41,59,0.5)] active:scale-[0.98] py-2"
			onClick={onClick}
		>
			<div className="w-full flex items-center gap-3 flex-grow">
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
					"flex items-center justify-center rounded-full border border-input",
					!isSelected && "bg-transparent p-3"
				)}
			>
				<Check
					className={cn(
						isSelected
							? "size-6 bg-secondary rounded-full border border-input"
							: "hidden"
					)}
				/>
			</div>
		</div>
	);
};
