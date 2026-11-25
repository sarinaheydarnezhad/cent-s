"""Summarize private Phase 4 results without summing overlapping test runs."""
import json
import pathlib
import re
import xml.etree.ElementTree as ET

root=pathlib.Path(__file__).resolve().parents[1]
out=root/'docs/educational-reader-pilot/phase-4/verification'

def text(name):
    raw=(out/name).read_bytes()
    return raw.decode('utf-16' if raw.startswith((b'\xff\xfe',b'\xfe\xff')) else 'utf-8-sig')

def run(name):
    rows=ET.parse(out/name).findall('.//{*}UnitTestResult')
    outcomes={r.attrib['testName']:r.attrib['outcome'] for r in rows}
    return outcomes,dict(file=name,total=len(rows),passed=sum(r.attrib['outcome']=='Passed' for r in rows),failed=sum(r.attrib['outcome']=='Failed' for r in rows))

full,full_report=run('cent-phase4-verified.trx')
corrected,corrected_report=run('reviewed-phase4-final.trx')
merged=full|corrected
assert len(merged)==164 and set(merged.values())=={'Passed'}
exam,exam_report=run('cent-exams-phase4-verified.trx')
assert len(exam)==90 and set(exam.values())=={'Passed'}
front=text('frontend-tests.log');assert re.search(r'Tests\s+219\s+passed',front)
assert 'built in' in text('frontend-build.log') and 'postbuild' in text('frontend-build.log')
assert not re.search(r'\berrors?\b',text('frontend-lint.log'),re.I)
browser=json.loads((out.parent/'after/results.json').read_text('utf-8'))
packages=json.loads((out.parent/'package-validation.json').read_text('utf-8'))
assert browser['passed'] and len(browser['subjects'])==6 and browser['catalogSha256']==packages['catalogSha256']
assert all(r['mobileDiagramZoom'] for r in browser['subjects'] if r['assetsInSample'])
security=json.loads((out/'http-security-results.json').read_text('utf-8'));assert security['passed']
performance=json.loads((out/'sqlite-performance.json').read_text('utf-8'));assert performance['passed']
sql=json.loads((out/'sqlserver-results.json').read_text('utf-8'))
pdf=json.loads((out/'pdf-page-results.json').read_text('utf-8'));assert pdf['passed']
result=dict(frontend=dict(passed=219,files=22,lint=True,typecheckAndBuild=True),cent=dict(fullRun=full_report,correctiveRun=corrected_report,uniqueTestsWithLatestPassingOutcome=len(merged),note='Full run had two invalid fixture-price failures. The final reviewed-content run supersedes those outcomes; overlapping tests are counted once.'),centExam=exam_report,browser=browser,pdfPage=pdf,httpSecurity=security,sqlitePerformance=performance,sqlServer=sql,releaseReady=False,rolloutEnabledByDefault=False)
(out/'test-results.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print('164 distinct Cent tests verified across full/corrective runs; 90 exam tests; 219 frontend tests; six browser subjects.')
