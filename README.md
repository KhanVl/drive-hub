# DH Export

Сайт компании по подбору и экспорту автомобилей из Южной Кореи.

## Локальный запуск

```powershell
$env:ADMIN_USERNAME="admin"
$env:ADMIN_PASSWORD="dh-export"
npm run server
```

Во втором терминале:

```powershell
npm run dev
```

Публичный сайт открывается по адресу `http://localhost:5173`, административная панель — `http://localhost:5173/admin`.

Инструкция по публикации находится в `DEPLOY.md`.
