const canvas = document.getElementById('game-area');
const ctx = canvas.getContext('2d');
const percentageDisplay = document.getElementById('percentage');
const reloadIcon = document.getElementById('reload-icon');
const backButton = document.getElementById('back-button');
const helpIcon = document.getElementById('help-icon');
const helpText = document.getElementById('help-text');

let points = []; // Точки, нарисованные пользователем
let isDrawing = false; // Флаг рисования
let center = { x: canvas.offsetWidth / 2, y: canvas.offsetHeight / 2 }; // Центр холста
let perfectRadius = 0; // Идеальный радиус круга
const maxDeviationForColor = 50; // Максимальное отклонение для градиента цвета
const minDrawingRadius = 20; // Минимальный радиус, внутри которого рисование запрещено

// Установка размеров холста
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// Рисование центра круга
function drawCenter() {
    ctx.beginPath();
    ctx.arc(center.x, center.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(34, 178, 76, 0.3)'; // Полупрозрачный зеленый
    ctx.fill();

    // Добавление текста вокруг центра
    ctx.font = '6px Arial';
    ctx.fillStyle = 'rgba(34, 178, 76, 0.3)'; // Полупрозрачный зеленый
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const radius = 8;
    const text = "центркруга";
    const angleStep = (Math.PI * 2) / text.length;
    for (let i = 0; i < text.length; i++) {
        const angle = i * angleStep + Math.PI;
        const x = center.x + Math.cos(angle) * radius;
        const y = center.y + Math.sin(angle) * radius;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillText(text[i], 0, 0);
        ctx.restore();
    }
}

// Начало рисования
function startDrawing(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Проверка, находится ли начальная точка в запрещенной зоне
    const dx = x - center.x;
    const dy = y - center.y;
    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
    if (distanceFromCenter < minDrawingRadius) {
        return; // Не начинаем рисование, если точка в запрещенной зоне
    }

    isDrawing = true;
    points = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCenter();

    points.push({ x, y });
    perfectRadius = distanceFromCenter; // Расчет идеального радиуса
}

// Рисование линии
function draw(clientX, clientY) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Проверка, находится ли текущая точка в запрещенной зоне
    const dx = x - center.x;
    const dy = y - center.y;
    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
    if (distanceFromCenter < minDrawingRadius) {
        return; // Пропускаем рисование, если точка в запрещенной зоне
    }

    points.push({ x, y });

    const currentRadius = distanceFromCenter;
    const deviation = Math.abs(currentRadius - perfectRadius);

    const color = getColorForDeviation(deviation); // Цвет линии в зависимости от отклонения

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 3;
    ctx.shadowColor = color;

    if (points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    calculateCircleQuality(); // Обновление процентов
}

// Завершение рисования
function endDrawing() {
    isDrawing = false;
    calculateCircleQuality();
}

// Расчет идеальности круга
function calculateCircleQuality() {
    if (points.length < 3) {
        percentageDisplay.textContent = "0%";
        return;
    }

    let totalDeviation = 0;
    points.forEach(point => {
        const dx = point.x - center.x;
        const dy = point.y - center.y;
        const currentRadius = Math.sqrt(dx * dx + dy * dy);
        const deviation = Math.abs(currentRadius - perfectRadius);
        totalDeviation += deviation;
    });

    const averageDeviation = totalDeviation / points.length;
    const maxAllowedDeviation = 30;
    const quality = Math.max(0, 100 - (averageDeviation / maxAllowedDeviation) * 100);
    percentageDisplay.textContent = `${Math.round(quality)}%`;
}

// Получение цвета линии в зависимости от отклонения
function getColorForDeviation(deviation) {
    const normalizedDeviation = Math.min(1, deviation / maxDeviationForColor);
    const hue = normalizedDeviation * 120;
    return `hsl(${120 - hue}, 100%, 70%)`; // Градиент от зеленого к красному
}

// Сброс игры
function resetGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points = [];
    percentageDisplay.textContent = "0%";
    drawCenter();
}

// Обработчики событий
backButton.addEventListener('click', () => {
    window.history.back();
});

helpIcon.addEventListener('click', () => {
    helpText.style.display = helpText.style.display === 'block' ? 'none' : 'block';
});

canvas.addEventListener('mousedown', (e) => {
    startDrawing(e.clientX, e.clientY);
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    startDrawing(touch.clientX, touch.clientY);
});

canvas.addEventListener('mousemove', (e) => {
    draw(e.clientX, e.clientY);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    draw(touch.clientX, touch.clientY);
});

canvas.addEventListener('mouseup', () => {
    endDrawing();
});

canvas.addEventListener('touchend', () => {
    endDrawing();
});

reloadIcon.addEventListener('click', resetGame);

// Инициализация
drawCenter();


