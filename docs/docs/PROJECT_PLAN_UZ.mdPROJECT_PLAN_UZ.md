# Poliklinika uchun Blockchain Asosidagi Bemor Tizimi Rejasi

## 1. Loyiha maqsadi

Poliklinika uchun xavfsiz, audit qilinadigan va bemor roziligiga asoslangan raqamli tizim yaratish:

- bemorning elektron tibbiy kartasini yuritish
- yozuvlarning o'zgarmaganini blockchain orqali tasdiqlash
- bemor roziligi asosida shifokorlarga ma'lumot ochish
- dori vositalari haqiqiyligini tekshirish
- barcha kirish va amallar tarixini kuzatish

## 2. Muammo va yechim

### Muammolar

- Tibbiy yozuvlar parchalanib ketgan bo'ladi
- Kim qaysi ma'lumotni ko'rgani aniq kuzatilmaydi
- Ruxsat boshqaruvi qo'lda yoki zaif bo'ladi
- Soxta dorilarni aniqlash qiyin

### Taklif etilayotgan yechim

Gibrid arxitektura:

- Maxfiy tibbiy ma'lumotlar: shifrlangan holda backend + database/storage'da
- Blockchain: yozuv hash'i, audit izi, bemor roziligi va dori supply-chain event'lari

## 3. Foydalanuvchi rollari

### Bemor

- profilini ko'radi
- o'z EMR yozuvlarini ko'radi
- qaysi shifokorga qaysi bo'lim ma'lumotini ochishni belgilaydi
- kirish tarixini ko'radi
- dori QR yoki seriya raqami orqali tekshiradi

### Shifokor

- ruxsat berilgan bemor yozuvlarini ko'radi
- yangi tashxis, retsept, davolanish, tavsiya qo'shadi
- audit izi bilan tizimda ishlaydi

### Registrator / operator

- bemorni ro'yxatdan o'tkazadi
- birlamchi profil yaratadi
- klinik tashkiliy ma'lumotlarni yangilaydi

### Administrator

- foydalanuvchilarni boshqaradi
- rollarni boshqaradi
- audit va xavfsizlik nazoratini amalga oshiradi

### Dorixona / tekshiruvchi

- dori haqiqiyligini tekshiradi
- supply-chain ma'lumotini ko'radi

## 4. Funksional talablar

### 4.1 Elektron tibbiy karta

- bemor yaratish
- pasport yoki ID bo'yicha identifikatsiya
- tashxislar tarixi
- laboratoriya natijalari
- retseptlar
- davolanish tarixi
- biriktirilgan fayllar: PDF, surat, UZI xulosasi va boshqalar

### 4.2 Rozilik va ruxsat boshqaruvi

- bemor shifokor yoki bo'lim bo'yicha ruxsat beradi
- ruxsat muddati belgilanadi
- faqat o'qish yoki o'qish + yozish huquqi beriladi
- ruxsat bekor qilinishi mumkin
- har bir ruxsat blockchain event sifatida qayd etiladi

### 4.3 Tibbiy yozuv qo'shish

- shifokor yangi record yaratadi
- record shifrlanadi
- record hash'i blockchain'ga yoziladi
- keyinchalik record buzilmaganini hash orqali tekshirish mumkin

### 4.4 Audit va kuzatuv

- kim kirdi
- qachon kirdi
- qaysi record ko'rildi
- qaysi IP yoki qurilmadan foydalandi
- nima o'zgartirildi
- audit event hash'i blockchain'ga yoziladi

### 4.5 Dori haqiqiyligini tekshirish

- ishlab chiqaruvchi dori partiyasini blockchain'ga kiritadi
- distributsiya bosqichlari event sifatida yoziladi
- poliklinika yoki bemor QR orqali tekshiradi
- tizim dori haqiqiy yoki shubhali ekanini ko'rsatadi

## 5. Nofunksional talablar

- ma'lumotlarni shifrlash: AES-256
- transport xavfsizligi: HTTPS/TLS
- autentifikatsiya: JWT, refresh token, 2FA ixtiyoriy
- rolga asoslangan nazorat: RBAC
- kengayuvchan mikroservis yoki modular monolit arxitektura
- audit yozuvlarining o'zgarmasligi
- zaxira nusxa va avariya tiklash rejasi

## 6. Tavsiya etilgan arxitektura

## Frontend

- `Next.js` web panel
- bemor, shifokor, admin uchun alohida dashboard

## Backend

- `NestJS` REST API
- auth moduli
- EMR moduli
- consent moduli
- audit moduli
- pharmacy verification moduli
- blockchain gateway moduli

## Database

- `PostgreSQL`
- asosiy jadvallar:
  - `users`
  - `patients`
  - `doctors`
  - `medical_records`
  - `consents`
  - `prescriptions`
  - `audit_logs`
  - `drug_batches`
  - `drug_verification_logs`

## Blockchain qatlami

- `Solidity` smart contract'lar
- `ConsentRegistry`
- `RecordHashRegistry`
- `AuditTrailRegistry`
- `DrugSupplyRegistry`

## Storage

- katta fayllar uchun `Supabase Storage` yoki `IPFS`
- database'da storage URL va metadata
- blockchain'da faqat hash va isbot

