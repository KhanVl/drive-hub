import { useEffect, useState } from 'react'
import heroImage from './assets/hero-cars.jpg'
import AdminPanel from './AdminPanel'
import { defaultEquipment, equipmentOptions } from './equipmentOptions'
import './App.css'

const fallbackCars = [
  { id: 1, brand: 'Genesis', name: 'Genesis G80 2.5T', year: 2022, mileage: 34000, fuel: 'Бензин', drive: 'Задний привод', price: 42900000, tone: 'graphite' },
  { id: 2, brand: 'Hyundai', name: 'Hyundai Grandeur 2.5', year: 2023, mileage: 18500, fuel: 'Бензин', drive: 'Передний привод', price: 39500000, tone: 'silver' },
  { id: 3, brand: 'Kia', name: 'Kia K8 3.5 Signature', year: 2022, mileage: 27100, fuel: 'Бензин', drive: 'Передний привод', price: 41300000, tone: 'black' },
  { id: 4, brand: 'Hyundai', name: 'Hyundai Palisade 2.2D', year: 2021, mileage: 46000, fuel: 'Дизель', drive: 'Полный привод', price: 36800000, tone: 'navy' },
  { id: 5, brand: 'Kia', name: 'Kia Sorento 2.2D', year: 2023, mileage: 22000, fuel: 'Дизель', drive: 'Полный привод', price: 38700000, tone: 'silver' },
  { id: 6, brand: 'Genesis', name: 'Genesis GV70 2.5T', year: 2021, mileage: 51500, fuel: 'Бензин', drive: 'Полный привод', price: 44900000, tone: 'black' },
  { id: 7, brand: 'Hyundai', name: 'Hyundai Ioniq 5 Long Range', year: 2022, mileage: 31000, fuel: 'Электро', drive: 'Задний привод', price: 35500000, tone: 'graphite' },
  { id: 8, brand: 'Kia', name: 'Kia Carnival 2.2D', year: 2020, mileage: 68500, fuel: 'Дизель', drive: 'Передний привод', price: 29800000, tone: 'navy' },
]

const steps = [
  ['01', 'Подбор авто', 'Находим автомобиль под ваши параметры и бюджет'],
  ['02', 'Проверка', 'Проверяем состояние, историю и документы'],
  ['03', 'Покупка', 'Выкупаем автомобиль и оформляем экспорт'],
  ['04', 'Доставка', 'Отправляем из Кореи в выбранную страну'],
  ['05', 'Получение', 'Сопровождаем вас до получения автомобиля'],
]

function Mark() {
  return <a className="brand" href="#top" aria-label="DH Export"><span>DH</span><small>EXPORT</small></a>
}

