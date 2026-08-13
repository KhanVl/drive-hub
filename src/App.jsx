import { useEffect, useRef, useState } from 'react'
import heroImage from './assets/hero-cars.jpg'
import logoDh from './assets/logo-dh.svg'
import AdminPanel from './AdminPanel'
import { defaultEquipment, equipmentOptions } from './equipmentOptions'
import ConditionMap from './ConditionMap'
import { damageTypes } from './damageTypes'
import CustomsCalculator from './CustomsCalculator'
import { getCarColor } from './carColors'
import { translatePublicPage } from './publicTranslations'
import { ArrowIcon, HeartIcon, SearchIcon } from './UiIcon'
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
  return <a className="brand" href="/" aria-label="DH Export — на главную"><img src={logoDh} alt="DH Export" /></a>
}

const iconPaths = {
  car: <><path d="M5 14.5 6.8 9a2 2 0 0 1 1.9-1.4h6.6A2 2 0 0 1 17.2 9l1.8 5.5"/><path d="M4 14.5h16v4H4zM7 18.5v2m10-2v2M7.5 14.5l1-2h7l1 2M7 16.5h.01M17 16.5h.01"/></>,
  shield: <><path d="M12 3 5.5 5.6v5.2c0 4.3 2.7 8.2 6.5 9.7 3.8-1.5 6.5-5.4 6.5-9.7V5.6L12 3Z"/><path d="m9 12 2 2 4-4"/></>,
  check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>,
  users: <><path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 10.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M17 11a3 3 0 1 0 0-6M19 14.8a4 4 0 0 1 2 3.5V20"/></>,
  wallet: <><path d="M4 6.5h14a2 2 0 0 1 2 2v9H5a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2h11"/><path d="M15 11h6v4h-6a2 2 0 0 1 0-4Z"/></>,
  headset: <><path d="M4 13v-1a8 8 0 0 1 16 0v1M4 13h3v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 1-2Zm16 0h-3v6h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-1-2ZM17 19c-1 1.3-2.3 2-4 2"/></>,
  camera: <><path d="M4 7.5h4l1.4-2h5.2l1.4 2h4v11H4z"/><circle cx="12" cy="13" r="3.5"/></>,
}

function AppIcon({ name }) {
  return <svg className="app-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{iconPaths[name]}</svg>
}

