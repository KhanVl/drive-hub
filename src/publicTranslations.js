const exact = new Map([
  ['Главная', 'Home'], ['Авто в наличии', 'Cars in stock'], ['Как мы работаем', 'How it works'], ['Связаться', 'Contact us'],
  ['Автомобили из Южной Кореи', 'Cars from South Korea'], ['Надёжные автомобили', 'Reliable cars'], ['из Кореи на экспорт', 'exported from Korea'],
  ['Подбираем, проверяем и доставляем автомобили в любую точку мира', 'We source, inspect and deliver vehicles anywhere in the world'],
  ['Подобрать авто', 'Find a car'], ['Смотреть в наличии', 'View inventory'], ['Честные условия', 'Fair terms'], ['Без скрытых платежей', 'No hidden fees'],
  ['Полная проверка', 'Full inspection'], ['Перед покупкой', 'Before purchase'], ['Доставка по миру', 'Worldwide delivery'], ['Быстро и безопасно', 'Fast and secure'],
  ['автомобилей экспортировано', 'vehicles exported'], ['стран доставки', 'delivery countries'], ['5 лет', '5 years'], ['опыта в сфере автоэкспорта', 'of vehicle export experience'], ['прозрачность сделки', 'transaction transparency'],
  ['Каталог', 'Inventory'], ['Автомобили в наличии', 'Cars in stock'], ['Все марки', 'All makes'], ['Любой год', 'Any year'], ['Любое топливо', 'Any fuel'], ['Любая цена', 'Any price'], ['Сначала новые', 'Newest first'],
  ['От 2023 года', '2023 or newer'], ['От 2022 года', '2022 or newer'], ['От 2021 года', '2021 or newer'], ['Бензин', 'Petrol'], ['Дизель', 'Diesel'], ['Электро', 'Electric'], ['Гибрид', 'Hybrid'],
  ['До ₩35 млн', 'Up to ₩35M'], ['До ₩40 млн', 'Up to ₩40M'], ['До ₩45 млн', 'Up to ₩45M'], ['Цена по возрастанию', 'Price: low to high'], ['Цена по убыванию', 'Price: high to low'], ['Сбросить', 'Reset'],
  ['В НАЛИЧИИ', 'IN STOCK'], ['Автомат', 'Automatic'], ['Передний привод', 'Front-wheel drive'], ['Задний привод', 'Rear-wheel drive'], ['Полный привод', 'All-wheel drive'], ['Подробнее', 'View details'],
  ['Автомобили не найдены', 'No vehicles found'], ['Попробуйте изменить параметры поиска.', 'Try changing your search criteria.'], ['Сбросить фильтры', 'Reset filters'],
  ['Просто и прозрачно', 'Simple and transparent'], ['Подбор авто', 'Vehicle selection'], ['Проверка', 'Inspection'], ['Покупка', 'Purchase'], ['Доставка', 'Delivery'], ['Получение', 'Handover'],
  ['Находим автомобиль под ваши параметры и бюджет', 'We find a vehicle that fits your needs and budget'], ['Проверяем состояние, историю и документы', 'We inspect its condition, history and documents'], ['Выкупаем автомобиль и оформляем экспорт', 'We purchase the vehicle and arrange export documents'], ['Отправляем из Кореи в выбранную страну', 'We ship it from Korea to your chosen country'], ['Сопровождаем вас до получения автомобиля', 'We support you until the vehicle is delivered'],
  ['Почему мы', 'Why choose us'], ['Экспорт без лишних рисков', 'Vehicle export without unnecessary risks'], ['Прозрачные цены', 'Transparent pricing'], ['Все расходы известны до покупки автомобиля', 'All costs are disclosed before purchase'], ['Поддержка 24/7', '24/7 support'], ['Остаёмся на связи на каждом этапе', 'We stay in touch at every stage'], ['Фото и видеоотчёты', 'Photo and video reports'], ['Показываем реальное состояние машины', 'We show the vehicle\'s actual condition'], ['Безопасная сделка', 'Secure transaction'], ['Работаем официально и по договору', 'Official service with a written contract'],
  ['Навигация', 'Navigation'], ['Связаться с нами', 'Contact us'], ['Инчхон, Южная Корея', 'Incheon, South Korea'], ['Подберём автомобиль под ваш бюджет', 'We will find a vehicle that fits your budget'], ['Оставить заявку', 'Send an enquiry'], ['Профессиональный экспорт автомобилей из Кореи. Надёжность, честность и индивидуальный подход.', 'Professional vehicle export from Korea with reliability, transparency and personal service.'],
  ['Вернуться в каталог', 'Back to inventory'], ['В наличии в Корее', 'Available in Korea'], ['Год выпуска', 'Model year'], ['Пробег', 'Mileage'], ['Топливо', 'Fuel'], ['Коробка', 'Transmission'], ['Заказать экспорт', 'Request export'], ['Позвонить нам', 'Call us'], ['В избранном', 'Saved'], ['Добавить в избранное', 'Add to favourites'],
  ['Характеристики', 'Specifications'], ['Двигатель', 'Engine'], ['Коробка передач', 'Transmission'], ['Привод', 'Drivetrain'], ['Цвет', 'Colour'], ['Страна', 'Country'], ['Южная Корея', 'South Korea'], ['Описание', 'Description'], ['Комплектация', 'Features'], ['Комплектация не указана', 'No features specified'],
  ['Ваше имя', 'Your name'], ['Телефон / WhatsApp', 'Phone / WhatsApp'], ['Страна назначения', 'Destination country'], ['Россия', 'Russia'], ['Казахстан', 'Kazakhstan'], ['Германия', 'Germany'], ['Другая страна', 'Other country'], ['Комментарий (необязательно)', 'Message (optional)'], ['Отправить заявку', 'Submit enquiry'],
  ['Отчёт осмотра', 'Inspection report'], ['Состояние кузова', 'Body condition'], ['Как проходит экспорт', 'Export process'], ['Примерная стоимость с доставкой', 'Estimated price including delivery'], ['Предварительный расчёт, включая основные расходы', 'Preliminary estimate including major costs'], ['Открыть калькулятор растаможки', 'Open customs calculator'],
  ['Все права защищены.', 'All rights reserved.'],
])

