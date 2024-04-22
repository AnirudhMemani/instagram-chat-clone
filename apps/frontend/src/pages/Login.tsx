import { processUserLogin } from "@/api/login-api";
import { CustomInput } from "@/components/CustomInput";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { loadingAtom } from "@/state/global";
import {
    fullNameAtom,
    profilePicAtom,
    userIdAtom,
    usernameAtom,
} from "@/state/user";
import { localStorageUtils } from "@/utils/LocalStorageUtils";
import { NavigationRoutes, StatusCodes } from "@/utils/constants";
import axios from "axios";
import { ArrowUpRight } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";

const Login: React.FC = (): JSX.Element => {
    const token = localStorageUtils.getToken();

    if (token) {
        return (
            <Navigate
                replace
                to={NavigationRoutes.Inbox}
            />
        );
    }

    const [credentials, setCredentials] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");

    const [isLoading, setIsLoading] = useRecoilState(loadingAtom);
    const setUsername = useSetRecoilState(usernameAtom);
    const setProfilePic = useSetRecoilState(profilePicAtom);
    const setUserId = useSetRecoilState(userIdAtom);
    const setFullName = useSetRecoilState(fullNameAtom);

    const navigate = useNavigate();

    const handleUserLogin = async (e: FormEvent) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            const response = await processUserLogin(
                credentials,
                password,
                navigate
            );

            if (response) {
                localStorageUtils.setLoginResponse(response);
                setUsername(response.data.username);
                setProfilePic(response.data.profilePic);
                setUserId(response.data.id);
                setFullName(response.data.fullName);
                navigate(NavigationRoutes.Inbox, { replace: true });
            }
        } catch (error) {
            console.log(error);
            if (axios.isAxiosError(error)) {
                if (error.response?.status === StatusCodes.BadRequest) {
                    setError("Bad Request! Try again later");
                } else if (error.response?.status === StatusCodes.NotFound) {
                    setError("Account does not exist. Please sign up");
                } else if (
                    error.response?.status === StatusCodes.Unauthorized
                ) {
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
            <div className="flex flex-col gap-8 justify-center p-16 border border-input rounded">
                <div className="flex flex-col space-y-3 items-center justify-center">
                    <img />
                    <h1 className="text-bold text-3xl text-center">
                        Sign in to your account
                    </h1>
                    <p className="text-sm text-[#6c6c89] text-center">
                        Welcome back! Please enter your details.
                    </p>
                </div>
                <form
                    onSubmit={handleUserLogin}
                    className="grid w-full max-w-sm items-center space-y-6"
                >
                    <div className="grid w-full space-y-4 max-w-sm items-center">
                        <CustomInput
                            type="text"
                            id="email"
                            placeholder="user@email.com"
                            required
                            disabled={isLoading}
                            label="Username or Email"
                            htmlFor="email"
                            onChange={(e) => setCredentials(e.target.value)}
                            value={credentials}
                        />
                        <CustomInput
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            label="Password"
                            htmlFor="password"
                            required
                            disabled={isLoading}
                            minLength={8}
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                        />
                        {error && (
                            <p
                                className="font-medium text-destructive"
                                id="error"
                            >
                                {error}
                            </p>
                        )}
                    </div>
                    <Button
                        variant="default"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing in..." : "Sign in"}
                    </Button>
                </form>
                <div className="flex items-center justify-center gap-2">
                    <p className="text-center text-sm">
                        Don't have an account?{" "}
                    </p>
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
