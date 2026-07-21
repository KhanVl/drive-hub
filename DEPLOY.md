# Публикация DH Export

1. Замените `dhexport.example` в `index.html`, `public/robots.txt` и `public/sitemap.xml` на реальный домен.
2. Создайте переменные окружения `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SYNC_TOKEN`, `CAR_FEED_URL`, `CAR_FEED_API_KEY` и `SYNC_INTERVAL_MINUTES` на сервере.
3. Выполните `npm ci` и `npm run build`.
4. Запустите приложение командой `npm run production`.
5. Направьте домен на порт приложения через HTTPS reverse proxy (Nginx, Caddy или панель хостинга).

Папка `storage/uploads` содержит фотографии, загруженные через админку. На хостинге она должна находиться на постоянном диске и регулярно попадать в резервные копии.

Не публикуйте секретные токены в репозитории или клиентском коде.

SQL-схема будущей PostgreSQL-базы находится в `database/schema.sql`. Для переключения хранилища потребуется доступная PostgreSQL-база и секретная переменная `DATABASE_URL`.
