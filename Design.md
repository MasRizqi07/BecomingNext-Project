# UI/UX Design Specification — Becoming V2

> Status: Implementation specification  
> Versi: 1.0  
> Tanggal: 31 Agustus 2026  
> Referensi requirement: [PRD.md](PRD.md)

## 1. Arah desain

### Konsep: “Cinematic clarity”

Becoming mempertahankan atmosfer gelap, tenang, dan introspektif yang sudah ada, tetapi meningkatkan clarity melalui spacing, hierarchy, navigation, dan state feedback. Hasilnya harus terasa personal dan premium tanpa terlihat mistis, manipulatif, atau seperti alat diagnosis.

### Kata kunci

- calm;
- reflective;
- private;
- editorial;
- precise;
- actionable.

### Yang dipertahankan

- canvas hampir hitam;
- aksen cyan sebagai primary signal;
- tipografi sans + display + serif italic;
- glass surface yang tipis;
- motion lembut dan particle ambience;
- headline editorial berskala besar.

### Yang diperbaiki

- kontras secondary text;
- konsistensi ukuran tombol dan state;
- kepadatan hasil panjang;
- navigasi pengguna kembali;
- visual distinction untuk info, warning, error, dan success;
- mobile layout, dialogs, focus management, dan reduced motion;
- penggunaan glow/blur agar tidak mengganggu keterbacaan.

## 2. Design principles

1. **One emotional focus per screen** — satu pertanyaan, satu keputusan utama, atau satu insight utama.
2. **Content earns emphasis** — skala besar digunakan untuk ide penting, bukan semua heading.
3. **State is never implied** — loading, saving, pending, failed, empty, dan completed selalu diberi label.
4. **Privacy is visible** — privacy cue hadir di titik input, submit, share, dan delete.
5. **Motion explains change** — animasi hanya memperjelas transisi/state, bukan menjadi hambatan.
6. **Mobile is a full experience** — bukan versi desktop yang dipersempit.

## 3. Design tokens

Implementasikan token di CSS theme agar halaman tidak menyimpan warna/radius/shadow acak.

### 3.1 Color

| Token                   | Nilai awal              | Penggunaan                  |
| ----------------------- | ----------------------- | --------------------------- |
| `--color-canvas`        | `#020205`               | Background utama            |
| `--color-surface-1`     | `#090A0F`               | Card solid                  |
| `--color-surface-2`     | `rgba(255,255,255,.05)` | Glass card                  |
| `--color-surface-3`     | `rgba(255,255,255,.08)` | Hover/selected              |
| `--color-border`        | `rgba(255,255,255,.12)` | Default border              |
| `--color-border-strong` | `rgba(255,255,255,.24)` | Hover/active border         |
| `--color-text-1`        | `#F8FAFC`               | Primary text                |
| `--color-text-2`        | `#CBD5E1`               | Body/secondary text         |
| `--color-text-3`        | `#94A3B8`               | Metadata; tetap cek kontras |
| `--color-accent`        | `#67E8F9`               | Cyan primary accent         |
| `--color-accent-strong` | `#22D3EE`               | Active/progress             |
| `--color-violet`        | `#C4B5FD`               | Intentional path            |
| `--color-danger`        | `#FCA5A5`               | Destructive/error           |
| `--color-warning`       | `#FCD34D`               | Warning/pending             |
| `--color-success`       | `#86EFAC`               | Confirmed success           |

Tidak boleh menyampaikan status hanya melalui warna. Selalu kombinasikan icon, label, atau copy.

### 3.2 Typography

Font saat ini tetap digunakan pada V2:

- Sans/body: Inter;
- Display/UI label: Space Grotesk;
- Editorial accent: Playfair Display.

| Style      | Desktop            | Mobile   | Line-height |
| ---------- | ------------------ | -------- | ----------- |
| Display XL | 80–96 px           | 48–56 px | 0.95–1.0    |
| Display L  | 56–64 px           | 40–48 px | 1.0–1.1     |
| H1         | 44–52 px           | 34–40 px | 1.1         |
| H2         | 30–36 px           | 26–30 px | 1.2         |
| H3         | 20–24 px           | 20–22 px | 1.3         |
| Body L     | 18 px              | 17 px    | 1.7         |
| Body       | 16 px              | 16 px    | 1.65        |
| Small      | 14 px              | 14 px    | 1.55        |
| Label      | 10–12 px uppercase | sama     | 1.4         |

