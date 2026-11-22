# Current shared component writing standards — Phase 2

Warm, clear, professional, concise, supportive conversational Persian; preserve scientific/educational content and formal contractual meaning. The documentation is English; Persian below is quoted interface copy.

| Situation | Shared wording / rule |
| --- | --- |
| Primary action | ادامه بده; start/save labels should name the actual operation |
| Secondary action | دیدن جزئیات; clarify the alternative |
| Cancel | انصراف; never destructive red or ambiguous confirmation |
| Confirm removal | حذف یادداشت; name the actual object/consequence; shared reference uses حذف نمونه and explicitly deletes nothing |
| Required | (ضروری) beside label; native required retains accessible semantics |
| Validation | نامت رو بنویس تا ادامه بدیم.; ایمیل رو با قالب درست بنویس؛ مثل name@example.test.; only when actual validation supports it |
| Loading | داریم اطلاعات رو بارگذاری می‌کنیم…; در حال ذخیره…; در حال بررسی… for existing login |
| Empty collection | هنوز چیزی اینجا نیست; explain when real records appear |
| Search no match | چیزی پیدا نشد. عبارت جست‌وجو رو تغییر بده. |
| Success | ذخیره شد; only after actual success |
| Fetch failure | نتونستیم اطلاعات رو بارگذاری کنیم; keep useful safe existing detail |
| Recovery | دوباره تلاش کن; only when a real retry exists |
| Insufficient evidence | سنجیده نشده / شواهد ناکافی; never invent a zero-score achievement or failure |

Actual migration: LoadState retry/loading defaults, shared dialog cancel/close, native required marker, login shared fields/action/error and reference demonstration text. Existing server errors, page-specific empty/search/payment/admin wording and protected workflow messages are not comprehensively rewritten. Login min10/max128 password and all existing validation/business rules stay unchanged. Persian/English mixed scientific content retains direction and meaning. See [usage guide](COMPONENT_USAGE_GUIDE.md) and [feedback framework](FEEDBACK_PATTERNS.md).

---

## Preserved earlier phase records

# UX writing audit and approved direction

Status: Phase 1 changed platform branding and appearance text only; see implementation record below. The original Phase 0 writing audit is preserved here. The historical [ux-text-inventory.json](evidence/ux-text-inventory.json) inventories source file, line, syntax kind and actual Persian text for 738 occurrences. This includes duplicates, template fragments and educational reference data; it is a discovery index, not a count of unique UI messages. Educational questions/explanations and legal/scientific meaning are outside conversational rewriting.

## Approved voice

Conversational, warm, calm and professional; second-person singular. Prefer رو، می‌تونی، نتونستیم، بهتره، آماده‌ست، انتخاب کن، ادامه بده. Avoid bureaucratic language, excessive slang/emoji/exclamation, shame, competitive pressure, false urgency, guaranteed success or claims of validated predictive accuracy. Legal language remains formal.

Standard vocabulary: ارزیابی سطح، درس‌نامه، مبحث، تمرین، مسیر یادگیری، پیشرفت، کتابخانه من، نتیجه ارزیابی، آزمون تمرینی، حساب کاربری، اشتراک، مباحث نیازمند مرور. Preserve CEnT-S / IMAT / SAT as official exam identifiers. Itatest / ایتاتست is the product brand. Do not rename technical Cent identifiers.

## Current content inventory by context

