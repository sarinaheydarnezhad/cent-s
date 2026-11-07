import { ApiError, centRequest, type StudyDocument } from './cent'

// Only the administrator loads PDF.js. Students receive authorized image pages, never the source PDF.
export async function uploadTrainingPdf(file: File, trainingId: string, title: string, sortOrder: number,
  onProgress: (value: string) => void) {
  if (file.size > 40 * 1024 * 1024) throw new Error('حداکثر حجم PDF برابر ۴۰ مگابایت است.')
  const bytes = new Uint8Array(await file.arrayBuffer())
  if (!new TextDecoder().decode(bytes.slice(0, 1024)).includes('%PDF-')) throw new Error('فایل PDF معتبر انتخاب کنید.')
  const fingerprint = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))).map(b => b.toString(16).padStart(2, '0')).join('')
  const resumeKey = `cent:upload:${trainingId}:${fingerprint}`
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
  const assetBase = `${import.meta.env.BASE_URL}pdfjs/`
  const task = pdfjs.getDocument({ data: bytes, cMapUrl: `${assetBase}cmaps/`, cMapPacked: true,
    standardFontDataUrl: `${assetBase}standard_fonts/`, wasmUrl: `${assetBase}wasm/`, iccUrl: `${assetBase}iccs/` })
  const pdf = await task.promise
  try {
    if (pdf.numPages < 1 || pdf.numPages > 200) throw new Error('هر درس باید بین ۱ تا ۲۰۰ صفحه داشته باشد؛ فایل بزرگ را به چند درس تقسیم کنید.')
    let documentId = sessionStorage.getItem(resumeKey)
    let existing: number[] = []
    if (documentId) {
      try {
        const state = await centRequest<{ uploadedPages: number[]; published: boolean }>(`/admin/documents/${documentId}/upload-state`)
        if (state.published) { sessionStorage.removeItem(resumeKey); throw new Error('این فایل قبلاً منتشر شده است.') }
        existing = state.uploadedPages
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) { sessionStorage.removeItem(resumeKey); documentId = null }
        else throw e
      }
    }
    if (!documentId) {
      const created = await centRequest<StudyDocument>('/admin/documents', { method: 'POST', body: JSON.stringify({ trainingId, title, sortOrder, pageCount: pdf.numPages }) })
      documentId = created.id; sessionStorage.setItem(resumeKey, documentId)
    }
    for (let number = 1; number <= pdf.numPages; number++) {
      onProgress(`آماده‌سازی و بارگذاری صفحه ${number} از ${pdf.numPages}`)
      if (existing.includes(number)) continue
      const page = await pdf.getPage(number)
      const natural = page.getViewport({ scale: 1 })
      const scale = Math.min(1.8, 1800 / natural.width, 4200 / natural.height)
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height)
      await page.render({ canvas, viewport, background: '#ffffff' }).promise
      let image = await encode(canvas, 0.84)
      if (image.size > 1_500_000) image = await encode(canvas, 0.6)
      if (image.size > 1_500_000) throw new Error(`حجم صفحه ${number} زیاد است؛ PDF را بهینه کنید.`)
      await centRequest(`/admin/documents/${documentId}/pages/${number}?width=${canvas.width}&height=${canvas.height}`, {
        method: 'PUT', headers: { 'Content-Type': 'image/webp' }, body: image,
      })
      canvas.width = 1; canvas.height = 1; page.cleanup()
    }
    onProgress('همه صفحات بارگذاری شدند؛ در حال انتشار درس…')
    const outline = await pdf.getOutline()
    const sections: { title: string; startPage: number }[] = []
    if (outline) for (const entry of outline.slice(0, 100)) {
      try {
        const destination = typeof entry.dest === 'string' ? await pdf.getDestination(entry.dest) : entry.dest
        if (!destination) continue
        const index = typeof destination[0] === 'object' ? await pdf.getPageIndex(destination[0]) : Number(destination[0])
        if (Number.isInteger(index) && index >= 0 && index < pdf.numPages) sections.push({ title: entry.title.slice(0, 200), startPage: index + 1 })
      } catch { /* An invalid bookmark must not stop an otherwise valid document upload. */ }
    }
    await centRequest(`/admin/documents/${documentId}/publish`, { method: 'POST', body: JSON.stringify({ sections }) })
    sessionStorage.removeItem(resumeKey)
    return documentId
  } finally { await task.destroy() }
}
function encode(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob && blob.type === 'image/webp' ? resolve(blob) : reject(new Error('مرورگر شما از تبدیل WebP پشتیبانی نمی‌کند. از مرورگر به‌روز استفاده کنید.')), 'image/webp', quality))
}