const patterns = [
  [/^(\d+) автомобил(?:ь|я|ей)$/u, '$1 vehicles'], [/^(♥?)\s*Избранное \((\d+)\)$/u, '♥ Favourites ($2)'],
  [/^(\d{4}) г\.$/u, '$1'], [/^([\d\s]+) км$/u, '$1 km'], [/^Фото (\d+) \/ (\d+)$/u, 'Photo $1 / $2'], [/^(\d+) опций$/u, '$1 features'],
  [/^Посмотреть все \((\d+)\)$/u, 'View all ($1)'], [/^Скрыть комплектацию$/u, 'Hide features'],
]

const extra = new Map([
  ['Расчёт для России', 'Calculation for Russia'], ['Калькулятор растаможки автомобиля', 'Vehicle customs calculator'], ['Расчёт по параметрам автомобиля и коэффициентам, используемым сервисом CalcUS.', 'Estimate based on vehicle parameters and the coefficients used by CalcUS.'],
  ['Автомобиль ввозит', 'Importer'], ['Физическое лицо для личного пользования', 'Individual for personal use'], ['Физическое лицо для перепродажи', 'Individual for resale'], ['Юридическое лицо', 'Legal entity'], ['Возраст автомобиля', 'Vehicle age'], ['До 3 лет', 'Under 3 years'], ['От 3 до 5 лет', '3 to 5 years'], ['От 5 до 7 лет', '5 to 7 years'], ['Более 7 лет', 'Over 7 years'],
  ['Тип двигателя', 'Engine type'], ['Бензиновый', 'Petrol'], ['Дизельный', 'Diesel'], ['Электрический', 'Electric'], ['Последовательный гибрид', 'Series hybrid'], ['Параллельный гибрид', 'Parallel hybrid'], ['Мощность двигателя', 'Engine power'], ['Объём двигателя', 'Engine displacement'], ['Стоимость автомобиля', 'Vehicle price'], ['Рассчитать', 'Calculate'], ['Очистить', 'Clear'], ['Расчёт платежей', 'Payment breakdown'], ['Таможенный сбор', 'Customs processing fee'], ['Таможенная пошлина', 'Import duty'], ['Акциз', 'Excise duty'], ['НДС', 'VAT'], ['Утилизационный сбор', 'Recycling fee'], ['Полная стоимость растаможки', 'Total customs cost'], ['Автомобиль + растаможка', 'Vehicle + customs'], ['Заполните параметры', 'Enter vehicle details'],
  ['Кожаный салон', 'Leather interior'], ['Камера заднего вида', 'Rear-view camera'], ['Климат-контроль', 'Climate control'], ['Парктроники', 'Parking sensors'], ['Подогрев сидений', 'Heated seats'], ['Круиз-контроль', 'Cruise control'], ['LED-фары', 'LED headlights'], ['Бесключевой доступ', 'Keyless entry'], ['Навигация', 'Navigation'], ['Вентиляция сидений', 'Ventilated seats'], ['Панорамная крыша', 'Panoramic roof'], ['Камеры 360°', '360° camera'],
  ['Замена', 'Replacement'], ['Ремонт', 'Repair'], ['Коррозия', 'Corrosion'], ['Царапина', 'Scratch'], ['Неровность', 'Dent'], ['Повреждение', 'Damage'],
  ['Белый', 'White'], ['Чёрный', 'Black'], ['Серебристый', 'Silver'], ['Серый', 'Grey'], ['Графитовый', 'Graphite'], ['Синий', 'Blue'], ['Тёмно-синий', 'Navy blue'], ['Красный', 'Red'], ['Зелёный', 'Green'], ['Коричневый', 'Brown'], ['Бежевый', 'Beige'],
])

const translateValue = (value) => {
  const trimmed = value.trim()
  if (exact.has(trimmed)) return value.replace(trimmed, exact.get(trimmed))
  if (extra.has(trimmed)) return value.replace(trimmed, extra.get(trimmed))
  for (const [pattern, replacement] of patterns) if (pattern.test(trimmed)) return value.replace(trimmed, trimmed.replace(pattern, replacement))
  return value
}

export function translatePublicPage(root) {
  if (!root) return
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  nodes.forEach((node) => {
    const translated = translateValue(node.nodeValue)
    if (translated !== node.nodeValue) node.nodeValue = translated
  })
  root.querySelectorAll('[placeholder],[aria-label],[title]').forEach((element) => {
    for (const attribute of ['placeholder', 'aria-label', 'title']) if (element.hasAttribute(attribute)) {
      const current = element.getAttribute(attribute)
      const translated = translateValue(current)
      if (translated !== current) element.setAttribute(attribute, translated)
    }
  })
}
