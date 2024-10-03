import { processUserSignup } from "@/api/signup-api";
import { CustomInput } from "@/components/CustomInput";
import { Loader } from "@/components/Loader";
import { CropModal } from "@/components/image-editor/CropModal";
import { useImageCropContext } from "@/components/image-editor/ImageCropProvider";
import { readFile } from "@/components/image-editor/helpers/cropImage";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { isChatModalVisibleAtom } from "@/state/global";
import { localStorageUtils } from "@/utils/LocalStorageUtils";
import { NavigationRoutes, StatusCodes } from "@/utils/constants";
import axios from "axios";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";

const Signup: React.FC = (): JSX.Element => {
    const token = localStorageUtils.getToken();

    if (token) {
        return <Navigate to={NavigationRoutes.Inbox} replace />;
    }

    const setIsChatModalVisible = useSetRecoilState(isChatModalVisibleAtom);
    setIsChatModalVisible({ visible: false });
    const [error, setError] = useState<string>("");
    const [profilePic, setProfilePic] = useState<File | undefined>();
    const [password, setPassword] = useState<string>("");
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [preview, setPreview] = useState<string>("");
    const [imageName, setImageName] = useState<string>("Choose an image");
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [fullName, setFullName] = useState<string>("");
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const navigate = useNavigate();
    const { toast } = useToast();

    const { getProcessedImage, setImage, resetStates } = useImageCropContext();

    const handleUserSignup = async (e: FormEvent) => {
        e.preventDefault();

        if (!profilePic) {
            toast({
                title: "Please add a profile picture",
            });
            return;
        }

        try {
            setIsLoading(true);

            const formData = new FormData();

            formData.set("email", email);
            formData.set("username", username);
            formData.set("password", password);
            formData.set("fullName", fullName);
            formData.append("profilePic", profilePic);

            const response = await processUserSignup(formData, navigate);

            if (response) {
                navigate(NavigationRoutes.Login, { replace: true });
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === StatusCodes.BadRequest) {
                    const message = JSON.parse(error.response?.data.message).pop().message || "Bad Request!";
                    setError(message);
                } else if (error.response?.status === StatusCodes.Conflict) {
                    setError("Username or Email already exists!");
                } else {
                    setError("An unknown error occured");
                }
            } else {
                setError("An unknown error occured");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDone = async () => {
        const avatar = await getProcessedImage();
        setProfilePic(avatar);
        setPreview(window.URL.createObjectURL(avatar));
        resetStates();
        setIsModalVisible(false);
    };

    type ThandleFileChange = React.ChangeEvent<HTMLInputElement>;

    const handleFileChange = async ({ target: { files } }: ThandleFileChange) => {
        const file = files && files[0];

        if (!file) {
            return;
        }

        setImageName(file.name);
        const imageDataUrl = await readFile(file);
        setImage(imageDataUrl);
        setIsModalVisible(true);
    };

    return (
        <section className="min-h-dvh w-full flex items-center justify-center">
            <div className="flex flex-col gap-8 justify-center py-10 px-16 border border-input rounded-lg">
                <div className="flex flex-col space-y-3 items-center justify-center">
                    <img />
                    <h1 className="text-bold text-3xl text-center">Sign up to get started</h1>
                    <p className="text-sm text-[#6c6c89] text-center">Welcome! Please enter your details.</p>
                </div>
                <form className="grid w-full max-w-sm items-center space-y-6" onSubmit={handleUserSignup}>
                    <div className="grid w-full space-y-4 max-w-sm items-center">
                        <CustomInput
                            type="email"
                            id="email"
                            placeholder="user@gmail.com"
                            label="Email"
                            htmlFor="email"
                            required
                            disabled={isLoading}
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                        />
                        <CustomInput
                            type="text"
                            id="fullName"
                            placeholder="User"
                            label="Full Name"
                            htmlFor="fullName"
                            required
                            disabled={isLoading}
                            onChange={(e) => setFullName(e.target.value)}
                            value={fullName}
                        />
                        <CustomInput
                            type="username"
                            id="username"
                            placeholder="theofficialuser"
                            required
                            disabled={isLoading}
                            htmlFor="username"
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="off"
                        />
                        <CustomInput
                            type={isPasswordVisible ? "text" : "password"}
                            id="password"
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                            minLength={8}
                            htmlFor="password"
                            label="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            rightIcon={isPasswordVisible ? EyeOff : Eye}
                            rightIconOnClick={() => setIsPasswordVisible((p) => !p)}
                            autoComplete="new-password"
                        />
                        {preview && (
                            <img src={preview} className="object-cover rounded-full h-32 w-32 mx-auto" alt="" />
                        )}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="picture">Profile Photo</Label>
                            <div className="w-full relative border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50 active:scale-95">
                                <span className="absolute top-1/2 -translate-y-1/2 size-sm left-1/2 -translate-x-1/2 line-clamp-1 w-[90%] text-center text-sm">
                                    {imageName}
                                </span>
                                <Input
                                    type="file"
                                    id="picture"
                                    className="cursor-pointer opacity-0"
                                    accept=".jpg, .png, .jpeg, .webp"
                                    disabled={isLoading}
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                        {error && (
                            <p className="font-medium text-destructive" id="error">
                                {error}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="terms" required disabled={isLoading} />
                        <label
                            htmlFor="terms"
                            className="text-sm pointer-events-none font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Accept terms and conditions
                        </label>
                    </div>
                    <Button type="submit" disabled={isLoading} variant="secondary">
                        {!isLoading ? "Sign up" : <Loader visible={isLoading} />}
                    </Button>
                </form>
                <div className="flex items-center justify-center gap-2">
                    <p className="text-center text-sm">Already have an account? </p>
                    <Link
                        to={NavigationRoutes.Login}
                        className={cn(
                            "text-muted-foreground flex items-center underline text-sm",
                            isLoading && "pointer-events-none opacity-50"
                        )}
                        aria-disabled={isLoading}
                    >
                        Sign in
                        <ArrowUpRight className="size-4" />
                    </Link>
                </div>
            </div>
            <CropModal handleDone={handleDone} isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} />
        </section>
    );
};

export default Signup;
