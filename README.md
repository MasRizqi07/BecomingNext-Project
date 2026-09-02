# Becoming

Becoming adalah aplikasi refleksi pribadi berbasis AI yang mengubah delapan jawaban pengguna menjadi
dua skenario masa depan dan rencana tindakan kecil. Hasilnya adalah panduan reflektif—bukan diagnosis,
ramalan, tes psikologi, atau skor ilmiah.

## Status project

V2 telah diimplementasikan end-to-end di repository: public discovery, authenticated reflection,
review, processing, result, dashboard, history, authoritative habit check-in, settings, scoped
analysis deletion, account deletion, dan 404. Seluruh mutation melewati callable backend; Gemini
secret tidak pernah masuk bundle browser.

Status harus dibaca per environment:

| Boundary                       | Status              | Arti                                                             |
| ------------------------------ | ------------------- | ---------------------------------------------------------------- |
| Source implementation          | Complete            | Phase 0–3 tersedia dan terhubung ke behavior nyata               |
| Local automated evidence       | Verified 2026-09-02 | Static, unit, emulator, browser, a11y, visual, build, audit      |
| GitHub Actions pada commit ini | Belum diverifikasi  | Memerlukan push/PR dan run CI baru                               |
| Staging                        | Belum diverifikasi  | Real Auth, App Check, Gemini, monitoring, Lighthouse belum diuji |
| Production                     | Belum disetujui     | Promotion memerlukan staging evidence dan reviewer approval      |

Detail bukti dan blocker tersedia di [release readiness](docs/release-readiness.md). Lolos lokal tidak
sama dengan release-ready.

## Dokumentasi

- [PRD](PRD.md) — requirement, acceptance criteria, fase, risiko, dan status implementasi;
- [Design](Design.md) — design system, route/state specification, responsive, dan accessibility;
- [Architecture](docs/architecture.md) — trust boundary, lifecycle, invariants, scaling, dan trade-off;
- [Runbook](docs/runbook.md) — environment, deployment, smoke, monitoring, incident, rollback;
- [ADR 0001](docs/adr/0001-secure-serverless-boundary.md) — secure serverless boundary;
- [ADR 0002](docs/adr/0002-gemini-model-and-interface.md) — model/API Gemini dan rollback lever;
- [ADR 0003](docs/adr/0003-authoritative-check-in-and-deletion-guard.md) — check-in authoritative dan deletion guard.

## Fitur

- Safe demo statis tanpa Auth, Firestore write, atau Gemini call.
- Google Authentication dan account-aware route protection.
- Delapan pertanyaan refleksi, session draft, review sebelum submit, dan recovery setelah refresh.
- Server-side Gemini structured output dengan Zod validation, idempotency, quota, dan lease recovery.
- Result lengkap: identity, two paths, radar + accessible table, timeline, future letter, action plan.
- Personal dashboard, recent history, filter, download letter, dan share summary.
- Daily habit check-in dengan status setiap habit, mood, note, deterministic daily upsert, dan
  acknowledgement server.
- Delete satu analisis yang juga menghapus reflection dan check-in terkait.
- Delete akun yang menghapus application data dan Auth, dengan hashed anti-replay tombstone 24 jam.
- Locked single-dark theme, reduced motion, native keyboard dialog, drawer isolation, focus restoration,
  dan axe coverage.
- CSP/security headers, owner-only reads, direct client writes denied, emulator suites, visual
  regression, cross-browser E2E, production dependency audit, dan bundle budget.

## Route inventory

| Route                    | Access            | Implementasi                                    |
| ------------------------ | ----------------- | ----------------------------------------------- |
| `/`                      | Public            | Landing, trust content, sign-in, safe demo CTA  |
| `/demo`                  | Public            | Static full result tanpa personal data/write/AI |
| `/how-it-works`          | Public            | Method, output, AI boundaries, FAQ              |
| `/privacy`               | Public            | Data, AI, retention, deletion, crisis boundary  |
| `/dashboard`             | Auth              | Latest/recent analysis dan contextual action    |
| `/reflect`               | Auth              | Reflection intake delapan pertanyaan            |
| `/reflect/review`        | Auth              | Review/edit dan authoritative submission        |
| `/analysis/:analysisId?` | Auth              | Create/resume pending/failed analysis           |
| `/results/:analysisId`   | Auth              | Owner-only personalized result                  |
| `/check-in/:analysisId`  | Auth              | Authoritative daily habit check-in              |
| `/history`               | Auth              | Archive, status filter, open/resume/delete      |
| `/settings`              | Auth              | Account, privacy, sign-out, delete account      |
| `*`                      | Public/Auth aware | Explicit 404 recovery                           |