function App() {
  const [cars, setCars] = useState(fallbackCars)
  const suppressCardClick = useRef(false)
  const [catalogPage, setCatalogPage] = useState(1)
  const [menuOpen, setMenuOpen] = useState(false)
  const [language, setLanguage] = useState(() => localStorage.getItem('dh-language') || 'ru')
  const [activeSection, setActiveSection] = useState('top')
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
  const setAdminOpen = (value) => { setAdminOpenState(value); window.history.pushState({}, '', value ? '/admin' : '/') }
  const [filters, setFilters] = useState({ search: '', brand: 'Все марки', year: 'Любой год', fuel: 'Любое топливо', maxPrice: 'Любая цена', sort: 'Сначала новые' })

  const closeMenu = () => setMenuOpen(false)
  const selectSection = (section) => {
    setActiveSection(section)
    closeMenu()
  }
  useEffect(() => {
    fetch('/api/cars').then((response) => {
      if (!response.ok) throw new Error('API недоступен')
      return response.json()
    }).then(setCars).catch(() => {})
  }, [])
  useEffect(() => localStorage.setItem('dh-favorites', JSON.stringify(favorites)), [favorites])
  useEffect(() => {
    localStorage.setItem('dh-language', language)
    document.documentElement.lang = language
    if (language !== 'en' || adminOpen) return undefined
    const root = document.querySelector('[data-public-site]')
    const applyTranslation = () => translatePublicPage(root)
    applyTranslation()
    const observer = new MutationObserver(applyTranslation)
    if (root) observer.observe(root, { childList: true, characterData: true, subtree: true })
    return () => observer.disconnect()
  }, [language, adminOpen, selectedCar])
  useEffect(() => {
    const sections = ['cars', 'process']
    const updateActiveSection = () => {
      const marker = window.scrollY + 140
      let current = 'top'
      sections.forEach((section) => {
        const element = document.getElementById(section)
        if (element && element.offsetTop <= marker) current = section
      })
      setActiveSection(current)
    }
    updateActiveSection()
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    return () => window.removeEventListener('scroll', updateActiveSection)
  }, [])
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
  const changeFilter = (event) => {
    suppressCardClick.current = true
    window.setTimeout(() => { suppressCardClick.current = false }, 400)
    setCatalogPage(1)
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
  }
  const resetFilters = () => {
    setCatalogPage(1)
    setFilters({ search: '', brand: 'Все марки', year: 'Любой год', fuel: 'Любое топливо', maxPrice: 'Любая цена', sort: 'Сначала новые' })
  }
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
  const carsPerPage = 8
  const totalCatalogPages = Math.max(1, Math.ceil(filteredCars.length / carsPerPage))
  const currentCatalogPage = Math.min(catalogPage, totalCatalogPages)
  const visibleCars = filteredCars.slice((currentCatalogPage - 1) * carsPerPage, currentCatalogPage * carsPerPage)

  const openCatalogPage = (page) => {
    setCatalogPage(page)
    document.getElementById('cars')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const openCar = (car) => {
    setSelectedCar(car)
    setEquipmentOpen(false)
    setActivePhoto(0)
    setRequestSent(false)
    window.history.pushState({}, '', `/cars/${car.id}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const openCarFromCard = (car) => {
    if (suppressCardClick.current) return
    openCar(car)
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
  if (adminOpen) return <AdminPanel token={adminToken} setToken={setAdminToken} onClose={() => setAdminOpen(false)} onCarsChanged={() => fetch('/api/cars').then((response) => response.json()).then(setCars)} />

  if (selectedCar) {
    const exportPrice = selectedCar.price + 6200000
    const detailPhotos = selectedCar.photos?.length ? selectedCar.photos : [heroImage, heroImage, heroImage, heroImage]
    const selectedEquipment = equipmentOptions.filter((option) => (Array.isArray(selectedCar.equipment) ? selectedCar.equipment : defaultEquipment).includes(option.id))
    const visibleEquipment = equipmentOpen ? selectedEquipment : selectedEquipment.slice(0, 6)
    return (
      <main data-public-site key={language} className="detail-page">
        <header className="header detail-header"><div className="container nav-wrap"><Mark /><button className="back-link" onClick={() => setSelectedCar(null)}>← Вернуться в каталог</button><div className="detail-header-actions"><select className="language" value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Язык"><option value="ru">RU</option><option value="en">EN</option></select><a className="button button-outline" href="#detail-request">Связаться</a></div></div></header>
        <div className="container detail-content">
          <div className="breadcrumbs"><button onClick={() => setSelectedCar(null)}>Главная</button><span>›</span><button onClick={() => setSelectedCar(null)}>Авто в наличии</button><span>›</span><b>{selectedCar.name}</b></div>
          <section className="detail-hero">
            <div className="detail-summary"><p className="eyebrow">В наличии в Корее</p><h1>{selectedCar.name}</h1><div className="quick-specs"><span><b>{selectedCar.year}</b><small>Год выпуска</small></span><span><b>{formatNumber(selectedCar.mileage)} км</b><small>Пробег</small></span><span><b>{selectedCar.fuel}</b><small>Топливо</small></span><span><b>Автомат</b><small>Коробка</small></span></div><div className="detail-price">₩ {formatNumber(selectedCar.price)}</div><div className="detail-actions"><a className="button button-gold" href="#detail-request">Заказать экспорт</a><a className="button button-glass" href="tel:+821012345678">Позвонить нам</a></div><button className={`favorite-button ${favorites.includes(selectedCar.id) ? 'selected' : ''}`} onClick={() => toggleFavorite(selectedCar.id)}>{favorites.includes(selectedCar.id) ? '♥ В избранном' : '♡ Добавить в избранное'}</button></div>
            <div className="gallery"><div className={`main-photo photo-${activePhoto}`} style={{ backgroundImage: `linear-gradient(rgba(5,10,15,.05),rgba(5,10,15,.12)),url(${detailPhotos[activePhoto]})` }}><em>В наличии</em><button className="gallery-left" onClick={() => setActivePhoto((activePhoto - 1 + detailPhotos.length) % detailPhotos.length)}>‹</button><button className="gallery-right" onClick={() => setActivePhoto((activePhoto + 1) % detailPhotos.length)}>›</button><span>Фото {activePhoto + 1} / {detailPhotos.length}</span></div><div className="thumbnails">{detailPhotos.map((photo, index) => <button className={activePhoto === index ? 'active' : ''} key={`${photo}-${index}`} onClick={() => setActivePhoto(index)} style={{ backgroundImage: `url(${photo})` }} aria-label={`Открыть фото ${index + 1}`} />)}</div></div>
          </section>

          <section className="detail-grid">
            <article className="detail-card specs-card"><h2>Характеристики</h2><dl><div><dt>Год выпуска</dt><dd>{selectedCar.year}</dd></div><div><dt>Пробег</dt><dd>{formatNumber(selectedCar.mileage)} км</dd></div><div><dt>Двигатель</dt><dd>{selectedCar.fuel === 'Электро' ? 'Электродвигатель' : '2.5 л'}</dd></div><div><dt>Топливо</dt><dd>{selectedCar.fuel}</dd></div><div><dt>Коробка передач</dt><dd>Автомат</dd></div><div><dt>Привод</dt><dd>{selectedCar.drive}</dd></div><div><dt>Цвет</dt><dd>{getCarColor(selectedCar.tone).label}</dd></div><div><dt>Страна</dt><dd>Южная Корея</dd></div></dl></article>
            <article className="detail-card description-card"><h2>Описание</h2><p>{selectedCar.name} в отличном техническом состоянии. Автомобиль прошёл первичную проверку, имеет чистый салон и подтверждённую историю обслуживания.</p><h3>Комплектация <small>{selectedEquipment.length} опций</small></h3>{selectedEquipment.length ? <><div className={`equipment ${equipmentOpen ? 'expanded' : ''}`}>{visibleEquipment.map((option) => <span key={option.id}><b>{option.icon}</b><small>{option.label}</small></span>)}</div>{selectedEquipment.length > 6 && <button type="button" className="equipment-toggle" aria-expanded={equipmentOpen} onClick={() => setEquipmentOpen((current) => !current)}>{equipmentOpen ? 'Скрыть комплектацию' : `Посмотреть все (${selectedEquipment.length})`} <i>{equipmentOpen ? '↑' : '↓'}</i></button>}</> : <p className="equipment-empty">Комплектация не указана</p>}</article>
            <article id="detail-request" className="detail-card request-card"><h2>Заказать экспорт</h2><p>Оставьте заявку — рассчитаем доставку в вашу страну.</p>{requestSent ? <div className="success-message"><b>✓ Заявка отправлена</b><span>Мы свяжемся с вами в ближайшее время.</span></div> : <form onSubmit={submitInquiry}><input name="name" required placeholder="Ваше имя" /><input name="phone" required type="tel" placeholder="Телефон / WhatsApp" /><select name="country" required defaultValue=""><option value="" disabled>Страна назначения</option><option>Россия</option><option>Казахстан</option><option>Германия</option><option>Другая страна</option></select><textarea name="message" placeholder="Комментарий (необязательно)" />{requestError && <span className="request-error">{requestError}</span>}<button className="button button-gold" type="submit">Отправить заявку</button></form>}</article>
          </section>

          <section className="vehicle-condition"><div className="condition-heading"><p className="eyebrow">Отчёт осмотра</p><h2>Состояние кузова</h2><p>{selectedCar.conditionMarks?.length ? 'На схеме отмечены обнаруженные особенности кузова.' : 'При осмотре кузова заметные повреждения не отмечены.'}</p></div><ConditionMap marks={selectedCar.conditionMarks || []}/><div className="damage-legend">{damageTypes.map((type) => <span key={type.id}><i style={{ background: type.color }}>{type.symbol}</i>{type.label}</span>)}</div></section>
          <section className="export-row"><article className="export-process"><h2>Как проходит экспорт</h2><div>{steps.slice(0,4).map(([number,title]) => <span key={number}><b>{number}</b><small>{title}</small></span>)}</div></article><article className="export-total"><p>Примерная стоимость с доставкой</p><span>Казахстан</span><strong>₩ {formatNumber(exportPrice)}</strong><small>Предварительный расчёт, включая основные расходы</small><a href="#calculator">Открыть калькулятор растаможки →</a></article></section>
          <CustomsCalculator car={selectedCar}/>
        </div>
        <footer className="detail-footer"><div className="copyright">© 2026 DH Export. Все права защищены.</div></footer>
      </main>
    )
  }

  return (
    <main id="top" data-public-site key={language}>
      <header className="header">
        <div className="container nav-wrap">
          <Mark />
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Открыть меню">{menuOpen ? '×' : '☰'}</button>
          <nav className={menuOpen ? 'nav open' : 'nav'}>
            <a className={activeSection === 'top' ? 'active' : ''} href="#top" onClick={() => selectSection('top')}>Главная</a>
            <a className={activeSection === 'cars' ? 'active' : ''} href="#cars" onClick={() => selectSection('cars')}>Авто в наличии</a>
            <a className={activeSection === 'process' ? 'active' : ''} href="#process" onClick={() => selectSection('process')}>Как мы работаем</a>
          </nav>
          <div className="nav-actions"><select className="language" value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Язык"><option value="ru">RU</option><option value="en">EN</option></select><a className="button button-outline" href="#contacts">Связаться</a></div>
        </div>
      </header>

      <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(5,10,15,.98) 0%, rgba(5,10,15,.76) 39%, rgba(5,10,15,.08) 76%), url(${heroImage})` }}>
        <div className="container hero-content">
          <p className="eyebrow">Автомобили из Южной Кореи</p>
          <h1>Надёжные автомобили<br />из Кореи на экспорт</h1>
          <p className="hero-copy">Подбираем, проверяем и доставляем автомобили в любую точку мира</p>
          <div className="hero-buttons"><a className="button button-gold" href="#cars">Подобрать авто</a><a className="button button-glass" href="#cars">Смотреть в наличии</a></div>
          <div className="hero-benefits">
            <div><b><AppIcon name="shield" /></b><span><strong>Честные условия</strong><small>Без скрытых платежей</small></span></div>
            <div><b><AppIcon name="check" /></b><span><strong>Полная проверка</strong><small>Перед покупкой</small></span></div>
            <div><b><AppIcon name="globe" /></b><span><strong>Доставка по миру</strong><small>Быстро и безопасно</small></span></div>
          </div>
        </div>
      </section>

      <section className="dark-section">
        <div className="container">
          <div className="stats">
            <div><span><AppIcon name="car" /></span><p><strong>500+</strong><small>автомобилей экспортировано</small></p></div>
            <div><span><AppIcon name="globe" /></span><p><strong>15+</strong><small>стран доставки</small></p></div>
            <div><span><AppIcon name="shield" /></span><p><strong>5 лет</strong><small>опыта в сфере автоэкспорта</small></p></div>
            <div><span><AppIcon name="users" /></span><p><strong>100%</strong><small>прозрачность сделки</small></p></div>
          </div>

          <section id="cars" className="cars-section">
            <div className="section-title"><div><p className="eyebrow">Каталог</p><h2>Автомобили в наличии</h2></div><div className="catalog-heading-actions"><button className={favoritesOnly ? 'active' : ''} onClick={() => setFavoritesOnly(!favoritesOnly)}><HeartIcon filled={favoritesOnly} /><span>Избранное ({favorites.length})</span></button><span className="results-count">{filteredCars.length} автомобилей</span></div></div>
            <div className="catalog-filters">
              <label className="search-field"><span><SearchIcon /></span><input name="search" value={filters.search} onChange={changeFilter} placeholder="Поиск по модели" /></label>
              <select name="brand" value={filters.brand} onChange={changeFilter}><option>Все марки</option><option>Genesis</option><option>Hyundai</option><option>Kia</option></select>
              <select name="year" value={filters.year} onChange={changeFilter}><option>Любой год</option><option value="2023">От 2023 года</option><option value="2022">От 2022 года</option><option value="2021">От 2021 года</option></select>
              <select name="fuel" value={filters.fuel} onChange={changeFilter}><option>Любое топливо</option><option>Бензин</option><option>Дизель</option><option>Электро</option></select>
              <select name="maxPrice" value={filters.maxPrice} onChange={changeFilter}><option>Любая цена</option><option value="35000000">До ₩35 млн</option><option value="40000000">До ₩40 млн</option><option value="45000000">До ₩45 млн</option></select>
              <select name="sort" value={filters.sort} onChange={changeFilter}><option>Сначала новые</option><option>Цена по возрастанию</option><option>Цена по убыванию</option></select>
              <button className="reset-button" type="button" onClick={resetFilters}>Сбросить</button>
            </div>
            <div className="car-grid">
              {visibleCars.map((car) => (
                <article className="car-card" key={car.id} role="link" tabIndex="0" aria-label={`Открыть ${car.name}`} onClick={() => openCarFromCard(car)} onKeyDown={(event) => { if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('button')) { event.preventDefault(); openCar(car) } }}>
                  <div className={`car-visual ${car.tone}`} style={{ backgroundImage: `url(${car.photos?.[0] || heroImage})`, backgroundSize: 'cover', backgroundPosition: car.photos?.[0] ? 'center' : `${35 + (car.id % 4) * 18}% center` }}><em>В НАЛИЧИИ</em><button className={favorites.includes(car.id) ? 'selected' : ''} onClick={(event) => { event.stopPropagation(); toggleFavorite(car.id) }} aria-label="Добавить в избранное"><HeartIcon filled={favorites.includes(car.id)} /></button></div>
                  <div className="car-info"><h3>{car.name}</h3><p>{car.year} г. <i>•</i> {formatNumber(car.mileage)} км</p><strong>₩ {formatNumber(car.price)}</strong><div className="tags"><span>{car.fuel}</span><span>Автомат</span><span>{car.drive}</span></div><button className="details-button" type="button" onClick={(event) => { event.stopPropagation(); openCar(car) }}>Подробнее <span><ArrowIcon /></span></button></div>
                </article>
              ))}
            </div>
            {totalCatalogPages > 1 && <div className="catalog-pagination" role="navigation" aria-label="Страницы каталога">
              <button type="button" disabled={currentCatalogPage === 1} onClick={() => openCatalogPage(currentCatalogPage - 1)} aria-label="Предыдущая страница"><ArrowIcon direction="left" /></button>
              {Array.from({ length: totalCatalogPages }, (_, index) => index + 1).map((page) => <button type="button" className={page === currentCatalogPage ? 'active' : ''} aria-current={page === currentCatalogPage ? 'page' : undefined} onClick={() => openCatalogPage(page)} key={page}>{page}</button>)}
              <button type="button" disabled={currentCatalogPage === totalCatalogPages} onClick={() => openCatalogPage(currentCatalogPage + 1)} aria-label="Следующая страница"><ArrowIcon /></button>
            </div>}
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
        <div><b><AppIcon name="wallet" /></b><span><strong>Прозрачные цены</strong><small>Все расходы известны до покупки автомобиля</small></span></div>
        <div><b><AppIcon name="headset" /></b><span><strong>Поддержка 24/7</strong><small>Остаёмся на связи на каждом этапе</small></span></div>
        <div><b><AppIcon name="camera" /></b><span><strong>Фото и видеоотчёты</strong><small>Показываем реальное состояние машины</small></span></div>
        <div><b><AppIcon name="shield" /></b><span><strong>Безопасная сделка</strong><small>Работаем официально и по договору</small></span></div>
      </div></div></section>

      <footer id="contacts"><div className="container footer-grid"><div><Mark /><p>Профессиональный экспорт автомобилей из Кореи. Надёжность, честность и индивидуальный подход.</p><div className="social-links"><a href="https://wa.me/821057377308" target="_blank" rel="noreferrer" aria-label="Написать в WhatsApp"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48"><path fill="#fff" d="M4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5c5.1,0,9.8,2,13.4,5.6	C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19c0,0,0,0,0,0h0c-3.2,0-6.3-0.8-9.1-2.3L4.9,43.3z"></path><path fill="#fff" d="M4.9,43.8c-0.1,0-0.3-0.1-0.4-0.1c-0.1-0.1-0.2-0.3-0.1-0.5L7,33.5c-1.6-2.9-2.5-6.2-2.5-9.6	C4.5,13.2,13.3,4.5,24,4.5c5.2,0,10.1,2,13.8,5.7c3.7,3.7,5.7,8.6,5.7,13.8c0,10.7-8.7,19.5-19.5,19.5c-3.2,0-6.3-0.8-9.1-2.3	L5,43.8C5,43.8,4.9,43.8,4.9,43.8z"></path><path fill="#cfd8dc" d="M24,5c5.1,0,9.8,2,13.4,5.6C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19h0c-3.2,0-6.3-0.8-9.1-2.3	L4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5 M24,43L24,43L24,43 M24,43L24,43L24,43 M24,4L24,4C13,4,4,13,4,24	c0,3.4,0.8,6.7,2.5,9.6L3.9,43c-0.1,0.3,0,0.7,0.3,1c0.2,0.2,0.4,0.3,0.7,0.3c0.1,0,0.2,0,0.3,0l9.7-2.5c2.8,1.5,6,2.2,9.2,2.2	c11,0,20-9,20-20c0-5.3-2.1-10.4-5.8-14.1C34.4,6.1,29.4,4,24,4L24,4z"></path><path fill="#40c351" d="M35.2,12.8c-3-3-6.9-4.6-11.2-4.6C15.3,8.2,8.2,15.3,8.2,24c0,3,0.8,5.9,2.4,8.4L11,33l-1.6,5.8	l6-1.6l0.6,0.3c2.4,1.4,5.2,2.2,8,2.2h0c8.7,0,15.8-7.1,15.8-15.8C39.8,19.8,38.2,15.8,35.2,12.8z"></path><path fill="#fff" fill-rule="evenodd" d="M19.3,16c-0.4-0.8-0.7-0.8-1.1-0.8c-0.3,0-0.6,0-0.9,0	s-0.8,0.1-1.3,0.6c-0.4,0.5-1.7,1.6-1.7,4s1.7,4.6,1.9,4.9s3.3,5.3,8.1,7.2c4,1.6,4.8,1.3,5.7,1.2c0.9-0.1,2.8-1.1,3.2-2.3	c0.4-1.1,0.4-2.1,0.3-2.3c-0.1-0.2-0.4-0.3-0.9-0.6s-2.8-1.4-3.2-1.5c-0.4-0.2-0.8-0.2-1.1,0.2c-0.3,0.5-1.2,1.5-1.5,1.9	c-0.3,0.3-0.6,0.4-1,0.1c-0.5-0.2-2-0.7-3.8-2.4c-1.4-1.3-2.4-2.8-2.6-3.3c-0.3-0.5,0-0.7,0.2-1c0.2-0.2,0.5-0.6,0.7-0.8	c0.2-0.3,0.3-0.5,0.5-0.8c0.2-0.3,0.1-0.6,0-0.8C20.6,19.3,19.7,17,19.3,16z" clip-rule="evenodd"></path></svg></a><a href="tg://resolve?phone=821057377308" aria-label="Написать в Telegram"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48"><path fill="#29b6f6" d="M24,4C13,4,4,13,4,24s9,20,20,20s20-9,20-20S35,4,24,4z"></path><path fill="#fff" d="M34,15l-3.7,19.1c0,0-0.2,0.9-1.2,0.9c-0.6,0-0.9-0.3-0.9-0.3L20,28l-4-2l-5.1-1.4c0,0-0.9-0.3-0.9-1	c0-0.6,0.9-0.9,0.9-0.9l21.3-8.5c0,0,0.7-0.2,1.1-0.2c0.3,0,0.6,0.1,0.6,0.5C34,14.8,34,15,34,15z"></path><path fill="#b0bec5" d="M23,30.5l-3.4,3.4c0,0-0.1,0.1-0.3,0.1c-0.1,0-0.1,0-0.2,0l1-6L23,30.5z"></path><path fill="#cfd8dc" d="M29.9,18.2c-0.2-0.2-0.5-0.3-0.7-0.1L16,26c0,0,2.1,5.9,2.4,6.9c0.3,1,0.6,1,0.6,1l1-6l9.8-9.1	C30,18.7,30.1,18.4,29.9,18.2z"></path></svg></a></div></div><div><h4>Навигация</h4><a href="#cars" onClick={() => selectSection('cars')}>Авто в наличии</a><a href="#process" onClick={() => selectSection('process')}>Как мы работаем</a><button className="admin-link" onClick={() => setAdminOpen(true)}>Администратор</button></div><div><h4>Связаться с нами</h4><a href="tel:+821057377308">+ 82 10 5737 7308</a><a href="mailto:drivehub.kr@gmail.com">drivehub.kr@gmail.com</a><span>Инчхон, Южная Корея</span></div><div className="footer-cta"><h3>Подберём автомобиль под ваш бюджет</h3><a className="button button-gold" href="https://wa.me/821057377308" target="_blank" rel="noreferrer">Оставить заявку</a></div></div><div className="copyright">© 2026 DH Export. Все права защищены.</div></footer>
    </main>
  )
}

export default App
