import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Badge, Button, EmptyState, FilterGroup, IconButton, Notice, ProgressBar, Skeleton } from './UI'
import { CheckField, InputField, SelectField, TextareaField } from './Fields'
import { ConfirmationDialog } from './Dialog'

describe('shared component semantic contracts', () => {
  it('defaults buttons to non-submitting and preserves explicit submit', () => {
    expect(renderToStaticMarkup(<Button>ادامه</Button>)).toContain('type="button"')
    expect(renderToStaticMarkup(<Button type="submit" name="save" value="yes">ذخیره</Button>)).toContain('type="submit"')
  })
  it('busy buttons disable native activation, expose busy state and retain both labels for layout', () => {
    const html = renderToStaticMarkup(<Button loading loadingLabel="در حال ذخیره…">ذخیره</Button>)
    expect(html).toContain('disabled=""')
    expect(html).toContain('aria-busy="true"')
    expect(html).toContain('class="button-label" aria-hidden="true"')
    expect(html).toContain('در حال ذخیره…')
  })
  it('keeps explicitly disabled buttons disabled when not busy', () => {
    expect(renderToStaticMarkup(<Button disabled loading={false}>ذخیره</Button>)).toContain('disabled=""')
  })
  it('requires an accessible name on an icon-only action', () => {
    expect(renderToStaticMarkup(<IconButton label="جست‌وجو"><span>⌕</span></IconButton>)).toContain('aria-label="جست‌وجو"')
  })
  it.each([-5, 0, 45, 100, 150, NaN, Infinity])('clamps presentation consistently for progress %s', value => {
    const expected = Number.isFinite(value) ? Math.max(0,Math.min(100,value)) : 0
    const html=renderToStaticMarkup(<ProgressBar value={value} label="تسلط"/>)
    expect(html).toContain(`aria-valuenow="${expected}"`)
    expect(html).toContain(`width:${expected}%`)
    expect(html).toContain('role="progressbar"')
  })
  it('preserves unknown mastery wording without fabricating a numeric achievement', () => {
    expect(renderToStaticMarkup(<ProgressBar value={0} valueText="شواهد ناکافی"/>)).toContain('aria-valuetext="شواهد ناکافی"')
  })
  it('attaches hints and errors and existing descriptions to the real field', () => {
    const html=renderToStaticMarkup(<InputField id="email" label="ایمیل" hint="راهنما" error="قالب درست نیست" aria-describedby="external" required type="email" dir="ltr"/>)
    expect(html).toContain('for="email"')
    expect(html).toContain('aria-describedby="external email-hint email-error"')
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('required=""')
    expect(html).toContain('dir="ltr"')
  })
  it('keeps standalone invalid state and native validation attributes', () => {
    const html=renderToStaticMarkup(<InputField label="رمز" aria-invalid="true" minLength={10} maxLength={128} autoComplete="current-password"/>)
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('minLength="10"')
    expect(html).toContain('autoComplete="current-password"')
  })
  it('uses native select, textarea and checkboxes with associated labels', () => {
    expect(renderToStaticMarkup(<SelectField id="course" label="درس"><option>ریاضی</option></SelectField>)).toContain('<select id="course"')
    expect(renderToStaticMarkup(<TextareaField id="note" label="یادداشت" readOnly/>)).toMatch(/<textarea\b[^>]*id="note"[^>]*readOnly=""/)
    expect(renderToStaticMarkup(<CheckField id="review" label="مرور"/>)).toContain('type="checkbox"')
  })
  it('exposes selection as pressed buttons without pretending filters are tabs', () => {
    const html=renderToStaticMarkup(<FilterGroup label="درس" value="all" options={[{value:'all',label:'همه'},{value:'math',label:'ریاضی'}]} onChange={()=>{}}/>)
    expect(html).toContain('role="group"')
    expect(html).toContain('aria-pressed="true"')
    expect(html).toContain('aria-pressed="false"')
    expect(html).not.toContain('role="tab"')
  })
  it('announces contextual feedback only when requested', () => {
    expect(renderToStaticMarkup(<Notice tone="error">خطا</Notice>)).not.toContain('role="alert"')
    expect(renderToStaticMarkup(<Notice tone="error" live="assertive">خطا</Notice>)).toContain('role="alert"')
    expect(renderToStaticMarkup(<Notice live="polite">ذخیره شد</Notice>)).toContain('role="status"')
  })
  it('keeps badges non-interactive and skeleton decoration out of accessibility tree', () => {
    expect(renderToStaticMarkup(<Badge tone="learning">مرور</Badge>)).toMatch(/^<span/)
    expect(renderToStaticMarkup(<Skeleton/>)).toContain('aria-hidden="true"')
  })
  it('labels no-data states without representing errors as empty data', () => {
    const html=renderToStaticMarkup(<EmptyState kind="search" title="چیزی پیدا نشد" description="عبارت رو تغییر بده"/>)
    expect(html).toContain('aria-labelledby=')
    expect(html).toContain('ui-empty-search')
    expect(html).not.toContain('role="alert"')
  })
  it('busy confirmation exposes disabled cancellation and a busy confirmation action', () => {
    const html=renderToStaticMarkup(<ConfirmationDialog open={false} busy title="حذف؟" description="نمونه" confirmLabel="حذف" onConfirm={()=>{}} onClose={()=>{}} destructive/>)
    expect(html.match(/disabled=""/g)).toHaveLength(2)
    expect(html).toContain('aria-labelledby=')
    expect(html).toContain('aria-describedby=')
  })
})
