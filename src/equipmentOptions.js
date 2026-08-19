import EquipmentIcon from './EquipmentIcon'
import { createElement } from 'react'

export const equipmentOptions = [
  ['leather', 'Кожаный салон', 'Leather interior', '◇'],
  ['rear-camera', 'Камера заднего вида', 'Rear-view camera', '▣'],
  ['climate', 'Климат-контроль', 'Climate control', '☼'],
  ['parking-sensors', 'Парктроники', 'Parking sensors', '◉'],
  ['heated-seats', 'Подогрев сидений', 'Heated seats', '♨'],
  ['cruise', 'Круиз-контроль', 'Cruise control', '◇'],
  ['led-headlights', 'LED-фары', 'LED headlights', '◐'],
  ['smart-key', 'Бесключевой доступ', 'Keyless entry', '⌾'],
  ['navigation', 'Навигация', 'Navigation', '⌖'],
  ['ventilated-seats', 'Вентиляция сидений', 'Ventilated seats', '≋'],
  ['memory-seats', 'Память сидений', 'Seat memory', '♙'],
  ['heated-steering', 'Подогрев руля', 'Heated steering wheel', '◯'],
  ['panorama', 'Панорамная крыша', 'Panoramic roof', '▱'],
  ['blind-spot', 'Контроль слепых зон', 'Blind-spot monitoring', '◒'],
  ['lane-assist', 'Удержание в полосе', 'Lane keeping assist', '∥'],
  ['adaptive-cruise', 'Адаптивный круиз-контроль', 'Adaptive cruise control', '◎'],
  ['electric-trunk', 'Электропривод багажника', 'Power tailgate', '⌁'],
  ['around-view', 'Камеры 360°', '360° camera', '⊕'],
  ['wireless-charge', 'Беспроводная зарядка', 'Wireless charging', 'ϟ'],
  ['premium-audio', 'Премиальная аудиосистема', 'Premium audio system', '♫'],
  ['apple-carplay', 'Apple CarPlay / Android Auto', 'Apple CarPlay / Android Auto', '▤'],
  ['head-up-display', 'Проекционный дисплей', 'Head-up display', '▰'],
  ['auto-parking', 'Автопарковка', 'Automatic parking', 'Ⓟ'],
  ['rain-sensor', 'Датчик дождя', 'Rain sensor', '☂'],
].map(([id, labelRu, labelEn, symbol]) => ({ id, labelRu, labelEn, label: labelRu, icon: createElement(EquipmentIcon, { name: id }), symbol }))

export const defaultEquipment = equipmentOptions.slice(0, 6).map(({ id }) => id)
