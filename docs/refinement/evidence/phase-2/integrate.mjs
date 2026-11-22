import fs from 'node:fs'
function edit(file,pairs) {
 let source=fs.readFileSync(file,'utf8')
 for(const [from,to] of pairs) {if(!source.includes(from))throw Error(`Missing replacement in ${file}: ${from}`);source=source.replace(from,to)}
 fs.writeFileSync(file,source)
}
edit('src/pages/CommercePages.tsx',[
 ["import { EmptyState, PageHeader }", "import { EmptyState, FilterGroup, PageHeader }"],
 ['<div className="section-tabs"><button className={kind === \'TRAINING\' ? \'active\' : \'\'} onClick={() => setKind(\'TRAINING\')}>آموزش‌های تکی</button><button className={kind === \'SUBSCRIPTION\' ? \'active\' : \'\'} onClick={() => setKind(\'SUBSCRIPTION\')}>اشتراک مطالعه</button></div>', '<FilterGroup className="section-tabs" label="نوع دسترسی آموزشی" value={kind} options={[{value:\'TRAINING\',label:\'آموزش‌های تکی\'},{value:\'SUBSCRIPTION\',label:\'اشتراک مطالعه\'}]} onChange={setKind}/>']
])
edit('src/pages/PracticePages.tsx',[
 ['import { PageHeader, ProgressBar, StatCard }', 'import { Card, PageHeader, ProgressBar, StatCard }'],
 ['<section className="card cent-admin-panel"><span className="eyebrow">قدم بعدی</span>', '<Card variant="recommendation" className="cent-admin-panel"><span className="eyebrow">قدم بعدی</span>'],
 ['تعیین سطح <ArrowLeft size={16}/></Link></section></div></>', 'تعیین سطح <ArrowLeft size={16}/></Link></Card></div></>'],
 ['<section className="card cent-admin-panel"><h2>قدم بعدی تو</h2>', '<Card variant="recommendation" className="cent-admin-panel"><h2>قدم بعدی تو</h2>'],
 ['"رفتن به مطالعه"}</Link></section>', '"رفتن به مطالعه"}</Link></Card>'],
 ['<ProgressBar value={100 * Object.keys(answers).length / attempt.questions.length}/>', '<ProgressBar tone="action" label="پاسخ‌های آزمون" value={100 * Object.keys(answers).length / attempt.questions.length}/>'],
 ['<ProgressBar value={result.percentage}/>', '<ProgressBar label={`عملکرد ${topic}`} value={result.percentage}/>']
])
edit('src/pages/LearningProgress.tsx',[
 ['<ProgressBar value={course.confirmedProgressPercentage}/>', '<ProgressBar label={`پیشرفت ${course.title}`} value={course.confirmedProgressPercentage}/>'],
 ['<ProgressBar value={topic.masteryPercentage ?? 0}/>', '<ProgressBar label={`تسلط ${topic.title}`} value={topic.masteryPercentage ?? 0} valueText={topic.masteryPercentage == null ? topic.evidenceQuestions === 0 ? \'سنجیده نشده\' : \'شواهد ناکافی\' : undefined}/>']
])
edit('src/pages/PersonalResults.tsx',[
 ['<ProgressBar value={c.confirmedProgressPercentage}/>', '<ProgressBar label={`پیشرفت ${c.title}`} value={c.confirmedProgressPercentage} valueText={c.assessedTopics ? undefined : \'هنوز سنجیده نشده\'}/>']
])
