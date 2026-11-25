"""Collect final Phase 5 evidence; never writes to application databases."""
import collections
import datetime
import hashlib
import json
import pathlib
import re
import sqlite3
import statistics
import xml.etree.ElementTree as ET

root = pathlib.Path(__file__).resolve().parents[1]
phase = root / 'docs/educational-reader-pilot/phase-5'
output = phase / 'verification'

def decoded(path):
    value = path.read_bytes()
    return value.decode('utf-16' if value.startswith((b'\xff\xfe', b'\xfe\xff')) else 'utf-8-sig', errors='replace')

def read(name):
    return json.loads(decoded(output / name))

def write(name, value):
    (output / name).write_text(json.dumps(value, indent=2), encoding='utf-8')

for name in ['npm-audit.json', 'npm-production-audit.json', 'npm-browser-audit.json', 'nuget-audit.json']:
    path = output / name
    raw = decoded(path)
    try:
        value = json.loads(raw)
    except json.JSONDecodeError:
        raw_path = path.with_suffix('.raw.log')
        raw_path.write_bytes(path.read_bytes())
        value = {'status': 'BLOCKED', 'auditCompleted': False, 'rawEvidence': raw_path.name,
                 'error': raw.strip()[-1800:], 'meaning': 'Connectivity failure; no clean vulnerability result.'}
        write(name, value)
    if 'status' not in value and ('error' in value or 'message' in value):
        value.update(status='BLOCKED', auditCompleted=False)
        write(name, value)

catalog_path = root.parent / 'Backend/backend/Cent.Module/Content/reviewed-v4.json'
catalog = json.loads(catalog_path.read_text(encoding='utf-8'))
files = [f for f in (root / 'dist').rglob('*') if f.is_file()]
text = '\n'.join(f.read_text(encoding='utf-8', errors='ignore') for f in files if f.suffix in ['.js', '.html', '.json', '.txt'])
violations = [str(f.relative_to(root / 'dist')) for f in files if re.search(r'\.(zip|db|bak|mdf|ldf)(\.|$)', f.name, re.I) or
              any(s.lower() in ['docs', 'content', 'provenance', '.preview-artifacts'] for s in f.relative_to(root / 'dist').parts)]
identities = [q['Id'] for q in catalog['questionBank'] if q['Id'] in text]
stems = [q['Id'] for q in catalog['questionBank'] if len(q['Text']) > 50 and q['Text'] in text]
write('public-artifact-scan.json', {'status': 'PASS' if not violations + identities + stems else 'FAIL',
      'capturedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'files': len(files),
      'bytes': sum(f.stat().st_size for f in files), 'privatePathViolations': violations,
      'privateQuestionIdsInTextAssets': identities, 'privateQuestionStemsInTextAssets': stems,
      'policy': 'Publish only dist; protected evidence, sessions, databases, archives and backups remain private.'})

browser = read('normal-local-acceptance.json')
write('local-links.json', {s['subject']: 'http://127.0.0.1:5173/cent-s/student/study/' + s['documentId'] for s in browser['subjects']})
baseline = read('local-backup.json')
database = pathlib.Path(baseline['database'])
with sqlite3.connect(database.as_uri() + '?mode=ro', uri=True) as current, sqlite3.connect(pathlib.Path(baseline['backup']).as_uri() + '?mode=ro', uri=True) as original:
    latency = next(c['latencyMs'] for c in read('normal-http-security.json')['checks'] if c['requirement'] == 'legitimate-session')
    write('local-storage-latency.json', {
        'capturedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'provider': 'SQLite; NOT SQL Server capacity evidence', 'beforeFileBytes': baseline['bytes'],
        'afterFileBytes': database.stat().st_size, 'growthBytes': database.stat().st_size - baseline['bytes'],
        'walBytes': pathlib.Path(str(database) + '-wal').stat().st_size if pathlib.Path(str(database) + '-wal').exists() else 0,
        'auditRowsBefore': original.execute('SELECT COUNT(*) FROM cent_audit_events').fetchone()[0],
        'auditRowsAfter': current.execute('SELECT COUNT(*) FROM cent_audit_events').fetchone()[0],
        'auditPayloadUtf8Bytes': current.execute('SELECT SUM(length(cast(Action AS blob))+length(cast(ActorId AS blob))+length(cast(EntityId AS blob))) FROM cent_audit_events').fetchone()[0],
        'budgetRows': current.execute('SELECT COUNT(*) FROM cent_reader_budgets').fetchone()[0],
        'budgetJsonBytes': current.execute('SELECT SUM(length(cast(StateJson AS blob))) FROM cent_reader_budgets').fetchone()[0],
        'auditMeasurementLimit': 'Payload estimate excludes row/index/page allocation; WAL is recorded separately. Includes acceptance activity.',
        'pacedSectionLatencyMs': {'samples': len(latency), 'mean': statistics.mean(latency), 'max': max(latency), 'p95NearestRank': sorted(latency)[-1]}})

