import z from "zod";

export const LoginFormSchema = z.object({
  credentials: z.string().min(1, "Username or email is required"),
  password: z.string().min(8, "Password must be minimum 8 characters long"),
});

export type TLoginFormSchema = z.infer<typeof LoginFormSchema>;
