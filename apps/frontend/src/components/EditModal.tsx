import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogClose } from "@radix-ui/react-dialog";

type TEditModalProps = {
    children?: React.ReactNode;
    title: string;
    description?: string;
    label?: string;
    placeholder?: string;
    label2?: string;
    placeholder2?: string;
    required?: boolean;
    required2?: boolean;
    submitLabel?: string;
    onSubmit?: () => void;
    defaultValue?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string;
};

export const EditModal: React.FC<TEditModalProps> = ({
    children,
    title,
    description,
    label,
    placeholder,
    required = false,
    label2,
    placeholder2,
    required2 = false,
    submitLabel,
    onSubmit,
    defaultValue,
    onChange,
    value,
}) => {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-center">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col items-start gap-4">
                        <Label
                            htmlFor={label}
                            className="text-right"
                        >
                            {label}
                        </Label>
                        <Input
                            id={label}
                            placeholder={placeholder}
                            className="col-span-3"
                            required={required}
                            defaultValue={defaultValue}
                            onChange={onChange}
                            value={value}
                        />
                    </div>
                    {label2 && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                                htmlFor={label2}
                                className="text-right"
                            >
                                {label2}
                            </Label>
                            <Input
                                id={label2}
                                placeholder={placeholder2}
                                className="col-span-3"
                                required={required2}
                            />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            type="submit"
                            onClick={onSubmit}
                        >
                            {submitLabel ?? "Save changes"}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
