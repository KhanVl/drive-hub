export const carColors = [
  ['white', 'Белый', '#e8e9e6'], ['black', 'Чёрный', '#17191b'], ['silver', 'Серебристый', '#a5aaad'],
  ['gray', 'Серый', '#686d70'], ['graphite', 'Графитовый', '#42484c'], ['blue', 'Синий', '#274f78'],
  ['navy', 'Тёмно-синий', '#172d43'], ['red', 'Красный', '#8f2528'], ['green', 'Зелёный', '#365747'],
  ['brown', 'Коричневый', '#594337'], ['beige', 'Бежевый', '#b6aa91'], ['gold', 'Золотистый', '#a58a54'],
  ['orange', 'Оранжевый', '#b75a25'], ['yellow', 'Жёлтый', '#d3a92d'], ['purple', 'Фиолетовый', '#604269'],
].map(([value, label, hex]) => ({ value, label, hex }))

export const getCarColor = (value) => carColors.find((color) => color.value === value) || carColors[4]
