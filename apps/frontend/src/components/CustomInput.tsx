import { Input, InputProps } from "./ui/input";
import { Label } from "./ui/label";

interface CustomInputProps extends InputProps {
    label?: string;
    htmlFor?: string;
    placeholder?: string;
}

export const CustomInput: React.FC<CustomInputProps> = ({
    htmlFor,
    label,
    ...props
}) => {
    return (
        <>
            <div className="flex flex-col gap-2">
                <Label htmlFor={htmlFor}>{label}</Label>
                <Input {...props} />
            </div>
        </>
    );
};
