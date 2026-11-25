// Paired with CentEducationalContent: URLs and executable markup are never copied.
export const lessonTags = new Set(["div", "span", "p", "b", "strong", "em", "i", "ol", "ul", "li", "h1", "h2", "h3", "h4", "h5", "h6", "details", "summary", "sup", "sub", "br", "hr", "table", "caption", "colgroup", "col", "tbody", "thead", "tfoot", "tr", "td", "th", "section", "main", "header", "figure", "figcaption", "small", "code", "pre", "dl", "dt", "dd", "label", "blockquote"])
export const lessonClasses = new Set(["sec-head", "sec-badge", "sec-label", "card", "concept", "example", "mistake", "examtip", "exercise", "card-title", "formula-box", "ltr", "frac", "num", "den", "steplist", "steps", "result", "q-block", "q", "ans-steps", "final-ans", "en", "en-block", "l", "fa", "m", "box", "bh", "bb", "lab", "lbl", "defcard", "dt", "node", "ins", "b-ex", "qbox", "final", "arr", "b-mis", "e", "sec", "tw", "h", "b-prac", "b-main", "b-cmp", "b-def", "b-tip", "b-trap", "b-mem", "b-must", "defs", "flow", "b-ce", "fig", "b-proc", "b-sf", "b-exp", "b-rev", "b-exc", "b-con", "gcard", "n", "rgrid", "b-src", "check", "b-cls", "b-quick", "b-chk", "guide", "legend", "step", "step-num", "step-lbl", "box-label", "dot", "q-head", "diff-badge", "sol", "diag-item", "sub-title", "inner", "solid", "formula-cell", "badge", "hard", "simple", "easy", "medium", "diagrow", "section-title", "tip", "fill-note", "formula", "trap", "remember", "remember-cols", "cheat", "qh", "qn", "qt", "opts", "options", "ex-block", "ex-tag", "practice-item", "difficulty", "term", "arrow-final", "analysis", "box-tip", "box-mistake", "box-remember", "diff-easy", "diff-med", "diff-hard", "review", "review-grid", "box-quick", "box-trap", "cheat-card", "strategy-block", "square-corner", "form", "cheat-grid", "checklist", "square-wrap", "square-grid", "venn-wrap", "venn-svg", "line", "card-label", "bul", "answer", "cap", "graph-box", "answer-final", "icon-list", "final-answer", "qitem", "qnum", "steps-list", "ex-title", "concept-item", "qtext", "ans", "topic", "example-block", "txt", "quiz", "practice", "mistakes", "tips", "grid2", "desc-cell", "shape-sub", "shape-head", "shape-icon", "question", "anatomy-item", "swatch", "compare-row", "k", "v", "section", "sec-num", "kicker", "quick-check", "diagram-box", "chapter-section", "graph-row", "why-box", "topic-head", "pos", "neg", "family-card", "compass", "anatomy-legend", "mistake-list", "tip-list", "section-head", "tag", "sec-intro", "part", "arrow", "numberline-box", "cycle", "anatomy-panel", "anatomy-body", "how-step", "num-badge", "cstep", "und", "law-table", "anatomy-sublabel", "summary-box", "pills", "concept-grid", "grid3", "two", "anatomy-header", "anatomy-eq", "link-box", "link-title", "compare-card", "sw", "cformula", "data-table-wrap", "data-table", "howto", "compare-section", "compare-intro", "summary", "pill-row", "diagram-row", "anatomy-head", "anatomy-expr", "anatomy-note", "angle-row", "steps-main", "cycle-wrap", "cycle-note", "cycle-steps", "toolbox", "recap", "sub", "usage", "table-demo", "preview-box", "family-grid", "b", "card-head", "final-line", "c-green", "problem", "c-blue", "lead", "c-red", "c-teal", "plain", "c-gold", "c-orange", "q-text", "diff", "mcq", "matrix", "vector", "passage"])
export type LessonAsset = { id: string; mime: string; alt: string }
export function hash(text: string) { let n = 2166136261; for (const c of text) n = Math.imul(n ^ c.charCodeAt(0), 16777619); return (n >>> 0).toString(36) }
export function prepareLesson(html: string, section: string, assets: LessonAsset[] = []) {
  const source = new DOMParser().parseFromString(html, 'text/html')
  const output = document.createElement('div')
  function copy(node: Node, parent: HTMLElement) {
    if (node.nodeType === Node.TEXT_NODE) {
      for (const part of (node.textContent || '').split(/(\([A-Za-z][A-Za-z ]+\))/g)) {
        if (/^\([A-Za-z]/.test(part)) { const run = document.createElement('bdi'); run.dir = 'ltr'; run.textContent = part; parent.append(run) }
        else parent.append(document.createTextNode(part))
      }
      return
    }
    if (!(node instanceof Element)) return
    if (node.tagName === 'IMG') {
      const asset = assets.find(a => a.id === node.getAttribute('data-asset') && /^[a-f0-9]{64}$/i.test(a.id))
      if (asset) { const image = document.createElement('img'); image.dataset.asset = asset.id; image.alt = asset.alt || 'تصویر آموزشی'; image.className = 'lesson-asset'; image.tabIndex = 0; image.setAttribute('role', 'button'); image.setAttribute('aria-label', 'بزرگ کردن تصویر: ' + image.alt); parent.append(image) }
      return
    }
    if (!lessonTags.has(node.tagName.toLowerCase())) return
    const el = document.createElement(node.tagName.toLowerCase())
    el.className = [...node.classList].filter(c => lessonClasses.has(c)).join(' ')
    for (const name of ['dir', 'lang', 'colspan', 'rowspan', 'type']) {
      const value = node.getAttribute(name)
      if (value && (name === 'dir' && /^(ltr|rtl|auto)$/.test(value) || name === 'lang' && /^(en|fa)$/.test(value) || /^(colspan|rowspan)$/.test(name) && /^[1-9][0-9]?$/.test(value) || name === 'type' && node.tagName === 'OL' && /^[aA1iI]$/.test(value))) el.setAttribute(name, value)
    }
    for (const child of node.childNodes) copy(child, el)
    parent.append(el)
  }
  for (const node of source.body.childNodes) copy(node, output)
  const seen = new Map<string, number>()
  // Keep Phase 1/2 block IDs and quotes byte-for-byte before new semantic adapters.
  for (const el of output.querySelectorAll<HTMLElement>('p,li,h2,h3,h4,.card-title,.formula-box,.steps > div,.result,.q,.ans-steps > div,.final-ans')) {
    const key = hash(el.textContent || ''); const count = seen.get(key) || 0; seen.set(key, count + 1)
    el.dataset.block = `${section}:${key}:${count}`
    el.dataset.anchorQuote = (el.textContent || '').slice(0, 500)
  }
  for (const el of output.querySelectorAll<HTMLElement>('figure,img,table,tr,dt,dd,pre,code,h1,h5,h6,.example,.box,.ex-block,.step,.formula,.final-line')) {
    if (el.dataset.block) continue
    const signature = (el.textContent || '') + [...el.querySelectorAll('img')].map(i => i.dataset.asset).join('') + (el.dataset.asset || '')
    const key = 'semantic-' + hash(signature); const count = seen.get(key) || 0; seen.set(key, count + 1)
    el.dataset.block = `${section}:${key}:${count}`; el.dataset.anchorQuote = (el.textContent || el.getAttribute('alt') || '').slice(0, 500)
  }
  for (const el of output.querySelectorAll<HTMLElement>('.en,.l,.en-block,.formula,.vector,.matrix')) el.classList.add('lesson-ltr')
  for (const el of output.querySelectorAll<HTMLElement>('.ltr,.lesson-ltr,[dir=ltr]')) {
    el.dir = 'ltr'
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) walker.currentNode.textContent = (walker.currentNode.textContent || '').replace(/[\u06f0-\u06f9\u0660-\u0669]/g, c => String(c.charCodeAt(0) - (c >= '\u06f0' ? 0x6f0 : 0x660)))
  }
  // Unmarked English runs in reading lessons keep normal wrapping and isolated direction.
  const walker = document.createTreeWalker(output, NodeFilter.SHOW_TEXT); const textNodes: Text[] = []
  while (walker.nextNode()) if (!(walker.currentNode.parentElement?.closest('.ltr,.lesson-ltr,[dir=ltr],bdi'))) textNodes.push(walker.currentNode as Text)
  for (const text of textNodes) {
    const parts = text.data.split(/([A-Za-z\u0370-\u03ff][A-Za-z\u0370-\u03ff0-9\u06f0-\u06f9\u0660-\u0669\u2070-\u209f\u00b9\u00b2\u00b3 ,;:.'?!()+/=?<>≤≥±−×÷⋅·→↔-]*)/g)
    if (parts.length < 2) continue
    const fragment = document.createDocumentFragment()
    for (const part of parts) { if (/^[A-Za-z\u0370-\u03ff]/.test(part)) { const run = document.createElement('bdi'); run.dir = 'ltr'; run.className = 'english-run'; run.textContent = part.replace(/[\u06f0-\u06f9\u0660-\u0669]/g, c => String(c.charCodeAt(0) - (c >= '\u06f0' ? 0x6f0 : 0x660))); fragment.append(run) } else fragment.append(document.createTextNode(part)) }
    text.replaceWith(fragment)
  }
  for (const row of output.querySelectorAll<HTMLElement>('.steps > div,.ans-steps > div')) {
    const formula = [...row.children].reverse().find(el => el.classList.contains('ltr'))
    if (formula) {
      const slot = document.createElement('span'); slot.className = 'solution-math'; slot.append(formula)
      const prose = document.createElement('span'); prose.className = 'solution-explanation'; prose.append(...row.childNodes)
      row.replaceChildren(...(prose.textContent?.trim() ? [prose, slot] : [slot]))
    }
  }
  // Large tables scroll inside their own reading-width container.
  // Display refinements follow anchor creation, preserving existing block IDs.
  const displayWalker = document.createTreeWalker(output, NodeFilter.SHOW_TEXT)
  while (displayWalker.nextNode()) {
    const node = displayWalker.currentNode
    if (node.parentElement?.closest('.frac,.ltr,.lesson-ltr,[dir=ltr]')) continue
    node.textContent = (node.textContent || '').replace(/[🎯🔵🟢🔴🟡🟣💡⚠✅❌📌⭐★🧠📝📚🧪📖🔍🎓🧭🧰🪆💠🔶🔹📊🟠]\uFE0F?/gu, '').replace(/([\u0600-\u06ff])([A-Za-z])/g, '$1 $2').replace(/([A-Za-z])([\u0600-\u06ff])/g, '$1 $2')
      .replace(/کارت آبی/g, 'بخش مفاهیم').replace(/مثال‌های سبز/g, 'مثال‌های آموزشی').replace(/کارت قرمز/g, 'بخش خطاهای رایج').replace(/نکات طلایی/g, 'نکات آزمون')
  }
  for (const title of output.querySelectorAll('h1,h2,h3,h4,h5,h6,.sec-head,.section-title')) {
    if (title.firstElementChild && /^[0-9۰-۹A-Za-z]{1,3}$/.test(title.firstElementChild.textContent?.trim() || '')) title.firstElementChild.classList.add('lesson-heading-marker')
    const first = title.firstChild
    if (first?.nodeType === Node.TEXT_NODE) first.textContent = (first.textContent || '').replace(/^([0-9۰-۹]+)(?=[\u0621-\u06ffA-Za-z])/, '$1 ')
  }
  const spacingWalker = document.createTreeWalker(output, NodeFilter.SHOW_TEXT)
  let previous: Text | null = null
  while (spacingWalker.nextNode()) {
    const node = spacingWalker.currentNode as Text
    if (previous && !node.parentElement?.closest('.frac,.num,.den') && previous.parentElement?.closest('p,li,h1,h2,h3,h4,h5,h6,td,th') === node.parentElement?.closest('p,li,h1,h2,h3,h4,h5,h6,td,th')) {
      const a = previous.data.trimEnd().at(-1) || '', b = node.data.trimStart()[0] || ''
      if (/[\u0621-\u06ff]/.test(a) && /[A-Za-z]/.test(b) || /[A-Za-z]/.test(a) && /[\u0621-\u06ff]/.test(b)) {
        // A space inside an inline-block math run collapses at its line edge.
        // Put the boundary in the common parent, outside either isolated run.
        let common: Node | null = node.parentNode
        while (common && !common.contains(previous)) common = common.parentNode
        if (common) {
          let next: Node = node
          while (next.parentNode && next.parentNode !== common) next = next.parentNode
          common.insertBefore(document.createTextNode(' '), next)
        }
      }
    }
    if (node.data) previous = node
  }
  for (const table of output.querySelectorAll('table')) { const wrap = document.createElement('div'); wrap.className = 'lesson-table-scroll'; table.replaceWith(wrap); wrap.append(table) }
  return output.innerHTML
}
