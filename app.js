// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;

// Сообщаем телеграму, что приложение готово
tg.ready();

// Настройка цветов темы (опционально, если CSS переменных недостаточно)
document.documentElement.style.setProperty('--bg-color', tg.themeParams.bg_color || '#1c1c1e');
document.documentElement.style.setProperty('--text-color', tg.themeParams.text_color || '#ffffff');

// Функция получения параметров из URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        refs: parseInt(params.get('refs')) || 0,
        threshold: parseInt(params.get('threshold')) || 5,
        refLink: params.get('link') || '',
        rewardReceived: params.get('reward') === '1',
        userId: params.get('user_id') || '-----',
        firstName: params.get('first_name') || 'Пользователь'
    };
}

// Применяем данные к интерфейсу
function updateUI() {
    const params = getUrlParams();

    // Данные юзера из URL (надежнее для Reply кнопок)
    document.getElementById('user-name').textContent = params.firstName;
    document.getElementById('user-id').textContent = 'ID: ' + params.userId;

    // Попытка загрузить аватарку (используем плейсхолдер с инициалами)
    const initial = params.firstName.charAt(0);
    document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${initial}&background=007aff&color=fff&size=200`;

    // Обновляем статистику рефералов
    document.getElementById('ref-count').textContent = params.refs;
    document.getElementById('ref-threshold').textContent = params.threshold;

    // Вычисляем процент заполнения круга
    let percentage = (params.refs / params.threshold) * 100;
    if (percentage > 100) percentage = 100;

    // Анимируем прогресс-бар
    setTimeout(() => {
        const circle = document.getElementById('progress-circle');
        circle.style.background = `conic-gradient(var(--accent-color) ${percentage * 3.6}deg, var(--secondary-bg) 0deg)`;
    }, 100);

    // Статус награды и тексты
    const rewardStatus = document.getElementById('reward-status');
    const rewardText = document.getElementById('reward-text');
    const progressText = document.getElementById('progress-text');

    if (params.rewardReceived) {
        rewardStatus.className = 'reward-status success';
        rewardStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>VIP Получен</span>';
        progressText.textContent = 'Вы уже получили свою награду!';
        setTimeout(() => {
            document.getElementById('progress-circle').style.background = `conic-gradient(var(--success-color) 360deg, var(--secondary-bg) 0deg)`;
        }, 100);
    } else if (params.refs >= params.threshold) {
        rewardStatus.className = 'reward-status success';
        rewardStatus.innerHTML = '<i class="fa-solid fa-gift"></i> <span>VIP Доступен!</span>';
        progressText.textContent = 'Поздравляем! Заберите награду в меню бота.';
    } else {
        rewardStatus.className = 'reward-status pending';
        const left = params.threshold - params.refs;
        rewardText.textContent = `Осталось пригласить: ${left}`;
        progressText.textContent = 'Приглашайте друзей для получения VIP!';
    }
}

// Обработчики кнопок
document.getElementById('close-btn').addEventListener('click', () => {
    tg.close();
});

document.getElementById('share-btn').addEventListener('click', () => {
    const params = getUrlParams();
    if (!params.refLink) {
        tg.showAlert("Ссылка не найдена!");
        return;
    }

    const shareText = "🎁 Нажми и получи ОТВЕТЫ НА ОГЭ!";
    const url = `https://t.me/share/url?url=${encodeURIComponent(params.refLink)}&text=${encodeURIComponent(shareText)}`;

    // Открываем нативное окно шаринга телеграма
    tg.openTelegramLink(url);
});

// Запускаем
updateUI();
