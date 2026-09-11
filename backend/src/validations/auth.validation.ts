import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z
    .string({ required_error: 'ایمیل یا نام کاربری الزامی است' })
    .min(3, { message: 'ایمیل یا نام کاربری باید حداقل ۳ کاراکتر باشد' })
    .max(100, { message: 'ایمیل یا نام کاربری بیش از حد طولانی است' }),
  password: z
    .string({ required_error: 'رمز عبور الزامی است' })
    .min(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' })
    .max(100, { message: 'رمز عبور بیش از حد طولانی است' }),
});

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'نام الزامی است' })
    .min(2, { message: 'نام باید حداقل ۲ کاراکتر باشد' }),
  username: z
    .string({ required_error: 'نام کاربری الزامی است' })
    .min(3, { message: 'نام کاربری باید حداقل ۳ کاراکتر باشد' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'نام کاربری فقط می‌تواند شامل حروف انگلیسی، اعداد و _ باشد' }),
  email: z
    .string({ required_error: 'ایمیل الزامی است' })
    .email({ message: 'لطفاً یک ایمیل معتبر وارد کنید' }),
  password: z
    .string({ required_error: 'رمز عبور الزامی است' })
    .min(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
