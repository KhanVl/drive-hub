import { useState } from 'react'
import { defaultEquipment, equipmentOptions } from './equipmentOptions'
import ConditionMap from './ConditionMap'
import { damageTypes } from './damageTypes'
import { carColors } from './carColors'

const createEmptyCar = () => ({ brand: '', name: '', year: new Date().getFullYear(), mileage: 0, engine: '2.5 л', engineDisplacement: '', horsepower: '', fuel: 'Бензин', transmission: 'Автомат', drive: 'Передний привод', price: '', tone: 'graphite', photos: '', equipment: [...defaultEquipment], conditionMarks: [] })

const engineOptions = ['1.0 л', '1.2 л', '1.4 л', '1.5 л', '1.6 л', '2.0 л', '2.2 л', '2.5 л', '3.0 л', '3.3 л', '3.5 л', '3.8 л', '4.0 л', '5.0 л', 'Электродвигатель']
const transmissionOptions = ['Автомат', 'Механика', 'Робот', 'Вариатор', 'Редуктор']

export default function AdminPanel({ token, setToken, onClose, onCarsChanged }) {
  const [authorized, setAuthorized] = useState(false)
  const [tab, setTab] = useState('cars')
  const [cars, setCars] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(createEmptyCar)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [deletingCar, setDeletingCar] = useState(null)
  const [draggingPhoto, setDraggingPhoto] = useState(null)
  const [activeDamage, setActiveDamage] = useState('scratch')
  const [credentials, setCredentials] = useState({ username: '', password: '' })

  const request = async (path, options = {}, authToken = token) => {
    const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}), ...options.headers } })
    const text = await response.text()
    let data
    try { data = text ? JSON.parse(text) : {} } catch { throw new Error('Сервер Vercel API ещё не настроен или не опубликован') }
    if (!response.ok) throw new Error(data.error || (response.status === 413 ? 'Фотография слишком большая для загрузки' : 'Ошибка сервера'))
    return data
  }

  const loadAll = async (event) => {
    event?.preventDefault()
    setError('')
    try {
      const login = await request('/api/admin/login', { method: 'POST', body: JSON.stringify(credentials) }, '')
      setToken(login.token)
      const [carData, inquiryData] = await Promise.all([request('/api/admin/cars', {}, login.token), request('/api/admin/inquiries', {}, login.token)])
      setCars(carData)
      setInquiries(inquiryData)
      setAuthorized(true)
    } catch (loadError) { setError(loadError.message) }
  }

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const toggleEquipment = (id) => setForm((current) => ({ ...current, equipment: (current.equipment || []).includes(id) ? current.equipment.filter((item) => item !== id) : [...(current.equipment || []), id] }))
  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  const preparePhoto = async (file) => {
    if (!file.type.startsWith('image/')) throw new Error(`${file.name}: выберите изображение`)
    const source = await createImageBitmap(file)
    const scale = Math.min(1, 1920 / Math.max(source.width, source.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(source.width * scale)
    canvas.height = Math.round(source.height * scale)
    canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height)
    source.close()
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', .84))
    if (!blob) throw new Error(`${file.name}: не удалось обработать фотографию`)
    return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp' })
  }
  const uploadPhotos = async (event) => {
    const files = [...event.target.files]
    if (!files.length) return
    setUploading(true)
    setError('')
    try {
      const urls = []
      for (const file of files) {
        const prepared = await preparePhoto(file)
        if (prepared.size > 2_500_000) throw new Error(`${file.name}: после обработки файл больше 2,5 МБ`)
        const data = await request('/api/admin/uploads', { method: 'POST', body: JSON.stringify({ name: prepared.name, data: await fileToDataUrl(prepared) }) })
        urls.push(data.url)
      }
      setForm((current) => ({ ...current, photos: [current.photos, ...urls].filter(Boolean).join('\n') }))
    } catch (uploadError) { setError(`Не удалось загрузить фотографию: ${uploadError.message}`) }
    finally { setUploading(false); event.target.value = '' }
  }
  const removePhoto = (url) => setForm((current) => ({ ...current, photos: String(current.photos).split('\n').filter((item) => item.trim() && item.trim() !== url).join('\n') }))
  const reorderPhotos = (fromIndex, toIndex) => {
    if (fromIndex === null || fromIndex === toIndex) return
    setForm((current) => {
      const photos = String(current.photos).split('\n').map((url) => url.trim()).filter(Boolean)
      if (toIndex < 0 || toIndex >= photos.length) return current
      const [movedPhoto] = photos.splice(fromIndex, 1)
      if (!movedPhoto) return current
      photos.splice(toIndex, 0, movedPhoto)
      return { ...current, photos: photos.join('\n') }
    })
  }
  const movePhoto = (index, offset) => reorderPhotos(index, index + offset)
  const startEdit = (car) => { setEditing(car.id); setForm({ ...car, engine: car.engine || (car.fuel === 'Электро' ? 'Электродвигатель' : '2.5 л'), engineDisplacement: car.engineDisplacement || '', horsepower: car.horsepower || '', transmission: car.transmission || 'Автомат', photos: (car.photos || []).join('\n'), equipment: Array.isArray(car.equipment) ? car.equipment : [...defaultEquipment], conditionMarks: Array.isArray(car.conditionMarks) ? car.conditionMarks : [] }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const cancelEdit = () => { setEditing(null); setForm(createEmptyCar()); setError('') }

  const saveCar = async (event) => {
    event.preventDefault()
    setError('')
    if (Number(form.horsepower) <= 0 || (form.fuel !== 'Электро' && Number(form.engineDisplacement) <= 0)) {
      setError('Укажите мощность двигателя и точный объём в см³. Для электромобиля объём не требуется.')
      return
    }
    const payload = { ...form, year: Number(form.year), mileage: Number(form.mileage), engineDisplacement: Number(form.engineDisplacement) || 0, horsepower: Number(form.horsepower) || 0, price: Number(form.price), photos: String(form.photos).split('\n').map((url) => url.trim()).filter(Boolean) }
    try {
      const saved = await request(editing ? `/api/admin/cars/${editing}` : '/api/admin/cars', { method: editing ? 'PATCH' : 'POST', body: JSON.stringify(payload) })
      setCars((current) => editing ? current.map((car) => car.id === saved.id ? saved : car) : [...current, saved])
      cancelEdit()
      onCarsChanged()
    } catch (saveError) { setError(saveError.message) }
  }

  const setCarStatus = async (car, status) => {
    try {
      const saved = await request(`/api/admin/cars/${car.id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      setCars((current) => current.map((item) => item.id === car.id ? saved : item))
      onCarsChanged()
    } catch (statusError) { setError(statusError.message) }
  }

  const deleteCar = async (car) => {
    if (!window.confirm(`Удалить автомобиль «${car.name}»? Это действие нельзя отменить.`)) return
    setDeletingCar(car.id)
    setError('')
    try {
      await request(`/api/admin/cars/${car.id}`, { method: 'DELETE' })
      setCars((current) => current.filter((item) => item.id !== car.id))
      if (editing === car.id) cancelEdit()
      onCarsChanged()
    } catch (deleteError) { setError(deleteError.message) }
    finally { setDeletingCar(null) }
  }

  const setInquiryStatus = async (id, status) => {
    try {
      await request(`/api/admin/inquiries/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      setInquiries((current) => current.map((item) => item.id === id ? { ...item, status } : item))
    } catch (statusError) { setError(statusError.message) }
  }
  const logout = async () => {
    await request('/api/admin/logout', { method: 'POST' }).catch(() => {})
    setToken('')
    setAuthorized(false)
    setCredentials({ username: '', password: '' })
  }

  return <main className="admin-page">
    <header className="header detail-header"><div className="container nav-wrap"><a className="brand" href="/" onClick={(event) => { event.preventDefault(); onClose() }}><span>DH</span><small>EXPORT</small></a><button className="back-link" onClick={onClose}>← Вернуться на сайт</button></div></header>
    <div className="container admin-content"><p className="eyebrow">Управление</p><h1>Админ-панель</h1>
      {!authorized ? <form className="admin-login" onSubmit={loadAll}><label>Логин<input value={credentials.username} onChange={(event) => setCredentials((current) => ({ ...current, username: event.target.value }))} required autoComplete="username" placeholder="admin" /></label><label>Пароль<input type="password" value={credentials.password} onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))} required autoComplete="current-password" placeholder="Введите пароль" /></label>{error && <span>{error}</span>}<button className="button button-gold">Войти</button></form> : <>
        <div className="admin-tabs"><button className={tab === 'cars' ? 'active' : ''} onClick={() => setTab('cars')}>Автомобили ({cars.length})</button><button className={tab === 'inquiries' ? 'active' : ''} onClick={() => setTab('inquiries')}>Заявки ({inquiries.length})</button><button className="logout-button" onClick={logout}>Выйти</button></div>
        {error && <div className="admin-alert">{error}</div>}
        {tab === 'cars' ? <div className="admin-cars-layout">
          <div className="admin-car-editor-column">
          <div className="car-editor powertrain-editor"><h2>Двигатель и коробка передач</h2><div className="editor-grid"><label>Двигатель<select name="engine" value={form.engine} onChange={change}>{engineOptions.map((engine) => <option key={engine}>{engine}</option>)}</select></label><label>Коробка передач<select name="transmission" value={form.transmission} onChange={change}>{transmissionOptions.map((transmission) => <option key={transmission}>{transmission}</option>)}</select></label><label>Объём двигателя, см³<input name="engineDisplacement" type="number" min="0" max="10000" value={form.engineDisplacement} onChange={change} placeholder="Например, 2497" /></label><label>Мощность, л.с.<input name="horsepower" type="number" min="1" max="3000" value={form.horsepower} onChange={change} placeholder="Например, 184" /></label></div><p className="powertrain-hint">Для электромобиля объём двигателя можно не заполнять. Мощность и точная кубатура автоматически попадут в калькулятор.</p></div>
          </div>
          <form className="car-editor" onSubmit={saveCar}><h2>{editing ? 'Редактировать автомобиль' : 'Добавить автомобиль'}</h2><div className="editor-grid"><label>Марка<input name="brand" value={form.brand} onChange={change} required /></label><label>Название модели<input name="name" value={form.name} onChange={change} required /></label><label>Год<input name="year" type="number" value={form.year} onChange={change} required /></label><label>Пробег, км<input name="mileage" type="number" value={form.mileage} onChange={change} /></label><label>Цена, KRW<input name="price" type="number" value={form.price} onChange={change} required /></label><label>Топливо<select name="fuel" value={form.fuel} onChange={change}><option>Бензин</option><option>Дизель</option><option>Гибрид</option><option>Электро</option></select></label><label>Привод<select name="drive" value={form.drive} onChange={change}><option>Передний привод</option><option>Задний привод</option><option>Полный привод</option></select></label><label>Цвет машины<select name="tone" value={form.tone} onChange={change}>{carColors.map((color) => <option value={color.value} key={color.value}>{color.label}</option>)}</select></label></div><fieldset className="equipment-editor"><legend>Комплектация <span>{(form.equipment || []).length} выбрано</span></legend><div>{equipmentOptions.map((option) => <label key={option.id} className={(form.equipment || []).includes(option.id) ? 'selected' : ''}><input type="checkbox" checked={(form.equipment || []).includes(option.id)} onChange={() => toggleEquipment(option.id)} /><b>{option.icon}</b><span>{option.label}</span></label>)}</div></fieldset><label className="upload-control">Фотографии с компьютера<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={uploadPhotos} disabled={uploading} /><span>{uploading ? 'Загрузка…' : 'Выбрать JPG, PNG или WebP — до 3 МБ'}</span></label><p className="photo-order-hint">Перетащите фотографии для изменения порядка. Первая фотография будет главной.</p><div className="photo-previews">{String(form.photos).split('\n').filter(Boolean).map((url, index, photos) => <div draggable key={`${url}-${index}`} className={draggingPhoto === index ? 'dragging' : ''} onDragStart={() => setDraggingPhoto(index)} onDragEnd={() => setDraggingPhoto(null)} onDragOver={(event) => event.preventDefault()} onDrop={() => { reorderPhotos(draggingPhoto, index); setDraggingPhoto(null) }} style={{ backgroundImage: `url(${url})` }}><span className="photo-position">{index === 0 ? 'Главная' : index + 1}</span><button className="photo-remove" type="button" onClick={() => removePhoto(url)} aria-label="Удалить фотографию">×</button><div className="photo-order-controls"><button type="button" disabled={index === 0} onClick={() => movePhoto(index, -1)} aria-label="Переместить фотографию назад">‹</button><button type="button" disabled={index === photos.length - 1} onClick={() => movePhoto(index, 1)} aria-label="Переместить фотографию вперёд">›</button></div></div>)}</div><label>Или ссылки — одна на строку<textarea name="photos" value={form.photos} onChange={change} placeholder="https://example.com/car-1.jpg" /></label><div className="editor-actions"><button className="button button-gold" disabled={uploading}>{editing ? 'Сохранить' : 'Добавить'}</button>{editing && <button type="button" className="button button-glass" onClick={cancelEdit}>Отмена</button>}</div></form>
          <div className="admin-car-list">{cars.map((car) => <article key={car.id}><div className={`admin-car-thumb ${car.tone}`} style={car.photos?.[0] ? { backgroundImage: `url(${car.photos[0]})` } : undefined}>{!car.photos?.[0] && 'AUTO'}</div><div><span className={`status ${car.status === 'available' ? 'completed' : ''}`}>{car.status === 'available' ? 'В продаже' : 'Продан'}</span><h3>{car.name}</h3><p>{car.year} · {new Intl.NumberFormat('ru-RU').format(car.mileage)} км · ₩ {new Intl.NumberFormat('ru-RU').format(car.price)}</p><div className="admin-car-actions"><button onClick={() => startEdit(car)}>Редактировать</button><button onClick={() => setCarStatus(car, car.status === 'available' ? 'sold' : 'available')}>{car.status === 'available' ? 'Снять с продажи' : 'Вернуть в продажу'}</button><button className="delete-car-button" disabled={deletingCar === car.id} onClick={() => deleteCar(car)}>{deletingCar === car.id ? 'Удаление…' : 'Удалить'}</button></div></div></article>)}</div>
        </div> : <><div className="admin-summary"><span><b>{inquiries.length}</b>Всего</span><span><b>{inquiries.filter((item) => item.status === 'new').length}</b>Новых</span><span><b>{inquiries.filter((item) => item.status === 'in_progress').length}</b>В работе</span><span><b>{inquiries.filter((item) => item.status === 'completed').length}</b>Завершено</span></div><div className="inquiry-list">{inquiries.map((item) => <article key={item.id}><div><span className={`status ${item.status}`}>{item.status === 'new' ? 'Новая' : item.status === 'in_progress' ? 'В работе' : 'Завершена'}</span><h3>{item.name}</h3><a href={`tel:${item.phone}`}>{item.phone}</a><p>{item.country} · Автомобиль #{item.carId || '—'}</p>{item.message && <blockquote>{item.message}</blockquote>}</div><select value={item.status} onChange={(event) => setInquiryStatus(item.id, event.target.value)}><option value="new">Новая</option><option value="in_progress">В работе</option><option value="completed">Завершена</option></select></article>)}</div></>}
        {tab === 'cars' && <fieldset className="condition-editor"><legend>Состояние кузова <span>{(form.conditionMarks || []).length} отметок</span></legend><p>Сначала выберите тип, затем нажмите на нужную область машины. Нажатие на готовую отметку удаляет её. После разметки нажмите «Сохранить» в форме автомобиля.</p><div className="damage-picker" aria-label="Обозначения повреждений">{damageTypes.map((type) => <button type="button" key={type.id} title={`${type.symbol} — ${type.labelRu}`} className={activeDamage === type.id ? 'active' : ''} onClick={() => setActiveDamage(type.id)}><i style={{ background: type.color }}>{type.symbol}</i><span>{type.labelRu}</span></button>)}</div><ConditionMap editable activeType={activeDamage} marks={form.conditionMarks || []} onAdd={(mark) => setForm((current) => ({ ...current, conditionMarks: [...(current.conditionMarks || []), mark] }))} onRemove={(index) => setForm((current) => ({ ...current, conditionMarks: current.conditionMarks.filter((_, itemIndex) => itemIndex !== index) }))}/>{(form.conditionMarks || []).length > 0 && <button type="button" className="clear-marks" onClick={() => setForm((current) => ({ ...current, conditionMarks: [] }))}>Очистить все отметки</button>}</fieldset>}
      </>}
    </div>
  </main>
}
