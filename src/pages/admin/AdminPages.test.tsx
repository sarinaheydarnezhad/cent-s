import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { AdminPagination, AdminReportView, AdminSubjectAccessView } from './AdminPages'
import type { AdminReport } from '../../services/admin'

const empty: AdminReport = { start: '2026-11-01T00:00:00Z', end: '2026-11-22T00:00:00Z', days: 30, registrations: [], orders: [], attempts: [] }
describe('admin presentation', () => {
  it('shows purchased subject terms and revocation using Persian subject names', () => {
    const html = renderToStaticMarkup(<AdminSubjectAccessView items={[{ id: 'access', subjectId: 'reading', startsAt: '2026-11-22T00:00:00Z', expiresAt: '2027-11-22T00:00:00Z', revokedAt: '2026-11-23T00:00:00Z' }]}/>)
    expect(html).toContain('درک مطلب'); expect(html).toContain('لغوشده'); expect(html).not.toContain('reading')
    expect(renderToStaticMarkup(<AdminSubjectAccessView items={[]}/>)).toBe('')
  })
  it('shows honest empty reports without invented charts or measurements', () => {
    const html = renderToStaticMarkup(<AdminReportView data={empty}/>)
    expect(html).toContain('ثبت‌نامی ثبت نشده'); expect(html).not.toContain('admin-bar-track'); expect(html).toContain('نمره و عملکرد علمی')
  })
  it('renders actual UTC buckets with visible exact counts and status meanings', () => {
    const html = renderToStaticMarkup(<AdminReportView data={{ ...empty, registrations: [{year:2026,month:11,day:20,count:7}], orders:[{status:'PAID',count:3}], attempts:[{kind:'diagnostic',started:5,submitted:2}] }}/>)
    expect(html).toContain('2026/11/20'); expect(html).toContain('۷'); expect(html).toContain('تأییدشده'); expect(html).toContain('۵ شروع'); expect(html).toContain('۲ ارسال')
  })
  it('bounds pagination controls at both ends with accessible names', () => {
    const first = renderToStaticMarkup(<AdminPagination data={{total:41,page:1,pageSize:20}} setPage={() => {}}/>)
    const last = renderToStaticMarkup(<AdminPagination data={{total:41,page:3,pageSize:20}} setPage={() => {}}/>)
    expect(first).toMatch(/disabled=""[^>]*aria-label="صفحه قبل"/)
    expect(last).toMatch(/disabled=""[^>]*aria-label="صفحه بعد"/)
  })
})