Batasi letter spacing label uppercase pada layar sempit agar kata tidak terpotong. Body refleksi tidak boleh lebih kecil dari 16 px.

### 3.3 Spacing, radius, elevation

- Base spacing: 4 px.
- Content spacing: 8, 12, 16, 24, 32, 48, 64, 96 px.
- Max content width: 1200 px; reading width: 680–760 px.
- Radius: 12 px control, 20 px compact card, 28–32 px feature card, full untuk pill.
- Glass blur maksimal 20 px; jangan menumpuk lebih dari dua translucent surfaces.
- Shadow dipakai hanya untuk elevation modal/floating navigation, bukan setiap card.

### 3.4 Motion

| Pattern     | Durasi     | Easing   |
| ----------- | ---------- | -------- |
| Hover/focus | 120–180 ms | ease-out |
| Page enter  | 220–300 ms | ease-out |
| Card reveal | 280–400 ms | ease-out |
| Dialog      | 180–240 ms | ease-out |

- Translate maksimal 16 px untuk page/card reveal.
- Jangan loop animasi content penting.
- `prefers-reduced-motion: reduce` menghapus transform, parallax, particle movement, dan smooth scroll.
- Loading spinner boleh berputar, tetapi harus disertai text status.

## 4. Layout system

### Breakpoints kerja

- `xs`: 320–479 px;
- `sm`: 480–767 px;
- `md`: 768–1023 px;
- `lg`: 1024–1279 px;
- `xl`: ≥1280 px.

### Grid

- Mobile: 4 kolom, gutter 16–20 px.
- Tablet: 8 kolom, gutter 24 px.
- Desktop: 12 kolom, gutter 24–32 px.
- Result reading column maksimal 760 px; visualization dapat melebar sampai 1200 px.

### Safe area

Sticky/fixed mobile controls memakai `env(safe-area-inset-bottom)` dan tidak menutupi konten. Minimum bottom space 24 px setelah safe area.

## 5. Global shell dan navigation

### Public header

- Kiri: brand mark + `BECOMING.`.
- Tengah desktop: How it works, Privacy.
- Kanan: Demo/Sign in atau Dashboard bila authenticated.
- Mobile: brand + menu button; menu tampil sebagai modal sheet dengan focus trap.
- Landing boleh memakai transparent overlay; setelah scroll, background menjadi solid/translucent dengan border bawah.

### Authenticated header

- Kiri: Back bila kontekstual + brand.
- Desktop: Dashboard, New reflection, History.
- Kanan: avatar/menu berisi Settings dan Sign out.
- Mobile: icon berlabel melalui accessible name; action penting jangan hanya bergantung tooltip.

### Footer publik

- Brand statement singkat.
- How it works, Privacy, AI boundaries.
- Disclaimer non-medical/non-diagnostic.
- Tahun copyright dapat dihitung saat runtime tanpa klaim organisasi yang tidak tersedia.

## 6. Component inventory

### 6.1 Button

Varian:

- `primary`: background terang, text gelap;
- `secondary`: translucent surface;
- `ghost`: tanpa container permanen;
- `danger`: destructive;
- `icon`: wajib accessible name;
- `link`: navigasi inline.

State wajib: default, hover, focus-visible, active, disabled, loading. Loading mempertahankan lebar tombol dan mengganti icon dengan spinner + label kerja.

### 6.2 Card

- `surface-card`: konten utama;
- `glass-card`: showcase/marketing;
- `insight-card`: insight dan key takeaway;
- `status-card`: pending/error/empty/success;
- `danger-card`: data deletion.

Card non-interaktif tidak boleh memiliki hover yang memberi kesan dapat diklik.

### 6.3 Form controls

- Label selalu terlihat di luar field.
- Hint dan error memiliki ID yang dihubungkan melalui `aria-describedby`.
- Error tidak menghapus hint yang masih berguna.
- Counter berubah warning mendekati limit, tetapi bukan satu-satunya validasi.
- Textarea minimum 144 px, resize vertical diperbolehkan.
- Radio/segmented score memiliki target 44 px dan dapat digunakan arrow key.

### 6.4 Feedback

- Inline alert untuk error yang memblok flow.
- Toast untuk copied, downloaded, dan deleted setelah server confirmed.
- Dialog untuk destructive confirmation.
- Skeleton hanya bila struktur final diketahui; processing AI memakai status narrative.

### 6.5 Status badge

