import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent, SetStateAction } from "react";

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
    submitLabel?: React.ReactNode;
    onSubmit?: (e: FormEvent) => void;
    defaultValue?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string;
    open?: boolean;
    setOpen?: React.Dispatch<SetStateAction<boolean>>;
    disabled?: boolean;
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
    open,
    setOpen,
    disabled,
}) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {children}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-center">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <form className="grid gap-8 py-2" onSubmit={onSubmit}>
                    <div className="grid gap-4">
                        <div className="flex flex-col items-start gap-4">
                            <Label htmlFor={label} className="text-right">
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
                                disabled={disabled}
                            />
                        </div>
                        {label2 && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor={label2} className="text-right">
                                    {label2}
                                </Label>
                                <Input
                                    id={label2}
                                    placeholder={placeholder2}
                                    className="col-span-3"
                                    required={required2}
                                    disabled={disabled}
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={disabled} variant="secondary">
                            {submitLabel ?? "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