## Stack

| Layer         | Teknologi                                                          |
| ------------- | ------------------------------------------------------------------ |
| Frontend      | React 19, TypeScript, Vite 8, React Router 7                       |
| Styling       | Tailwind CSS 4, semantic CSS, Motion, Lucide, local variable fonts |
| State         | Zustand session persistence                                        |
| Visualization | Recharts + accessible table equivalent                             |
| Validation    | Shared Zod contracts                                               |
| Platform      | Firebase Hosting, Auth, App Check, Firestore, Functions            |
| AI            | Gemini Interactions API, server-side, `store: false`               |
| Test          | Vitest, Firebase Emulator, Playwright, axe-core                    |

## Trust flow

```text
Public visitor -> Hosting -> static DEMO_ANALYSIS (no write, no AI)

Authenticated user
  -> Auth + limited-use App Check token
  -> callable Function
  -> shared Zod validation
  -> Firestore transaction / bounded batch lifecycle
  -> optional Gemini structured-output request
  -> authoritative Firestore state
  -> owner-only client read / server-confirmed mutation result
```

Mutation yang tersedia: `createAnalysis`, `upsertCheckIn`, `deleteAnalysis`, dan `deleteMyData`.
Direct client writes ditolak. `GEMINI_API_KEY` disimpan di Secret Manager dan tidak boleh menjadi
variable `VITE_*`.

## Prerequisites

- Node.js 24 untuk root toolchain dan CI (`.nvmrc`);
- npm 10+;
- Java 21+ untuk Firestore Emulator;
- Chromium, Firefox, WebKit, dan Google Chrome dari Playwright;
- Firebase CLI login hanya untuk deployment atau project nyata.

Firebase Functions menggunakan runtime Node.js 22 sesuai `functions/package.json` dan
`firebase.json`.

## Local setup

```bash
npm ci
npm --prefix functions ci
cp .env.example .env.local
npm run dev
```

Aplikasi berjalan pada `http://localhost:3000`. Isi `.env.local` dengan Firebase web configuration
environment yang dipakai. Firebase web config adalah identifier publik; Gemini secret tetap
server-side.

### Emulator mode

```dotenv
VITE_USE_FIREBASE_EMULATORS="true"
```

```bash
npx firebase-tools emulators:start --project demo-becoming
npm run dev
```

| Service     | Port |
| ----------- | ---- |
| Emulator UI | 4000 |
| Functions   | 5001 |
| Firestore   | 8180 |
| Auth        | 9099 |
| Hosting     | 5000 |

## Scripts

| Command                     | Fungsi                                              |
| --------------------------- | --------------------------------------------------- |
| `npm run dev`               | Vite development server                             |
| `npm run build`             | Build web + Functions + bundle budget               |
| `npm run lint`              | ESLint tanpa warning                                |
| `npm run typecheck`         | Strict typecheck web + Functions                    |
| `npm run test:coverage`     | Frontend/shared tests + coverage                    |
| `npm run test:functions`    | Functions unit tests                                |
| `npm run test:transactions` | Reservation/check-in/deletion emulator tests        |
| `npm run test:rules`        | Firestore authorization emulator tests              |
| `npm run test:e2e`          | Chromium/Firefox/WebKit desktop/mobile, axe, visual |
| `npm run test:e2e:phase1`   | Portable Chromium primitive/interaction visual gate |
| `npm run test:e2e:visual`   | Windows/Chromium visual regression baselines        |
| `npm run test:e2e:auth`     | Authenticated full-stack emulator lifecycle         |
| `npm run audit`             | Production dependency audit root + Functions        |
| `npm run verify`            | Static, unit, build, bundle, audit                  |
| `npm run verify:full`       | Semua gate lokal termasuk emulator dan E2E          |
| `npm run clean`             | Hapus generated build/test artifacts                |