| Status      | Label           | Tone    |
| ----------- | --------------- | ------- |
| `pending`   | In progress     | warning |
| `completed` | Ready           | success |
| `failed`    | Needs attention | danger  |

Jangan tampilkan enum mentah kepada pengguna.

## 7. Page specifications

### 7.1 Landing `/`

Tujuan: menjelaskan manfaat, membangun trust, lalu mengarahkan ke demo atau refleksi.

Urutan section:

1. Header.
2. Hero: eyebrow, headline, supporting copy, dua CTA, privacy cue.
3. Product outcome preview: identity, paths, dan plan sebagai mock content berlabel preview.
4. How it works: Reflect → Compare → Act.
5. Why private: Auth, App Check, owner-only data, delete controls dalam bahasa non-teknis.
6. AI boundary callout.
7. Final CTA.
8. Footer.

Improvement terhadap kondisi sekarang:

- Pertahankan hero utama yang sudah kuat.
- Tambahkan preview output untuk mengurangi ketidakpastian sebelum login.
- Naikkan kontras paragraph dan privacy cue.
- Tambahkan navigation destination nyata untuk How it works dan Privacy.
- Particle dibuat lebih jarang pada mobile dan dekoratif (`aria-hidden`).

Acceptance visual:

- Hero CTA terlihat tanpa scroll pada 360×800 dan 1440×900.
- Headline tidak terpotong pada 320 px.
- CTA bertumpuk full-width pada mobile dan inline pada desktop.

### 7.2 How it works `/how-it-works`

- Hero ringkas: “Eight prompts. Two paths. One practical next step.”
- Stepper visual tiga tahap.
- “What you receive” dengan contoh data statis.
- “What AI does / does not do”.
- FAQ accordion native-accessible.
- CTA demo dan start.

FAQ tidak memuat klaim retention atau compliance yang belum diputuskan.

### 7.3 Privacy `/privacy`

- Data yang dikumpulkan dan alasan penggunaan.
- Tempat pemrosesan secara high-level dan siapa yang dapat membaca.
- Download/share behavior.
- Cara menghapus satu analisis dan akun.
- AI limitations dan kontak operator placeholder yang wajib diisi sebelum production.

Halaman ini adalah product explanation, bukan pengganti kebijakan legal yang telah direview.

### 7.4 Demo result `/demo`

- Tambahkan persistent `Demo` badge dan note “No personal data was used”.
- Gunakan layout hasil yang sama dengan personalized result.
- Sembunyikan Delete, History, dan Check-in.
- CTA header dan akhir: `Create my own reflection`.
- Download berisi label demonstration.

### 7.5 Dashboard `/dashboard`

```text
┌─────────────────────────────────────────────────────────────┐
│ Greeting                                      New reflection │
├──────────────────────────────────┬──────────────────────────┤
│ Latest analysis / resume          │ Today's smallest action  │
│ status, archetype, date, CTA      │ one plan item + Check in  │
├──────────────────────────────────┴──────────────────────────┤
│ Recent reflections (max 3)                   View all →      │
└─────────────────────────────────────────────────────────────┘
```

States:

- No analysis: welcome card + begin reflection.
- Pending: resume card dengan status akurat.
- Failed: needs-attention card + retry.
- Completed: latest insight + next action.
- Check-in backend belum dibuat: CTA tidak ditampilkan, bukan fake success.

### 7.6 Reflection intro dan intake `/reflect`

Intro state berisi jumlah pertanyaan, estimasi 8–12 menit, informasi draft session, privacy, dan Start/Resume CTA. Estimasi waktu adalah panduan UX, bukan janji pasti.

```text
Header / Exit
Question 3 of 8                          38%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CURRENT REFLECTION
Question copy
Hint copy

┌────────────────────────────────────────┐
│ Answer textarea                        │
└────────────────────────────────────────┘
Private to your account             0/1200

Back                                      Continue
```

Behavior:

- Autofocus hanya bila tidak menyebabkan mobile keyboard surprise.
- Back menyimpan jawaban saat ini sebelum pindah.
- Exit memunculkan dialog hanya bila ada perubahan belum tersimpan.
- Progress bar memiliki `<progress>` untuk semantics.
- Score memakai 1–10 selector + reason jika contract dimigrasi; sebelum itu tetap kompatibel dengan schema saat ini.

### 7.7 Review `/reflect/review`

