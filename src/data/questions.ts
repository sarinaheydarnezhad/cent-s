import type { Question } from '../types'

export const questions: Question[] = [
  {
    id: 'm1', subject: 'math', topic: 'جبر', difficulty: 'easy', kind: 'both', status: 'active',
    text: 'اگر ۳x + ۵ = ۲۰ باشد، مقدار x کدام است؟',
    options: ['۳', '۵', '۷', '۱۵'], correctAnswer: 1,
    explanation: 'با کم‌کردن ۵ از دو طرف، ۳x = ۱۵ و در نتیجه x = ۵ می‌شود.',
  },
  {
    id: 'm2', subject: 'math', topic: 'درصد و تناسب', difficulty: 'easy', kind: 'diagnostic', status: 'active',
    text: 'قیمت کالایی پس از ۲۰٪ تخفیف، ۸۰ یورو است. قیمت اولیه چند یورو بوده است؟',
    options: ['۹۶', '۱۰۰', '۱۰۴', '۱۲۰'], correctAnswer: 1,
    explanation: '۸۰ یورو برابر ۸۰٪ قیمت اولیه است؛ بنابراین قیمت اولیه ۸۰ ÷ ۰٫۸ = ۱۰۰ است.',
  },
  {
    id: 'm3', subject: 'math', topic: 'توان و رادیکال', difficulty: 'medium', kind: 'diagnostic', status: 'active',
    text: 'مقدار ۲³ × ۲⁴ کدام است؟',
    options: ['۲⁷', '۴⁷', '۲¹²', '۴¹²'], correctAnswer: 0,
    explanation: 'در ضرب توان‌های هم‌پایه، توان‌ها جمع می‌شوند: ۲³ × ۲⁴ = ۲⁷.',
  },
  {
    id: 'm4', subject: 'math', topic: 'احتمال', difficulty: 'medium', kind: 'both', status: 'active',
    text: 'در کیسه‌ای ۳ مهره قرمز و ۲ مهره آبی است. احتمال انتخاب یک مهره آبی چقدر است؟',
    options: ['۲/۳', '۲/۵', '۳/۵', '۱/۲'], correctAnswer: 1,
    explanation: 'از ۵ مهره، ۲ مهره آبی است؛ پس احتمال برابر ۲/۵ است.',
  },
  {
    id: 'm5', subject: 'math', topic: 'هندسه', difficulty: 'medium', kind: 'diagnostic', status: 'active',
    text: 'مساحت مثلثی با قاعده ۸ و ارتفاع ۵ چند واحد مربع است؟',
    options: ['۱۳', '۲۰', '۴۰', '۸۰'], correctAnswer: 1,
    explanation: 'مساحت مثلث برابر نصف حاصل‌ضرب قاعده در ارتفاع است: ۸ × ۵ ÷ ۲ = ۲۰.',
  },
  {
    id: 'm6', subject: 'math', topic: 'تابع', difficulty: 'hard', kind: 'diagnostic', status: 'active',
    text: 'اگر f(x)=x²−1 باشد، کدام مقدار x باعث می‌شود f(x)=۸ شود؟',
    options: ['فقط ۳', 'فقط −۳', '۳ و −۳', '۴ و −۴'], correctAnswer: 2,
    explanation: 'x²−1=۸، پس x²=۹ و در نتیجه x می‌تواند ۳ یا −۳ باشد.',
  },
  {
    id: 'l1', subject: 'logic', topic: 'دنباله منطقی', difficulty: 'easy', kind: 'both', status: 'active',
    text: 'عدد بعدی در دنباله ۲، ۶، ۱۲، ۲۰، ... کدام است؟',
    options: ['۲۶', '۲۸', '۳۰', '۳۲'], correctAnswer: 2,
    explanation: 'اختلاف‌ها ۴، ۶ و ۸ هستند؛ اختلاف بعدی ۱۰ است، پس عدد بعدی ۳۰ می‌شود.',
  },
  {
    id: 'l2', subject: 'logic', topic: 'استدلال شرطی', difficulty: 'medium', kind: 'diagnostic', status: 'active',
    text: 'اگر همه برنامه‌نویسان حل‌کننده مسئله باشند و سارا برنامه‌نویس باشد، کدام نتیجه حتماً درست است؟',
    options: ['سارا مدیر است', 'سارا حل‌کننده مسئله است', 'همه حل‌کنندگان مسئله برنامه‌نویس‌اند', 'هیچ‌کدام'], correctAnswer: 1,
    explanation: 'سارا عضو مجموعه برنامه‌نویسان است و طبق گزاره، تمام اعضای این مجموعه حل‌کننده مسئله‌اند.',
  },
  {
    id: 'l3', subject: 'logic', topic: 'مجموعه‌ها', difficulty: 'medium', kind: 'diagnostic', status: 'active',
    text: 'در کلاسی ۱۸ نفر ریاضی و ۱۲ نفر منطق می‌خوانند و ۵ نفر هر دو را می‌خوانند. چند نفر حداقل یکی را می‌خوانند؟',
    options: ['۲۵', '۳۰', '۳۵', '۶۰'], correctAnswer: 0,
    explanation: 'با اصل شمول و عدم شمول: ۱۸ + ۱۲ − ۵ = ۲۵.',
  },
  {
    id: 'l4', subject: 'logic', topic: 'الگوی تصویری', difficulty: 'easy', kind: 'diagnostic', status: 'active',
    text: 'در یک الگو تعداد نقطه‌ها به‌ترتیب ۱، ۴، ۹، ۱۶ است. جمله بعدی چند نقطه دارد؟',
    options: ['۲۰', '۲۴', '۲۵', '۳۲'], correctAnswer: 2,
    explanation: 'جملات مربع اعداد طبیعی‌اند: ۱²، ۲²، ۳²، ۴²؛ پس جمله بعدی ۵² = ۲۵ است.',
  },
  {
    id: 'l5', subject: 'logic', topic: 'تحلیل گزاره', difficulty: 'hard', kind: 'diagnostic', status: 'active',
    text: 'نقیض گزاره «همه دانشجویان آزمون را گذرانده‌اند» کدام است؟',
    options: ['هیچ دانشجویی نگذرانده است', 'حداقل یک دانشجو نگذرانده است', 'بعضی دانشجویان گذرانده‌اند', 'همه دانشجویان مردود شده‌اند'], correctAnswer: 1,
    explanation: 'برای نادرست‌شدن گزاره همگانی، وجود حداقل یک مورد نقض کافی است.',
  },
  {
    id: 'l6', subject: 'logic', topic: 'استنتاج', difficulty: 'hard', kind: 'diagnostic', status: 'active',
    text: 'هیچ Aای، B نیست. بعضی Cها، A هستند. کدام نتیجه قطعی است؟',
    options: ['همه Cها B هستند', 'بعضی Cها B نیستند', 'هیچ Cای B نیست', 'بعضی Bها A هستند'], correctAnswer: 1,
    explanation: 'آن دسته از Cها که A هستند، با توجه به گزاره اول نمی‌توانند B باشند.',
  },
  {
    id: 's1', subject: 'math', topic: 'معادله', difficulty: 'medium', kind: 'simulator', status: 'active',
    text: 'مجموع دو عدد ۲۴ و اختلاف آن‌ها ۶ است. عدد بزرگ‌تر کدام است؟',
    options: ['۹', '۱۲', '۱۵', '۱۸'], correctAnswer: 2,
    explanation: 'با حل x+y=۲۴ و x−y=۶ داریم ۲x=۳۰ و x=۱۵.',
  },
  {
    id: 's2', subject: 'math', topic: 'میانگین', difficulty: 'easy', kind: 'simulator', status: 'active',
    text: 'میانگین اعداد ۴، ۷، ۹ و ۱۲ چند است؟',
    options: ['۷', '۸', '۹', '۱۰'], correctAnswer: 1,
    explanation: 'مجموع اعداد ۳۲ است و ۳۲ ÷ ۴ = ۸.',
  },
  {
    id: 's3', subject: 'math', topic: 'نسبت', difficulty: 'medium', kind: 'simulator', status: 'active',
    text: 'نسبت دانشجویان A به B برابر ۳ به ۵ است. اگر مجموع آن‌ها ۴۰ باشد، تعداد A چند است؟',
    options: ['۱۵', '۲۰', '۲۴', '۲۵'], correctAnswer: 0,
    explanation: 'مجموع سهم‌ها ۸ است؛ هر سهم ۵ و تعداد A برابر ۳×۵=۱۵ است.',
  },
  {
    id: 's4', subject: 'logic', topic: 'دنباله منطقی', difficulty: 'medium', kind: 'simulator', status: 'active',
    text: 'حرف بعدی در الگوی A, C, F, J, ... کدام است؟',
    options: ['M', 'N', 'O', 'P'], correctAnswer: 2,
    explanation: 'فاصله حروف به‌ترتیب ۲، ۳ و ۴ است؛ با فاصله ۵ از J به O می‌رسیم.',
  },
  {
    id: 's5', subject: 'logic', topic: 'استدلال شرطی', difficulty: 'medium', kind: 'simulator', status: 'active',
    text: 'اگر باران ببارد، زمین خیس می‌شود. زمین خیس نیست. چه نتیجه‌ای معتبر است؟',
    options: ['باران باریده است', 'باران نباریده است', 'هوا آفتابی است', 'نتیجه‌ای نمی‌توان گرفت'], correctAnswer: 1,
    explanation: 'با عکس نقیض: اگر زمین خیس نیست، باران نباریده است.',
  },
  {
    id: 's6', subject: 'logic', topic: 'طبقه‌بندی', difficulty: 'easy', kind: 'simulator', status: 'active',
    text: 'کدام مورد با سه مورد دیگر متفاوت است؟',
    options: ['مثلث', 'مربع', 'دایره', 'مستطیل'], correctAnswer: 2,
    explanation: 'دایره برخلاف سه گزینه دیگر چندضلعی و دارای ضلع نیست.',
  },
]

export const diagnosticQuestions = questions.filter((q) => q.status === 'active' && (q.kind === 'diagnostic' || q.kind === 'both'))
export const simulatorQuestions = questions.filter((q) => q.status === 'active' && (q.kind === 'simulator' || q.kind === 'both')).slice(0, 8)

export const subjectLabels = { math: 'ریاضیات', logic: 'منطق' } as const
export const difficultyLabels = { easy: 'آسان', medium: 'متوسط', hard: 'دشوار' } as const
