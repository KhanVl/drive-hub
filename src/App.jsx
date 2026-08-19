import { useEffect, useRef, useState } from 'react'
import heroImage from './assets/hero-cars.jpg'
import heroBackground from './assets/hero-background.jpg'
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
  return <a className="brand" href="/" aria-label="DH Export — Home"><img src={logoDh} alt="DH Export" /></a>
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
  const isEnglish = language === 'en'
  const localizeLabel = (ruText, enText) => isEnglish ? enText : ruText
  const localizeCarValue = (value) => {
    const mapping = {
      'Бензин': 'Petrol',
      'Дизель': 'Diesel',
      'Электро': 'Electric',
      'Гибрид': 'Hybrid',
      'Передний привод': 'Front-wheel drive',
      'Задний привод': 'Rear-wheel drive',
      'Полный привод': 'All-wheel drive',
      'Автомат': 'Automatic',
      'Все марки': 'All makes',
      'Любой год': 'Any year',
      'Любое топливо': 'Any fuel',
      'Любая цена': 'Any price',
      'Сначала новые': 'Newest first',
      'В НАЛИЧИИ': 'IN STOCK',
      'Каталог': 'Inventory',
      'Автомобили в наличии': 'Cars in stock',
      'Как мы работаем': 'How it works',
      'Связаться': 'Contact us',
      'Подобрать авто': 'Find a car',
      'Смотреть в наличии': 'View inventory',
      'Главная': 'Home',
      'Вернуться в каталог': 'Back to inventory',
      'В наличии в Корее': 'Available in Korea',
      'Год выпуска': 'Model year',
      'Пробег': 'Mileage',
      'Топливо': 'Fuel',
      'Коробка': 'Transmission',
      'Заказать экспорт': 'Request export',
      'Позвонить нам': 'Call us',
      'В избранном': 'Saved',
      'Добавить в избранное': 'Add to favourites',
      'Характеристики': 'Specifications',
      'Двигатель': 'Engine',
      'Коробка передач': 'Transmission',
      'Привод': 'Drivetrain',
      'Цвет': 'Colour',
      'Страна': 'Country',
      'Южная Корея': 'South Korea',
      'Описание': 'Description',
      'Комплектация': 'Features',
      'Комплектация не указана': 'No features specified',
      'Ваше имя': 'Your name',
      'Телефон / WhatsApp': 'Phone / WhatsApp',
      'Страна назначения': 'Destination country',
      'Россия': 'Russia',
      'Казахстан': 'Kazakhstan',
      'Германия': 'Germany',
      'Другая страна': 'Other country',
      'Комментарий (необязательно)': 'Message (optional)',
      'Отправить заявку': 'Submit enquiry',
      'Отчёт осмотра': 'Inspection report',
      'Состояние кузова': 'Body condition',
      'Как проходит экспорт': 'Export process',
      'Примерная стоимость с доставкой': 'Estimated price including delivery',
      'Предварительный расчёт, включая основные расходы': 'Preliminary estimate including major costs',
      'Открыть калькулятор растаможки': 'Open customs calculator',
    }
    return isEnglish ? (mapping[value] ?? value) : value
  }
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
  const [filters, setFilters] = useState({
    search: '',
    brand: isEnglish ? 'All makes' : 'Все марки',
    year: isEnglish ? 'Any year' : 'Любой год',
    fuel: isEnglish ? 'Any fuel' : 'Любое топливо',
    maxPrice: isEnglish ? 'Any price' : 'Любая цена',
    sort: isEnglish ? 'Newest first' : 'Сначала новые',
  })

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      brand: current.brand === 'Все марки' || current.brand === 'All makes' ? (isEnglish ? 'All makes' : 'Все марки') : current.brand,
      year: current.year === 'Любой год' || current.year === 'Any year' ? (isEnglish ? 'Any year' : 'Любой год') : current.year,
      fuel: current.fuel === 'Любое топливо' || current.fuel === 'Any fuel' ? (isEnglish ? 'Any fuel' : 'Любое топливо') : current.fuel,
      maxPrice: current.maxPrice === 'Любая цена' || current.maxPrice === 'Any price' ? (isEnglish ? 'Any price' : 'Любая цена') : current.maxPrice,
      sort: current.sort === 'Сначала новые' || current.sort === 'Newest first' ? (isEnglish ? 'Newest first' : 'Сначала новые') : current.sort,
    }))
  }, [language])

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
    document.title = adminOpen
      ? 'Admin panel — DH Export'
      : selectedCar
        ? (language === 'en' ? `${selectedCar.name} — buy from Korea | DH Export` : `${selectedCar.name} — купить из Кореи | DH Export`)
        : (language === 'en' ? 'Cars from Korea for export | DH Export' : 'Автомобили из Кореи на экспорт | DH Export')
    document.querySelector('meta[name="description"]')?.setAttribute('content', selectedCar
      ? (language === 'en'
        ? `${selectedCar.name}, ${selectedCar.year}, mileage ${new Intl.NumberFormat('en-US').format(selectedCar.mileage)} km. Delivery of the vehicle from South Korea.`
        : `${selectedCar.name}, ${selectedCar.year} год, пробег ${new Intl.NumberFormat('ru-RU').format(selectedCar.mileage)} км. Доставка автомобиля из Южной Кореи.`)
      : (language === 'en'
        ? 'Vehicle sourcing, inspection and delivery from South Korea worldwide.'
        : 'Подбор, проверка и доставка автомобилей из Южной Кореи по всему миру.'))
  }, [selectedCar, adminOpen, language])
  const changeFilter = (event) => {
    suppressCardClick.current = true
    window.setTimeout(() => { suppressCardClick.current = false }, 400)
    setCatalogPage(1)
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
  }
  const resetFilters = () => {
    setCatalogPage(1)
    setFilters({
      search: '',
      brand: isEnglish ? 'All makes' : 'Все марки',
      year: isEnglish ? 'Any year' : 'Любой год',
      fuel: isEnglish ? 'Any fuel' : 'Любое топливо',
      maxPrice: isEnglish ? 'Any price' : 'Любая цена',
      sort: isEnglish ? 'Newest first' : 'Сначала новые',
    })
  }
  const toggleFavorite = (id) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const formatNumber = (number) => new Intl.NumberFormat('ru-RU').format(number)
  const allMakes = isEnglish ? 'All makes' : 'Все марки'
  const anyYear = isEnglish ? 'Any year' : 'Любой год'
  const anyFuel = isEnglish ? 'Any fuel' : 'Любое топливо'
  const anyPrice = isEnglish ? 'Any price' : 'Любая цена'
  const newestFirst = isEnglish ? 'Newest first' : 'Сначала новые'
  const lowToHigh = isEnglish ? 'Price: low to high' : 'Цена по возрастанию'
  const highToLow = isEnglish ? 'Price: high to low' : 'Цена по убыванию'
  const filteredCars = cars
    .filter((car) => car.name.toLowerCase().includes(filters.search.toLowerCase().trim()))
    .filter((car) => filters.brand === allMakes || car.brand === filters.brand)
    .filter((car) => filters.year === anyYear || car.year >= Number(filters.year))
    .filter((car) => filters.fuel === anyFuel || car.fuel === filters.fuel)
    .filter((car) => filters.maxPrice === anyPrice || car.price <= Number(filters.maxPrice))
    .filter((car) => !favoritesOnly || favorites.includes(car.id))
    .sort((a, b) => filters.sort === lowToHigh ? a.price - b.price : filters.sort === highToLow ? b.price - a.price : b.year - a.year)
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
    const detailPhotos = selectedCar.photos?.length ? selectedCar.photos : [heroImage, heroImage, heroImage, heroImage]
    const selectedEquipment = equipmentOptions.filter((option) => (Array.isArray(selectedCar.equipment) ? selectedCar.equipment : defaultEquipment).includes(option.id))
    const visibleEquipment = equipmentOpen ? selectedEquipment : selectedEquipment.slice(0, 6)
    return (
      <main data-public-site key={language} className="detail-page">
        <header className="header detail-header"><div className="container nav-wrap"><Mark /><button className="back-link" onClick={() => setSelectedCar(null)}>← {localizeLabel('Вернуться в каталог', 'Back to inventory')}</button><div className="detail-header-actions"><select className="language" value={language} onChange={(event) => setLanguage(event.target.value)} aria-label={localizeLabel('Язык', 'Language')}><option value="ru">RU</option><option value="en">EN</option></select><a className="button button-outline" href="#detail-request">{localizeLabel('Связаться', 'Contact us')}</a></div></div></header>
        <div className="container detail-content">
          <div className="breadcrumbs"><button onClick={() => setSelectedCar(null)}>{localizeLabel('Главная', 'Home')}</button><span>›</span><button onClick={() => setSelectedCar(null)}>{localizeLabel('Авто в наличии', 'Cars in stock')}</button><span>›</span><b>{selectedCar.name}</b></div>
          <section className="detail-hero">
            <div className="detail-summary"><p className="eyebrow">{localizeLabel('В наличии в Корее', 'Available in Korea')}</p><h1>{selectedCar.name}</h1><div className="quick-specs"><span><b>{selectedCar.year}</b><small>{localizeLabel('Год выпуска', 'Model year')}</small></span><span><b>{formatNumber(selectedCar.mileage)} {isEnglish ? 'km' : 'км'}</b><small>{localizeLabel('Пробег', 'Mileage')}</small></span><span><b>{localizeCarValue(selectedCar.fuel)}</b><small>{localizeLabel('Топливо', 'Fuel')}</small></span><span><b>{localizeCarValue('Автомат')}</b><small>{localizeLabel('Коробка', 'Transmission')}</small></span></div><div className="detail-price">₩ {formatNumber(selectedCar.price)}</div><div className="detail-actions"><a className="button button-gold" href="#detail-request">{localizeLabel('Заказать экспорт', 'Request export')}</a><a className="button button-glass" href="tel:+821012345678">{localizeLabel('Позвонить нам', 'Call us')}</a></div><button className={`favorite-button ${favorites.includes(selectedCar.id) ? 'selected' : ''}`} onClick={() => toggleFavorite(selectedCar.id)}>{favorites.includes(selectedCar.id) ? `♥ ${localizeLabel('В избранном', 'Saved')}` : `♡ ${localizeLabel('Добавить в избранное', 'Add to favourites')}`}</button></div>
            <div className="gallery"><div className={`main-photo photo-${activePhoto}`} style={{ backgroundImage: `linear-gradient(rgba(5,10,15,.05),rgba(5,10,15,.12)),url(${detailPhotos[activePhoto]})` }}><em>{localizeLabel('В наличии', 'In stock')}</em><button className="gallery-left" onClick={() => setActivePhoto((activePhoto - 1 + detailPhotos.length) % detailPhotos.length)}>‹</button><button className="gallery-right" onClick={() => setActivePhoto((activePhoto + 1) % detailPhotos.length)}>›</button><span>{isEnglish ? 'Photo' : 'Фото'} {activePhoto + 1} / {detailPhotos.length}</span></div><div className="thumbnails">{detailPhotos.map((photo, index) => <button className={activePhoto === index ? 'active' : ''} key={`${photo}-${index}`} onClick={() => setActivePhoto(index)} style={{ backgroundImage: `url(${photo})` }} aria-label={isEnglish ? `Open photo ${index + 1}` : `Открыть фото ${index + 1}`} />)}</div></div>
          </section>

          <section className="detail-grid">
            <article className="detail-card specs-card"><h2>{localizeLabel('Характеристики', 'Specifications')}</h2><dl><div><dt>{localizeLabel('Год выпуска', 'Model year')}</dt><dd>{selectedCar.year}</dd></div><div><dt>{localizeLabel('Пробег', 'Mileage')}</dt><dd>{formatNumber(selectedCar.mileage)} {isEnglish ? 'km' : 'км'}</dd></div><div><dt>{localizeLabel('Двигатель', 'Engine')}</dt><dd>{selectedCar.fuel === 'Электро' ? (isEnglish ? 'Electric motor' : 'Электродвигатель') : (isEnglish ? '2.5 L' : '2.5 л')}</dd></div><div><dt>{localizeLabel('Топливо', 'Fuel')}</dt><dd>{localizeCarValue(selectedCar.fuel)}</dd></div><div><dt>{localizeLabel('Коробка передач', 'Transmission')}</dt><dd>{localizeCarValue('Автомат')}</dd></div><div><dt>{localizeLabel('Привод', 'Drivetrain')}</dt><dd>{localizeCarValue(selectedCar.drive)}</dd></div><div><dt>{localizeLabel('Цвет', 'Colour')}</dt><dd>{getCarColor(selectedCar.tone).label}</dd></div><div><dt>{localizeLabel('Страна', 'Country')}</dt><dd>{localizeLabel('Южная Корея', 'South Korea')}</dd></div></dl></article>
            <article className="detail-card description-card"><h2>{localizeLabel('Описание', 'Description')}</h2><p>{selectedCar.name}{isEnglish ? ' is in excellent technical condition. The vehicle has passed an initial inspection and has a clean interior and verified service history.' : ' в отличном техническом состоянии. Автомобиль прошёл первичную проверку, имеет чистый салон и подтверждённую историю обслуживания.'}</p><h3>{localizeLabel('Комплектация', 'Features')} <small>{selectedEquipment.length} {isEnglish ? 'options' : 'опций'}</small></h3>{selectedEquipment.length ? <><div className={`equipment ${equipmentOpen ? 'expanded' : ''}`}>{visibleEquipment.map((option) => <span key={option.id}><b>{option.icon}</b><small>{isEnglish ? option.labelEn : option.labelRu}</small></span>)}</div>{selectedEquipment.length > 6 && <button type="button" className="equipment-toggle" aria-expanded={equipmentOpen} onClick={() => setEquipmentOpen((current) => !current)}>{equipmentOpen ? (isEnglish ? 'Hide features' : 'Скрыть комплектацию') : `${isEnglish ? 'View all' : 'Посмотреть все'} (${selectedEquipment.length})`} <i>{equipmentOpen ? '↑' : '↓'}</i></button>}</> : <p className="equipment-empty">{localizeLabel('Комплектация не указана', 'No features specified')}</p>}</article>
            <article id="detail-request" className="detail-card request-card"><h2>{localizeLabel('Заказать экспорт', 'Request export')}</h2><p>{localizeLabel('Оставьте заявку — рассчитаем доставку в вашу страну.', 'Send an enquiry and we will calculate delivery to your country.')}</p>{requestSent ? <div className="success-message"><b>✓ {localizeLabel('Заявка отправлена', 'Enquiry sent')}</b><span>{localizeLabel('Мы свяжемся с вами в ближайшее время.', 'We will contact you shortly.')}</span></div> : <form onSubmit={submitInquiry}><input name="name" required placeholder={localizeLabel('Ваше имя', 'Your name')} /><input name="phone" required type="tel" placeholder={localizeLabel('Телефон / WhatsApp', 'Phone / WhatsApp')} /><select name="country" required defaultValue=""><option value="" disabled>{localizeLabel('Страна назначения', 'Destination country')}</option><option>{localizeLabel('Россия', 'Russia')}</option><option>{localizeLabel('Казахстан', 'Kazakhstan')}</option><option>{localizeLabel('Германия', 'Germany')}</option><option>{localizeLabel('Другая страна', 'Other country')}</option></select><textarea name="message" placeholder={localizeLabel('Комментарий (необязательно)', 'Message (optional)')} />{requestError && <span className="request-error">{requestError}</span>}<button className="button button-gold" type="submit">{localizeLabel('Отправить заявку', 'Submit enquiry')}</button></form>}</article>
          </section>

          <section className="vehicle-condition"><div className="condition-heading"><p className="eyebrow">{localizeLabel('Отчёт осмотра', 'Inspection report')}</p><h2>{localizeLabel('Состояние кузова', 'Body condition')}</h2><p>{selectedCar.conditionMarks?.length ? localizeLabel('На схеме отмечены обнаруженные особенности кузова.', 'The detected body-condition findings are marked on the diagram.') : localizeLabel('При осмотре кузова заметные повреждения не отмечены.', 'No visible body damage was found during the inspection.')}</p></div><ConditionMap marks={selectedCar.conditionMarks || []} isEnglish={isEnglish}/><div className="damage-legend">{damageTypes.map((type) => <span key={type.id}><i style={{ background: type.color }}>{type.symbol}</i>{isEnglish ? type.labelEn : type.labelRu}</span>)}</div></section>
          <section className="export-row"><article className="export-process"><h2>{localizeLabel('Как проходит экспорт', 'Export process')}</h2><div>{[['01', localizeLabel('Выбор машины', 'Vehicle selection')], ['02', localizeLabel('Осмотр', 'Inspection')], ['03', localizeLabel('Выкуп', 'Purchase')], ['04', localizeLabel('Подготовка автомобиля', 'Vehicle preparation')], ['05', localizeLabel('Отправка', 'Shipping')]].map(([number,title]) => <span key={number}><b>{number}</b><small>{title}</small></span>)}</div><p className="delivery-note">{localizeLabel('Для подробного расчёта доставки до вашего города или страны напишите нам в WhatsApp.', 'For a detailed delivery quote to your city or country, contact us on WhatsApp.')}</p><a className="whatsapp-calc" href="https://wa.me/821057377308" target="_blank" rel="noreferrer">{localizeLabel('Получить подробный расчёт в WhatsApp', 'Get a detailed quote on WhatsApp')}</a></article></section>
          <CustomsCalculator car={selectedCar} isEnglish={isEnglish}/>
        </div>
        <footer className="detail-footer"><div className="copyright">© 2026 DH Export. {localizeLabel('Все права защищены.', 'All rights reserved.')}</div></footer>
      </main>
    )
  }

  return (
    <main id="top" data-public-site key={language}>
      <header className="header">
        <div className="container nav-wrap">
          <Mark />
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={localizeLabel('Открыть меню', 'Open menu')}>{menuOpen ? '×' : '☰'}</button>
          <nav className={menuOpen ? 'nav open' : 'nav'}>
            <a className={activeSection === 'top' ? 'active' : ''} href="#top" onClick={() => selectSection('top')}>{localizeLabel('Главная', 'Home')}</a>
            <a className={activeSection === 'cars' ? 'active' : ''} href="#cars" onClick={() => selectSection('cars')}>{localizeLabel('Авто в наличии', 'Cars in stock')}</a>
            <a className={activeSection === 'process' ? 'active' : ''} href="#process" onClick={() => selectSection('process')}>{localizeLabel('Как мы работаем', 'How it works')}</a>
          </nav>
          <div className="nav-actions"><select className="language" value={language} onChange={(event) => setLanguage(event.target.value)} aria-label={localizeLabel('Язык', 'Language')}><option value="ru">RU</option><option value="en">EN</option></select><a className="button button-outline" href="#contacts">{localizeLabel('Связаться', 'Contact us')}</a></div>
        </div>
      </header>

      <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(5,10,15,.82) 0%, rgba(5,10,15,.52) 42%, rgba(5,10,15,.06) 76%), url(${heroBackground})` }}>
        <div className="container hero-content">
          <p className="eyebrow">{localizeLabel('Автомобили из Южной Кореи', 'Cars from South Korea')}</p>
          <h1>{localizeLabel('Надёжные автомобили', 'Reliable cars')}<br />{localizeLabel('из Кореи на экспорт', 'exported from Korea')}</h1>
          <p className="hero-copy">{localizeLabel('Подбираем, проверяем и доставляем автомобили в любую точку мира', 'We source, inspect and deliver vehicles anywhere in the world')}</p>
          <div className="hero-buttons"><a className="button button-gold" href="#cars">{localizeLabel('Подобрать авто', 'Find a car')}</a><a className="button button-glass" href="#cars">{localizeLabel('Смотреть в наличии', 'View inventory')}</a></div>
          <div className="hero-benefits">
            <div><b><AppIcon name="shield" /></b><span><strong>{localizeLabel('Честные условия', 'Fair terms')}</strong><small>{localizeLabel('Без скрытых платежей', 'No hidden fees')}</small></span></div>
            <div><b><AppIcon name="check" /></b><span><strong>{localizeLabel('Полная проверка', 'Full inspection')}</strong><small>{localizeLabel('Перед покупкой', 'Before purchase')}</small></span></div>
            <div><b><AppIcon name="globe" /></b><span><strong>{localizeLabel('Доставка по миру', 'Worldwide delivery')}</strong><small>{localizeLabel('Быстро и безопасно', 'Fast and secure')}</small></span></div>
          </div>
        </div>
      </section>

      <section className="dark-section">
        <div className="container">
          <div className="stats">
            <div><span><AppIcon name="car" /></span><p><strong>500+</strong><small>{localizeLabel('автомобилей экспортировано', 'vehicles exported')}</small></p></div>
            <div><span><AppIcon name="globe" /></span><p><strong>15+</strong><small>{localizeLabel('стран доставки', 'delivery countries')}</small></p></div>
            <div><span><AppIcon name="shield" /></span><p><strong>{localizeLabel('5 лет', '5 years')}</strong><small>{localizeLabel('опыта в сфере автоэкспорта', 'of vehicle export experience')}</small></p></div>
            <div><span><AppIcon name="users" /></span><p><strong>100%</strong><small>{localizeLabel('прозрачность сделки', 'transaction transparency')}</small></p></div>
          </div>

          <section id="cars" className="cars-section">
            <div className="section-title"><div><p className="eyebrow">{localizeLabel('Каталог', 'Inventory')}</p><h2>{localizeLabel('Автомобили в наличии', 'Cars in stock')}</h2></div><div className="catalog-heading-actions"><button className={favoritesOnly ? 'active' : ''} onClick={() => setFavoritesOnly(!favoritesOnly)}><HeartIcon filled={favoritesOnly} /><span>{localizeLabel('Избранное', 'Favourites')} ({favorites.length})</span></button><span className="results-count">{filteredCars.length} {isEnglish ? 'vehicles' : 'автомобилей'}</span></div></div>
            <div className="catalog-filters">
              <label className="search-field"><span><SearchIcon /></span><input name="search" value={filters.search} onChange={changeFilter} placeholder={isEnglish ? 'Model search' : 'Поиск по модели'} /></label>
              <select name="brand" value={filters.brand} onChange={changeFilter}><option>{localizeLabel('Все марки', 'All makes')}</option><option>Genesis</option><option>Hyundai</option><option>Kia</option></select>
              <select name="year" value={filters.year} onChange={changeFilter}><option>{localizeLabel('Любой год', 'Any year')}</option><option value="2023">{isEnglish ? '2023 or newer' : 'От 2023 года'}</option><option value="2022">{isEnglish ? '2022 or newer' : 'От 2022 года'}</option><option value="2021">{isEnglish ? '2021 or newer' : 'От 2021 года'}</option></select>
              <select name="fuel" value={filters.fuel} onChange={changeFilter}><option>{localizeLabel('Любое топливо', 'Any fuel')}</option><option>{localizeCarValue('Бензин')}</option><option>{localizeCarValue('Дизель')}</option><option>{localizeCarValue('Электро')}</option></select>
              <select name="maxPrice" value={filters.maxPrice} onChange={changeFilter}><option>{localizeLabel('Любая цена', 'Any price')}</option><option value="35000000">{isEnglish ? 'Up to ₩35M' : 'До ₩35 млн'}</option><option value="40000000">{isEnglish ? 'Up to ₩40M' : 'До ₩40 млн'}</option><option value="45000000">{isEnglish ? 'Up to ₩45M' : 'До ₩45 млн'}</option></select>
              <select name="sort" value={filters.sort} onChange={changeFilter}><option>{localizeLabel('Сначала новые', 'Newest first')}</option><option>{localizeLabel('Цена по возрастанию', 'Price: low to high')}</option><option>{localizeLabel('Цена по убыванию', 'Price: high to low')}</option></select>
              <button className="reset-button" type="button" onClick={resetFilters}>{localizeLabel('Сбросить', 'Reset')}</button>
            </div>
            <div className="car-grid">
              {visibleCars.map((car) => (
                <article className="car-card" key={car.id} role="link" tabIndex="0" aria-label={isEnglish ? `Open ${car.name}` : `Открыть ${car.name}`} onClick={() => openCarFromCard(car)} onKeyDown={(event) => { if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('button')) { event.preventDefault(); openCar(car) } }}>
                  <div className={`car-visual ${car.tone}`} style={{ backgroundImage: `url(${car.photos?.[0] || heroImage})`, backgroundSize: 'cover', backgroundPosition: car.photos?.[0] ? 'center' : `${35 + (car.id % 4) * 18}% center` }}><em>{localizeCarValue('В НАЛИЧИИ')}</em><button className={favorites.includes(car.id) ? 'selected' : ''} onClick={(event) => { event.stopPropagation(); toggleFavorite(car.id) }} aria-label={localizeLabel('Добавить в избранное', 'Add to favourites')}><HeartIcon filled={favorites.includes(car.id)} /></button></div>
                  <div className="car-info"><h3>{car.name}</h3><p>{car.year} {isEnglish ? '' : 'г.'} <i>•</i> {formatNumber(car.mileage)} {isEnglish ? 'km' : 'км'}</p><strong>₩ {formatNumber(car.price)}</strong><div className="tags"><span>{localizeCarValue(car.fuel)}</span><span>{localizeCarValue('Автомат')}</span><span>{localizeCarValue(car.drive)}</span></div><button className="details-button" type="button" onClick={(event) => { event.stopPropagation(); openCar(car) }}>{localizeLabel('Подробнее', 'View details')} <span><ArrowIcon /></span></button></div>
                </article>
              ))}
            </div>
            {totalCatalogPages > 1 && <div className="catalog-pagination" role="navigation" aria-label={isEnglish ? 'Catalog pages' : 'Страницы каталога'}>
              <button type="button" disabled={currentCatalogPage === 1} onClick={() => openCatalogPage(currentCatalogPage - 1)} aria-label={isEnglish ? 'Previous page' : 'Предыдущая страница'}><ArrowIcon direction="left" /></button>
              {Array.from({ length: totalCatalogPages }, (_, index) => index + 1).map((page) => <button type="button" className={page === currentCatalogPage ? 'active' : ''} aria-current={page === currentCatalogPage ? 'page' : undefined} onClick={() => openCatalogPage(page)} key={page}>{page}</button>)}
              <button type="button" disabled={currentCatalogPage === totalCatalogPages} onClick={() => openCatalogPage(currentCatalogPage + 1)} aria-label={isEnglish ? 'Next page' : 'Следующая страница'}><ArrowIcon /></button>
            </div>}
            {!filteredCars.length && <div className="empty-state"><b>{localizeLabel('Автомобили не найдены', 'No vehicles found')}</b><p>{localizeLabel('Попробуйте изменить параметры поиска.', 'Try changing your search criteria.')}</p><button type="button" onClick={resetFilters}>{localizeLabel('Сбросить фильтры', 'Reset filters')}</button></div>}
          </section>
        </div>
      </section>

      <section id="process" className="process-section">
        <div className="container"><p className="eyebrow center">{localizeLabel('Просто и прозрачно', 'Simple and transparent')}</p><h2>{localizeLabel('Как мы работаем', 'How it works')}</h2><div className="steps">
          {steps.map(([number, title, text], index) => <article key={number}><div className="step-icon">{number}</div>{index < steps.length - 1 && <span className="arrow">→</span>}<h3>{localizeLabel(title, title === 'Подбор авто' ? 'Vehicle selection' : title === 'Проверка' ? 'Inspection' : title === 'Покупка' ? 'Purchase' : title === 'Доставка' ? 'Delivery' : 'Pickup')}</h3><p>{localizeLabel(text, text === 'Находим автомобиль под ваши параметры и бюджет' ? 'We find a vehicle that fits your needs and budget' : text === 'Проверяем состояние, историю и документы' ? 'We inspect the vehicle condition, history and documents' : text === 'Выкупаем автомобиль и оформляем экспорт' ? 'We purchase the vehicle and arrange export' : text === 'Отправляем из Кореи в выбранную страну' ? 'We ship from Korea to your chosen country' : 'We stay with you until the vehicle is received')}</p></article>)}
        </div></div>
      </section>

      <section id="about" className="why-section"><div className="container"><div className="why-heading"><p className="eyebrow">{localizeLabel('Почему мы', 'Why choose us')}</p><h2>{localizeLabel('Экспорт без лишних рисков', 'Export without unnecessary risks')}</h2></div><div className="why-grid">
        <div><b><AppIcon name="wallet" /></b><span><strong>{localizeLabel('Прозрачные цены', 'Transparent pricing')}</strong><small>{localizeLabel('Все расходы известны до покупки автомобиля', 'All costs are known before purchase')}</small></span></div>
        <div><b><AppIcon name="headset" /></b><span><strong>{localizeLabel('Поддержка 24/7', '24/7 support')}</strong><small>{localizeLabel('Остаёмся на связи на каждом этапе', 'We stay connected at every stage')}</small></span></div>
        <div><b><AppIcon name="camera" /></b><span><strong>{localizeLabel('Фото и видеоотчёты', 'Photo and video reports')}</strong><small>{localizeLabel('Показываем реальное состояние машины', 'We show the real condition of the car')}</small></span></div>
        <div><b><AppIcon name="shield" /></b><span><strong>{localizeLabel('Безопасная сделка', 'Safe deal')}</strong><small>{localizeLabel('Работаем официально и по договору', 'We operate officially and under contract')}</small></span></div>
      </div></div></section>

      <footer id="contacts"><div className="container footer-grid"><div><Mark /><p>{localizeLabel('Профессиональный экспорт автомобилей из Кореи. Надёжность, честность и индивидуальный подход.', 'Professional export of cars from Korea. Reliability, honesty and a personalised approach.')}</p><div className="social-links"><a href="https://wa.me/821057377308" target="_blank" rel="noreferrer" aria-label={localizeLabel('Написать в WhatsApp', 'Write on WhatsApp')}><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48"><path fill="#fff" d="M4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5c5.1,0,9.8,2,13.4,5.6	C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19c0,0,0,0,0,0h0c-3.2,0-6.3-0.8-9.1-2.3L4.9,43.3z"></path><path fill="#fff" d="M4.9,43.8c-0.1,0-0.3-0.1-0.4-0.1c-0.1-0.1-0.2-0.3-0.1-0.5L7,33.5c-1.6-2.9-2.5-6.2-2.5-9.6	C4.5,13.2,13.3,4.5,24,4.5c5.2,0,10.1,2,13.8,5.7c3.7,3.7,5.7,8.6,5.7,13.8c0,10.7-8.7,19.5-19.5,19.5c-3.2,0-6.3-0.8-9.1-2.3	L5,43.8C5,43.8,4.9,43.8,4.9,43.8z"></path><path fill="#cfd8dc" d="M24,5c5.1,0,9.8,2,13.4,5.6C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19h0c-3.2,0-6.3-0.8-9.1-2.3	L4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5 M24,43L24,43L24,43 M24,43L24,43L24,43 M24,4L24,4C13,4,4,13,4,24	c0,3.4,0.8,6.7,2.5,9.6L3.9,43c-0.1,0.3,0,0.7,0.3,1c0.2,0.2,0.4,0.3,0.7,0.3c0.1,0,0.2,0,0.3,0l9.7-2.5c2.8,1.5,6,2.2,9.2,2.2	c11,0,20-9,20-20c0-5.3-2.1-10.4-5.8-14.1C34.4,6.1,29.4,4,24,4L24,4z"></path><path fill="#40c351" d="M35.2,12.8c-3-3-6.9-4.6-11.2-4.6C15.3,8.2,8.2,15.3,8.2,24c0,3,0.8,5.9,2.4,8.4L11,33l-1.6,5.8	l6-1.6l0.6,0.3c2.4,1.4,5.2,2.2,8,2.2h0c8.7,0,15.8-7.1,15.8-15.8C39.8,19.8,38.2,15.8,35.2,12.8z"></path><path fill="#fff" fill-rule="evenodd" d="M19.3,16c-0.4-0.8-0.7-0.8-1.1-0.8c-0.3,0-0.6,0-0.9,0	s-0.8,0.1-1.3,0.6c-0.4,0.5-1.7,1.6-1.7,4s1.7,4.6,1.9,4.9s3.3,5.3,8.1,7.2c4,1.6,4.8,1.3,5.7,1.2c0.9-0.1,2.8-1.1,3.2-2.3	c0.4-1.1,0.4-2.1,0.3-2.3c-0.1-0.2-0.4-0.3-0.9-0.6s-2.8-1.4-3.2-1.5c-0.4-0.2-0.8-0.2-1.1,0.2c-0.3,0.5-1.2,1.5-1.5,1.9	c-0.3,0.3-0.6,0.4-1,0.1c-0.5-0.2-2-0.7-3.8-2.4c-1.4-1.3-2.4-2.8-2.6-3.3c-0.3-0.5,0-0.7,0.2-1c0.2-0.2,0.5-0.6,0.7-0.8	c0.2-0.3,0.3-0.5,0.5-0.8c0.2-0.3,0.1-0.6,0-0.8C20.6,19.3,19.7,17,19.3,16z" clip-rule="evenodd"></path></svg></a><a href="tg://resolve?phone=821057377308" aria-label="Написать в Telegram"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48"><path fill="#29b6f6" d="M24,4C13,4,4,13,4,24s9,20,20,20s20-9,20-20S35,4,24,4z"></path><path fill="#fff" d="M34,15l-3.7,19.1c0,0-0.2,0.9-1.2,0.9c-0.6,0-0.9-0.3-0.9-0.3L20,28l-4-2l-5.1-1.4c0,0-0.9-0.3-0.9-1	c0-0.6,0.9-0.9,0.9-0.9l21.3-8.5c0,0,0.7-0.2,1.1-0.2c0.3,0,0.6,0.1,0.6,0.5C34,14.8,34,15,34,15z"></path><path fill="#b0bec5" d="M23,30.5l-3.4,3.4c0,0-0.1,0.1-0.3,0.1c-0.1,0-0.1,0-0.2,0l1-6L23,30.5z"></path><path fill="#cfd8dc" d="M29.9,18.2c-0.2-0.2-0.5-0.3-0.7-0.1L16,26c0,0,2.1,5.9,2.4,6.9c0.3,1,0.6,1,0.6,1l1-6l9.8-9.1	C30,18.7,30.1,18.4,29.9,18.2z"></path></svg></a></div></div><div><h4>Навигация</h4><a href="#cars" onClick={() => selectSection('cars')}>Авто в наличии</a><a href="#process" onClick={() => selectSection('process')}>Как мы работаем</a><button className="admin-link" onClick={() => setAdminOpen(true)}>Администратор</button></div><div><h4>Связаться с нами</h4><a href="tel:+821057377308">+ 82 10 5737 7308</a><a href="mailto:drivehub.kr@gmail.com">drivehub.kr@gmail.com</a><span>Инчхон, Южная Корея</span></div><div className="footer-cta"><h3>Подберём автомобиль под ваш бюджет</h3><a className="button button-gold" href="https://wa.me/821057377308" target="_blank" rel="noreferrer">Оставить заявку</a></div></div><div className="copyright">© 2026 DH Export. Все права защищены.</div></footer>
    </main>
  )
}

export default App
