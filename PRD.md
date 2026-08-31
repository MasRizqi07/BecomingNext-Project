# Product Requirements Document — Becoming V2

> Status: Draft siap implementasi  
> Versi dokumen: 1.0  
> Tanggal: 31 Agustus 2026  
> Pemilik produk: Tim Becoming  
> Dokumen terkait: [Design.md](Design.md), [README.md](README.md), [Architecture](docs/architecture.md)

## 1. Ringkasan produk

Becoming adalah aplikasi refleksi pribadi berbasis AI yang membantu pengguna mengubah delapan jawaban reflektif menjadi:

1. gambaran identitas saat ini;
2. dua jalur masa depan yang masuk akal—drifting dan intentional;
3. perbandingan perkembangan pada lima dimensi;
4. surat reflektif dari masa depan;
5. rencana tindakan kecil yang dapat dijalankan.

Produk bukan alat diagnosis, ramalan, tes psikologi, atau pengganti bantuan profesional. Skor dan keluaran AI harus selalu dibingkai sebagai alat refleksi, bukan kebenaran ilmiah.

Upgrade V2 berfokus pada peningkatan kejelasan perjalanan pengguna, keterbacaan hasil, retensi yang sehat melalui check-in, serta konsistensi UI/UX tanpa mengubah prinsip keamanan serverless yang sudah ada.

## 2. Latar belakang dan masalah

### 2.1 Kondisi saat ini

Repository telah memiliki:

- landing page dan demo publik;
- autentikasi Google;
- alur delapan pertanyaan refleksi;
- proses analisis AI dengan status `pending`, `completed`, dan `failed`;
- halaman hasil, riwayat, penghapusan analisis, dan penghapusan akun;
- Firebase Auth, App Check, callable Functions, Firestore, Gemini, idempotency, serta rate limit;
- pengujian unit, rules, transaksi, E2E publik, E2E autentikasi, aksesibilitas, dan bundle budget.

UI saat ini sudah memiliki identitas visual yang kuat, tetapi navigasi dan struktur informasi masih menyerupai pengalaman satu kali. Pengguna belum memiliki beranda personal, ringkasan progres, check-in terhadap rencana, atau penjelasan produk yang cukup sebelum autentikasi.

### 2.2 Masalah pengguna

- Pengunjung baru belum selalu memahami apa yang akan mereka dapatkan sebelum sign-in.
- Pengguna kembali harus membuka riwayat untuk menemukan analisis terakhir.
- Delapan pertanyaan belum memiliki overview, estimasi waktu, dan mekanisme review sebelum submit.
- Hasil panjang membutuhkan hierarki, ringkasan, dan tindakan lanjutan yang lebih jelas.
- Rencana hasil AI belum dapat ditandai, ditinjau ulang, atau dibandingkan melalui check-in.
- Status loading, empty, error, offline, dan destructive action perlu pola visual yang seragam.
- Bahasa antarmuka saat ini berbahasa Inggris, sementara kesiapan internasionalisasi belum menjadi bagian struktur UI.

## 3. Visi dan prinsip produk

### Visi

Menjadikan Becoming ruang refleksi digital yang privat, tenang, jujur, dan actionable—membantu pengguna melihat arah hidup tanpa mengklaim dapat menentukan masa depan mereka.

### Prinsip

1. **Reflection before prediction** — produk memfasilitasi refleksi, bukan meramal.
2. **Private by design** — data refleksi tidak dijadikan konten publik dan tidak masuk log aplikasi.
3. **Calm, not addictive** — tidak memakai streak yang manipulatif, urgency palsu, atau notifikasi berlebihan.
4. **Action over spectacle** — visual sinematik mendukung pemahaman, bukan mengalahkan isi.
5. **Progressive disclosure** — ringkasan tampil lebih dulu; detail dapat dibuka saat dibutuhkan.
6. **Accessible by default** — keyboard, screen reader, reduced motion, dan kontras adalah acceptance criteria.

## 4. Sasaran dan non-sasaran

### 4.1 Sasaran V2

- Meningkatkan pemahaman value proposition sebelum autentikasi.
- Mengurangi kebingungan selama reflection intake dan submission.
- Membuat hasil AI lebih mudah dipindai, dipahami, disimpan, dan ditindaklanjuti.
- Menyediakan dashboard personal dan check-in ringan untuk pengguna kembali.
- Menyatukan pola komponen, state, token, responsive layout, dan microcopy.
- Mempertahankan keamanan, privasi, idempotency, dan batas biaya yang sudah diterapkan.

