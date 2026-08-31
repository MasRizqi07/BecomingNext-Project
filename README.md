# Becoming

Becoming adalah aplikasi refleksi pribadi berbasis AI yang mengubah delapan jawaban pengguna menjadi dua skenario masa depan dan rencana tindakan kecil. Hasilnya adalah panduan reflektif—bukan diagnosis, ramalan, tes psikologi, atau skor ilmiah.

## Product documentation

Dokumen upgrade V2 menjadi sumber kerja utama:

- [PRD.md](PRD.md) — tujuan produk, persona, requirement, prioritas, acceptance criteria, dan risiko;
- [Design.md](Design.md) — design system, spesifikasi setiap halaman, komponen, responsive behavior, accessibility, dan design QA;
- [docs/architecture.md](docs/architecture.md) — trust boundary, request lifecycle, security, reliability, dan trade-off teknis;
- [docs/runbook.md](docs/runbook.md) — setup environment, deployment, smoke test, monitoring, incident response, dan rollback;
- [docs/release-readiness.md](docs/release-readiness.md) — evidence gate terbaru dan blocker promotion.

PRD dan Design mendeskripsikan target V2. Tidak semua route/fitur target telah diimplementasikan pada source saat ini; lihat bagian “Current vs target”.

## Status project

Fondasi repository sudah production-oriented dan gate lokal telah diverifikasi. Staging dan production belum terverifikasi serta belum disetujui untuk promotion. Deployment publik masih membutuhkan Firebase project milik operator, kredensial Google Cloud, App Check key, dan Gemini secret yang valid.

Tidak ada secret AI di browser. Gemini hanya dipanggil melalui trusted callable Cloud Function.

### Current vs target

| Area          | Saat ini                                          | Target V2                                            |
| ------------- | ------------------------------------------------- | ---------------------------------------------------- |
| Public        | Landing, safe demo                                | + How it works, Privacy, explicit 404                |
| Authenticated | Reflection, processing, result, history, settings | + Dashboard, review answers, check-in                |
| Navigation    | Compact page header                               | Public/authenticated shell yang konsisten            |
| Result        | Full long-form result                             | Section navigation, hierarchy, accessible data view  |
| Retention     | History archive                                   | Latest action dashboard + non-addictive check-in     |
| Design system | Tailwind utilities + shared CSS classes           | Semantic tokens + reusable primitives/state patterns |
| Backend       | Analysis lifecycle dan deletion                   | + Check-in contract/rules/callable pada Phase 3      |

## Fitur yang sudah tersedia

- Safe demo tanpa Auth, Firestore write, atau Gemini call.
- Google Authentication dan account-aware route protection.
- Delapan pertanyaan refleksi dengan session draft.
- Server-side Gemini structured output dengan validasi Zod.
- Idempotency, lease recovery, dan batas analisis harian.
- Processing yang dapat dilanjutkan setelah refresh.
- Hasil: identity, two paths, radar, timeline, future letter, action plan, identity card.
- Download letter dan share summary.
- History owner-only, delete satu analisis, serta delete seluruh akun/data.
- App Check, Firestore rules, CSP, security headers, automated tests, dan bundle budget.

## Route inventory

### Route saat ini

| Route                    | Access | Implementasi                 |
| ------------------------ | ------ | ---------------------------- |
| `/`                      | Public | Landing + sign-in + demo CTA |
| `/demo`                  | Public | Static safe result           |
| `/reflect`               | Auth   | Reflection intake            |
| `/analysis/:analysisId?` | Auth   | Create/resume processing     |
| `/results/:analysisId`   | Auth   | Personalized result          |
| `/history`               | Auth   | Analysis archive             |
| `/settings`              | Auth   | Account/privacy controls     |

Unknown route saat ini kembali ke `/`. Target V2 menggunakan halaman 404 eksplisit.

### Route target V2

Tambahan yang direncanakan: `/how-it-works`, `/privacy`, `/dashboard`, `/reflect/review`, `/check-in/:analysisId`, dan halaman not-found. Requirement per route tersedia di [PRD.md](PRD.md); layout dan state tersedia di [Design.md](Design.md).

## Technology stack

| Layer         | Teknologi                                                 |
| ------------- | --------------------------------------------------------- |
| Frontend      | React 19, TypeScript, Vite 8, React Router 7              |
| Styling       | Tailwind CSS 4, CSS theme, Motion, Lucide                 |
| State         | Zustand session persistence                               |
| Visualization | Recharts                                                  |
| Validation    | Zod shared contracts                                      |
| Platform      | Firebase Hosting, Auth, App Check, Firestore, Functions   |
| AI            | Gemini Interactions API, server-side only, `store: false` |
| Test          | Vitest, Firebase Emulator, Playwright, axe-core           |

