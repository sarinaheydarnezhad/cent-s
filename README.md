# Cent-s Practice MVP

یک MVP قابل‌اجرای فارسی و RTL برای نمایش چرخه آمادگی آزمون: صفحه فرود، آزمون تشخیصی، امتیازدهی قطعی، تحلیل AI با fallback، پکیج و پرداخت نمایشی، محتوای آموزشی، آزمون شبیه‌ساز و پنل مدیریت.

> این پروژه نسخه تمرینی است؛ اطلاعات آزمون، احراز هویت، پرداخت و داده‌های مدیریتی برای استفاده تولیدی آماده نیستند.

## فناوری‌ها

- React + TypeScript + React Router
- Vite برای رابط کاربری
- Express برای API سرور
- Zod برای اعتبارسنجی payloadهای API
- Vitest برای تست منطق امتیازدهی
- localStorage برای وضعیت دمو و CRUD محلی

## اجرا

پیش‌نیاز: Node.js 20 یا جدیدتر.

```bash
npm install
npm run dev
```

سپس باز کنید:

- رابط کاربری: `http://localhost:5173`
- وضعیت API: `http://localhost:8787/api/health`

در PowerShell ویندوز با execution policy محدود می‌توانید از `npm.cmd` استفاده کنید:

```powershell
npm.cmd install
npm.cmd run dev
```

## حساب‌های دمو

ورود رمز عبور ندارد و از صفحه `/login` با انتخاب نقش انجام می‌شود:

- دانشجو: `student@cent-s.demo`
- مدیر: `admin@cent-s.demo`

این مکانیزم عمداً در `AppState` ایزوله شده و فقط برای نمایش MVP است.

## متغیرهای محیطی

فایل `.env.example` را به `.env` کپی و مقادیر لازم را وارد کنید. کلیدهای بدون پیشوند `VITE_` فقط در Express خوانده می‌شوند و وارد bundle مرورگر نمی‌شوند.

### OpenRouter

```env
OPENROUTER_API_KEY=
OPENROUTER_MODEL=openai/gpt-4.1-mini
```

- اگر کلید خالی باشد، `MockAIAnalysisProvider` پاسخ قطعی و قابل تکرار می‌سازد.
- اگر فراخوانی OpenRouter شکست بخورد، `AIAnalysisService` به fallback محلی برمی‌گردد و جریان آزمون خراب نمی‌شود.
- درصدها در `src/services/scoring.ts` محاسبه می‌شوند؛ AI اجازه محاسبه یا تغییر نمره را ندارد.

### پرداخت Mock و اتصال آینده زرین‌پال

Provider فعلی `MockPaymentProvider` در `server/services/payment.ts` است. این Provider فقط یک سفارش دمو می‌سازد و هیچ درگاه یا اطلاعات بانکی ندارد.

برای تست خطا:

```env
MOCK_PAYMENT_SHOULD_FAIL=true
```

اتصال آینده زرین‌پال باید با پیاده‌سازی قرارداد `PaymentProvider`، ساخت سفارش PENDING، redirect و verify کاملاً server-side انجام شود.

### n8n

```env
N8N_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=
```

`QuestionGenerationService` در `server/services/question-generation.ts` قرار دارد. بدون URL، `MockQuestionGenerator` براساس مباحث ضعیف سؤال‌های موجود را انتخاب می‌کند. با تنظیم URL، adapter مربوط به n8n payload عملکرد را server-side ارسال می‌کند و در صورت خطا fallback دارد.

## جریان‌های قابل آزمایش

1. صفحه اصلی → آزمون تشخیصی → پاسخ‌گویی → نتیجه و تحلیل → صفحه پکیج
2. ورود دانشجو → خرید آزمایشی → فعال‌شدن پکیج → محتوا → شبیه‌ساز → نتیجه
3. ورود مدیر → داشبورد → سؤال‌ها → افزودن/ویرایش با persistence محلی → سفارش‌ها → AI → تنظیمات

## دستورهای بررسی

```bash
npm run test
npm run build
npm run lint
```

## مرزهای نسخه دمو

- داده‌ها database ندارند و بخشی از وضعیت در localStorage ذخیره می‌شود.
- احراز هویت production و session server-side وجود ندارد.
- پرداخت واقعی انجام نمی‌شود.
- OpenRouter اختیاری است و به‌صورت پیش‌فرض Mock فعال است.
- n8n اختیاری است و به‌صورت پیش‌فرض Mock فعال است.
- اطلاعات رسمی و جاری CEnT-S هنوز باید از منابع رسمی اعتبارسنجی و نسخه‌گذاری شود.
- محتوای درس‌ها نمونه معماری است و بانک محتوای کامل تجاری نیست.