tests = []
for name, overlap in [('cent-final.trx', False), ('cent-exams-resumed.trx', False), ('content-preview-final.trx', True)]:
    counters = ET.parse(output / name).getroot().find('.//{http://microsoft.com/schemas/VisualStudio/TeamTest/2010}Counters')
    assert int(counters.get('passed', '0')) > 0 and counters.get('passed') == counters.get('total') and int(counters.get('failed', '0')) == 0, name
    tests.append({'evidence': name, 'status': 'PASS',
                  'passed': int(counters.get('passed')), 'total': int(counters.get('total')), 'overlapsFullCentSuite': overlap})
frontend = decoded(output / 'frontend-resumed.log')
assert '221 passed' in frontend
tests.insert(0, {'evidence': 'frontend-resumed.log', 'status': 'PASS', 'passed': 221, 'files': 22})
assert '✓ built' in decoded(output / 'build-resumed.log')
assert not re.search(r'\b[1-9]\d* problems?\b', decoded(output / 'lint-resumed.log'))
assert {s['subject'] for s in browser['subjects']} == {'math', 'physics', 'chemistry', 'biology', 'logic', 'reading'}
assert all(s['status'] == 'PASS' for s in browser['subjects']) and not browser['errors']
assert any(c['requirement'] == 'normal-local-six-subject-journey' and c['status'] == 'PASS' for c in browser['checks'])
assert not read('normal-http-security.json')['errors']
assert not read('normal-interactions.json')['errors']
assert read('normal-pdf.json')['status'] == 'PASS'
assert read('local-preservation.json')['status'] == 'PASS'
assert read('acceptance-cleanup.json')['status'] == 'PASS'
assert read('final-health.json')['status'] == 'PASS'
assert read('public-artifact-scan.json')['status'] == 'PASS'

checklist = phase / 'RELEASE_CHECKLIST.md'
checklist.write_text(checklist.read_text(encoding='utf-8').replace('219 tests', '221 tests'), encoding='utf-8')
requirements = []
for line in checklist.read_text(encoding='utf-8').splitlines():
    if not line.startswith('|'):
        continue
    pieces = [part.strip() for part in line.strip('|').split('|', 2)]
    if len(pieces) == 3 and pieces[1] in ['PASS', 'FAIL', 'BLOCKED', 'NOT TESTED']:
        requirements.append({'requirement': pieces[0], 'status': pieces[1], 'evidenceOrLimit': pieces[2]})
write('results.json', {'capturedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
      'productionStatus': 'BLOCKED', 'localManualAcceptanceStatus': 'PASS',
      'localLimit': 'New chemistry and logic documents remain drafts; live provider login unverified; private existing-account sessions available.',
      'productionDeployed': False, 'leronaModified': False,
      'canonicalContentSha256': hashlib.sha256(catalog_path.read_bytes()).hexdigest(),
      'tests': tests, 'finalBuildEvidence': ['build-resumed.log', 'lint-resumed.log', 'cent-release-build.log', 'preview-resumed-build.log', 'release-tool-build.log'],
      'normalEnvironmentEvidence': ['normal-local-acceptance.json', 'normal-http-security.json', 'normal-interactions.json', 'normal-pdf.json', 'final-health.json'],
      'requirements': requirements, 'statusCounts': dict(collections.Counter(r['status'] for r in requirements)),
      'doNotSumOverlappingRuns': True,
      'residualRisks': ['SQL Server execution/locking/deadlocks/expiry/load/storage unverified', 'Online npm/NuGet audits blocked',
                        'Independent academic sign-offs absent', 'Firefox/WebKit binaries unavailable', 'Real devices and full assistive-technology acceptance not tested',
                        'Authorized extraction, screenshots, OCR and slow scraping remain possible']})
for path in output.glob('*.json'):
    path.write_text(json.dumps(json.loads(decoded(path)), indent=2), encoding='utf-8')
print(json.dumps({'production': 'BLOCKED', 'local': 'PASS', 'requirements': len(requirements),
                  'statusCounts': dict(collections.Counter(r['status'] for r in requirements))}))
