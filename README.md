# Twitter / X Clone - Next.js & Isolated Express Backend

سامانه کلون توییتر / X با رابط کاربری فارسی و راست‌چین (RTL)، تایپوگرافی با فونت **وزیرمتن (Vazirmatn)**، اعتبارسنجی دوطرفه با **Zod**، مدیریت فرم با هوک اختصاصی `useForm`، کلاینت **Axios** به همراه رهگیری (Interceptors) توکن و بک‌اند کاملاً ایزوله با معماری لایه‌ای.

---

## 🌟 ویژگی‌های پیاده‌سازی شده

### فرانت‌اند (Frontend)
* **زبان فارسی و چیدمان راست‌چین (RTL)**: پیکربندی کامل `<html lang="fa" dir="rtl">` و بارگذاری فونت Google Vazirmatn.
* **صفحه ورود واکنش‌گرا (Responsive Login Page)**: سازگار با ابعاد موبایل (<600px)، تبلت و دسکتاپ به همراه کلید تغییر نمایش رمز عبور و اعلان‌های خطای مناسب.
* **هوک اختصاصی اعتبارسنجی فرم (`useForm`)**: مدیریت مقادیر، خطاها، لمس فیلدها و وضعیت ارسال با طرح‌واره اعتبارسنجی **Zod**.
* **احراز هویت و کلاینت Axios با Interceptors**:
  * **Request Interceptor**: تزریق خودکار توکن JWT از `localStorage` در سرآیند `Authorization: Bearer <token>`.
  * **Response Interceptor**: مدیریت کدهای ۴۰۱ (انقضای جلسه)، پاک‌سازی توکن و نرمال‌سازی پیام‌های خطای فارسی.
  * **هوک `useAuth` و `AuthProvider`**: وضعیت ورود کاربر (`user`، `token`، `isAuthenticated`)، امکان ورود و خروج در سراسر برنامه.
* **کلید تکمیل سریع با کاربر آزمایشی**: دکمه اختصاصی در صفحه ورود برای پر کردن خودکار اطلاعات حساب دمو (`demo@example.com` / `password123`).

### بک‌اند ایزوله (`/backend`)
* **معماری کاملاً لایه‌ای (Layered Architecture)**:
  * **مخزن داده (Repository)**: رابط انتزاعی `IUserRepository` و پیاده‌سازی در حافظه `MockUserRepository` با حساب‌های پیش‌فرض.
  * **منطق کسب‌وکار (Service)**: بررسی اعتبار گذرواژه با `bcryptjs` و صدور توکن‌های امن `jsonwebtoken`.
  * **کنترلرها (Controllers)**: جداسازی کامل دریافت درخواست و ارسال پاسخ.
  * **میان‌افزارها (Middlewares)**: اعتبارسنجی یکپارچه درخواست‌ها با Zod (`validate.middleware`)، احراز هویت توکن (`auth.middleware`) و مدیریت متمرکز خطا (`error.middleware`).
  * **مسیرها (Routes)**: تعریف اندپوینت‌های `/api/auth/login`، `/api/auth/register`، `/api/auth/me` و `/api/health`.
* **تست‌های خودکار جامع (Unit & E2E)**: ۱۳ تست خودکار با Vitest برای تمامی لایه‌ها و اندپوینت‌ها.

---

## 🚀 راهنمای راه‌اندازی و اجرا

### ۱. اجرای بک‌اند
```bash
# از پوشه ریشه پروژه:
npm run backend

# یا مستقیماً از پوشه بک‌اند:
cd backend
npm install
npm run dev
```
بک‌اند روی پورت `http://localhost:5000` در دسترس قرار می‌گیرد.

### ۲. اجرای فرانت‌اند
```bash
npm run dev
```
فرانت‌اند روی پورت `http://localhost:3000` اجرا خواهد شد و صفحه ورود در آدرس `http://localhost:3000/login` قرار دارد.

### ۳. اجرای تست‌های بک‌اند
```bash
npm run backend:test
```

### 👤 حساب آزمایشی پیش‌فرض (Demo Account)
* **ایمیل یا نام کاربری:** `demo@example.com` یا `demo`
* **رمز عبور:** `password123`