- Header `Review your reflection`.
- Delapan answer cards dengan nomor, prompt, preview jawaban, dan Edit.
- Privacy/AI disclosure tepat sebelum submit.
- Sticky action bar pada mobile: Back + Create analysis.
- Submit loading: `Securing your reflection…`.
- Kegagalan submit mempertahankan semua jawaban dan idempotency key.

### 7.8 Processing `/analysis/:analysisId`

- Central orb/line visualization ringan; tanpa percentage palsu.
- Current narrative step dan list empat tahap.
- Copy menjelaskan halaman boleh ditutup dan dapat dilanjutkan.
- Completed diumumkan satu kali lalu redirect ke result.
- Error card: pesan sederhana, Retry, Back to review/history.
- Polling memakai bounded exponential backoff dan pause saat tab hidden/offline.

### 7.9 Results `/results/:analysisId`

Urutan informasi:

1. Hero identity.
2. Short “Start here” summary.
3. Two paths side-by-side; stacked pada mobile.
4. Radar comparison dengan text/table equivalent.
5. Timeline 6 months, 1 year, 5 years.
6. Future letter pada reading-width container.
7. Action plan: daily habits, learning roadmap, anti-procrastination.
8. Identity card dengan disclaimer di dekat score.
9. Actions.

Desktop memakai sticky section rail: Summary, Paths, Timeline, Letter, Plan. Mobile memakai `Jump to section` disclosure, bukan tabs horizontal yang terpotong.

Data visualization:

- Cyan = drifting path; violet = intentional path.
- Legend selalu terlihat.
- Tooltip dapat keyboard/focus atau nilai tersedia pada accessible table.
- Chart tidak menjadi satu-satunya cara memahami data.

Actions:

- Primary: Start check-in atau Reflect again berdasarkan feature availability.
- Secondary: Download letter, Share summary, History.
- Danger: Delete analysis ditempatkan terpisah.
- Native share cancellation bukan error; clipboard fallback memberi toast setelah berhasil.

### 7.10 Check-in `/check-in/:analysisId`

- Context analysis archetype + tanggal.
- Habit checklist tiga status, bukan checkbox biner.
- Optional mood 1–5 dengan label teks.
- Note maksimal 1000 karakter.
- Save CTA dan privacy cue.
- Setelah server confirmation: success summary + dashboard/result CTA.

Analysis bukan milik user/tidak ditemukan memakai generic not-found agar tidak membocorkan data. Analysis pending diarahkan ke processing. Route tidak diaktifkan pada production navigation sebelum backend tersedia.

### 7.11 History `/history`

- Heading + New reflection.
- Filter chips: All, Ready, In progress, Needs attention.
- Cards: friendly status, archetype, local date, Open/Resume.
- Delete memakai accessible dialog dengan akibat penghapusan.
- Setelah server confirmed, keluarkan item dan tampilkan toast.
- Mobile menggunakan overflow action bila tombol mulai berdesakan.

### 7.12 Settings `/settings`

1. Account identity.
2. Experience: reduced motion/system dan language readiness.
3. Privacy shortcuts.
4. Sign out.
5. Danger zone: delete account.

Typed confirmation tetap `DELETE`. Penjelasan deletion harus mencakup check-in bila fitur sudah ditambahkan.

### 7.13 Not found `*`

- Code `404`, copy ringkas, dan visual minimal.
- CTA `Return home` untuk publik atau `Go to dashboard` untuk user.
- Jangan redirect otomatis; pengguna perlu memahami URL tidak tersedia.

## 8. Responsive rules

- Hero headline memakai `clamp()` agar skala halus.
- Two-path dan plan grids menjadi satu kolom sebelum lebar card < 320 px.
- Header action masuk menu pada mobile.
- Sticky bottom action hanya pada intake/review/check-in; sisakan padding konten.
- Table kompleks berubah menjadi card/list jika memungkinkan.
- Panjang line body 45–75 karakter.

## 9. Accessibility specification

- Satu `h1` per halaman; heading section berurutan.
- Skip link tetap tersedia dan terlihat saat focus.
- Icon dekoratif `aria-hidden`; icon-only action memiliki name spesifik.
- Dialog memakai focus trap, safe initial focus, Escape, dan mengembalikan focus ke trigger.
- Background polling tidak memindahkan focus.
- Form error summary dapat difokuskan dan menaut ke field.
- `aria-live="polite"` untuk status; error blocking dapat memakai `role="alert"`.
- Chart memiliki text alternative/table; particles disembunyikan dari accessibility tree.
- Semua copy penting tetap tersedia saat CSS/animation gagal.

## 10. Content design