function App() {
  const [cars, setCars] = useState(fallbackCars)
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedCar, setSelectedCar] = useState(() => {
    const id = Number(window.location.pathname.match(/^\/cars\/(\d+)$/)?.[1])
    return fallbackCars.find((car) => car.id === id) || null
  })
  const [activePhoto, setActivePhoto] = useState(0)
  const [equipmentOpen, setEquipmentOpen] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('dh-favorites') || '[]'))
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [adminOpen, setAdminOpenState] = useState(window.location.pathname === '/admin')
  const [adminToken, setAdminToken] = useState('')
  const [inquiries, setInquiries] = useState([])
  const [adminError, setAdminError] = useState('')
  const setAdminOpen = (value) => { setAdminOpenState(value); window.history.pushState({}, '', value ? '/admin' : '/') }
  const [filters, setFilters] = useState({ search: '', brand: 'Все марки', year: 'Любой год', fuel: 'Любое топливо', maxPrice: 'Любая цена', sort: 'Сначала новые' })

  const closeMenu = () => setMenuOpen(false)
  useEffect(() => {
    fetch('/api/cars').then((response) => {
      if (!response.ok) throw new Error('API недоступен')
      return response.json()
    }).then(setCars).catch(() => {})
  }, [])
  useEffect(() => localStorage.setItem('dh-favorites', JSON.stringify(favorites)), [favorites])
  useEffect(() => {
    const onPopState = () => {
      const id = Number(window.location.pathname.match(/^\/cars\/(\d+)$/)?.[1])
      setAdminOpenState(window.location.pathname === '/admin')
      setSelectedCar(cars.find((car) => car.id === id) || null)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [cars])
  useEffect(() => {
    document.title = adminOpen ? 'Админ-панель — DH Export' : selectedCar ? `${selectedCar.name} — купить из Кореи | DH Export` : 'Автомобили из Кореи на экспорт | DH Export'
    document.querySelector('meta[name="description"]')?.setAttribute('content', selectedCar ? `${selectedCar.name}, ${selectedCar.year} год, пробег ${new Intl.NumberFormat('ru-RU').format(selectedCar.mileage)} км. Доставка автомобиля из Южной Кореи.` : 'Подбор, проверка и доставка автомобилей из Южной Кореи по всему миру.')
  }, [selectedCar, adminOpen])
  const changeFilter = (event) => setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
  const resetFilters = () => setFilters({ search: '', brand: 'Все марки', year: 'Любой год', fuel: 'Любое топливо', maxPrice: 'Любая цена', sort: 'Сначала новые' })
  const toggleFavorite = (id) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const formatNumber = (number) => new Intl.NumberFormat('ru-RU').format(number)
  const filteredCars = cars
    .filter((car) => car.name.toLowerCase().includes(filters.search.toLowerCase().trim()))
    .filter((car) => filters.brand === 'Все марки' || car.brand === filters.brand)
    .filter((car) => filters.year === 'Любой год' || car.year >= Number(filters.year))
    .filter((car) => filters.fuel === 'Любое топливо' || car.fuel === filters.fuel)
    .filter((car) => filters.maxPrice === 'Любая цена' || car.price <= Number(filters.maxPrice))
    .filter((car) => !favoritesOnly || favorites.includes(car.id))
    .sort((a, b) => filters.sort === 'Цена по возрастанию' ? a.price - b.price : filters.sort === 'Цена по убыванию' ? b.price - a.price : b.year - a.year)

  const openCar = (car) => {
    setSelectedCar(car)
    setEquipmentOpen(false)
    setActivePhoto(0)
    setRequestSent(false)
    window.history.pushState({}, '', `/cars/${car.id}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const submitInquiry = async (event) => {
    event.preventDefault()
    setRequestError('')
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ carId: selectedCar.id, name: form.get('name'), phone: form.get('phone'), country: form.get('country'), message: form.get('message') }) })
      if (!response.ok) throw new Error('Не удалось отправить заявку')
      setRequestSent(true)
    } catch (error) { setRequestError(`${error.message}. Убедитесь, что сервер запущен.`) }
  }
  const loadInquiries = async (event) => {
    event?.preventDefault()
    setAdminError('')
    try {
      const response = await fetch('/api/admin/inquiries', { headers: { Authorization: `Bearer ${adminToken}` } })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setInquiries(data)
    } catch (error) { setAdminError(error.message) }
  }
  const updateInquiry = async (id, status) => {
    const response = await fetch(`/api/admin/inquiries/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` }, body: JSON.stringify({ status }) })
    if (response.ok) setInquiries((current) => current.map((item) => item.id === id ? { ...item, status } : item))
  }

  if (adminOpen) return <AdminPanel token={adminToken} setToken={setAdminToken} onClose={() => setAdminOpen(false)} onCarsChanged={() => fetch('/api/cars').then((response) => response.json()).then(setCars)} />

  if (adminOpen && inquiries === null) return (
    <main className="admin-page"><header className="header detail-header"><div className="container nav-wrap"><Mark /><button className="back-link" onClick={() => setAdminOpen(false)}>← Вернуться на сайт</button></div></header><div className="container admin-content"><p className="eyebrow">Управление</p><h1>Заявки клиентов</h1>{!inquiries.length ? <form className="admin-login" onSubmit={loadInquiries}><label>Токен администратора<input type="password" value={adminToken} onChange={(event) => setAdminToken(event.target.value)} required placeholder="Введите ADMIN_TOKEN" /></label>{adminError && <span>{adminError}</span>}<button className="button button-gold">Открыть панель</button></form> : <><div className="admin-summary"><span><b>{inquiries.length}</b>Всего</span><span><b>{inquiries.filter((item) => item.status === 'new').length}</b>Новых</span><span><b>{inquiries.filter((item) => item.status === 'in_progress').length}</b>В работе</span><span><b>{inquiries.filter((item) => item.status === 'completed').length}</b>Завершено</span></div><div className="inquiry-list">{inquiries.map((item) => <article key={item.id}><div><span className={`status ${item.status}`}>{item.status === 'new' ? 'Новая' : item.status === 'in_progress' ? 'В работе' : 'Завершена'}</span><h3>{item.name}</h3><a href={`tel:${item.phone}`}>{item.phone}</a><p>{item.country} · Автомобиль #{item.carId || '—'}</p>{item.message && <blockquote>{item.message}</blockquote>}</div><select value={item.status} onChange={(event) => updateInquiry(item.id, event.target.value)}><option value="new">Новая</option><option value="in_progress">В работе</option><option value="completed">Завершена</option></select></article>)}</div></>}</div></main>
  )

  if (selectedCar) {
    const exportPrice = selectedCar.price + 6200000
    const detailPhotos = selectedCar.photos?.length ? selectedCar.photos : [heroImage, heroImage, heroImage, heroImage]
    const selectedEquipment = equipmentOptions.filter((option) => (Array.isArray(selectedCar.equipment) ? selectedCar.equipment : defaultEquipment).includes(option.id))
    const visibleEquipment = equipmentOpen ? selectedEquipment : selectedEquipment.slice(0, 6)
    return (
      <main className="detail-page">
        <header className="header detail-header"><div className="container nav-wrap"><Mark /><button className="back-link" onClick={() => setSelectedCar(null)}>← Вернуться в каталог</button><a className="button button-outline" href="#detail-request">Связаться</a></div></header>
        <div className="container detail-content">
          <div className="breadcrumbs"><button onClick={() => setSelectedCar(null)}>Главная</button><span>›</span><button onClick={() => setSelectedCar(null)}>Авто в наличии</button><span>›</span><b>{selectedCar.name}</b></div>
          <section className="detail-hero">
            <div className="detail-summary"><p className="eyebrow">В наличии в Корее</p><h1>{selectedCar.name}</h1><div className="quick-specs"><span><b>{selectedCar.year}</b><small>Год выпуска</small></span><span><b>{formatNumber(selectedCar.mileage)} км</b><small>Пробег</small></span><span><b>{selectedCar.fuel}</b><small>Топливо</small></span><span><b>Автомат</b><small>Коробка</small></span></div><div className="detail-price">₩ {formatNumber(selectedCar.price)}</div><div className="detail-actions"><a className="button button-gold" href="#detail-request">Заказать экспорт</a><a className="button button-glass" href="tel:+821012345678">Позвонить нам</a></div><button className={`favorite-button ${favorites.includes(selectedCar.id) ? 'selected' : ''}`} onClick={() => toggleFavorite(selectedCar.id)}>{favorites.includes(selectedCar.id) ? '♥ В избранном' : '♡ Добавить в избранное'}</button></div>
            <div className="gallery"><div className={`main-photo photo-${activePhoto}`} style={{ backgroundImage: `linear-gradient(rgba(5,10,15,.05),rgba(5,10,15,.12)),url(${detailPhotos[activePhoto]})` }}><em>В наличии</em><button className="gallery-left" onClick={() => setActivePhoto((activePhoto - 1 + detailPhotos.length) % detailPhotos.length)}>‹</button><button className="gallery-right" onClick={() => setActivePhoto((activePhoto + 1) % detailPhotos.length)}>›</button><span>Фото {activePhoto + 1} / {detailPhotos.length}</span></div><div className="thumbnails">{detailPhotos.map((photo, index) => <button className={activePhoto === index ? 'active' : ''} key={`${photo}-${index}`} onClick={() => setActivePhoto(index)} style={{ backgroundImage: `url(${photo})` }} aria-label={`Открыть фото ${index + 1}`} />)}</div></div>
          </section>

          <section className="detail-grid">
            <article className="detail-card specs-card"><h2>Характеристики</h2><dl><div><dt>Год выпуска</dt><dd>{selectedCar.year}</dd></div><div><dt>Пробег</dt><dd>{formatNumber(selectedCar.mileage)} км</dd></div><div><dt>Двигатель</dt><dd>{selectedCar.fuel === 'Электро' ? 'Электродвигатель' : '2.5 л'}</dd></div><div><dt>Топливо</dt><dd>{selectedCar.fuel}</dd></div><div><dt>Коробка передач</dt><dd>Автомат</dd></div><div><dt>Привод</dt><dd>{selectedCar.drive}</dd></div><div><dt>Цвет</dt><dd>Чёрный</dd></div><div><dt>Страна</dt><dd>Южная Корея</dd></div></dl></article>
            <article className="detail-card description-card"><h2>Описание</h2><p>{selectedCar.name} в отличном техническом состоянии. Автомобиль прошёл первичную проверку, имеет чистый салон и подтверждённую историю обслуживания.</p><h3>Комплектация <small>{selectedEquipment.length} опций</small></h3>{selectedEquipment.length ? <><div className={`equipment ${equipmentOpen ? 'expanded' : ''}`}>{visibleEquipment.map((option) => <span key={option.id}><b>{option.icon}</b><small>{option.label}</small></span>)}</div>{selectedEquipment.length > 6 && <button type="button" className="equipment-toggle" aria-expanded={equipmentOpen} onClick={() => setEquipmentOpen((current) => !current)}>{equipmentOpen ? 'Скрыть комплектацию' : `Посмотреть все (${selectedEquipment.length})`} <i>{equipmentOpen ? '↑' : '↓'}</i></button>}</> : <p className="equipment-empty">Комплектация не указана</p>}</article>
            <article id="detail-request" className="detail-card request-card"><h2>Заказать экспорт</h2><p>Оставьте заявку — рассчитаем доставку в вашу страну.</p>{requestSent ? <div className="success-message"><b>✓ Заявка отправлена</b><span>Мы свяжемся с вами в ближайшее время.</span></div> : <form onSubmit={submitInquiry}><input name="name" required placeholder="Ваше имя" /><input name="phone" required type="tel" placeholder="Телефон / WhatsApp" /><select name="country" required defaultValue=""><option value="" disabled>Страна назначения</option><option>Россия</option><option>Казахстан</option><option>Германия</option><option>Другая страна</option></select><textarea name="message" placeholder="Комментарий (необязательно)" />{requestError && <span className="request-error">{requestError}</span>}<button className="button button-gold" type="submit">Отправить заявку</button></form>}</article>
          </section>

          <section className="export-row"><article className="export-process"><h2>Как проходит экспорт</h2><div>{steps.slice(0,4).map(([number,title]) => <span key={number}><b>{number}</b><small>{title}</small></span>)}</div></article><article className="export-total"><p>Примерная стоимость с доставкой</p><span>Казахстан</span><strong>₩ {formatNumber(exportPrice)}</strong><small>Предварительный расчёт, включая основные расходы</small><a href="#detail-request">Рассчитать для другой страны →</a></article></section>
        </div>
        <footer className="detail-footer"><div className="copyright">© 2026 DH Export. Все права защищены.</div></footer>
      </main>
    )
  }

  return (
    <main id="top">
      <header className="header">
        <div className="container nav-wrap">
          <Mark />
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Открыть меню">{menuOpen ? '×' : '☰'}</button>
          <nav className={menuOpen ? 'nav open' : 'nav'}>
            <a className="active" href="#top" onClick={closeMenu}>Главная</a>
            <a href="#cars" onClick={closeMenu}>Авто в наличии</a>
            <a href="#process" onClick={closeMenu}>Как мы работаем</a>
            <a href="#about" onClick={closeMenu}>О нас</a>
            <a href="#contacts" onClick={closeMenu}>Контакты</a>
          </nav>
          <div className="nav-actions"><button className="language">RU</button><a className="button button-outline" href="#contacts">Связаться</a></div>
        </div>
      </header>

      <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(5,10,15,.98) 0%, rgba(5,10,15,.76) 39%, rgba(5,10,15,.08) 76%), url(${heroImage})` }}>
        <div className="container hero-content">
          <p className="eyebrow">Автомобили из Южной Кореи</p>
          <h1>Надёжные автомобили<br />из Кореи на экспорт</h1>
          <p className="hero-copy">Подбираем, проверяем и доставляем автомобили в любую точку мира</p>
          <div className="hero-buttons"><a className="button button-gold" href="#cars">Подобрать авто</a><a className="button button-glass" href="#cars">Смотреть в наличии</a></div>
          <div className="hero-benefits">
            <div><b>◇</b><span><strong>Честные условия</strong><small>Без скрытых платежей</small></span></div>
            <div><b>✓</b><span><strong>Полная проверка</strong><small>Перед покупкой</small></span></div>
            <div><b>◎</b><span><strong>Доставка по миру</strong><small>Быстро и безопасно</small></span></div>
          </div>
        </div>
      </section>

      <section className="dark-section">
        <div className="container">
          <div className="stats">
            <div><span>🚘</span><p><strong>1000+</strong><small>автомобилей экспортировано</small></p></div>
            <div><span>◎</span><p><strong>15+</strong><small>стран доставки</small></p></div>
            <div><span>♢</span><p><strong>5 лет</strong><small>опыта в сфере автоэкспорта</small></p></div>
            <div><span>♙</span><p><strong>100%</strong><small>прозрачность сделки</small></p></div>
          </div>

          <section id="cars" className="cars-section">
            <div className="section-title"><div><p className="eyebrow">Каталог</p><h2>Автомобили в наличии</h2></div><div className="catalog-heading-actions"><button className={favoritesOnly ? 'active' : ''} onClick={() => setFavoritesOnly(!favoritesOnly)}>♥ Избранное ({favorites.length})</button><span className="results-count">{filteredCars.length} автомобилей</span></div></div>
            <div className="catalog-filters">
              <label className="search-field"><span>⌕</span><input name="search" value={filters.search} onChange={changeFilter} placeholder="Поиск по модели" /></label>
              <select name="brand" value={filters.brand} onChange={changeFilter}><option>Все марки</option><option>Genesis</option><option>Hyundai</option><option>Kia</option></select>
              <select name="year" value={filters.year} onChange={changeFilter}><option>Любой год</option><option value="2023">От 2023 года</option><option value="2022">От 2022 года</option><option value="2021">От 2021 года</option></select>
              <select name="fuel" value={filters.fuel} onChange={changeFilter}><option>Любое топливо</option><option>Бензин</option><option>Дизель</option><option>Электро</option></select>
              <select name="maxPrice" value={filters.maxPrice} onChange={changeFilter}><option>Любая цена</option><option value="35000000">До ₩35 млн</option><option value="40000000">До ₩40 млн</option><option value="45000000">До ₩45 млн</option></select>
              <select name="sort" value={filters.sort} onChange={changeFilter}><option>Сначала новые</option><option>Цена по возрастанию</option><option>Цена по убыванию</option></select>
              <button className="reset-button" type="button" onClick={resetFilters}>Сбросить</button>
            </div>
            <div className="car-grid">
              {filteredCars.map((car) => (
                <article className="car-card" key={car.id}>
                  <div className={`car-visual ${car.tone}`} style={{ backgroundImage: `url(${car.photos?.[0] || heroImage})`, backgroundSize: 'cover', backgroundPosition: car.photos?.[0] ? 'center' : `${35 + (car.id % 4) * 18}% center` }}><em>В НАЛИЧИИ</em><button className={favorites.includes(car.id) ? 'selected' : ''} onClick={() => toggleFavorite(car.id)} aria-label="Добавить в избранное">{favorites.includes(car.id) ? '♥' : '♡'}</button></div>
                  <div className="car-info"><h3>{car.name}</h3><p>{car.year} г. <i>•</i> {formatNumber(car.mileage)} км</p><strong>₩ {formatNumber(car.price)}</strong><div className="tags"><span>{car.fuel}</span><span>Автомат</span><span>{car.drive}</span></div><button className="details-button" type="button" onClick={() => openCar(car)}>Подробнее <span>→</span></button></div>
                </article>
              ))}
            </div>
            {!filteredCars.length && <div className="empty-state"><b>Автомобили не найдены</b><p>Попробуйте изменить параметры поиска.</p><button type="button" onClick={resetFilters}>Сбросить фильтры</button></div>}
          </section>
        </div>
      </section>

      <section id="process" className="process-section">
        <div className="container"><p className="eyebrow center">Просто и прозрачно</p><h2>Как мы работаем</h2><div className="steps">
          {steps.map(([number, title, text], index) => <article key={number}><div className="step-icon">{number}</div>{index < steps.length - 1 && <span className="arrow">→</span>}<h3>{title}</h3><p>{text}</p></article>)}
        </div></div>
      </section>

      <section id="about" className="why-section"><div className="container"><div className="why-heading"><p className="eyebrow">Почему мы</p><h2>Экспорт без лишних рисков</h2></div><div className="why-grid">
        <div><b>₩</b><span><strong>Прозрачные цены</strong><small>Все расходы известны до покупки автомобиля</small></span></div>
        <div><b>◉</b><span><strong>Поддержка 24/7</strong><small>Остаёмся на связи на каждом этапе</small></span></div>
        <div><b>▣</b><span><strong>Фото и видеоотчёты</strong><small>Показываем реальное состояние машины</small></span></div>
        <div><b>✓</b><span><strong>Безопасная сделка</strong><small>Работаем официально и по договору</small></span></div>
      </div></div></section>

      <footer id="contacts"><div className="container footer-grid"><div><Mark /><p>Профессиональный экспорт автомобилей из Кореи. Надёжность, честность и индивидуальный подход.</p></div><div><h4>Навигация</h4><a href="#cars">Авто в наличии</a><a href="#process">Как мы работаем</a><a href="#about">О нас</a><button className="admin-link" onClick={() => setAdminOpen(true)}>Администратор</button></div><div><h4>Связаться с нами</h4><a href="tel:+821057377308">+ 82 10 5737 7308</a><a href="mailto:drivehub.kr@gmail.com">drivehub.kr@gmail.com</a><span>Инчхон, Южная Корея</span></div><div className="footer-cta"><h3>Подберём автомобиль под ваш бюджет</h3><a className="button button-gold" href="mailto:info@dhexport.kr">Оставить заявку</a></div></div><div className="copyright">© 2026 DH Export. Все права защищены.</div></footer>
    </main>
  )
}

export default App
