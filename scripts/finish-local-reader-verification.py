"""Restore pre-existing reading positions touched by this acceptance run only.

Backs up current normal Cent data first. Preserves all original notes and history,
new Reading access, submitted acceptance results and newly created positions.
"""
import datetime
import hashlib
import json
import sqlite3
from pathlib import Path

root = Path(__file__).resolve().parents[1]
evidence = root / 'docs/educational-reader-pilot/phase-5/verification'
baseline = json.loads((evidence / 'local-backup.json').read_text(encoding='utf-8'))
sessions = json.loads((root / '.preview-artifacts/phase5/local-review-sessions.json').read_text(encoding='utf-8'))
owner = next(s['id'] for s in sessions if s['role'] == 'STUDENT')
browser = json.loads((evidence / 'normal-local-acceptance.json').read_text(encoding='utf-8'))
pdf = json.loads((evidence / 'normal-pdf.json').read_text(encoding='utf-8'))
allowed = {s['documentId'].upper() for s in browser['subjects']} | {pdf['documentId'].upper()}
stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
backup = root / ('.preview-artifacts/phase5/normal-after-acceptance-' + stamp + '.db.bak')
with sqlite3.connect(baseline['database']) as current, sqlite3.connect(Path(baseline['backup']).as_uri() + '?mode=ro', uri=True) as original:
    with sqlite3.connect(backup) as destination:
        current.backup(destination)
        assert destination.execute('PRAGMA integrity_check').fetchone() == ('ok',)
        assert not destination.execute('PRAGMA foreign_key_check').fetchall()
    restored = 0
    for user, document, last, furthest, updated in original.execute('SELECT UserId,DocumentId,LastPage,FurthestPage,UpdatedAt FROM cent_study_progress WHERE UserId=?', (owner,)):
        if document.upper() not in allowed:
            continue
        row = current.execute('SELECT LastPage,FurthestPage,UpdatedAt FROM cent_study_progress WHERE UserId=? AND DocumentId=?', (user, document)).fetchone()
        if row != (last, furthest, updated):
            current.execute('UPDATE cent_study_progress SET LastPage=?,FurthestPage=?,UpdatedAt=? WHERE UserId=? AND DocumentId=?', (last, furthest, updated, user, document))
            restored += 1
    original_ids = {row[0] for row in original.execute('SELECT Id FROM cent_notes')}
    removed = 0
    for identity, body in current.execute('SELECT Id,Body FROM cent_notes WHERE UserId=?', (owner,)).fetchall():
        if identity not in original_ids and (body.startswith('Phase 5 anchored acceptance ') or body.startswith('Phase 5 private ownership probe') or body.startswith('Phase 5 acceptance ')):
            current.execute('DELETE FROM cent_notes WHERE Id=? AND UserId=?', (identity, owner))
            removed += 1
    current.commit()
result = {'status': 'PASS', 'verifiedCurrentBackup': str(backup), 'sha256': hashlib.sha256(backup.read_bytes()).hexdigest(),
          'historicalPositionsRestored': restored, 'ownIncompleteProbeNotesRemoved': removed,
          'originalNotesDeleted': 0, 'originalAttemptsDeleted': 0, 'newMockReadingAccessRetained': True}
(evidence / 'acceptance-cleanup.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
print(json.dumps(result))
