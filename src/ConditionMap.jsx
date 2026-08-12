import { damageTypes } from './damageTypes'

export default function ConditionMap({ marks = [], activeType = 'scratch', editable = false, onAdd, onRemove }) {
  const addMark = (event) => {
    if (!editable || !onAdd) return
    const box = event.currentTarget.getBoundingClientRect()
    onAdd({ x: Number((((event.clientX - box.left) / box.width) * 100).toFixed(1)), y: Number((((event.clientY - box.top) / box.height) * 100).toFixed(1)), type: activeType })
  }
  return <div className={`condition-map ${editable ? 'editable' : ''}`} onClick={addMark} role={editable ? 'button' : 'img'} aria-label="Схема состояния кузова автомобиля">
    <svg viewBox="0 0 760 390" aria-hidden="true">
      <g fill="#111a22" stroke="#64717c" strokeWidth="2">
        <path d="M284 36Q380 5 476 36L502 112 492 326Q380 378 268 326L258 112Z" />
        <path d="M302 54Q380 30 458 54L472 112H288Z" fill="#1b2731" />
        <path d="M294 130H466V268H294Z" fill="#16212a" />
        <path d="M304 286Q380 312 456 286L470 326Q380 356 290 326Z" />
        <path d="M66 64Q140 32 230 61L258 116 250 314Q150 354 60 309L43 119Z" />
        <path d="M530 61Q620 32 694 64L717 119 700 309Q610 354 510 314L502 116Z" />
        <path d="M82 89L205 69 239 126 230 287 76 302 61 133Z" fill="#16212a" />
        <path d="M678 89L555 69 521 126 530 287 684 302 699 133Z" fill="#16212a" />
        <path d="M258 116L235 126M258 314L230 287M502 116L525 126M502 314L530 287" />
      </g>
      <g fill="#0b1117" stroke="#8a959e" strokeWidth="2">
        <circle cx="77" cy="75" r="34"/><circle cx="76" cy="317" r="34"/><circle cx="683" cy="75" r="34"/><circle cx="684" cy="317" r="34"/>
      </g>
      <g stroke="#596772" strokeWidth="2"><path d="M270 190H490M380 36V354M64 190H245M515 190H696"/></g>
    </svg>
    {marks.map((mark, index) => { const type = damageTypes.find((item) => item.id === mark.type) || damageTypes[0]; return <button type="button" key={`${mark.x}-${mark.y}-${index}`} className="damage-mark" style={{ left: `${mark.x}%`, top: `${mark.y}%`, background: type.color }} title={`${type.label}${editable ? ' — нажмите, чтобы удалить' : ''}`} onClick={(event) => { event.stopPropagation(); if (editable) onRemove?.(index) }}>{type.symbol}</button> })}
  </div>
}
