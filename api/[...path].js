/* global Buffer, process */
import { get, list, put } from '@vercel/blob'
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'

const dataPrefix = 'drivehub/data'
const requestBuckets = new Map()
const seedCars = [
  { id: 1, brand: 'Genesis', name: 'Genesis G80 2.5T', year: 2022, mileage: 34000, fuel: 'Бензин', drive: 'Задний привод', price: 42900000, tone: 'graphite', photos: [], status: 'available' },
  { id: 2, brand: 'Hyundai', name: 'Hyundai Grandeur 2.5', year: 2023, mileage: 18500, fuel: 'Бензин', drive: 'Передний привод', price: 39500000, tone: 'silver', photos: [], status: 'available' },
  { id: 3, brand: 'Kia', name: 'Kia K8 3.5 Signature', year: 2022, mileage: 27100, fuel: 'Бензин', drive: 'Передний привод', price: 41300000, tone: 'black', photos: [], status: 'available' },
  { id: 4, brand: 'Hyundai', name: 'Hyundai Palisade 2.2D', year: 2021, mileage: 46000, fuel: 'Дизель', drive: 'Полный привод', price: 36800000, tone: 'navy', photos: [], status: 'available' },
  { id: 5, brand: 'Kia', name: 'Kia Sorento 2.2D', year: 2023, mileage: 22000, fuel: 'Дизель', drive: 'Полный привод', price: 38700000, tone: 'silver', photos: [], status: 'available' },
  { id: 6, brand: 'Genesis', name: 'Genesis GV70 2.5T', year: 2021, mileage: 51500, fuel: 'Бензин', drive: 'Полный привод', price: 44900000, tone: 'black', photos: [], status: 'available' },
  { id: 7, brand: 'Hyundai', name: 'Hyundai Ioniq 5 Long Range', year: 2022, mileage: 31000, fuel: 'Электро', drive: 'Задний привод', price: 35500000, tone: 'graphite', photos: [], status: 'available' },
  { id: 8, brand: 'Kia', name: 'Kia Carnival 2.2D', year: 2020, mileage: 68500, fuel: 'Дизель', drive: 'Передний привод', price: 29800000, tone: 'navy', photos: [], status: 'available' },
]

const send = (response, status, data) => response.status(status).json(data)
const clientIp = (request) => String(request.headers['x-forwarded-for'] || request.headers['x-real-ip'] || 'unknown').split(',')[0].trim()
const allowRequest = (request, key, limit, windowMs) => {
  const id = `${key}:${clientIp(request)}`; const now = Date.now(); const current = requestBuckets.get(id)
  if (!current || current.resetAt <= now) { requestBuckets.set(id, { count: 1, resetAt: now + windowMs }); return true }
  if (current.count >= limit) return false
  current.count += 1; return true
}
const cleanText = (value, max) => String(value || '').trim().slice(0, max)
const pathname = (request) => {
  const route = request.query?.route
  if (route) return `/api/${Array.isArray(route) ? route.join('/') : route}`
  return new URL(request.url, 'https://drivehub-kr.com').pathname
}
const safeEqual = (left, right) => {
  const a = Buffer.from(String(left)); const b = Buffer.from(String(right))
  return a.length === b.length && timingSafeEqual(a, b)
}

