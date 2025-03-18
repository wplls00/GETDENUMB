// Получаем элементы страницы
const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');
const predictButton = document.getElementById('predict-button');
const resultSpan = document.getElementById('result');
const statusSpan = document.getElementById('status');

let isDrawing = false;

// Обработчики событий для рисования
canvas.addEventListener('mousedown', () => isDrawing = true);
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mousemove', draw);

function draw(event) {
  if (!isDrawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  ctx.fillStyle = 'black';
  ctx.fillRect(x, y, 10, 10); // Рисуем квадраты размером 10x10
}

// Очистка canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Загружаем модель
let model;
(async function loadModel() {
  try {
    model = await tf.loadLayersModel('./web_model/model.json');
    console.log('Модель успешно загружена!');
    statusSpan.textContent = 'Модель загружена! Можно рисовать.';
  } catch (error) {
    console.error('Ошибка загрузки модели:', error);
    statusSpan.textContent = 'Ошибка загрузки модели. Проверьте консоль.';
  }
})();

// Предобработка изображения
function preprocessCanvas(canvas) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const tensor = tf.browser.fromPixels(imageData)
    .resizeNearestNeighbor([28, 28]) // Уменьшаем до 28x28 пикселей
    .mean(2) // Преобразуем в градации серого
    .expandDims(2)
    .expandDims()
    .toFloat();
  return tensor.div(255.0); // Нормализуем значения пикселей
}

// Кнопка "Распознать"
predictButton.addEventListener('click', async () => {
  if (!model) {
    alert('Модель ещё не загружена. Пожалуйста, подождите.');
    return;
  }

  // Получаем предсказание
  const imageTensor = preprocessCanvas(canvas);
  const prediction = await model.predict(imageTensor).data();
  const result = prediction.indexOf(Math.max(...prediction)); // Находим наиболее вероятную цифру
  resultSpan.textContent = result; // Показываем результат
});
