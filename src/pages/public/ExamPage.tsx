import { PageHeader } from '../../components/UI'
import { CourseCatalog } from '../CourseCatalog'

export function ExamPage() {
  return <div className="container narrow-page"><PageHeader title="درس‌ها و مسیر آمادگی" description="درس‌نامه‌ها و سؤال‌ها براساس منابع آموزشی واردشده در سامانه"/><CourseCatalog/></div>
}
