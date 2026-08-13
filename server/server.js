/* global process, Buffer */
import { createServer } from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'
import { mkdir } from 'node:fs/promises'
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { syncFromUrl } from './importer.js'

const root = dirname(fileURLToPath(import.meta.url))
const dataPath = (name) => join(root, 'data', name)
const distPath = join(root, '..', 'dist')
const uploadsPath = join(root, '..', 'storage', 'uploads')
const port = Number(process.env.PORT || 4000)
let syncRunning = false
const sessions = new Map()
const loginAttempts = new Map()
const publicAttempts = new Map()
const sessionLifetime = 12 * 60 * 60 * 1000
const isAdmin = (request) => {
  const token = request.headers.authorization?.replace(/^Bearer\s+/, '')
  const session = token && sessions.get(token)
  if (!session || session.expiresAt < Date.now()) { if (token) sessions.delete(token); return false }
  return true
}
const safePasswordMatch = (actual, expected) => {
  const salt = 'dh-export-admin-login-v1'
  const actualHash = scryptSync(String(actual), salt, 64)
  const expectedHash = scryptSync(String(expected), salt, 64)
  return timingSafeEqual(actualHash, expectedHash)
}
const allowRequest = (request, key, limit, windowMs) => {
  const id = `${key}:${request.socket.remoteAddress || 'unknown'}`; const now = Date.now(); const current = publicAttempts.get(id)
  if (!current || current.resetAt <= now) { publicAttempts.set(id, { count: 1, resetAt: now + windowMs }); return true }
  if (current.count >= limit) return false
  current.count += 1; return true
}
const cleanText = (value, max) => String(value || '').trim().slice(0, max)

const readJson = async (name) => JSON.parse(await readFile(dataPath(name), 'utf8'))
const writeJson = async (name, value) => writeFile(dataPath(name), `${JSON.stringify(value, null, 2)}\n`)

const send = (response, status, payload) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' })
  response.end(JSON.stringify(payload))
}

const readBody = (request) => new Promise((resolve, reject) => {
  let body = ''
  request.on('data', (chunk) => {
    body += chunk
    if (body.length > 12_000_000) request.destroy()
  })
  request.on('end', () => {
    try { resolve(JSON.parse(body || '{}')) } catch (error) { reject(error) }
  })
})
const calculateCustoms = async (input) => {
  const fields = new URLSearchParams({ owner: String(input.owner || 1), age: String(input.age || '3-5'), engine: String(input.engine || 1), power: String(Number(input.power) || 1), power_unit: String(input.power_unit || 1), value: String(Number(input.value) || 1), price: String(Number(input.price) || 0), curr: String(input.curr || 'KRW') })
  const result = await fetch('https://calcus.ru/calculate/Customs', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'DriveHub-KR/1.0' }, body: fields })
  if (!result.ok) throw new Error('Сервис таможенного расчёта временно недоступен')
  return result.json()
}

createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`)

  if (request.method === 'OPTIONS') {
    response.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS' })
    return response.end()
  }

  try {
    if (request.method === 'GET' && url.pathname === '/api/health') return send(response, 200, { status: 'ok', time: new Date().toISOString() })
    if (request.method === 'POST' && url.pathname === '/api/customs') {
      if (!allowRequest(request, 'customs', 30, 60_000)) return send(response, 429, { error: 'Слишком много расчётов. Повторите через минуту' })
      return send(response, 200, await calculateCustoms(await readBody(request)))
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/login') {
      const ip = request.socket.remoteAddress || 'unknown'
      const attempt = loginAttempts.get(ip) || { count: 0, resetAt: Date.now() + 15 * 60_000 }
      if (attempt.resetAt < Date.now()) { attempt.count = 0; attempt.resetAt = Date.now() + 15 * 60_000 }
      if (attempt.count >= 5) return send(response, 429, { error: 'Слишком много попыток. Повторите через 15 минут' })
      const input = await readBody(request)
      const validUser = Boolean(process.env.ADMIN_USERNAME) && String(input.username) === process.env.ADMIN_USERNAME
      const validPassword = Boolean(process.env.ADMIN_PASSWORD) && safePasswordMatch(input.password || '', process.env.ADMIN_PASSWORD || randomBytes(24).toString('hex'))
      if (!validUser || !validPassword) { attempt.count += 1; loginAttempts.set(ip, attempt); return send(response, 401, { error: 'Неверный логин или пароль' }) }
      loginAttempts.delete(ip)
      const token = randomBytes(32).toString('hex')
      const expiresAt = Date.now() + sessionLifetime
      sessions.set(token, { username: input.username, expiresAt })
      return send(response, 200, { token, expiresAt: new Date(expiresAt).toISOString() })
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/logout') {
      const token = request.headers.authorization?.replace(/^Bearer\s+/, '')
      if (token) sessions.delete(token)
      return send(response, 200, { status: 'ok' })
    }

    if (request.method === 'GET' && url.pathname === '/api/sync/status') return send(response, 200, await readJson('sync-status.json'))

    if (request.method === 'POST' && url.pathname === '/api/sync') {
      if (!process.env.SYNC_TOKEN || request.headers.authorization !== `Bearer ${process.env.SYNC_TOKEN}`) return send(response, 401, { error: 'Нет доступа' })
      if (!process.env.CAR_FEED_URL) return send(response, 400, { error: 'CAR_FEED_URL не настроен' })
      if (syncRunning) return send(response, 409, { error: 'Синхронизация уже выполняется' })
      syncRunning = true
      try { return send(response, 200, await syncFromUrl(process.env.CAR_FEED_URL)) } finally { syncRunning = false }
    }

    if (request.method === 'GET' && url.pathname === '/api/cars') {
      const cars = await readJson('cars.json')
      return send(response, 200, cars.filter((car) => car.status === 'available'))
    }

    const carMatch = url.pathname.match(/^\/api\/cars\/(\d+)$/)
    if (request.method === 'GET' && carMatch) {
      const cars = await readJson('cars.json')
      const car = cars.find((item) => item.id === Number(carMatch[1]))
      return car ? send(response, 200, car) : send(response, 404, { error: 'Автомобиль не найден' })
    }

    if (request.method === 'POST' && url.pathname === '/api/inquiries') {
      if (!allowRequest(request, 'inquiry', 5, 10 * 60_000)) return send(response, 429, { error: 'Слишком много заявок. Повторите позже' })
      const input = await readBody(request)
      const name = cleanText(input.name, 80); const phone = cleanText(input.phone, 40); const country = cleanText(input.country, 80); const message = cleanText(input.message, 1000)
      if (!name || !phone || !country) return send(response, 400, { error: 'Заполните имя, телефон и страну' })
      if (!/^[+\d\s()-]{6,40}$/.test(phone)) return send(response, 400, { error: 'Проверьте номер телефона' })
      const inquiries = await readJson('inquiries.json')
      const inquiry = { id: Date.now(), carId: Number(input.carId) || null, name, phone, country, message, status: 'new', createdAt: new Date().toISOString() }
      inquiries.push(inquiry)
      await writeJson('inquiries.json', inquiries)
      return send(response, 201, { id: inquiry.id, status: inquiry.status })
    }

    if (request.method === 'GET' && url.pathname === '/api/admin/inquiries') {
      if (!isAdmin(request)) return send(response, 401, { error: 'Неверный токен администратора' })
      const inquiries = await readJson('inquiries.json')
      return send(response, 200, inquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    }

    if (request.method === 'GET' && url.pathname === '/api/admin/cars') {
      if (!isAdmin(request)) return send(response, 401, { error: 'Неверный токен администратора' })
      return send(response, 200, await readJson('cars.json'))
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/uploads') {
      if (!isAdmin(request)) return send(response, 401, { error: 'Неверный токен администратора' })
      const input = await readBody(request)
      const match = String(input.data || '').match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/)
      if (!match) return send(response, 400, { error: 'Разрешены только JPG, PNG и WebP' })
      const buffer = Buffer.from(match[2], 'base64')
      if (!buffer.length || buffer.length > 8_000_000) return send(response, 400, { error: 'Размер фотографии должен быть не больше 8 МБ' })
      const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
      const filename = `${Date.now()}-${randomUUID()}.${extensions[match[1]]}`
      await mkdir(uploadsPath, { recursive: true })
      await writeFile(join(uploadsPath, filename), buffer)
      return send(response, 201, { url: `/uploads/${filename}` })
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/cars') {
      if (!isAdmin(request)) return send(response, 401, { error: 'Неверный токен администратора' })
      const input = await readBody(request)
      if (!input.brand?.trim() || !input.name?.trim() || !Number(input.year) || !Number(input.price)) return send(response, 400, { error: 'Заполните марку, модель, год и цену' })
      const cars = await readJson('cars.json')
      const now = new Date().toISOString()
      const car = { id: Math.max(0, ...cars.map((item) => item.id)) + 1, brand: input.brand.trim(), name: input.name.trim(), year: Number(input.year), mileage: Number(input.mileage) || 0, fuel: input.fuel || 'Бензин', drive: input.drive || 'Передний привод', price: Number(input.price), tone: input.tone || 'graphite', photos: Array.isArray(input.photos) ? input.photos.filter(Boolean) : [], equipment: Array.isArray(input.equipment) ? input.equipment : [], conditionMarks: Array.isArray(input.conditionMarks) ? input.conditionMarks : [], status: 'available', createdAt: now, updatedAt: now }
      cars.push(car)
      await writeJson('cars.json', cars)
      return send(response, 201, car)
    }

    const adminCarMatch = url.pathname.match(/^\/api\/admin\/cars\/(\d+)$/)
    if (request.method === 'PATCH' && adminCarMatch) {
      if (!isAdmin(request)) return send(response, 401, { error: 'Неверный токен администратора' })
      const input = await readBody(request)
      const cars = await readJson('cars.json')
      const car = cars.find((item) => item.id === Number(adminCarMatch[1]))
      if (!car) return send(response, 404, { error: 'Автомобиль не найден' })
      const allowed = ['brand', 'name', 'year', 'mileage', 'fuel', 'drive', 'price', 'tone', 'photos', 'equipment', 'conditionMarks', 'status']
      allowed.forEach((key) => { if (input[key] !== undefined) car[key] = input[key] })
      car.year = Number(car.year); car.mileage = Number(car.mileage); car.price = Number(car.price)
      if (!['available', 'sold'].includes(car.status)) return send(response, 400, { error: 'Некорректный статус' })
      car.updatedAt = new Date().toISOString()
      await writeJson('cars.json', cars)
      return send(response, 200, car)
    }

    const inquiryMatch = url.pathname.match(/^\/api\/admin\/inquiries\/(\d+)$/)
    if (request.method === 'PATCH' && inquiryMatch) {
      if (!isAdmin(request)) return send(response, 401, { error: 'Неверный токен администратора' })
      const input = await readBody(request)
      if (!['new', 'in_progress', 'completed'].includes(input.status)) return send(response, 400, { error: 'Некорректный статус' })
      const inquiries = await readJson('inquiries.json')
      const inquiry = inquiries.find((item) => item.id === Number(inquiryMatch[1]))
      if (!inquiry) return send(response, 404, { error: 'Заявка не найдена' })
      inquiry.status = input.status
      inquiry.updatedAt = new Date().toISOString()
      await writeJson('inquiries.json', inquiries)
      return send(response, 200, inquiry)
    }

    if (request.method === 'GET' && !url.pathname.startsWith('/api/')) {
      if (url.pathname.startsWith('/uploads/')) {
        const filename = decodeURIComponent(url.pathname.slice('/uploads/'.length))
        if (!/^[a-zA-Z0-9.-]+$/.test(filename)) return send(response, 400, { error: 'Некорректное имя файла' })
        try {
          const file = await readFile(join(uploadsPath, filename))
          const extension = filename.split('.').pop()
          const types = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }
          response.writeHead(200, { 'Content-Type': types[extension] || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000, immutable' })
          return response.end(file)
        } catch { return send(response, 404, { error: 'Файл не найден' }) }
      }
      const requested = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '')
      const safeFile = requested.includes('..') ? 'index.html' : requested
      let file
      try { file = await readFile(join(distPath, safeFile)) } catch { file = await readFile(join(distPath, 'index.html')) }
      const extension = safeFile.split('.').pop()
      const contentTypes = { html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8', css: 'text/css; charset=utf-8', jpg: 'image/jpeg', png: 'image/png', svg: 'image/svg+xml', xml: 'application/xml; charset=utf-8', txt: 'text/plain; charset=utf-8' }
      response.writeHead(200, { 'Content-Type': contentTypes[extension] || 'text/html; charset=utf-8', 'Cache-Control': extension === 'html' ? 'no-cache' : 'public, max-age=31536000, immutable' })
      return response.end(file)
    }

    return send(response, 404, { error: 'Маршрут не найден' })
  } catch (error) {
    console.error(error)
    return send(response, 500, { error: 'Внутренняя ошибка сервера' })
  }
}).listen(port, () => {
  console.log(`DH Export API: http://localhost:${port}`)
  if (process.env.CAR_FEED_URL) setInterval(() => {
    if (syncRunning) return
    syncRunning = true
    syncFromUrl(process.env.CAR_FEED_URL).catch(console.error).finally(() => { syncRunning = false })
  }, Number(process.env.SYNC_INTERVAL_MINUTES || 60) * 60_000)
})
