# githab66#

Poliklinika uchun blockchain bilan himoyalangan elektron tibbiy karta tizimining ishlaydigan MVP namunasi.

## Nimalar bor

- Bemor, shifokor va admin uchun login
- Elektron tibbiy karta yaratish va ko'rish
- Bemor tomonidan shifokorga access berish va bekor qilish
- Yangi tashxis yoki davolanish yozuvlarini qo'shish
- Kim, qachon, qaysi ma'lumotga kirganini audit qilish
- Dori batch kodini blockchain-ledger orqali tekshirish
- Solidity smart contract namunalari

## Arxitektura

- `backend/`: dependency'siz Node.js API va local blockchain ledger
- `frontend/`: brauzerda ishlaydigan web dashboard
- `contracts/`: EVM testnet uchun Solidity contractlar
- `docs/`: loyiha rejalari va deploy yo'riqnomasi

## Ishga tushirish

```powershell
node backend/server.js
```

Brauzerda oching: `http://localhost:3000`

## Demo loginlar

- `admin / admin123`
- `doctor / doctor123`
- `patient / patient123`

## Deploy

- `Render`: [render.yaml](/c:/Users/Intel/OneDrive/Desktop/80talik%20bloc6/render.yaml)
- `Docker`: [Dockerfile](/c:/Users/Intel/OneDrive/Desktop/80talik%20bloc6/Dockerfile), [docker-compose.yml](/c:/Users/Intel/OneDrive/Desktop/80talik%20bloc6/docker-compose.yml)
- `GitHub Actions`: [.github/workflows/ci.yml](/c:/Users/Intel/OneDrive/Desktop/80talik%20bloc6/.github/workflows/ci.yml)

## Muhim izoh

Bu versiya demo/MVP. Real production uchun tibbiy ma'lumotlar shifrlangan bazada saqlanadi, blockchain'da esa faqat hash va audit proof saqlanishi kerak.
