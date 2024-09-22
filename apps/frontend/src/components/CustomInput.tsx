import { LucideIcon } from "lucide-react";
import { Input, InputProps } from "./ui/input";
import { Label } from "./ui/label";

interface CustomInputProps extends InputProps {
	label?: string;
	htmlFor?: string;
	placeholder?: string;
	rightIcon?: LucideIcon;
	rightIconOnClick?: () => void;
}

export const CustomInput: React.FC<CustomInputProps> = ({
	htmlFor,
	label,
	rightIcon: RightIcon,
	rightIconOnClick,
	...props
}) => {
	return (
		<div className="flex flex-col gap-2 relative">
			<Label htmlFor={htmlFor}>{label}</Label>
			<div className="relative">
				<Input {...props} />
				{RightIcon && (
					<RightIcon
						className="absolute right-3 top-1/2 -translate-y-1/2 size-4 cursor-pointer"
						onClick={rightIconOnClick}
					/>
				)}
			</div>
		</div>
	);
};