### 4.2 Non-sasaran V2

- Diagnosis medis atau psikologis.
- Social feed, leaderboard, perbandingan pengguna, atau profil publik.
- Chat AI tanpa batas.
- Pembayaran dan subscription.
- Native mobile application.
- Mengganti Firebase/Gemini atau melakukan migrasi arsitektur backend besar.
- Mengklaim staging/production siap sebelum checklist release benar-benar lolos.

## 5. Persona utama

### P1 — First-time explorer

Ingin memahami produk tanpa menyerahkan data. Membutuhkan demo yang aman, penjelasan proses, ekspektasi waktu, privasi, dan batasan AI.

### P2 — Intentional reflector

Siap menjawab dengan jujur, tetapi membutuhkan ruang bebas distraksi, draft yang aman, progress jelas, dan kesempatan review sebelum menghasilkan analisis.

### P3 — Returning builder

Sudah memiliki hasil. Ingin membuka analisis terakhir, melihat aksi utama, melakukan check-in, atau membuat refleksi baru tanpa mencari-cari di history.

### P4 — Privacy-conscious user

Membutuhkan transparansi tentang data, kontrol penghapusan, status akun, serta jaminan bahwa isi refleksi tidak tampil dalam log atau halaman publik.

## 6. Jobs to be done

- Ketika saya baru menemukan Becoming, saya ingin melihat contoh hasil agar dapat menilai manfaat tanpa login.
- Ketika saya mulai refleksi, saya ingin mengetahui progres dan apakah jawaban saya tersimpan agar dapat menjawab dengan tenang.
- Ketika analisis diproses lama, saya ingin mengetahui status sebenarnya dan dapat melanjutkannya setelah refresh.
- Ketika membaca hasil, saya ingin memahami insight utama lebih dulu lalu mengeksplorasi detail.
- Ketika kembali, saya ingin melihat analisis terakhir dan langkah yang perlu dilakukan hari ini.
- Ketika tidak ingin melanjutkan, saya ingin menghapus satu analisis atau seluruh akun secara jelas dan aman.

## 7. Information architecture target

### Publik

| Route           | Halaman                 | Tujuan                                           |
| --------------- | ----------------------- | ------------------------------------------------ |
| `/`             | Landing                 | Value proposition, trust, CTA primer, demo       |
| `/demo`         | Demo result             | Contoh lengkap tanpa data personal               |
| `/how-it-works` | How it works            | Proses, output, privasi, FAQ                     |
| `/privacy`      | Privacy & AI boundaries | Penjelasan data, AI, retention, kontrol pengguna |
| `*`             | Not found               | Recovery yang jelas, bukan redirect diam-diam    |

### Terautentikasi

| Route                   | Halaman            | Tujuan                                       |
| ----------------------- | ------------------ | -------------------------------------------- |
| `/dashboard`            | Personal dashboard | Resume analisis, next action, recent history |
| `/reflect`              | Reflection intake  | Delapan pertanyaan bertahap                  |
| `/reflect/review`       | Review answers     | Review dan edit sebelum submit               |
| `/analysis/:analysisId` | Processing/status  | Pending, retry, resume, failure recovery     |
| `/results/:analysisId`  | Result detail      | Insight, paths, plan, letter, actions        |
| `/check-in/:analysisId` | Progress check-in  | Refleksi ringan terhadap rencana sebelumnya  |
| `/history`              | Analysis archive   | List, filter sederhana, open/resume/delete   |
| `/settings`             | Account & privacy  | Account, preferences, data controls          |

`/dashboard`, `/reflect/review`, `/check-in/:analysisId`, `/how-it-works`, `/privacy`, dan halaman 404 adalah penambahan V2. Route lama harus tetap valid.

## 8. User journey utama

### 8.1 Pengunjung ke refleksi personal

`Landing → How it works atau Demo → Sign in → Dashboard/Reflection intro → 8 questions → Review → Processing → Result → Check-in`

### 8.2 Pengguna kembali

`Sign in → Dashboard → Resume pending / Open latest result / Start new reflection`

### 8.3 Recovery

`Refresh processing → Load authoritative Firestore status → Completed: result / Pending: continue polling / Failed: retry safely`

### 8.4 Penghapusan data