## Implementation phases

| Phase | Scope                                                                    | Status lokal              |
| ----- | ------------------------------------------------------------------------ | ------------------------- |
| 0     | Tokens, primitives, shell, route/state inventory                         | Complete                  |
| 1     | Landing, demo, information, intake/review, result, history/settings, 404 | Complete                  |
| 2     | Returning-user dashboard dan contextual CTA                              | Complete                  |
| 3     | Shared check-in contract, callable, rules/indexes, cascade, UI, E2E      | Complete                  |
| 4A    | Static/unit/emulator/cross-browser/a11y/visual/build/audit               | Verified locally          |
| 4B    | CI, staging, real providers, monitoring, performance acceptance, rollout | Pending external evidence |

## Production configuration

1. Gunakan Firebase project terpisah untuk staging dan production.
2. Aktifkan Google Auth, Firestore, Functions, Hosting, App Check, dan reCAPTCHA Enterprise.
3. Isi `VITE_FIREBASE_*`, `VITE_FIRESTORE_DATABASE_ID`, dan site key per environment.
4. Simpan Gemini key dengan `firebase functions:secrets:set GEMINI_API_KEY`.
5. Deploy Firestore rules/indexes/TTL policy sebelum Functions dan Hosting.
6. Verifikasi composite indexes serta TTL `accountDeletionTombstones.expiresAt` aktif.
7. Konfigurasikan budgets, quota, logs, monitoring, alert, backup, dan retention.
8. Jalankan `npm run verify:full`, deploy staging, lalu isi seluruh checklist runbook.
9. Promotion production hanya melalui protected environment dengan reviewer approval.

Default model adalah Gemini 3.7 Flash melalui Interactions API stateless (`store: false`).
`GEMINI_MODEL` tetap tersedia sebagai rollback lever.

## Data and privacy

- Reflection, analysis, dan check-in hanya dapat dibaca pemilik terautentikasi.
- Client tidak dapat menulis application documents langsung.
- Delete analysis menghapus reflection, analysis, dan seluruh check-in terkait.
- Delete account menghapus profile, rate limit, reflections, analyses, check-ins, lalu Auth account.
- Untuk mencegah ID token lama membuat ulang data, server menyimpan tombstone berisi hash satu arah
  UID serta timestamp deletion/expiry, tanpa profile atau reflection content. Tombstone kedaluwarsa
  setelah 24 jam dan kemudian eligible untuk cleanup TTL yang asynchronous.
- Structured logs hanya memuat operational identifiers, bukan isi refleksi.
- Safe demo memakai fixture lokal dan tidak memanggil provider.

## Complexity and trade-offs

- Request validation/hashing: `O(C)`, dengan `C` total karakter yang dibatasi schema.
- Analysis reservation: `O(1)` document reads/writes per transaction.
- Check-in upsert: `O(h)`, `2 <= h <= 5`, sehingga bounded secara operasional.
- History: `O(k)` untuk maksimal 20 record yang dimuat client.
- Delete analysis/account: `O(n)` terhadap owned documents, batch maksimum 400 dengan peak memory
  `O(400)`.
- Tombstone lookup: `O(1)` document read pada mutation transaction.
- Native-dialog Tab containment: `O(f)` per Tab, dengan `f` jumlah kontrol focusable di dialog.
- Score-field keyboard navigation: `O(s)` per key event, dengan default `s = 10`; toast scheduling
  tetap `O(1)`.

Trade-off: Firebase serverless mengurangi operational surface tetapi meningkatkan provider coupling;
synchronous AI menyederhanakan UX tetapi dibatasi timeout; deterministic daily check-in mencegah
duplikasi tetapi hanya menyimpan state terakhir per UTC day; TTL mengurangi retention identifier namun
cleanup fisiknya asynchronous. Native `<dialog>` memberi top-layer modality lintas browser, sementara
Tab-containment safety net tetap dipertahankan untuk konsistensi engine.

## Release boundary

Gunakan [runbook](docs/runbook.md) untuk deployment dan [release readiness](docs/release-readiness.md)
sebagai satu-satunya sumber status promotion. Jangan menyimpulkan CI, staging, real Gemini/App Check,
atau production dari hasil lokal.
