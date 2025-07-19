import { CustomInput } from "@/components/CustomInput";
import { CropModal } from "@/components/image-editor/CropModal";
import { readFile } from "@/components/image-editor/helpers/cropImage";
import { useImageCropContext } from "@/components/image-editor/ImageCropProvider";
import { Loader } from "@/components/Loader";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TUser, userAtom } from "@/state/user";
import { getAvatarFallback, handleUserLogout, StatusCodes } from "@/utils/constants";
import { printlogs } from "@/utils/logs";
import { zodResolver } from "@hookform/resolvers/zod";
import { UPDATE_PROFILE } from "@instachat/messages/messages";
import { IMessage } from "@instachat/messages/types";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { toast } from "sonner";
import z from "zod";

type TEditProfileProps = {
  socket: WebSocket | null;
};

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fileSchema = z
  .any()
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), ".jpg .jpeg .png or .webp files are accepted.");

const userSchema = z.object({
  email: z.string().email().min(1, "Email is required"),
  fullName: z.string().min(1, "Full Name is required"),
  username: z.string().min(1, "Username is required"),
  profilePic: fileSchema.optional(),
});

type TUserSchema = z.infer<typeof userSchema>;

export const EditProfile: React.FC<TEditProfileProps> = ({ socket }): JSX.Element => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCropModalVisible, setIsCropModalVisible] = useState<boolean>(false);

  const [user, setUser] = useRecoilState(userAtom);

  const [previewImage, setPreviewImage] = useState<string>(user.profilePic);

  const { theme } = useTheme();
  const { getProcessedImage, setImage, resetStates } = useImageCropContext();

  const navigate = useNavigate();

  const getSkeletonGroupPicture = async () => {
    const response = await fetch(user.profilePic);
    const blob = await response.blob();

    const urlParts = user.profilePic.split("/");
    const mimeType = blob.type || "image/png";
    const extension = mimeType.split("/").pop();
    const fileName = urlParts.pop() || `${user.id}-user-profile-picture.${extension}`;

    const newFile = new File([blob], fileName, { type: mimeType });
    setValue("profilePic", newFile);
  };

  const { handleSubmit, control, setValue, getValues, setError, formState, getFieldState } = useForm<TUserSchema>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      profilePic: null,
    },
  });

  useEffect(() => {
    printlogs(formState.errors);
    printlogs(getFieldState("profilePic"));
  }, [formState.errors]);

  useEffect(() => {
    getSkeletonGroupPicture();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleSocketMessages = (event: MessageEvent<any>) => {
      try {
        const message = JSON.parse(event.data) as IMessage;

        const payload = message?.payload;
        const status = message?.status;

        switch (message.type) {
          case UPDATE_PROFILE:
            if (message?.success === false) {
              switch (status) {
                //@ts-ignore
                case StatusCodes.BadRequest:
                  if (payload?.action === "file-size") {
                    toast.error(`Exceeded max file size of 8 MB. Your file size was ${payload?.fileSize}`);
                    setError("profilePic", { message: "File size cannot be more than 8 MB" }, { shouldFocus: true });
                    break;
                  }
                case StatusCodes.NotFound:
                  toast.error("Profile not found!");
                  handleUserLogout(navigate);
                  break;
                case StatusCodes.Conflict:
                  if (payload?.action === "username") {
                    toast.error("This Username is not available");
                    setError("username", { message: "This username is not available" }, { shouldFocus: true });
                  } else if (payload?.action === "email") {
                    toast.error("This Email ID is not available");
                    setError("email", { message: "This email ID is not available" }, { shouldFocus: true });
                  }
                  break;
                case StatusCodes.Unauthorized:
                  toast.error("Session Expired!");
                  handleUserLogout(navigate);
                  break;
                default:
                  toast.error("There was an issue with your request! Try again later!");
                  break;
              }
            } else {
              if (status === StatusCodes.Ok) {
                toast.success("Profile updated!");
                setUser(payload);
                navigate(-1);
              } else {
                toast.error("There was an issue with your request! Try again later!");
              }
            }
            break;
        }
      } catch (error) {
        printlogs("ERROR inside EditProfile socket listener useEffect:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    socket.addEventListener("message", handleSocketMessages);

    return () => {
      socket.removeEventListener("message", handleSocketMessages);
    };
  }, [socket]);

  const handleCropDone = async () => {
    const avatar = await getProcessedImage();
    setValue("profilePic", avatar);
    setPreviewImage(window.URL.createObjectURL(avatar));
    resetStates();
    setIsCropModalVisible(false);
  };

  const handleGroupImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) {
      return;
    }

    const file = event.target.files[0];

    const imageDataUrl = await readFile(file);
    setImage(imageDataUrl);
    setIsCropModalVisible(true);
  };

  const onSubmit = (userProfileValues: TUserSchema) => {
    printlogs("Submit entered");
    if (!socket) return;

    let hasUpdated = false;

    Object.entries(userProfileValues).map(([key, value]) => {
      if (user[key as keyof TUser] !== value) {
        hasUpdated = true;
        return;
      }
    });

    if (!hasUpdated) {
      toast.success("Profile updated!");
      return;
    }

    try {
      setIsSubmitting(true);

      const groupImage = getValues("profilePic");

      printlogs("groupImage", groupImage);

      const pictureName = groupImage?.name?.split(".")?.[0] ?? "user-image";

      const reader = new FileReader();

      reader.onload = (e) => {
        const imageData = e.target?.result;

        printlogs("imageData", imageData);

        if (!imageData) {
          return;
        }

        const updateUserProfileMessage = {
          type: UPDATE_PROFILE,
          payload: {
            ...userProfileValues,
            profilePic: imageData,
            pictureName,
          },
        };

        socket.send(JSON.stringify(updateUserProfileMessage));
      };

      if (groupImage) {
        reader.readAsDataURL(groupImage);
      }
    } catch (error) {
      setIsSubmitting(false);
      printlogs("ERROR inside onSubmit Profile Form:", error);
      toast.error("Could not process your request");
    }
  };

  return (
    <div className="relative flex w-full items-center justify-center lg:h-dvh">
      <form className="flex w-3/4 flex-col items-center justify-center gap-10" onSubmit={handleSubmit(onSubmit)}>
        <fieldset className="flex w-full flex-col items-center justify-center gap-6">
          <Controller
            name="profilePic"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <div className="relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                <Input
                  type="file"
                  accept=".jpg, .png, .jpeg, .webp"
                  className="peer absolute z-20 h-full w-full cursor-pointer opacity-0"
                  disabled={isSubmitting}
                  onChange={handleGroupImageChange}
                />
                <Avatar className="h-full w-full">
                  <AvatarImage src={previewImage} />
                  <AvatarFallback>{getAvatarFallback(user.fullName)}</AvatarFallback>
                </Avatar>
              </div>
            )}
          />
          <Controller
            name="email"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomInput
                type="email"
                containerClassName="w-full max-w-xl"
                placeholder="alphaUser@gmail.com"
                label="Email"
                disabled={isSubmitting}
                {...field}
              />
            )}
          />
          <Controller
            name="username"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomInput
                type="text"
                containerClassName="w-full max-w-xl"
                placeholder="alphaUser"
                label="Username"
                disabled={isSubmitting}
                {...field}
              />
            )}
          />
          <Controller
            name="fullName"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomInput
                type="text"
                containerClassName="w-full max-w-xl"
                placeholder="Alpha User"
                label="Full Name"
                disabled={isSubmitting}
                {...field}
              />
            )}
          />
        </fieldset>
        <div className="w-full max-w-xl space-y-4">
          <Button
            variant={theme === "dark" || theme === "system" ? "secondary" : "default"}
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {!isSubmitting ? "Submit" : <Loader visible />}
          </Button>
          <Button type="button" className="w-full !bg-gray-300" onClick={() => navigate(-1)} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
      <CropModal
        handleDone={handleCropDone}
        isModalVisible={isCropModalVisible}
        setIsModalVisible={setIsCropModalVisible}
      />
    </div>
  );
};