`Result atau History → Confirm delete analysis → Delete reflection + analysis → Success notice`

`Settings → Type DELETE → Delete all owned data + Auth account → Signed-out landing`

## 9. Functional requirements

### FR-01 Landing dan trust

- Menampilkan value proposition, manfaat, cara kerja tiga langkah, contoh keluaran, privasi, batas AI, dan CTA yang konsisten.
- CTA primer mengarahkan pengguna terautentikasi ke `/dashboard`; pengguna baru melalui Google sign-in lalu ke dashboard.
- CTA sekunder membuka `/demo` tanpa autentikasi.
- Header menyediakan How it works, Privacy, dan account-aware navigation.
- Tidak boleh memakai klaim ilmiah, hasil palsu yang dipersonalisasi, atau testimonial rekaan.

### FR-02 Demo publik

- Menggunakan fixture statis `DEMO_ANALYSIS`; tidak memanggil Gemini dan tidak menulis Firestore.
- Semua bagian hasil dapat dilihat, tetapi diberi label jelas sebagai demo.
- Download letter bekerja; share mengikuti Web Share API dengan clipboard fallback.
- CTA akhir mengarah ke sign-in/start reflection.

### FR-03 Dashboard

- Menampilkan salam aman, latest analysis, status, tanggal, dan CTA konteks.
- Menampilkan maksimal tiga analisis terbaru dan link ke seluruh history.
- Menampilkan next action dari plan terbaru jika hasil tersedia.
- Empty state mengarahkan ke refleksi pertama.
- Pending state mengarahkan ke processing; failed state menawarkan retry.
- Tidak menampilkan isi jawaban refleksi di dashboard.

### FR-04 Reflection intake

- Menampilkan intro singkat, jumlah pertanyaan, estimasi waktu, privasi, dan cara penyimpanan draft.
- Satu pertanyaan per layar dengan progress numerik dan visual.
- Jawaban dipertahankan selama session refresh seperti perilaku store saat ini.
- Mendukung Back/Continue, keyboard focus, inline validation, character counter, dan reduced motion.
- Pertanyaan `disciplineScore` menggunakan kontrol 1–10 disertai alasan singkat; kontrak backend perlu diubah hanya jika nilai dan alasan dipisah menjadi field berbeda.
- Submit final diarahkan ke halaman review, bukan langsung memanggil AI.

### FR-05 Review answers

- Menampilkan semua delapan jawaban, dapat melompat ke pertanyaan tertentu untuk edit.
- Menampilkan disclosure bahwa hasil adalah panduan reflektif.
- Tombol `Create my analysis` hanya aktif jika schema valid.
- Double click atau retry jaringan tidak boleh membuat job/biaya ganda; UUID idempotency tetap sumber identitas job.

### FR-06 Processing

- Menampilkan tahapan yang bersifat komunikatif, bukan progress palsu berbasis persentase.
- Status sebenarnya berasal dari backend: pending, completed, atau failed.
- Refresh harus dapat melanjutkan job berdasarkan `analysisId`.
- Error menyediakan pesan manusiawi, retry aman, dan jalan kembali ke review/history.
- Tidak menampilkan prompt, raw response, token, atau detail error sensitif.

### FR-07 Result detail

- Urutan konten: identity summary → two paths → radar comparison → timeline → future letter → action plan → identity card → actions.
- Menyediakan table of contents/sticky section navigator pada desktop dan jump menu pada mobile.
- Setiap skor harus diberi label “reflective estimate”, bukan assessment ilmiah.
- Download, share, reflect again, history, delete, dan check-in tersedia sesuai konteks.
- Share hanya berisi ringkasan identitas yang disetujui pengguna, bukan jawaban asli atau URL privat secara default.

### FR-08 Check-in

- Pengguna memilih status tiap habit: `not_started`, `in_progress`, atau `done`.
- Pengguna dapat menambah catatan singkat dan mood opsional.
- Check-in ditautkan ke analysis milik pengguna dan dapat dibuka dari result/dashboard.
- Check-in tidak memanggil AI pada rilis pertama.
- Membutuhkan collection/contract/rules/callable baru; tidak boleh disimulasikan sebagai data tersimpan sebelum backend tersedia.

### FR-09 History

- Menampilkan status, archetype jika selesai, tanggal, dan CTA Open/Resume.
- Filter client-side: All, Completed, In progress, Failed untuk maksimal 20 data yang sudah dimuat.
- Delete memakai confirmation dialog aksesibel, bukan `window.confirm` pada target V2.
- Empty, loading, error, dan retry state harus eksplisit.