## Architecture

```text
Public visitor
  -> Firebase Hosting
  -> local static demo result

Authenticated user
  -> React/Vite client
  -> Firebase Auth + limited-use App Check token
  -> callable Cloud Function
  -> Zod request validation
  -> Firestore idempotency/quota/lease transaction
  -> Gemini structured output
  -> Zod response validation
  -> authoritative Firestore result
  -> owner-only client read
```

Direct client writes ditolak. `GEMINI_API_KEY` berada di Secret Manager dan tidak boleh ditempatkan pada variable `VITE_*`.

## Prerequisites

- Node.js 24 untuk root toolchain dan CI (`.nvmrc`);
- npm 10 atau lebih baru;
- Java 21 atau lebih baru untuk Firestore Emulator;
- Firebase CLI login untuk emulator/deployment;
- Google Chrome untuk E2E.

Firebase Functions dideploy dengan runtime Node.js 22 sebagaimana dikonfigurasi pada `firebase.json`.

## Local setup

```bash
npm ci
npm --prefix functions ci
cp .env.example .env.local
npm run dev
```

Aplikasi berjalan pada `http://localhost:3000`.

Isi `.env.local` dengan Firebase web configuration milik environment Anda. Nilai konfigurasi web Firebase adalah identifier publik, tetapi Gemini secret tidak pernah menjadi `VITE_*`.

### Emulator mode

```dotenv
VITE_USE_FIREBASE_EMULATORS="true"
```

Jalankan pada terminal terpisah:

```bash
npx firebase-tools emulators:start --project demo-becoming
npm run dev
```

Emulator ports:

| Service     | Port |
| ----------- | ---- |
| Emulator UI | 4000 |
| Functions   | 5001 |
| Firestore   | 8180 |
| Auth        | 9099 |
| Hosting     | 5000 |

## Available scripts

| Command                     | Fungsi                                            |
| --------------------------- | ------------------------------------------------- |
| `npm run dev`               | Vite development server pada port 3000            |
| `npm run build`             | Build web dan Functions                           |
| `npm run preview`           | Preview production build pada port 4173           |
| `npm run lint`              | ESLint tanpa warning                              |
| `npm run typecheck`         | Typecheck web dan Functions                       |
| `npm run test`              | Frontend/shared Vitest                            |
| `npm run test:functions`    | Functions unit tests                              |
| `npm run test:transactions` | Firestore reservation/concurrency emulator tests  |
| `npm run test:rules`        | Firestore rules emulator tests                    |
| `npm run test:e2e`          | Public desktop/mobile + accessibility             |
| `npm run test:e2e:auth`     | Authenticated full-stack lifecycle via emulator   |
| `npm run verify`            | Static, unit, build, bundle, dan dependency gates |
| `npm run verify:full`       | Seluruh gate termasuk emulator dan E2E            |
| `npm run clean`             | Hapus generated build/test artifacts              |

## Quality gates

Sebelum membuka perubahan untuk review:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Sebelum release candidate:

```bash
npm run verify:full
```

Bundle production diperiksa otomatis: entry maksimal 180 KiB gzip dan setiap lazy chunk maksimal 130 KiB gzip.

Lolos lokal tidak sama dengan lolos staging. Promotion membutuhkan evidence real Google sign-in, valid App Check, owner isolation, satu real Gemini response, retry, deletion, logs, monitoring, dan smoke test pada deployment staging.

## Implementing the V2 upgrade

### Phase 0 — UI foundation

1. Pindahkan warna, typography, spacing, radius, motion, dan state color ke semantic tokens.
2. Ekstrak Button, Card, Field, Dialog, Badge, Toast, PageShell, PublicHeader, dan AppHeader.
3. Buat route/state inventory test serta screenshot baseline.
4. Pertahankan route dan backend behavior selama refactor.

### Phase 1 — Existing journey

1. Upgrade landing dan demo.
2. Tambah How it works, Privacy, dan 404.
3. Upgrade intake dan tambah review answers.
4. Rapikan processing recovery serta result hierarchy.
5. Upgrade history dan settings.

Fase ini seharusnya tidak memerlukan perubahan besar pada backend analysis contract.

### Phase 2 — Dashboard

1. Tambah authenticated dashboard.
2. Gunakan existing history query untuk latest/recent analysis.
3. Tambahkan contextual CTA berdasarkan status.
4. Ubah post-sign-in destination setelah flow teruji.

