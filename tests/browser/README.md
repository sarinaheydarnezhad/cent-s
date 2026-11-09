# Local browser checks

`npm.cmd --prefix tests/browser run test:google-auth` tests Google/password login and registration, loading states, duplicate activation/callback handling under React StrictMode, state validation, cancellation, conflicts, disabled configuration, session expiration/restoration, logout, and mobile layout. Start only the Vite frontend for this check: it mocks all Cent and Google requests in isolated browser contexts and never contacts Google or creates database records. It also verifies callback response headers; use Vite development or preview, or a production server configured with the documented callback headers. The screenshot and result report use synthetic test data.

This optional test package is kept separate from the frontend application's dependencies. Its manifest, lockfile and test sources belong to the Cent Git repository. Normal frontend installation, build and runtime do not need this package.

Start `Cent.Preview` from the backend repository and the Vite frontend with `CENT_BACKEND_URL=http://127.0.0.1:5108`, as described in the main README. These checks require local development mock payments and create sample users, trainings, PDF pages and purchases in the local preview database.

From the frontend repository root:

```powershell
npm.cmd --prefix tests/browser ci
npm.cmd --prefix tests/browser test
```

The default browser is an installed Google Chrome. Set `CENT_TEST_BROWSER_CHANNEL=msedge` to use installed Microsoft Edge, or `CENT_TEST_CHROME_PATH` to select a browser executable. Optional `CENT_TEST_WEB_URL` and `CENT_TEST_API_URL` change the local URLs. Non-loopback URLs and non-mock payment environments are rejected before test fixtures are created.

The smoke check covers PDF upload, account registration, a simulated purchase, the library, watermarked reading, persistent notes, mobile layout and session recovery. The separate `test:recovery` command checks a second-page note created by a previous smoke run; use a dedicated local preview database with the default fixture passwords for these checks.

Generated sample PDFs, screenshots and reports are written to `artifacts/`, which Git ignores. Node modules are also ignored. All paths are relative to this test package; no workspace tools folder or machine-specific repository path is required.

After importing the bundled curriculum in the preview, `npm.cmd --prefix tests/browser run test:curriculum` checks a targeted algebra assessment, hidden answer keys, topic/subject mastery, desktop/mobile layout, source-text reading and persisted notes after reload. It creates a local verification user and a simulated training purchase; it requires the same loopback/mock protections as the smoke check.

`npm.cmd --prefix tests/browser run test:courses` checks the public homepage, catalog and course introduction against the actual imported courses, all five course outlines, mobile layout, and API failure without a sample-data fallback. It also checks that public visitors have no lesson-reading links. It does not create purchases or users.

`npm.cmd --prefix tests/browser run test:notes` reproduces consecutive note creation in the same reader session. It checks three new notes without refreshing, editing followed by a new note, a failed-save retry that retains its note ID, creating after deletion, and five distinct server-persisted notes after reload. It creates a dedicated local verification learner, simulated training purchase and notes under the same loopback/mock protections.

`npm.cmd --prefix tests/browser run test:study-return` checks reader → practice → results → the same lesson and page, including cancelling a test, login/session restoration, refreshing the test/results, recovery of a page-local note draft, and safe fallback when no valid study origin is provided. It creates a dedicated local learner and simulated training purchase.

`npm.cmd --prefix tests/browser run test:progress` submits real incorrect/correct practice attempts for a dedicated local learner and verifies My Results' actual scores, recent weighted accuracy, comparable score change, updated mastery without repeated-evidence inflation, subject filters, mobile layout, empty state and isolation from a second learner. It uses only local mock-enabled services.
