import { damageTypes } from './damageTypes'
import vehicleCondition from './assets/vehicle-condition.svg'

export default function ConditionMap({ marks = [], activeType = 'scratch', editable = false, onAdd, onRemove }) {
  const addMark = (event) => {
    if (!editable || !onAdd) return
    const box = event.currentTarget.getBoundingClientRect()
    onAdd({ x: Number((((event.clientX - box.left) / box.width) * 100).toFixed(1)), y: Number((((event.clientY - box.top) / box.height) * 100).toFixed(1)), type: activeType })
  }

  return <div className={`condition-map ${editable ? 'editable' : ''}`} onClick={addMark} role={editable ? 'button' : 'img'} aria-label="Схема состояния кузова автомобиля">
    <img className="condition-diagram" src={vehicleCondition} alt="" draggable="false" />
    {marks.map((mark, index) => {
      const type = damageTypes.find((item) => item.id === mark.type) || damageTypes[0]
      return <button type="button" key={`${mark.x}-${mark.y}-${index}`} className="damage-mark" style={{ left: `${mark.x}%`, top: `${mark.y}%`, background: type.color }} title={`${type.label}${editable ? ' — нажмите, чтобы удалить' : ''}`} onClick={(event) => { event.stopPropagation(); if (editable) onRemove?.(index) }}>{type.symbol}</button>
    })}
  </div>
}
