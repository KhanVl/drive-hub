import { useState } from 'react'

const numberFromResult = (value) => Number(String(value || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0

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

export default function CustomsCalculator({ car }) {
  const age = Math.max(0, new Date().getFullYear() - Number(car.year || 2023))
  const [form, setForm] = useState({
    owner: '1', age: age < 3 ? '0-3' : age <= 5 ? '3-5' : age <= 7 ? '5-7' : '7-0',
    engine: car.fuel === 'Электро' ? '4' : car.fuel === 'Дизель' ? '2' : car.fuel === 'Гибрид' ? '6' : '1',
    power: 184, power_unit: '1', value: car.fuel === 'Электро' ? 1 : 1998,
    price: car.price || 33500000, curr: 'KRW',
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const calculate = async (event) => {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const response = await fetch('/api/customs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Не удалось выполнить расчёт')
      setResult(data)
    } catch (requestError) { setError(requestError.message) }
    finally { setLoading(false) }
  }
  const reset = () => {
    setForm({ owner: '1', age: '3-5', engine: '1', power: 184, power_unit: '1', value: 1998, price: 33500000, curr: 'KRW' })
    setResult(null); setError('')
  }
  const chart = result ? [
    ['Стоимость автомобиля', Number(result.price), '#1D9E75'],
    ['Таможенный сбор', numberFromResult(result.sbor), '#BA7517'],
    ['Таможенная пошлина', numberFromResult(result.tax), '#D85A30'],
    ['Утилизационный сбор', numberFromResult(result.util), '#534AB7'],
  ] : []
  const chartTotal = chart.reduce((sum, item) => sum + item[1], 0)
  let angle = 0
  const gradient = chart.map((item) => {
    const start = angle; angle += chartTotal ? item[1] / chartTotal * 360 : 0
    return `${item[2]} ${start}deg ${angle}deg`
  }).join(',')
  const yearValues = result?.util_by_years?.match(/[\d\u00a0 ]+ ₽/g)?.slice(0, 6) || []

  return <section className="customs-calculator" id="calculator">
    <div className="calculator-heading"><p className="eyebrow">Расчёт для России</p><h2>Калькулятор растаможки автомобиля</h2><p>Расчёт по параметрам автомобиля и коэффициентам, используемым сервисом CalcUS.</p></div>
    <div className="calculator-shell">
      <form className="calculator-form" onSubmit={calculate}>
        <label><span>Автомобиль ввозит</span><select name="owner" value={form.owner} onChange={change}><option value="1">Физическое лицо для личного пользования</option><option value="3">Физическое лицо для перепродажи</option><option value="2">Юридическое лицо</option></select></label>
        <label><span>Возраст автомобиля</span><select name="age" value={form.age} onChange={change}><option value="0-3">До 3 лет</option><option value="3-5">От 3 до 5 лет</option><option value="5-7">От 5 до 7 лет</option><option value="7-0">Более 7 лет</option></select></label>
        <label><span>Тип двигателя</span><select name="engine" value={form.engine} onChange={change}><option value="1">Бензиновый</option><option value="2">Дизельный</option><option value="4">Электрический</option><option value="5">Последовательный гибрид</option><option value="6">Параллельный гибрид</option></select></label>
        <label><span>Мощность двигателя</span><div><NumberStepper name="power" min="1" step="0.01" value={form.power} onChange={change}/><select name="power_unit" value={form.power_unit} onChange={change}><option value="1">л.с.</option><option value="2">кВт</option></select></div></label>
        {['1','2','6'].includes(form.engine) && <label><span>Объём двигателя</span><div><NumberStepper name="value" min="1" max="10000" value={form.value} onChange={change}/><em>см³</em></div></label>}
        <label><span>Стоимость автомобиля</span><div><NumberStepper name="price" min="0" value={form.price} onChange={change}/><select name="curr" value={form.curr} onChange={change}><option value="KRW">KRW</option><option value="RUB">RUB</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="CNY">CNY</option><option value="JPY">JPY</option></select></div></label>
        <div className="calculator-actions"><button className="button button-gold" disabled={loading}>{loading ? 'Расчёт…' : 'Рассчитать'}</button><button type="button" onClick={reset}>Очистить</button></div>
        {error && <p className="calculator-error">{error}</p>}
      </form>
      <div className="calculator-result">
        {result ? <>
          <h3>Расчёт платежей</h3>
          <dl><div><dt>Таможенный сбор</dt><dd>{result.sbor} ₽</dd></div><div><dt>Таможенная пошлина</dt><dd>{result.tax} ₽</dd></div><div><dt>Акциз</dt><dd>{result.excise} ₽</dd></div><div><dt>НДС</dt><dd>{result.nds} ₽</dd></div><div><dt>Утилизационный сбор</dt><dd>{result.util} ₽</dd></div></dl>
          <div className="calculator-total"><span>Полная стоимость растаможки</span><strong>{result.total} ₽</strong></div>
          <div className="calculator-grand"><span>Автомобиль + растаможка</span><b>{result.total2} ₽</b></div>
          <div className="customs-chart"><div className="donut" style={{ background: `conic-gradient(${gradient})` }}/><div>{chart.map((item) => <span key={item[0]}><i style={{ background: item[2] }}/>{item[0]} {chartTotal ? (item[1] / chartTotal * 100).toFixed(1) : 0}%</span>)}</div></div>
          {yearValues.length > 0 && <div className="util-years"><p>Расчёт утильсбора по утверждённым тарифам до 2030 года</p><div>{yearValues.map((value,index) => <span key={`${value}-${index}`}><small>{2025 + index}</small><b>{value}</b>{index > 0 && <em>{index === 1 ? '+20%' : '+10%'}</em>}</span>)}</div></div>}
          <p>Курсы валют и коэффициенты берутся в момент расчёта. Итог остаётся справочным до проверки документов таможенным специалистом.</p>
        </> : <div className="calculator-placeholder"><b>Заполните параметры</b><span>Нажмите «Рассчитать», чтобы получить подробную разбивку платежей.</span></div>}
      </div>
    </div>
  </section>
}
