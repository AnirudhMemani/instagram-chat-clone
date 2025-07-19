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
import { cn } from "@/lib/utils";
import { isChatModalVisibleAtom } from "@/state/global";
import { localStorageUtils } from "@/utils/LocalStorageUtils";
import { NAVIGATION_ROUTES, StatusCodes } from "@/utils/constants";
import axios from "axios";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { toast } from "sonner";

const Signup: React.FC = (): JSX.Element => {
  const token = localStorageUtils.getToken();

  if (token) {
    return <Navigate to={NAVIGATION_ROUTES.INBOX} replace />;
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

  const { getProcessedImage, setImage, resetStates } = useImageCropContext();

  const handleUserSignup = async (e: FormEvent) => {
    e.preventDefault();

    if (!profilePic) {
      toast.error("Please add a profile picture");
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();

      formData.set("email", email.trim());
      formData.set("username", username.trim());
      formData.set("password", password);
      formData.set("fullName", fullName.trim());
      formData.append("profilePic", profilePic);

      const response = await processUserSignup(formData, navigate);

      if (response) {
        navigate(NAVIGATION_ROUTES.LOGIN, { replace: true });
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? {
            [StatusCodes.BadRequest]: "There was an issue with your request",
            [StatusCodes.Conflict]: "Username or Email ID already exists!",
          }[error.response?.status || 500] || "An unknown error occurred. Please try again later!"
        : "An unknown error occurred. Please try again later!";
      setError(message);
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
    <section className="flex min-h-dvh w-full items-center justify-center py-10">
      <div className="border-input mx-3 flex flex-col justify-center gap-8 rounded-lg border p-8 text-xs sm:px-16 sm:py-10 sm:text-sm">
        <div className="flex flex-col items-center justify-center space-y-3">
          <img />
          <h1 className="text-bold text-center text-2xl sm:text-3xl">Sign up to get started</h1>
          <p className="text-center text-[#6c6c89]">Welcome! Please enter your details.</p>
        </div>
        <form className="grid w-full max-w-sm items-center space-y-6" onSubmit={handleUserSignup}>
          <div className="grid w-full max-w-sm items-center space-y-4">
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
            {preview && <img src={preview} className="mx-auto h-32 w-32 rounded-full object-cover" alt="" />}
            <div className="flex flex-col gap-2">
              <Label htmlFor="picture" className="max-sm:text-xs">
                Profile Photo
              </Label>
              <div className="relative w-full border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50">
                <span className="size-sm absolute left-1/2 top-1/2 line-clamp-1 w-[90%] -translate-x-1/2 -translate-y-1/2 text-center">
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
              <p className="text-destructive font-medium" id="error">
                {error}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" required disabled={isLoading} />
            <label
              htmlFor="terms"
              className="pointer-events-none font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Accept terms and conditions
            </label>
          </div>
          <Button type="submit" disabled={isLoading} variant="secondary">
            {!isLoading ? "Sign up" : <Loader visible={isLoading} />}
          </Button>
        </form>
        <div className="flex items-center justify-center gap-2">
          <p className="text-center">Already have an account? </p>
          <Link
            to={NAVIGATION_ROUTES.LOGIN}
            className={cn(
              "text-muted-foreground flex items-center underline",
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