### FR-10 Settings dan privacy

- Menampilkan account identity, sign out, motion preference, dan language readiness.
- Menyediakan penghapusan seluruh data dengan typed confirmation.
- Menjelaskan data yang dihapus dan sifat irreversible sebelum tindakan.
- Tautan privacy dan AI boundary tersedia tanpa harus sign-in.

### FR-11 Global navigation dan feedback

- Desktop memakai compact top navigation; mobile memakai menu/dialog yang dapat dioperasikan keyboard.
- Toast hanya untuk konfirmasi tindakan non-kritis; error penting tetap inline.
- Semua async action memiliki disabled/loading state dan mencegah duplicate submission.
- Unknown route menampilkan 404 dengan CTA home/dashboard.

## 10. Data dan backend impact

### Tetap digunakan

- `users`, `reflections`, `analyses`, dan `rateLimits`.
- Callable `createAnalysis`, `deleteAnalysis`, dan `deleteMyData`.
- Shared Zod contracts, server-side Gemini, App Check, owner-only reads, direct client writes denied.

### Penambahan untuk check-in

Usulan collection `checkIns/{checkInId}`:

| Field                    | Type          | Catatan                               |
| ------------------------ | ------------- | ------------------------------------- |
| `userId`                 | string        | Owner, berasal dari Auth server-side  |
| `analysisId`             | UUID string   | Referensi analysis yang dimiliki user |
| `habitStates`            | bounded array | Maksimal 5 item, enum status          |
| `note`                   | string        | Opsional, maksimal 1000 karakter      |
| `mood`                   | integer       | Opsional, 1–5                         |
| `createdAt`, `updatedAt` | timestamp     | Server timestamps                     |

Wajib ada callable tervalidasi untuk create/update/delete, owner-only reads, index yang diperlukan, emulator rules tests, dan cascade deletion pada `deleteMyData` serta `deleteAnalysis`.

## 11. Non-functional requirements

### NFR-01 Accessibility

- Target WCAG 2.2 AA untuk seluruh flow utama.
- Semua kontrol dapat digunakan dengan keyboard dan memiliki visible focus.
- Target sentuh minimal 44×44 px.
- Heading hierarchy logis; landmark dan accessible name tersedia.
- Kontras teks normal minimal 4.5:1 dan teks besar minimal 3:1.
- Motion dekoratif dinonaktifkan pada `prefers-reduced-motion`.
- Status async memakai `aria-live` secara selektif tanpa announcement berulang.

### NFR-02 Performance

- Pertahankan budget bundle saat ini: entry ≤ 180 KiB gzip; lazy chunk ≤ 130 KiB gzip.
- Target Lighthouse mobile staging: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.
- Target Core Web Vitals p75: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.
- Particle background harus lazy, dekoratif, tidak memblok render, dan dapat dikurangi/nonaktif pada perangkat lemah.

### NFR-03 Security dan privacy

- Tidak ada Gemini secret pada browser atau variabel `VITE_*`.
- Semua input/output tervalidasi pada trust boundary.
- Direct client writes tetap ditolak.
- Isi refleksi tidak boleh masuk analytics, crash report, URL, share payload, atau log.
- App Check wajib fail closed di production.

### NFR-04 Reliability

- Idempotency dan lease tetap berlaku pada pembuatan analisis.
- Pending job dapat dipulihkan setelah refresh.
- Setiap mutation menyediakan retry semantics yang jelas.
- Local success tidak boleh dianggap sebagai bukti staging/production.

### NFR-05 Responsive support

- Minimum viewport 320 px.
- Breakpoint pengujian: 360×800, 768×1024, 1024×768, 1440×900.
- Tidak ada horizontal overflow pada content viewport.

## 12. Analytics dan success metrics

Analytics hanya boleh diaktifkan setelah consent dan konfigurasi privacy disetujui. Jangan kirim isi jawaban atau hasil AI.

### Event aman

- `landing_demo_opened`
- `sign_in_started`, `sign_in_completed`, `sign_in_failed`
- `reflection_started`, `reflection_step_completed`, `reflection_review_opened`
- `analysis_submitted`, `analysis_completed`, `analysis_failed`
- `result_section_opened`
- `check_in_started`, `check_in_completed`
- `analysis_deleted`, `account_deletion_started`, `account_deleted`

