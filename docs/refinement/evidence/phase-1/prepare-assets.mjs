import fs from 'node:fs'
const directory = 'public/brand'
fs.mkdirSync(directory,{recursive:true})
const paths = colors => `<path fill="${colors[0]}" d="M512 158 845 491 770 566 512 307 254 565 180 491Z"/><path fill="${colors[1]}" d="M512 416 715 619 640 694 512 566 385 694 310 619Z"/><path fill="${colors[2]}" d="m512 645 101 101-101 100-100-100Z"/>`
const variants = {
  symbol: ['#A5B5A1','#4D687A','#29343C'],
  'symbol-dark': ['#A5B5A1','#9CB8C9','#F5F7F7'],
  monochrome: ['#29343C','#29343C','#29343C'],
  inverted: ['#F5F7F7','#F5F7F7','#F5F7F7'],
}
for(const [name,colors] of Object.entries(variants)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="160 138 704 728" role="img" aria-label="Itatest">${paths(colors)}</svg>\n`
  fs.writeFileSync(`${directory}/${name}.svg`,svg)
}
for(const [name,colors] of [['primary',variants.symbol],['dark',variants['symbol-dark']]]) {
  fs.writeFileSync(`${directory}/logo-${name}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 580 160" role="img" aria-label="Itatest"><svg x="0" y="8" width="140" height="144" viewBox="160 138 704 728">${paths(colors)}</svg><text x="164" y="112" fill="${name==='dark'?'#F5F7F7':'#29343C'}" font-family="Inter,Arial,sans-serif" font-size="100" font-weight="700">Itatest</text></svg>\n`)
}
fs.writeFileSync(`${directory}/favicon.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#F5F7F7"/><svg x="2" y="2" width="28" height="28" viewBox="160 138 704 728">${paths(variants.symbol)}</svg></svg>\n`)
for(const file of ['src/styles.css','src/cent.css']) {
  let source=fs.readFileSync(file,'utf8').replace(/((?:background-image|mask-image):)var\(--color-[^)]+\)/g,'$1none')
  fs.writeFileSync(file,source)
}
for(const file of ['src/pages/CommercePages.tsx','src/pages/admin/CentAdmin.tsx']) {
  let source=fs.readFileSync(file,'utf8').replaceAll('حساب Cent','حساب ایتاتست').replaceAll('مدیریت Cent','مدیریت ایتاتست').replaceAll('سفارش‌های Cent','سفارش‌های ایتاتست').replaceAll('کاربران Cent','کاربران ایتاتست').replaceAll('پایگاه داده Cent','پایگاه داده ایتاتست')
  fs.writeFileSync(file,source)
}