const blobToken = () => process.env.BLOB_READ_WRITE_TOKEN
// New Vercel Blob connections authenticate through the function's OIDC token.
// Passing `token: undefined` forces the legacy token path, so omit the option
// entirely unless this deployment explicitly has a read/write token.
const blobAuth = () => blobToken() ? { token: blobToken() } : {}
const loadData = async (name, fallback) => {
  const result = await list({ prefix: `${dataPrefix}/${name}.json`, limit: 1, ...blobAuth() })
  if (!result.blobs.length) return structuredClone(fallback)
  const blob = await get(result.blobs[0].pathname, { access: 'private', useCache: false, ...blobAuth() })
  if (!blob || blob.statusCode !== 200) throw new Error(`Не удалось прочитать ${name}`)
  return new Response(blob.stream).json()
}
const saveData = async (name, data) => put(`${dataPrefix}/${name}.json`, JSON.stringify(data), { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json', ...blobAuth() })

const sessionSecret = () => process.env.SESSION_SECRET || ''
const createSession = (username) => {
  const payload = Buffer.from(JSON.stringify({ username, expiresAt: Date.now() + 12 * 60 * 60 * 1000 })).toString('base64url')
  const signature = createHmac('sha256', sessionSecret()).update(payload).digest('base64url')
  return `${payload}.${signature}`
}
const verifySession = (request) => {
  if (!sessionSecret()) return false
  const token = request.headers.authorization?.replace(/^Bearer\s+/, '') || ''
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false
  const expected = createHmac('sha256', sessionSecret()).update(payload).digest('base64url')
  if (!safeEqual(signature, expected)) return false
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString()).expiresAt > Date.now() } catch { return false }
}
const requireAdmin = (request, response) => verifySession(request) || (send(response, 401, { error: 'Сессия истекла. Войдите снова' }), false)
const calculateCustoms = async (input) => {
  const fields = new URLSearchParams({
    owner: String(input.owner || 1), age: String(input.age || '3-5'), engine: String(input.engine || 1),
    power: String(Number(input.power) || 1), power_unit: String(input.power_unit || 1),
    value: String(Number(input.value) || 1), price: String(Number(input.price) || 0), curr: String(input.curr || 'KRW'),
  })
  const result = await fetch('https://calcus.ru/calculate/Customs', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'DriveHub-KR/1.0' }, body: fields })
  if (!result.ok) throw new Error('Сервис таможенного расчёта временно недоступен')
  return result.json()
}