| Context / source | Actual examples or patterns | Observed issue / proposed direction |
| --- | --- | --- |
| Header/footer/Brand | Cent-s; مسیر آمادگی هدفمند; آشنایی با آزمون; تعیین سطح; آموزش‌ها و اشتراک | Product vs exam naming and ارزیابی سطح terminology |
| DashboardLayout | فضای یادگیری Cent; پروفایل; سلام … 👋; امروز یک قدم… | Product name, account label and limited emoji |
| HomePage | از منابع درست، قدم‌به‌قدم یاد بگیر; تعیین سطح را شروع کن; منابع آموزشی شما | Mix of singular/plural and formal را; actual curriculum counts retained |
| ExamPage | درس‌ها و مسیر آمادگی | Header calls route exam introduction but actual page is course catalog; clarify label after approval |
| DiagnosticIntro | تعیین سطح رایگان; موقعیت فعلی‌ات را بشناس; قوت و ضعف موضوعی | Prefer ارزیابی/مباحث نیازمند مرور; free claim needs backend availability confirmation |
| Login/register | خوش برگشتی; حساب Cent خودت را بساز; حداقل ۱۰ نویسه | Brand, conversational consistency; do not change password constraint |
| Google callback/service | ورود امن به Cent; دوباره وارد شوید; conflict account message | Brand in user text only, calmer consistent second person; protocol untouched |
| ProtectedRoute/AppState | در حال بررسی حساب…; بررسی دوباره حساب | Keep persistent error/retry and role redirect behavior |
| Shared LoadState | در حال بارگذاری…; تلاش دوباره; ارتباط برقرار نشد | Useful pattern, add context carefully; no modal needed |
| Dashboard | امروز از کجا ادامه می‌دهی؟; براساس آخرین ارزیابی تو | Real saved page/outcome only; no invented daily plan |
| Mastery/results | شواهد ناکافی; سنجیده نشده; پیشرفت تأییدشده; تغییر نسبت به آزمون هم‌مبحث | Preserve coverage/accuracy/mastery distinctions and backend thresholds |
| Exam setup/question | نتیجه از پاسخ‌ها و کلید پاسخ سرور محاسبه می‌شود; شروع آزمون; پاک‌کردن پاسخ; ثبت و دیدن نتیجه | Technical implementation detail in product text; revise presentation without changing rules |
| Reader/notes | پیش‌نویس روی این دستگاه; در حساب شما ذخیره شد; این یادداشت حذف شود؟ | Good state distinction; preserve draft/revision/confirmation semantics |
| Notes search | No matches uses هنوز یادداشتی اینجا نیست | Distinguish empty collection and no search results |
| Library/catalog | داخل اشتراک; خرید دائمی; نیازمند تمدید; آموزش‌های تازه در راه‌اند | Keep authoritative entitlement; future-content promise unconfirmed |
| Checkout | درگاه در حالت آزمایشی است; پرداخت واقعی انجام نمی‌شود | If status request fails, absence of data currently takes experimental copy branch; do not claim a known mode from unknown state |
| Result/account | خریدت تأیید شد…; پرداخت هنوز تأیید نشده; all non-PAID → pending | Preserve authoritative success; do not invent distinctions absent from API |
| Admin | بانک سؤال; ورود بانک سؤال منابع; publish/save/upload progress; raw role/order/provider codes | Operational wording can be denser; map known statuses without changing controls |
| 404 | هنوز در MVP ساخته نشده باشد | Implementation detail exposed to users; suggest simple recovery wording |

## Feedback mechanism inventory

Current: error alert + retry via LoadState, inline error text, notices, status live regions, dedicated result page, native confirm/beforeunload, native required validation. No reusable toast/banner/dialog system. Server error text is often displayed directly; inspect safe known error codes/contracts before remapping. No observed sensitive response is included in this documentation.

Target by approved phases: routine success toast or scoped status; field validation inline and associated; connection failure persistent banner; failed fetch retry state; destructive actions accessible confirmation; assessment interruption appropriate blocking treatment only after behavior approval; payment/result dedicated page; empty/search states distinct; loading skeleton/status. State what happened, effect and next action when relevant.

## Proposed label/message examples (not implemented)

| Use | Candidate |
| --- | --- |
| Appearance | روشن / تاریک / مطابق تنظیمات دستگاه |
| Assessment CTA | شروع ارزیابی سطح; add رایگان only after availability confirmed |
| Generic retrieval failure | نتونستیم اطلاعات رو دریافت کنیم. دوباره تلاش کن. |
| Search no match | چیزی پیدا نشد. عبارت جست‌وجو رو تغییر بده. |
| Paid, server confirmed | پرداختت با موفقیت انجام شد. |
| Unconfirmed boolean result | پرداختت هنوز تأیید نشده. می‌تونی دوباره وضعیت رو بررسی کنی. |
| Cancelled/failed/pending | Use distinct approved copy only when authoritative state supports it |

Direction: keep email/URLs LTR; isolate exam identifiers/Latin values appropriately; preserve source text/math language. Use Persian punctuation/half spaces in UI. Number localization is currently inconsistent; validate timer/math compatibility before changing formatting.


## Phase 1 implementation record

Phase 1 changes are restricted to Itatest/ایتاتست platform names, the approved tagline, brand metadata and appearance labels: ظاهر / روشن / تاریک / مطابق تنظیمات دستگاه. Existing CEnT-S exam references, scientific content, legal meaning, auth error handling and broad interface copy remain unchanged. Brand account/security/admin phrases were updated only where they named Cent as the platform. No new claims, exam availability or personalized recommendations were added.
