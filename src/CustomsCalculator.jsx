import { useState } from 'react'

const numberFromResult = (value) => Number(String(value || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0

const getInitialForm = (car) => {
  const age = Math.max(0, new Date().getFullYear() - Number(car.year || 2023))
  const isElectric = car.fuel === 'Электро'
  return {
    owner: '1',
    age: age < 3 ? '0-3' : age <= 5 ? '3-5' : age <= 7 ? '5-7' : '7-0',
    engine: isElectric ? '4' : car.fuel === 'Дизель' ? '2' : car.fuel === 'Гибрид' ? '6' : '1',
    power: Number(car.horsepower) || '',
    power_unit: '1',
    value: isElectric ? 1 : Number(car.engineDisplacement) || '',
    price: Number(car.price) || 33500000,
    curr: 'KRW',
  }
}

function NumberStepper({ name, value, onChange, min, max, step = 1 }) {
  const parseValue = () => Number(String(value ?? '0').replace(',', '.')) || 0
  const updateValue = (nextValue) => {
    const safeValue = Number.isFinite(nextValue) ? nextValue : 0
    onChange({ target: { name, value: String(safeValue) } })
  }

  return (
    <div className="custom-number-field">
      <input
        name={name}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
      />
      <div className="custom-number-stepper" aria-label={`Регулировка ${name}`}>
        <button type="button" aria-label={`Увеличить ${name}`} onClick={() => updateValue(parseValue() + step)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 14.5 12 9l5 5.5" /></svg>
        </button>
        <button type="button" aria-label={`Уменьшить ${name}`} onClick={() => updateValue(parseValue() - step)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9.5 12 15l5-5.5" /></svg>
        </button>
      </div>
    </div>
  )
}

export default function CustomsCalculator({ car, isEnglish = false }) {
  const [form, setForm] = useState(() => getInitialForm(car))
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const calculate = async (event) => {
    event.preventDefault(); setLoading(true); setError('')
    if (Number(form.power) <= 0 || (['1', '2', '6'].includes(form.engine) && Number(form.value) <= 0)) {
      setLoading(false)
      setError(isEnglish ? 'Engine power and displacement are missing from this vehicle listing.' : 'В объявлении не указаны мощность и объём двигателя. Обновите характеристики автомобиля.')
      return
    }
    try {
      const response = await fetch('/api/customs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || (isEnglish ? 'Calculation failed' : 'Не удалось выполнить расчёт'))
      setResult(data)
    } catch (requestError) { setError(requestError.message) }
    finally { setLoading(false) }
  }
  const reset = () => {
    setForm(getInitialForm(car))
    setResult(null); setError('')
  }
  const chart = result ? [
    [(isEnglish ? 'Vehicle price' : 'Стоимость автомобиля'), Number(result.price), '#1D9E75'],
    [(isEnglish ? 'Customs fee' : 'Таможенный сбор'), numberFromResult(result.sbor), '#BA7517'],
    [(isEnglish ? 'Import duty' : 'Таможенная пошлина'), numberFromResult(result.tax), '#D85A30'],
    [(isEnglish ? 'Recycling fee' : 'Утилизационный сбор'), numberFromResult(result.util), '#534AB7'],
  ] : []
  const chartTotal = chart.reduce((sum, item) => sum + item[1], 0)
  let angle = 0
  const gradient = chart.map((item) => {
    const start = angle; angle += chartTotal ? item[1] / chartTotal * 360 : 0
    return `${item[2]} ${start}deg ${angle}deg`
  }).join(',')
  const yearValues = result?.util_by_years?.match(/[\d\u00a0 ]+ ₽/g)?.slice(0, 6) || []

  return <section className="customs-calculator" id="calculator">
    <div className="calculator-heading"><p className="eyebrow">{isEnglish ? 'Calculation for Russia' : 'Расчёт для России'}</p><h2>{isEnglish ? 'Vehicle customs calculator' : 'Калькулятор растаможки автомобиля'}</h2><p>{isEnglish ? 'Estimate based on the vehicle parameters and coefficients used by CalcUS.' : 'Расчёт по параметрам автомобиля и коэффициентам, используемым сервисом CalcUS.'}</p></div>
    <div className="calculator-shell">
      <form className="calculator-form" onSubmit={calculate}>
        <label><span>{isEnglish ? 'Importer' : 'Автомобиль ввозит'}</span><select name="owner" value={form.owner} onChange={change}><option value="1">{isEnglish ? 'Private person for personal use' : 'Физическое лицо для личного пользования'}</option><option value="3">{isEnglish ? 'Private person for resale' : 'Физическое лицо для перепродажи'}</option><option value="2">{isEnglish ? 'Legal entity' : 'Юридическое лицо'}</option></select></label>
        <label><span>{isEnglish ? 'Vehicle age' : 'Возраст автомобиля'}</span><select name="age" value={form.age} onChange={change}><option value="0-3">{isEnglish ? 'Under 3 years' : 'До 3 лет'}</option><option value="3-5">{isEnglish ? '3 to 5 years' : 'От 3 до 5 лет'}</option><option value="5-7">{isEnglish ? '5 to 7 years' : 'От 5 до 7 лет'}</option><option value="7-0">{isEnglish ? 'Over 7 years' : 'Более 7 лет'}</option></select></label>
        <label><span>{isEnglish ? 'Engine type' : 'Тип двигателя'}</span><select name="engine" value={form.engine} onChange={change}><option value="1">{isEnglish ? 'Petrol' : 'Бензиновый'}</option><option value="2">{isEnglish ? 'Diesel' : 'Дизельный'}</option><option value="4">{isEnglish ? 'Electric' : 'Электрический'}</option><option value="5">{isEnglish ? 'Series hybrid' : 'Последовательный гибрид'}</option><option value="6">{isEnglish ? 'Parallel hybrid' : 'Параллельный гибрид'}</option></select></label>
        <label><span>{isEnglish ? 'Engine power' : 'Мощность двигателя'}</span><div><NumberStepper name="power" min="1" step="0.01" value={form.power} onChange={change}/><select name="power_unit" value={form.power_unit} onChange={change}><option value="1">{isEnglish ? 'hp' : 'л.с.'}</option><option value="2">{isEnglish ? 'kW' : 'кВт'}</option></select></div></label>
        {['1','2','6'].includes(form.engine) && <label><span>{isEnglish ? 'Engine displacement' : 'Объём двигателя'}</span><div><NumberStepper name="value" min="1" max="10000" value={form.value} onChange={change}/><em>{isEnglish ? 'cm³' : 'см³'}</em></div></label>}
        <label><span>{isEnglish ? 'Vehicle price' : 'Стоимость автомобиля'}</span><div><NumberStepper name="price" min="0" value={form.price} onChange={change}/><select name="curr" value={form.curr} onChange={change}><option value="KRW">KRW</option><option value="RUB">RUB</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="CNY">CNY</option><option value="JPY">JPY</option></select></div></label>
        <div className="calculator-actions"><button className="button button-gold" disabled={loading}>{loading ? (isEnglish ? 'Calculating…' : 'Расчёт…') : (isEnglish ? 'Calculate' : 'Рассчитать')}</button><button type="button" onClick={reset}>{isEnglish ? 'Clear' : 'Очистить'}</button></div>
        {error && <p className="calculator-error">{error}</p>}
      </form>
      <div className="calculator-result">
        {result ? <>
          <h3>{isEnglish ? 'Payment breakdown' : 'Расчёт платежей'}</h3>
          <dl><div><dt>{isEnglish ? 'Customs fee' : 'Таможенный сбор'}</dt><dd>{result.sbor} ₽</dd></div><div><dt>{isEnglish ? 'Import duty' : 'Таможенная пошлина'}</dt><dd>{result.tax} ₽</dd></div><div><dt>{isEnglish ? 'Excise duty' : 'Акциз'}</dt><dd>{result.excise} ₽</dd></div><div><dt>{isEnglish ? 'VAT' : 'НДС'}</dt><dd>{result.nds} ₽</dd></div><div><dt>{isEnglish ? 'Recycling fee' : 'Утилизационный сбор'}</dt><dd>{result.util} ₽</dd></div></dl>
          <div className="calculator-total"><span>{isEnglish ? 'Total customs cost' : 'Полная стоимость растаможки'}</span><strong>{result.total} ₽</strong></div>
          <div className="calculator-grand"><span>{isEnglish ? 'Vehicle + customs' : 'Автомобиль + растаможка'}</span><b>{result.total2} ₽</b></div>
          <div className="customs-chart"><div className="donut" style={{ background: `conic-gradient(${gradient})` }}/><div>{chart.map((item) => <span key={item[0]}><i style={{ background: item[2] }}/>{item[0]} {chartTotal ? (item[1] / chartTotal * 100).toFixed(1) : 0}%</span>)}</div></div>
          {yearValues.length > 0 && <div className="util-years"><p>{isEnglish ? 'Recycling fee estimate based on approved rates through 2030' : 'Расчёт утильсбора по утверждённым тарифам до 2030 года'}</p><div>{yearValues.map((value,index) => <span key={`${value}-${index}`}><small>{2025 + index}</small><b>{value}</b>{index > 0 && <em>{index === 1 ? '+20%' : '+10%'}</em>}</span>)}</div></div>}
          <p>{isEnglish ? 'Exchange rates and coefficients are applied at the time of calculation. The result is indicative until the documents are reviewed by a customs specialist.' : 'Курсы валют и коэффициенты берутся в момент расчёта. Итог остаётся справочным до проверки документов таможенным специалистом.'}</p>
        </> : <div className="calculator-placeholder"><b>{isEnglish ? 'Enter vehicle details' : 'Заполните параметры'}</b><span>{isEnglish ? 'Click “Calculate” to see a detailed payment breakdown.' : 'Нажмите «Рассчитать», чтобы получить подробную разбивку платежей.'}</span></div>}
      </div>
    </div>
  </section>
}
