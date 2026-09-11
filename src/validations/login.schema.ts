import { z } from 'zod';

export const loginFormSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: 'لطفاً ایمیل یا نام کاربری را وارد کنید' })
    .min(3, { message: 'ایمیل یا نام کاربری باید حداقل ۳ کاراکتر باشد' })
    .max(100, { message: 'ایمیل یا نام کاربری بیش از حد طولانی است' }),
  password: z
    .string()
    .min(1, { message: 'لطفاً رمز عبور را وارد کنید' })
    .min(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' })
    .max(100, { message: 'رمز عبور بیش از حد طولانی است' }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