### Target awal setelah baseline tersedia

- Landing → demo/start engagement meningkat tanpa menaikkan sign-in failure.
- Completion delapan pertanyaan ≥ baseline + 15% relatif.
- Submission → completed analysis ≥ 95%, tidak termasuk provider outage.
- Median pengguna dapat menemukan insight utama dalam usability test ≤ 30 detik.
- Tidak ada critical/serious axe violation pada route yang diuji.
- Duplicate billable generation untuk idempotency key yang sama: 0.

Angka conversion final harus ditetapkan setelah baseline staging tersedia; jangan mengarang baseline.

## 13. Prioritas dan fase implementasi

### Phase 0 — Foundation

- Tetapkan design tokens, shell, responsive navigation, primitives, state patterns, dan content rules.
- Tambahkan visual regression baseline dan route inventory.
- Tidak mengubah backend.

### Phase 1 — Existing journey upgrade (P0)

- Landing, demo, intake, processing, result, history, settings, dan 404.
- Tambah How it works, Privacy, serta Review answers.
- Pertahankan kontrak backend yang ada.

### Phase 2 — Returning-user experience (P1)

- Dashboard, latest analysis, recent history, dan contextual CTA.
- Query tetap memakai data maksimal 20 item saat ini; optimasi query dapat menyusul berdasarkan evidence.

### Phase 3 — Check-in (P1, backend-dependent)

- Shared contract, callable, Firestore rules/indexes, cascade deletion, UI, unit/integration/E2E.
- Tidak dirilis bila lifecycle data dan owner isolation belum terbukti.

### Phase 4 — Optimization and release evidence

- Performance, accessibility, cross-browser, error/offline behavior, staging smoke, monitoring, dan rollout bertahap.

## 14. Acceptance criteria tingkat produk

V2 dinyatakan selesai hanya jika:

1. seluruh route target memiliki default, loading, empty, error, dan success state yang relevan;
2. seluruh CTA memiliki tujuan dan perilaku nyata;
3. flow publik dan autentikasi lolos pada mobile dan desktop;
4. axe tidak menemukan pelanggaran critical/serious pada flow utama;
5. keyboard-only journey dapat diselesaikan;
6. schema, rules, idempotency, quota, dan deletion tests tetap lolos;
7. bundle budget tidak regresi;
8. check-in, bila dirilis, memiliki backend authoritative dan cascade deletion;
9. release staging checklist selesai dengan bukti real Auth, App Check, Firestore isolation, dan satu response Gemini nyata;
10. production belum dipromosikan sebelum approval eksplisit.

## 15. Risiko dan mitigasi

| Risiko                            | Dampak                   | Mitigasi                                                          |
| --------------------------------- | ------------------------ | ----------------------------------------------------------------- |
| Tampilan terlalu dekoratif        | Konten sulit dibaca      | Batasi glow/blur, gunakan hierarchy dan contrast budget           |
| Hasil AI dianggap ilmiah          | Misinterpretasi pengguna | Disclaimer dekat skor, gunakan istilah reflective estimate        |
| Check-in memperluas data sensitif | Risiko privacy           | Data minimal, no AI by default, owner-only access, delete cascade |
| Route baru memperbesar bundle     | Loading lebih lambat     | Route lazy loading, icon import terarah, bundle gate              |
| Draft hilang                      | Abandonment              | Session persistence dan pesan status draft                        |
| Polling berlebihan                | Biaya/read meningkat     | Bounded backoff, stop saat hidden/offline/completed               |
| UI mengklaim sukses terlalu dini  | Hilangnya kepercayaan    | Success hanya setelah server confirmation                         |

## 16. Keputusan yang masih perlu dikunci

- Bahasa default tetap Inggris atau mulai Bahasa Indonesia.
- Apakah check-in cukup manual atau membutuhkan reminder opt-in pada fase berikutnya.
- Retention policy eksplisit untuk reflection/analysis/check-in.
- Apakah dashboard menjadi tujuan setelah sign-in untuk semua user atau hanya returning user.
- Apakah hasil boleh dibagikan sebagai image card; default aman saat ini hanya text summary tanpa jawaban privat.

Keputusan tersebut harus dicatat sebelum fase yang terdampak dimulai. Default aman: UI Inggris, tanpa reminder, tanpa public share link, dan dashboard sebagai authenticated home.
