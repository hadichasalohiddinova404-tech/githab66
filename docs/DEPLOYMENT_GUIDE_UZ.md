# GitHub va Free Serverlarga Deploy Yo'riqnomasi

## 1. Repo struktura tavsiyasi

```text
polyclinic-blockchain/
  frontend/
  backend/
  contracts/
  docs/
  docker-compose.yml
  README.md
```

## 2. GitHub'ga yuklash

### Git buyruqlari

```powershell
git init
git add .
git commit -m "Initial project plan for blockchain EMR system"
git branch -M main
git remote add origin https://github.com/USERNAME/polyclinic-blockchain.git
git push -u origin main
```

## 3. Free deploy tavsiyasi

### Frontend

- Platforma: `Vercel`
- Repo'ni GitHub orqali ulang
- Root directory: `frontend`
- Environment variable'larni kiriting

### Backend

- Platforma: `Render`
- GitHub repo orqali yangi Web Service yarating
- Root directory: `backend`
- Build command: `npm install && npm run build`
- Start command: `npm run start:prod`

### Database

- `Supabase` orqali bepul `PostgreSQL` oching
- `DATABASE_URL` ni backend'ga ulang

### Smart contract

- `Hardhat` bilan `Polygon Amoy` yoki `Base Sepolia` ga deploy qiling
- RPC URL va private key `.env` orqali boshqarilsin

## 4. Zarur environment variables

### Backend

```env
PORT=5000
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
RPC_URL=
CHAIN_ID=
PRIVATE_KEY=
CONSENT_CONTRACT_ADDRESS=
RECORD_CONTRACT_ADDRESS=
AUDIT_CONTRACT_ADDRESS=
DRUG_CONTRACT_ADDRESS=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Frontend

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_CHAIN_ID=
NEXT_PUBLIC_CONSENT_CONTRACT_ADDRESS=
NEXT_PUBLIC_RECORD_CONTRACT_ADDRESS=
NEXT_PUBLIC_DRUG_CONTRACT_ADDRESS=
```

## 5. CI/CD tavsiyasi

GitHub Actions pipeline:

- lint
- test
- build
- contract test
- deploy frontend
- deploy backend

## 6. Hozirgi cheklov

Ushbu ish muhitida GitHub akkauntingizga push qilish va free hosting platformalariga ulanib deploy qilish uchun quyidagilar kerak bo'ladi:

- GitHub login yoki personal access token
- Vercel/Render/Supabase akkauntlari
- kerak bo'lsa blockchain RPC va wallet test key'lari

Shu ma'lumotlarsiz men bu sessiyada real publish/deploy'ni yakunlay olmayman, lekin repo'ni to'liq tayyorlab, deploy-ready holatga keltirib bera olaman.

## 7. Keyingi amaliy qadam

Agar xohlasangiz, keyingi bosqichda men shu workspace ichida quyidagilarni ham yaratib beraman:

- `frontend` uchun Next.js skeleton
- `backend` uchun NestJS yoki Express API skeleton
- `contracts` uchun Solidity smart contractlar
- `.env.example`
- `docker-compose.yml`
- GitHub Actions workflow

Shunda loyiha GitHub'ga yuklash va free serverlarga chiqarish uchun tayyor bazaga ega bo'ladi.
