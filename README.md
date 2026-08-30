# Becoming

Becoming adalah aplikasi refleksi pribadi yang mengubah delapan jawaban pengguna menjadi dua skenario masa depan dan rencana tindakan kecil. Hasil AI adalah panduan reflektif, bukan diagnosis, ramalan, atau skor ilmiah.

## Status

Fondasi aplikasi sudah production-oriented: React/Vite frontend, Firebase Authentication, Firestore, App Check, callable Cloud Functions, server-side Gemini, validasi kontrak Zod, security rules, idempotency, rate limit, automated tests, bundle budget, serta workflow CI/deployment.

Deployment publik tetap memerlukan Firebase project milik operator, kredensial Google Cloud, App Check key, dan secret Gemini yang valid. Tidak ada secret AI di browser.

## Arsitektur singkat

```text
Browser
  -> Firebase Auth + App Check
  -> callable Cloud Functions (validated request)
  -> Gemini API (Secret Manager, server only)
  -> Firestore (server writes, owner-only reads)
```

Dokumen teknis lengkap tersedia di [architecture](docs/architecture.md), [runbook](docs/runbook.md), dan [ADR](docs/adr/0001-secure-serverless-boundary.md).

## Prasyarat

- Node.js 24 untuk toolchain lokal/CI (`.nvmrc`); Functions dideploy dengan Node.js 22.
- npm 10 atau lebih baru.
- Java 21 atau lebih baru untuk Firestore Emulator.
- Firebase CLI login untuk penggunaan emulator/deployment lokal.
- Google Chrome untuk E2E lokal.

## Menjalankan lokal

```bash
npm ci
npm --prefix functions ci
cp .env.example .env.local
npm run dev
```

Nilai Firebase bawaan hanya fallback development dari prototype. Untuk pengujian terhadap project sendiri, isi semua `VITE_FIREBASE_*` di `.env.local`. Jangan pernah menaruh `GEMINI_API_KEY` pada variabel `VITE_*`.

Untuk memakai emulator:

```bash
# .env.local
VITE_USE_FIREBASE_EMULATORS="true"

# terminal 1
npx firebase-tools emulators:start --project demo-becoming

# terminal 2
npm run dev
```

## Quality gates

```bash
npm run verify       # format, lint, types, unit, functions, build, production audit
npm run test:rules   # Firestore rules melalui emulator
npm run test:e2e     # desktop + mobile + axe accessibility
npm run verify:full  # seluruh gate di atas
```

Bundle production diperiksa otomatis: entry maksimal 180 KiB gzip dan setiap lazy chunk maksimal 130 KiB gzip.

## Konfigurasi production

1. Buat Firebase project staging dan production yang terpisah.
2. Aktifkan Google Authentication, Firestore, Functions, Hosting, App Check, dan reCAPTCHA Enterprise.
3. Salin `.env.example` menjadi file konfigurasi environment dan isi seluruh nilai publik Firebase.
4. Simpan Gemini key melalui Secret Manager:

   ```bash
   npx firebase-tools functions:secrets:set GEMINI_API_KEY --project <project-id>
   ```

5. Jika perlu, atur parameter `GEMINI_MODEL` dan `DAILY_ANALYSIS_LIMIT` pada environment Functions.
6. Deploy rules, index, functions, dan hosting melalui workflow `Deploy` atau Firebase CLI.
7. Aktifkan App Check enforcement hanya setelah metrik request valid pada staging sudah stabil.

Detail deploy, smoke test, observability, backup, penghapusan data, dan rollback ada di [runbook](docs/runbook.md).

## Data dan privasi

- Jawaban refleksi dan hasil hanya dapat dibaca pemilik yang terautentikasi.
- Client tidak dapat menulis dokumen aplikasi secara langsung.
- Tombol penghapusan analisis menghapus reflection dan analysis terkait.
- Penghapusan akun menghapus seluruh data pengguna lalu akun Firebase Auth.
- Log backend hanya memuat identifier operasional, bukan isi refleksi.

## Struktur utama

```text
src/                 frontend, routes, UI, store, Firebase client
shared/              kontrak request/response bersama
functions/src/       callable API, idempotency, rate limit, AI adapter
tests/e2e/            browser and accessibility checks
tests/rules/          Firestore authorization tests
docs/                 architecture, ADR, operational runbook
.github/workflows/    continuous integration and controlled deployment
```
