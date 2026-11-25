"""Back up and verify only the normal Cent.Preview database. No fixture creation."""
import argparse
import datetime
import hashlib
import json
import sqlite3
from pathlib import Path

root = Path(__file__).resolve().parents[2]
database = root / 'Backend/backend/Cent.Preview/App_Data/preview.db'
private = root / 'itatest/.preview-artifacts/phase5'
evidence = root / 'itatest/docs/educational-reader-pilot/phase-5/verification'
tables = ['cent_users', 'cent_notes', 'cent_orders', 'cent_entitlements', 'cent_study_progress',
          'cent_subject_access', 'cent_subject_orders', 'cent_attempts', 'cent_attempt_questions', 'cent_mock_attempts']

def state(connection):
    result = {}
    for table in tables:
        rows = sorted(connection.execute('SELECT * FROM ' + table).fetchall(), key=repr)
        result[table] = {'count': len(rows), 'sha256': hashlib.sha256(repr(rows).encode()).hexdigest()}
    return result

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('action', choices=['backup', 'verify'])
args = parser.parse_args()
private.mkdir(parents=True, exist_ok=True)
evidence.mkdir(parents=True, exist_ok=True)
with sqlite3.connect(database.as_uri() + '?mode=rw', uri=True) as source:
    if args.action == 'backup':
        stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
        backup = private / ('normal-preview-before-activation-' + stamp + '.db.bak')
        with sqlite3.connect(backup) as destination:
            source.backup(destination)
            assert destination.execute('PRAGMA integrity_check').fetchone() == ('ok',)
            assert not destination.execute('PRAGMA foreign_key_check').fetchall()
        result = {'status': 'PASS', 'database': str(database), 'backup': str(backup),
                  'sha256': hashlib.sha256(backup.read_bytes()).hexdigest(), 'bytes': backup.stat().st_size,
                  'integrityCheck': 'ok', 'foreignKeyViolations': 0, 'protectedTables': state(source)}
        (evidence / 'local-backup.json').write_text(json.dumps(result, indent=2))
        print('Verified Cent-only backup; original rows fingerprinted.')
    else:
        before = json.loads((evidence / 'local-backup.json').read_text())
        # Compare the pre-activation columns and original rows. Additive nullable
        # columns and explicitly created acceptance orders must not mask a lost
        # or changed historical row.
        after = {}
        with sqlite3.connect(Path(before['backup']).as_uri() + '?mode=ro', uri=True) as baseline:
            purchase_deltas = [source.execute('SELECT PurchaseVersion FROM cent_users WHERE Id=?', (identity,)).fetchone()[0] - version
                               for identity, version in baseline.execute('SELECT Id,PurchaseVersion FROM cent_users')]
            purchase_deltas = [delta for delta in purchase_deltas if delta]
            # Existing checkout and successful verification each invalidate once.
            if purchase_deltas not in ([], [2]):
                raise RuntimeError('Unexpected historical purchase-version changes.')
            for table in tables:
                columns = [r[1] for r in baseline.execute('PRAGMA table_info(' + table + ')')]
                # The acceptance Reading mock checkout legitimately increments
                # this cache-invalidation counter; identity fields remain exact.
                if table == 'cent_users':
                    columns.remove('PurchaseVersion')
                query = 'SELECT ' + ','.join('"' + column + '"' for column in columns) + ' FROM ' + table
                original = sorted(baseline.execute(query).fetchall(), key=repr)
                before['protectedTables'][table] = {'count': len(original), 'sha256': hashlib.sha256(repr(original).encode()).hexdigest()}
                current = set(source.execute(query).fetchall())
                retained = sorted((row for row in original if row in current), key=repr)
                after[table] = {'count': len(retained), 'sha256': hashlib.sha256(repr(retained).encode()).hexdigest()}
        # Run before acceptance creates new notes/progress/attempts/orders.
        comparisons = {table: {'status': 'PASS' if value == after[table] else 'FAIL',
                              'before': value, 'after': after[table]} for table, value in before['protectedTables'].items()}
        result = {'status': 'PASS' if all(r['status'] == 'PASS' for r in comparisons.values()) else 'FAIL',
                  'intentionalAcceptanceChanges': ['Added Reading DEVELOPMENT_MOCK order and entitlement', 'Owner PurchaseVersion incremented by checkout; excluded from identity comparison'],
                  'purchaseVersionDeltas': purchase_deltas,
                  'tables': comparisons, 'integrityCheck': source.execute('PRAGMA integrity_check').fetchone()[0],
                  'foreignKeyViolations': len(source.execute('PRAGMA foreign_key_check').fetchall())}
        (evidence / 'local-preservation.json').write_text(json.dumps(result, indent=2))
        print(result['status'])