Tone: jujur, lembut, langsung, tidak menghakimi, tidak membuat kepastian masa depan, dan tidak memakai jargon AI tanpa manfaat.

| Hindari                       | Gunakan                                                          |
| ----------------------------- | ---------------------------------------------------------------- |
| “This is who you will become” | “One plausible direction based on your reflection”               |
| “Your psychological profile”  | “Your reflection summary”                                        |
| “AI score”                    | “Reflective estimate”                                            |
| “We predicted your future”    | “We compared two possible paths”                                 |
| “Something went wrong”        | “Your analysis paused. Your answers are safe; retry when ready.” |

Existing UI menggunakan Inggris. V2 dapat tetap Inggris agar tidak mencampur bahasa, tetapi string baru dipusatkan pada content module supaya siap i18n. Jangan menerjemahkan sebagian route saja.

## 11. State matrix

| Surface    | Loading           | Empty                | Error           | Success            |
| ---------- | ----------------- | -------------------- | --------------- | ------------------ |
| Auth       | Checking session  | Signed out           | Popup failed    | Signed in          |
| Dashboard  | Card skeleton     | First reflection CTA | Retry data      | Latest + recent    |
| Intake     | Hydrating draft   | New session          | Validation      | Step saved         |
| Processing | Pending narrative | N/A                  | Retry/resume    | Redirect result    |
| Result     | Fetching result   | Not found generic    | Back to history | Full result        |
| History    | List skeleton     | First reflection CTA | Retry           | Records            |
| Check-in   | Loading plan      | No plan              | Retry/not found | Saved confirmation |
| Delete     | Working           | N/A                  | Inline failure  | Toast + navigation |

## 12. Asset guidance

- Prioritaskan CSS gradients, simple vector lines, dan existing particles.
- Jangan memakai stock portrait yang dapat menyiratkan identitas pengguna.
- Image baru memiliki explicit dimensions, modern format, dan lazy loading di bawah fold.
- Decorative background tidak menerima pointer events.
- Logo tersedia sebagai reusable component dan favicon/app icon konsisten.

## 13. Component/file architecture target

```text
src/
  routes/                     route-level screens and guards
  components/
    primitives/               Button, Card, Dialog, Field, Badge, Toast
    layout/                   PublicHeader, AppHeader, Footer, PageShell
    reflection/               Progress, QuestionField, ReviewCard
    analysis/                 StatusTimeline, ResultSectionNav
    results/                  PathCard, Timeline, PlanCard, IdentityCard
  content/                    centralized UI copy, future i18n boundary
  features/
    dashboard/
    check-in/
  services/                   callable and Firestore reads
  store/                      session-only draft and active job state
shared/                       client/server contracts
```

Refactor dilakukan incremental. Jangan memindahkan seluruh repository sekaligus; primitives dan route shell diekstrak saat halaman pertama membutuhkannya.

## 14. UI implementation sequence

1. Token audit dan primitives.
2. Global public/authenticated shell.
3. Landing, How it works, Privacy, 404.
4. Intake + Review.
5. Processing states.
6. Result hierarchy dan accessible visualization.
7. History + Settings.
8. Dashboard.
9. Check-in setelah backend contract/rules siap.
10. Responsive, accessibility, visual regression, performance polish.

## 15. Design QA checklist

- Cocokkan seluruh route dengan state matrix.
- Periksa 320, 360, 768, 1024, dan 1440 px.
- Periksa 200% zoom dan browser text scaling.
- Navigasi seluruh flow hanya dengan keyboard.
- Uji screen reader landmarks, heading, form label, status, dan dialog.
- Uji particle/glow tidak berkedip dan dapat direduksi.
- Pastikan focus tidak hilang setelah route transition, dialog close, delete, atau retry.
- Pastikan private answer tidak masuk share, analytics, URL, dan error UI.
- Jalankan axe dan Playwright untuk public serta authenticated flow.
- Bandingkan screenshot baseline untuk landing, intake, processing, results, dashboard, history, settings, dan mobile variants.

## 16. Definition of done per halaman

Sebuah halaman selesai bila:

- default dan seluruh state relevan terimplementasi;
- data/CTA terhubung ke behavior nyata;
- responsive tanpa overflow;
- keyboard dan screen reader semantics teruji;
- reduced motion teruji;
- tidak ada console error;
- unit/component/E2E test relevan tersedia;
- screenshot review disetujui;
- copy tidak melanggar AI/privacy boundaries pada PRD.
