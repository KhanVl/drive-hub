/* global process */
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const dataFile = join(root, 'data', 'cars.json')
const statusFile = join(root, 'data', 'sync-status.json')

const fuelMap = { gasoline: 'Бензин', diesel: 'Дизель', electric: 'Электро', hybrid: 'Гибрид' }
const driveMap = { awd: 'Полный привод', fwd: 'Передний привод', rwd: 'Задний привод' }
const tones = ['graphite', 'silver', 'black', 'navy']

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'))
const saveJson = async (path, data) => writeFile(path, `${JSON.stringify(data, null, 2)}\n`)

export const normalizeCar = (item) => {
  const externalId = String(item.externalId ?? item.id ?? '').trim()
  const brand = String(item.brand ?? '').trim()
  const model = String(item.model ?? item.name ?? '').trim()
  const year = Number(item.year)
  const mileage = Number(item.mileage)
  const price = Number(item.priceKrw ?? item.price)
  if (!externalId || !brand || !model || !year || mileage < 0 || !price) throw new Error(`Некорректная запись: ${externalId || 'без ID'}`)
  return { externalId, brand, name: model.toLowerCase().startsWith(brand.toLowerCase()) ? model : `${brand} ${model}`, year, mileage, fuel: fuelMap[item.fuel] || item.fuel || 'Не указано', drive: driveMap[item.drive] || item.drive || 'Не указано', price, photos: Array.isArray(item.photos) ? item.photos : [], status: 'available' }
}

export const syncCars = async (feed, { dryRun = false, source = 'unknown' } = {}) => {
  const current = await readJson(dataFile)
  const incoming = feed.map(normalizeCar)
  const byExternalId = new Map(current.filter((car) => car.externalId).map((car) => [car.externalId, car]))
  const seen = new Set()
  let added = 0
  let updated = 0
  const now = new Date().toISOString()

  for (const item of incoming) {
    seen.add(item.externalId)
    const existing = byExternalId.get(item.externalId)
    if (existing) {
      Object.assign(existing, item, { id: existing.id, updatedAt: now })
      updated += 1
    } else {
      current.push({ ...item, id: Math.max(0, ...current.map((car) => car.id)) + 1, tone: tones[current.length % tones.length], createdAt: now, updatedAt: now })
      added += 1
    }
  }

  let removed = 0
  current.forEach((car) => {
    if (car.externalId && !seen.has(car.externalId) && car.status !== 'sold') { car.status = 'sold'; car.updatedAt = now; removed += 1 }
  })

  const stats = { received: incoming.length, added, updated, removed, total: current.length, dryRun }
  if (!dryRun) {
    await saveJson(dataFile, current)
    await saveJson(statusFile, { state: 'idle', lastRunAt: now, lastSuccessAt: now, source, stats, error: null })
  }
  return stats
}

export const syncFromUrl = async (url) => {
  await saveJson(statusFile, { state: 'running', lastRunAt: new Date().toISOString(), lastSuccessAt: null, source: url, stats: null, error: null })
  try {
    const response = await fetch(url, { headers: process.env.CAR_FEED_API_KEY ? { Authorization: `Bearer ${process.env.CAR_FEED_API_KEY}` } : {} })
    if (!response.ok) throw new Error(`Источник ответил HTTP ${response.status}`)
    const payload = await response.json()
    return await syncCars(Array.isArray(payload) ? payload : payload.cars, { source: url })
  } catch (error) {
    const previous = await readJson(statusFile)
    await saveJson(statusFile, { ...previous, state: 'error', error: error.message })
    throw error
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const fileFlag = process.argv.indexOf('--file')
  const source = fileFlag >= 0 ? process.argv[fileFlag + 1] : null
  if (!source) { console.error('Укажите --file <путь-к-фиду>'); process.exitCode = 1 }
  else syncCars(await readJson(resolve(source)), { dryRun: process.argv.includes('--dry-run'), source }).then((stats) => console.log(JSON.stringify(stats, null, 2))).catch((error) => { console.error(error.message); process.exitCode = 1 })
}
