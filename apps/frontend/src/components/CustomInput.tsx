import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    htmlFor?: string;
    placeholder?: string;
    rightIcon?: LucideIcon;
    containerClassName?: string;
    rightIconOnClick?: () => void;
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
    ({ htmlFor, label, rightIcon: RightIcon, rightIconOnClick, containerClassName, ...props }, ref) => {
        return (
            <div className={cn("relative flex flex-col gap-2", containerClassName)}>
                <Label htmlFor={htmlFor} className="max-sm:text-xs">
                    {label}
                </Label>
                <div className="relative">
                    <Input {...props} ref={ref} />
                    {RightIcon && (
                        <RightIcon
                            className="absolute right-3 top-1/2 size-4 -translate-y-1/2 cursor-pointer"
                            onClick={rightIconOnClick}
                        />
                    )}
                </div>
            </div>
        );
    }
);

CustomInput.displayName = "CustomInput";

export { CustomInput };