## 7. Ma'lumotlar oqimi

### Yangi bemor yaratilishi

1. Registrator bemor profilini yaratadi
2. Backend patient ID yaratadi
3. Asosiy metadata bazaga yoziladi
4. Zarur bo'lsa, patient root profile hash blockchain'ga yuboriladi

### Shifokor yozuv qo'shishi

1. Shifokor yangi tashxis yoki davolanish ma'lumotini kiritadi
2. Tizim bemor roziligini tekshiradi
3. Record shifrlanadi va bazaga saqlanadi
4. Record hash smart contract'ga yoziladi
5. Audit event yaratiladi

### Bemor ruxsat berishi

1. Bemor dashboard'da shifokorni tanlaydi
2. Qaysi turdagi ma'lumotlar ochilishi belgilanadi
3. Muddati ko'rsatiladi
4. Rozilik blockchain event sifatida saqlanadi

### Dori tekshirish

1. QR yoki serial kiritiladi
2. Backend drug batch yozuvini topadi
3. Blockchain event'lar bilan solishtiradi
4. Natija ko'rsatiladi

## 8. Smart contractlar tarkibi

### ConsentRegistry

- `grantAccess(patientId, doctorId, scope, expiry)`
- `revokeAccess(consentId)`
- `hasAccess(patientId, doctorId, scope)`

### RecordHashRegistry

- `addRecordHash(patientId, recordId, recordHash, category, createdBy)`
- `verifyRecordHash(recordId, recordHash)`

### AuditTrailRegistry

- `logAccess(userId, patientId, resourceType, action, timestampHash)`

### DrugSupplyRegistry

- `registerBatch(batchId, manufacturer, drugName, expiryDate)`
- `addTransfer(batchId, from, to, timestamp)`
- `verifyBatch(batchId)`

## 9. Xavfsizlik tamoyillari

- PII va PHI ni ochiq blockchain'da saqlamaslik
- Field-level encryption
- Access token + refresh token
- Har bir o'qish amali uchun audit yaratish
- Muhim operatsiyalar uchun e-imzo yoki wallet signature qo'shish
- Rate limiting va anomaly detection

## 10. MVP doirasi

Birinchi versiyada quyidagilar yetarli:

- bemor ro'yxatdan o'tkazish
- elektron karta yaratish
- shifokor login va role-based access
- bemor consent boshqaruvi
- record qo'shish va ko'rish
- hash'ni blockchain'ga yozish
- audit log ko'rish
- dori QR tekshirishning oddiy moduli

## 11. Bosqichma-bosqich ishlab chiqish rejasi

### 1-bosqich: Analiz

- talablarni yig'ish
- rol va use-case'larni tasdiqlash
- ma'lumotlar modeli chizish
- huquqiy va maxfiylik talablarini aniqlash

### 2-bosqich: Dizayn

- UI wireframe
- ERD
- API contract
- smart contract interface

### 3-bosqich: Backend

- auth
- users/patients/doctors CRUD
- medical records moduli
- consent moduli
- audit moduli

### 4-bosqich: Blockchain

- contract yozish
- testnet'ga deploy
- backend bilan integratsiya

### 5-bosqich: Frontend

- bemor paneli
- shifokor paneli
- admin paneli
- dori tekshiruv sahifasi

### 6-bosqich: Test

- unit test
- integration test
- smart contract test
- security test

### 7-bosqich: Release

- GitHub repo
- CI/CD
- free hosting'ga deploy
- demo ma'lumotlar bilan ishga tushirish

## 12. Taxminiy sprint reja

### Sprint 1

- repo yaratish
- backend skeleton
- frontend skeleton
- database schema

### Sprint 2

- auth va role system
- patient/doctor CRUD
- EMR yaratish

### Sprint 3

- consent boshqaruvi
- audit tizimi
- fayl upload

### Sprint 4

- smart contractlar
- blockchain integratsiya
- record hash verification

### Sprint 5

- dori haqiqiyligi moduli
- dashboard polishing
- testlar

### Sprint 6

- deploy
- demo
- hujjatlashtirish

## 13. Tavsiya etilgan free infratuzilma

- Frontend: `Vercel`
- Backend: `Render` yoki `Railway`
- Database: `Supabase Postgres`
- Smart contract testnet: `Polygon Amoy`
- RPC: `Alchemy` yoki `Infura` free tier
- Storage: `Supabase Storage` yoki `Pinata` free tier
- Monitoring: `Sentry` free tier

## 14. Risklar

- Tibbiy maxfiylik talablari noto'g'ri talqin qilinishi
- Blockchain'da ortiqcha ma'lumot saqlash oqibatida maxfiylik buzilishi
- Free hosting'da cold start va cheklovlar
- Wallet va kalitlarni xavfsiz boshqarish muammosi

## 15. Yakuniy tavsiya

Eng to'g'ri boshlanish yo'li:

1. Avval MVP quriladi
2. Ochiq blockchain'ga faqat hash va audit izlari yoziladi
3. Real tibbiy fayllar database/storage'da shifrlanadi
4. Testnet'da sinov qilinadi
5. Keyin production uchun huquqiy va xavfsizlik auditidan o'tkaziladi
