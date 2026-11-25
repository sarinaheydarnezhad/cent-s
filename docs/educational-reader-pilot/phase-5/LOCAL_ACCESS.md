# Local manual acceptance

25 November 2026. Normal persistent Itatest environment, not a disposable fixture. Production is disabled.

## Addresses

| Purpose | Local URL |
|---|---|
| Application | http://127.0.0.1:5173/cent-s/ |
| Login | http://127.0.0.1:5173/cent-s/login |
| Student library | http://127.0.0.1:5173/cent-s/student/content |
| Notes / reading positions | http://127.0.0.1:5173/cent-s/student/notes |
| Practice and reviewed assessments | http://127.0.0.1:5173/cent-s/student/practice |
| Administrator resources | http://127.0.0.1:5173/cent-s/admin/resources |
| Administrator content / offer review | http://127.0.0.1:5173/cent-s/admin/content |
| Chemistry publication draft, 50 lessons | http://127.0.0.1:5173/cent-s/admin/content-preview/3e9aa405-a3f1-3974-be40-9d1a5d11dc4b |
| Logic supplementary draft | http://127.0.0.1:5173/cent-s/admin/content-preview/ffe2a411-780c-14cc-099d-a3d3dc867430 |
| API status | http://127.0.0.1:5108/api/cent/v1/status |
| API explorer | http://127.0.0.1:5108/swagger/index.html |

Exact selected six-subject document URLs are in `verification/local-links.json`. Use the library for all other retained documents and PDFs. Draft preview requires content-management permission. The explicitly allowlisted existing student can review these two drafts locally through the normal reader, including notes and progress. Other identities still receive 404. The reader labels unpublished content as local review. The grant is effective only in Development, requires current training access, and is ignored in Production/Staging. Publication and academic approval remain pending.

## Start or restart

Open two PowerShell windows, both in `D:\Lerona\itatest`:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/start-local-reader.ps1 -Service Backend
```

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/start-local-reader.ps1 -Service Frontend
```

`-ExecutionPolicy Bypass` applies only to that process; it does not change machine policy. Keep the foreground windows open. Stop each with Ctrl+C before rebuilding/upgrading. If Vite responds to TCP but its first HTML request stalls, stop only this Itatest Vite process and run `npm.cmd run dev -- --host 127.0.0.1 --strictPort --force`. This recovered a stale dependency-optimization startup during verification. Do not stop unrelated Node processes.

The ignored `itatest/.env.local` is read as assignments by the startup script and by Vite. Its local values are:

```dotenv
VITE_CENT_API_URL=/api/cent/v1
VITE_BASE_PATH=/cent-s/
CENT_BACKEND_URL=http://127.0.0.1:5108
ASPNETCORE_ENVIRONMENT=Development
Cent__Reader__Enabled=true
Cent__Reader__AllSubjects=true
Cent__ReaderPilot__Enabled=false
Cent__Reader__Protection__CleanupEnabled=true
Cent__Reader__LocalReview__Enabled=true
Cent__Reader__LocalReview__UserId=COPY_EXISTING_STUDENT_ID_FROM_PRIVATE_SESSION_FILE
```

No audit deletion policy is enabled locally. The database is `D:\Lerona\Backend\backend\Cent.Preview\App_Data\preview.db`. Do not add `--isolated-database`, `--admin-fixtures`, `--reviewed-reader-fixtures` or `--sandbox-subject-offers` to these commands. No fixture flag was used for activation.

## Existing accounts

No account, password, Google identity or role was replaced. The existing administrator and existing subscribed student were used. Reading access was added to that student through the existing development mock checkout; this creates an explicitly mock order and entitlement and increments its purchase-cache counter. It does not mark a subject offer academically reviewed. The other five subjects use the existing subscription.

Live Google/SMS sign-in cannot be certified from this offline sandbox. The normal login UI and provider routes are unchanged. For immediate authorized local review, private 24-hour maintenance sessions for these **existing accounts** were written to:

`D:\Lerona\itatest\.preview-artifacts\phase5\local-review-sessions.json`

These are local administrator-issued sessions, not proof of provider authentication. Their expiry is in that private file. They are not public artifacts or known seeded credentials. To use one, open the application URL and its browser developer console. Copy only the selected entry's `token` and `expiresAt` from that file into:

```javascript
sessionStorage.setItem('cent:session:v1', 'COPY_SELECTED_PRIVATE_TOKEN');
sessionStorage.setItem('cent:session-expiry:v1', 'COPY_ITS_EXPIRES_AT');
location.assign('/cent-s/student/content'); // use /cent-s/admin/resources for ADMIN
```

Use separate browser profiles/windows for student and administrator. Do not paste session values into this report, screenshots, source control or public chat. After expiry use the normal configured provider sign-in, or an authorized local administrator can issue another local session using the existing Cent session store. There is no added bypass route or password endpoint.

## Maintenance already completed

The initial online SQLite backup, integrity check, foreign-key check, SHA-256 and original-row fingerprints are in `verification/local-backup.json`. The private backup is under `.preview-artifacts/phase5`. Further verified backups were made before each additive upgrade/import; their exact names are in `verification/local-activation.log` and `local-anchor-upgrade.log`.

The normal preview's SQLite upgrade was used, including the newly corrected nullable `cent_notes.AnchorJson` addition and creation of reader budget storage. EF's SQL Server migrations were **not** executed against SQLite. SQL Server verification is separately blocked. Import used `CentCurriculumImporter.Import()` with reviewed content enabled, in its existing transaction. Both new documents remain drafts. Historical user-data preservation passed before browser acceptance generated new activity; final historical-row comparisons are recorded separately.

Do not rerun the backup command over the acceptance baseline. For a future maintenance event, archive this evidence and create a fresh baseline first. With the API stopped, the existing maintenance command is:

```powershell
dotnet ..\Backend\backend\Cent.Preview\bin\Debug\net10.0\Cent.Preview.dll --upgrade-curriculum true --import-curriculum true --prepare-subject-offers true --exit-after-setup true
```

Never use the local mock host, SQLite DDL, local sessions or this `.env.local` for production.