### Phase 3 — Check-in

1. Definisikan Zod contract bersama.
2. Implementasikan callable mutation tervalidasi.
3. Tambahkan owner-only rules, indexes, dan emulator tests.
4. Tambahkan cascade deletion pada analysis dan account deletion.
5. Baru aktifkan route serta CTA check-in.

UI tidak boleh menampilkan check-in tersimpan sampai server mengonfirmasi write.

### Phase 4 — Release validation

1. Responsive dan keyboard audit.
2. Axe + screen-reader smoke.
3. Visual regression dan cross-browser check.
4. Performance/bundle audit.
5. `npm run verify:full`.
6. Deploy staging dan isi checklist pada runbook.

## Engineering conventions

- Gunakan strict TypeScript dan shared Zod schemas pada trust boundary.
- Lazy-load route berat dan visualization.
- Jangan memasukkan jawaban refleksi ke URL, analytics, console, atau structured logs.
- Gunakan server-confirmed state untuk success, delete, dan persistence.
- Pertahankan idempotency key untuk seluruh retry analysis yang sama.
- Gunakan accessible native semantics sebelum menambah ARIA.
- Hormati `prefers-reduced-motion`.
- Tambahkan test untuk setiap state baru, bukan hanya happy path.
- Perubahan check-in dianggap full-stack dan wajib mencakup rules serta deletion lifecycle.

## Project structure

```text
src/                  frontend routes, UI, state, Firebase client
shared/               request/response contracts dan demo fixture
functions/src/         callable API, AI adapter, idempotency, quota
tests/e2e/             public browser dan accessibility tests
tests/e2e-auth/        authenticated full-stack lifecycle
tests/rules/           Firestore authorization tests
docs/                  architecture, ADR, runbook, release evidence
.github/workflows/     CI dan controlled deployment
PRD.md                 target product requirements
Design.md              target UI/UX implementation specification
```

## Production configuration

1. Pisahkan Firebase project staging dan production.
2. Aktifkan Google Auth, Firestore, Functions, Hosting, App Check, dan reCAPTCHA Enterprise.
3. Isi seluruh `VITE_FIREBASE_*` dan `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` per environment.
4. Simpan Gemini key:

   ```bash
   npx firebase-tools functions:secrets:set GEMINI_API_KEY --project <project-id>
   ```

5. Atur `GEMINI_MODEL` dan `DAILY_ANALYSIS_LIMIT` bila diperlukan.
6. Konfigurasikan budgets, quota, monitoring, dan alert.
7. Jalankan full verification, deploy staging, lalu selesaikan smoke checklist.
8. Promotion production memerlukan reviewer approval.

Default AI runtime saat ini adalah Gemini 3.7 Flash melalui Interactions API stateless (`store: false`). Lihat [ADR 0002](docs/adr/0002-gemini-model-and-interface.md) untuk keputusan dan rollback lever.

## Data and privacy

- Reflection dan analysis hanya dapat dibaca oleh pemilik terautentikasi.
- Client tidak dapat menulis dokumen aplikasi langsung.
- Delete analysis menghapus reflection dan analysis terkait.
- Delete account menghapus data pengguna dan Firebase Auth account.
- Backend log hanya memuat identifier operasional, bukan isi refleksi.
- Safe demo menggunakan data statis dan tidak memanggil AI.

## Complexity and scaling notes

- Request validation/hashing: `O(C)`, dengan `C` total karakter yang dibatasi schema.
- Reservation transaction: `O(1)` document reads/writes.
- History render/query result: `O(k)`, saat ini `k ≤ 20` di client service.
- Account deletion: `O(n)` terhadap jumlah dokumen pengguna, batch maksimum 400 sehingga peak working memory `O(400)`.
- Filter history V2 tetap `O(k)` dan tidak membutuhkan query baru selama dataset yang dimuat tetap bounded.

Trade-off utama: Firebase serverless mengurangi beban operasi tetapi meningkatkan provider coupling; synchronous AI menyederhanakan UX tetapi dibatasi timeout; cinematic visuals memperkuat brand tetapi harus tunduk pada performance, contrast, dan reduced-motion requirements.

## Release status

Repository gates lokal telah lolos berdasarkan evidence tanggal 31 Agustus 2026. CI berikutnya, staging, real Gemini, dan production tetap belum terverifikasi. Gunakan [release-readiness](docs/release-readiness.md) sebagai sumber status dan [runbook](docs/runbook.md) sebagai checklist operasional.