export default async function handler(request, response) {
  const path = pathname(request)
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  try {
    if (request.method === 'GET' && path === '/api/health') return send(response, 200, { status: 'ok', runtime: 'vercel' })
    if (request.method === 'POST' && path === '/api/customs') {
      if (!allowRequest(request, 'customs', 30, 60_000)) return send(response, 429, { error: 'Слишком много расчётов. Повторите через минуту' })
      return send(response, 200, await calculateCustoms(request.body || {}))
    }

    if (request.method === 'GET' && path === '/api/media') {
      const mediaPath = new URL(request.url, 'https://drivehub-kr.com').searchParams.get('path') || ''
      if (!mediaPath.startsWith('drivehub/cars/')) return send(response, 400, { error: 'Некорректный путь' })
      const media = await get(mediaPath, { access: 'private', ...blobAuth() })
      if (!media || media.statusCode !== 200) return send(response, 404, { error: 'Файл не найден' })
      const body = Buffer.from(await new Response(media.stream).arrayBuffer())
      response.setHeader('Content-Type', media.blob.contentType)
      response.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      return response.status(200).send(body)
    }

    if (request.method === 'POST' && path === '/api/admin/login') {
      if (!allowRequest(request, 'login', 5, 15 * 60_000)) return send(response, 429, { error: 'Слишком много попыток. Повторите через 15 минут' })
      if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !sessionSecret()) return send(response, 503, { error: 'Переменные админки не настроены в Vercel' })
      const { username = '', password = '' } = request.body || {}
      if (!safeEqual(username, process.env.ADMIN_USERNAME) || !safeEqual(password, process.env.ADMIN_PASSWORD)) return send(response, 401, { error: 'Неверный логин или пароль' })
      const token = createSession(username)
      return send(response, 200, { token, expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() })
    }
    if (request.method === 'POST' && path === '/api/admin/logout') return send(response, 200, { status: 'ok' })

    if (request.method === 'GET' && path === '/api/cars') {
      const cars = await loadData('cars', seedCars)
      return send(response, 200, cars.filter((car) => car.status === 'available'))
    }
    const publicCar = path.match(/^\/api\/cars\/(\d+)$/)
    if (request.method === 'GET' && publicCar) {
      const cars = await loadData('cars', seedCars)
      const car = cars.find((item) => item.id === Number(publicCar[1]) && item.status === 'available')
      return car ? send(response, 200, car) : send(response, 404, { error: 'Автомобиль не найден' })
    }

    if (request.method === 'GET' && path === '/api/admin/cars') {
      if (!requireAdmin(request, response)) return
      return send(response, 200, await loadData('cars', seedCars))
    }
    if (request.method === 'POST' && path === '/api/admin/cars') {
      if (!requireAdmin(request, response)) return
      const input = request.body || {}
      if (!input.brand?.trim() || !input.name?.trim() || !Number(input.year) || !Number(input.price)) return send(response, 400, { error: 'Заполните марку, модель, год и цену' })
      const cars = await loadData('cars', seedCars)
      const now = new Date().toISOString()
      const car = { id: Math.max(0, ...cars.map((item) => item.id)) + 1, brand: input.brand.trim(), name: input.name.trim(), year: Number(input.year), mileage: Number(input.mileage) || 0, fuel: input.fuel || 'Бензин', drive: input.drive || 'Передний привод', price: Number(input.price), tone: input.tone || 'graphite', photos: Array.isArray(input.photos) ? input.photos.filter(Boolean) : [], equipment: Array.isArray(input.equipment) ? input.equipment : [], conditionMarks: Array.isArray(input.conditionMarks) ? input.conditionMarks : [], status: 'available', createdAt: now, updatedAt: now }
      cars.push(car); await saveData('cars', cars)
      return send(response, 201, car)
    }
    const adminCar = path.match(/^\/api\/admin\/cars\/(\d+)$/)
    if (request.method === 'PATCH' && adminCar) {
      if (!requireAdmin(request, response)) return
      const cars = await loadData('cars', seedCars)
      const car = cars.find((item) => item.id === Number(adminCar[1]))
      if (!car) return send(response, 404, { error: 'Автомобиль не найден' })
      const input = request.body || {}
      ;['brand', 'name', 'year', 'mileage', 'fuel', 'drive', 'price', 'tone', 'photos', 'equipment', 'conditionMarks', 'status'].forEach((key) => { if (input[key] !== undefined) car[key] = input[key] })
      car.year = Number(car.year); car.mileage = Number(car.mileage); car.price = Number(car.price); car.updatedAt = new Date().toISOString()
      await saveData('cars', cars)
      return send(response, 200, car)
    }

    if (request.method === 'POST' && path === '/api/inquiries') {
      if (!allowRequest(request, 'inquiry', 5, 10 * 60_000)) return send(response, 429, { error: 'Слишком много заявок. Повторите позже' })
      const input = request.body || {}
      const name = cleanText(input.name, 80); const phone = cleanText(input.phone, 40); const country = cleanText(input.country, 80); const message = cleanText(input.message, 1000)
      if (!name || !phone || !country) return send(response, 400, { error: 'Заполните имя, телефон и страну' })
      if (!/^[+\d\s()-]{6,40}$/.test(phone)) return send(response, 400, { error: 'Проверьте номер телефона' })
      const inquiries = await loadData('inquiries', [])
      const inquiry = { id: Date.now(), carId: Number(input.carId) || null, name, phone, country, message, status: 'new', createdAt: new Date().toISOString() }
      inquiries.push(inquiry); await saveData('inquiries', inquiries)
      return send(response, 201, { id: inquiry.id, status: inquiry.status })
    }
    if (request.method === 'GET' && path === '/api/admin/inquiries') {
      if (!requireAdmin(request, response)) return
      const inquiries = await loadData('inquiries', [])
      return send(response, 200, inquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    }
    const inquiry = path.match(/^\/api\/admin\/inquiries\/(\d+)$/)
    if (request.method === 'PATCH' && inquiry) {
      if (!requireAdmin(request, response)) return
      const inquiries = await loadData('inquiries', [])
      const item = inquiries.find((entry) => entry.id === Number(inquiry[1]))
      if (!item) return send(response, 404, { error: 'Заявка не найдена' })
      if (!['new', 'in_progress', 'completed'].includes(request.body?.status)) return send(response, 400, { error: 'Некорректный статус' })
      item.status = request.body.status; item.updatedAt = new Date().toISOString(); await saveData('inquiries', inquiries)
      return send(response, 200, item)
    }

    if (request.method === 'POST' && path === '/api/admin/uploads') {
      if (!requireAdmin(request, response)) return
      const match = String(request.body?.data || '').match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/)
      if (!match) return send(response, 400, { error: 'Разрешены только JPG, PNG и WebP' })
      const buffer = Buffer.from(match[2], 'base64')
      if (!buffer.length || buffer.length > 3_000_000) return send(response, 400, { error: 'На Vercel фотография должна быть не больше 3 МБ' })
      const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[match[1]]
      const blob = await put(`drivehub/cars/${Date.now()}-${randomUUID()}.${ext}`, buffer, { access: 'private', contentType: match[1], ...blobAuth() })
      return send(response, 201, { url: `/api/media?path=${encodeURIComponent(blob.pathname)}` })
    }

    return send(response, 404, { error: 'Маршрут не найден' })
  } catch (error) {
    console.error(error)
    return send(response, 500, { error: error.message || 'Внутренняя ошибка сервера' })
  }
}
