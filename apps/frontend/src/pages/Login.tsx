import { processUserLogin } from "@/api/login-api";
import { CustomInput } from "@/components/CustomInput";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoginFormSchema } from "@/schema/auth/Login";
import { isChatModalVisibleAtom } from "@/state/global";
import { userAtom } from "@/state/user";
import { localStorageUtils } from "@/utils/LocalStorageUtils";
import { NavigationRoutes, StatusCodes } from "@/utils/constants";
import axios from "axios";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { toast } from "sonner";

const Login: React.FC = (): JSX.Element => {
    const token = localStorageUtils.getToken();
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            navigate(NavigationRoutes.Inbox, { replace: true });
        }
    }, [token]);

    const setIsChatModalVisible = useSetRecoilState(isChatModalVisibleAtom);
    setIsChatModalVisible({ visible: false });
    const [credentials, setCredentials] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

    const setUser = useSetRecoilState(userAtom);

    const handleUserLogin = async (e: FormEvent) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            const result = LoginFormSchema.safeParse({ credentials, password });
            if (!result.success) {
                const messageArray = JSON.parse(result.error.message);
                setError(messageArray?.[0].message || "");
                return;
            }
            const response = await processUserLogin(credentials, password, navigate);
            if (response) {
                localStorageUtils.setLoginResponse(response);
                setUser({
                    id: response.data.id,
                    email: response.data.email,
                    username: response.data.username,
                    fullName: response.data.fullName,
                    profilePic: response.data.profilePic,
                });
                navigate(NavigationRoutes.Inbox, { replace: true });
                toast.success("Login successful");
            }
        } catch (error) {
            console.log(error);
            if (axios.isAxiosError(error)) {
                if (error.response?.status === StatusCodes.BadRequest) {
                    setError("Bad Request!");
                } else if (error.response?.status === StatusCodes.NotFound) {
                    setError("Account does not exist. Please sign up");
                } else if (error.response?.status === StatusCodes.Unauthorized) {
                    setError("Invalid Credentials");
                } else {
                    setError("Unknown error occured");
                }
            } else {
                setError("Unknown error occured");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="h-dvh w-full flex items-center justify-center">
            <div className="flex flex-col gap-8 justify-center p-16 border border-input rounded-lg">
                <div className="flex flex-col space-y-3 items-center justify-center">
                    <h1 className="text-bold text-3xl text-center">Sign in to your account</h1>
                    <p className="text-sm text-[#6c6c89] text-center">Welcome back! Please enter your details.</p>
                </div>
                <form onSubmit={handleUserLogin} className="grid w-full max-w-sm items-center space-y-6">
                    <div className="grid w-full space-y-4 max-w-sm items-center">
                        <CustomInput
                            type="text"
                            id="email"
                            placeholder="user@gmail.com"
                            required
                            disabled={isLoading}
                            label="Username or Email"
                            htmlFor="email"
                            onChange={(e) => setCredentials(e.target.value)}
                            value={credentials}
                        />
                        <CustomInput
                            type={isPasswordVisible ? "text" : "password"}
                            id="password"
                            placeholder="••••••••"
                            label="Password"
                            htmlFor="password"
                            required
                            disabled={isLoading}
                            minLength={8}
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            rightIcon={isPasswordVisible ? EyeOff : Eye}
                            rightIconOnClick={() => setIsPasswordVisible((p) => !p)}
                        />
                        {error && (
                            <p className="font-medium text-destructive text-xs" id="error">
                                {error}
                            </p>
                        )}
                    </div>
                    <Button variant="secondary" type="submit" disabled={isLoading}>
                        {!isLoading ? "Sign in" : <Loader visible={isLoading} />}
                    </Button>
                </form>
                <div className="flex items-center justify-center gap-2">
                    <p className="text-center text-sm">Don't have an account? </p>
                    <Link
                        to={NavigationRoutes.Signup}
                        className={cn(
                            "text-muted-foreground flex items-center underline text-sm",
                            isLoading && "pointer-events-none opacity-50"
                        )}
                    >
                        Sign up
                        <ArrowUpRight className="size-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Login;
