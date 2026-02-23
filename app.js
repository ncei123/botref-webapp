// ===== Telegram Web App Init =====
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Устанавливаем цвета для нативного ощущения
try {
    tg.setHeaderColor('#0a0610');
    tg.setBackgroundColor('#0a0610');
} catch (e) { /* старые версии TG */ }

// ===== URL Parameters =====
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        refs: parseInt(params.get('refs')) || 0,
        threshold: parseInt(params.get('threshold')) || 5,
        refLink: params.get('link') || '',
        rewardReceived: params.get('reward') === '1',
        userId: params.get('user_id') || '-----',
        firstName: params.get('first_name') || 'Пользователь',
        joinDate: params.get('join_date') || ''
    };
}

// ===== Animated Counter =====
function animateCounter(element, targetValue, duration) {
    if (duration === undefined) duration = 800;
    var startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        // Easing: ease-out cubic
        var eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.floor(eased * targetValue);
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            element.textContent = targetValue;
        }
    }

    requestAnimationFrame(step);
}

// ===== Days Since Join =====
function daysSinceJoin(dateStr) {
    if (!dateStr) return '—';
    try {
        var joinDate = new Date(dateStr);
        var now = new Date();
        var diff = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24));
        return diff >= 0 ? diff : '—';
    } catch (e) {
        return '—';
    }
}

// ===== Achievements =====
function renderAchievements(refs, threshold, rewardReceived) {
    // Динамические вехи на основе реального порога
    var m25 = Math.max(2, Math.ceil(threshold * 0.25));
    var m50 = Math.max(3, Math.ceil(threshold * 0.5));
    var m75 = Math.max(4, Math.ceil(threshold * 0.75));

    var achievements = [
        { icon: '🚀', label: 'Старт', unlocked: true },
        { icon: '👤', label: '1 реферал', unlocked: refs >= 1 },
        { icon: '🔥', label: m25 + ' реф.', unlocked: refs >= m25 },
        { icon: '⭐', label: m50 + ' реф.', unlocked: refs >= m50 },
        { icon: '💎', label: m75 + ' реф.', unlocked: refs >= m75 },
        { icon: '🏆', label: threshold + ' реф.', unlocked: refs >= threshold },
        { icon: '👑', label: 'VIP', unlocked: rewardReceived }
    ];

    var grid = document.getElementById('achievements-grid');
    grid.innerHTML = '';

    achievements.forEach(function (a) {
        var div = document.createElement('div');
        div.className = 'achievement';

        var iconDiv = document.createElement('div');
        iconDiv.className = 'achievement-icon ' + (a.unlocked ? 'unlocked' : 'locked');
        iconDiv.textContent = a.icon;

        var labelDiv = document.createElement('div');
        labelDiv.className = 'achievement-label';
        labelDiv.textContent = a.label;

        div.appendChild(iconDiv);
        div.appendChild(labelDiv);
        grid.appendChild(div);
    });
}

// ===== Confetti Effect =====
function launchConfetti() {
    var container = document.getElementById('confetti-container');
    var colors = ['#ff2a5f', '#ff6b8a', '#ff9f0a', '#ffffff', '#e01245'];

    for (var i = 0; i < 40; i++) {
        (function (index) {
            setTimeout(function () {
                var piece = document.createElement('div');
                piece.className = 'confetti-piece';
                piece.style.left = (Math.random() * 100) + '%';
                piece.style.background = colors[Math.floor(Math.random() * colors.length)];
                piece.style.animationDuration = (2 + Math.random() * 2) + 's';
                piece.style.animationDelay = '0s';
                piece.style.width = (6 + Math.random() * 6) + 'px';
                piece.style.height = (6 + Math.random() * 6) + 'px';
                piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
                container.appendChild(piece);

                setTimeout(function () {
                    if (piece.parentNode) piece.parentNode.removeChild(piece);
                }, 4000);
            }, index * 50);
        })(i);
    }
}

// ===== Toast Notification =====
function showToast(message) {
    var toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(function () {
        toast.classList.remove('show');
    }, 2000);
}

// ===== Copy to Clipboard =====
function copyRefLink(link) {
    var box = document.getElementById('copy-link-box');

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(function () {
            box.classList.add('copied');
            showToast('✓ Ссылка скопирована!');
            haptic('success');
            setTimeout(function () { box.classList.remove('copied'); }, 2000);
        }).catch(function () {
            fallbackCopy(link, box);
        });
    } else {
        fallbackCopy(link, box);
    }
}

function fallbackCopy(text, box) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        box.classList.add('copied');
        showToast('✓ Ссылка скопирована!');
        haptic('success');
        setTimeout(function () { box.classList.remove('copied'); }, 2000);
    } catch (e) {
        showToast('Не удалось скопировать');
    }
    document.body.removeChild(textarea);
}

// ===== Haptic Feedback =====
function haptic(type) {
    try {
        if (tg.HapticFeedback) {
            if (type === 'success') {
                tg.HapticFeedback.notificationOccurred('success');
            } else if (type === 'light') {
                tg.HapticFeedback.impactOccurred('light');
            } else {
                tg.HapticFeedback.impactOccurred('medium');
            }
        }
    } catch (e) { /* Haptic not available */ }
}

// ===== Remove Skeletons =====
function removeSkeletons() {
    var skeletons = document.querySelectorAll('.skeleton');
    skeletons.forEach(function (s) {
        if (s.parentNode) s.parentNode.removeChild(s);
    });
}

// ===== Main UI Update =====
function updateUI() {
    var params = getUrlParams();

    // Small delay for skeleton effect
    setTimeout(function () {
        // Remove skeletons
        removeSkeletons();

        // Profile header
        document.getElementById('user-name').textContent = params.firstName;
        document.getElementById('user-id').textContent = 'ID: ' + params.userId;

        // VIP badge
        var badge = document.getElementById('vip-badge');
        if (params.rewardReceived) {
            badge.className = 'vip-badge active';
        } else {
            badge.className = 'vip-badge inactive';
        }

        // Stats cards
        var refsEl = document.getElementById('stat-refs');
        refsEl.textContent = '0';
        animateCounter(refsEl, params.refs, 600);




        var statusEl = document.getElementById('stat-status');
        statusEl.textContent = params.rewardReceived ? 'VIP' : 'Free';
        if (params.rewardReceived) {
            statusEl.style.color = '#ff2a5f';
        }

        // Progress circle
        document.getElementById('ref-count').textContent = '0';
        document.getElementById('ref-threshold').textContent = params.threshold;
        animateCounter(document.getElementById('ref-count'), params.refs, 900);

        var percentage = (params.refs / params.threshold) * 100;
        if (percentage > 100) percentage = 100;

        setTimeout(function () {
            var circle = document.getElementById('progress-circle');
            var deg = percentage * 3.6;
            circle.style.background = 'conic-gradient(#ff2a5f ' + deg + 'deg, rgba(255,255,255,0.05) 0deg)';

            // Glow intensity based on percentage
            var glowIntensity = 0.15 + (percentage / 100) * 0.35;
            circle.style.boxShadow = '0 0 ' + (30 + percentage * 0.3) + 'px rgba(255, 42, 95, ' + glowIntensity + ')';
        }, 200);

        // Reward status
        var rewardStatus = document.getElementById('reward-status');
        var progressText = document.getElementById('progress-text');

        if (params.rewardReceived) {
            rewardStatus.className = 'reward-status success';
            rewardStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>VIP Получен</span>';
            progressText.textContent = 'Вы уже получили свою награду!';
            setTimeout(function () {
                document.getElementById('progress-circle').style.background =
                    'conic-gradient(#ff2a5f 360deg, rgba(255,255,255,0.05) 0deg)';
            }, 100);
        } else if (params.refs >= params.threshold) {
            rewardStatus.className = 'reward-status success';
            rewardStatus.innerHTML = '<i class="fa-solid fa-gift"></i> <span>VIP Доступен!</span>';
            progressText.textContent = 'Поздравляем! Заберите награду в меню бота.';
            // Launch confetti
            setTimeout(function () { launchConfetti(); }, 500);
        } else {
            rewardStatus.className = 'reward-status pending';
            var left = params.threshold - params.refs;
            document.getElementById('reward-text').textContent = 'Осталось пригласить: ' + left;
            progressText.textContent = 'Приглашайте друзей для получения VIP!';
        }

        // Achievements
        renderAchievements(params.refs, params.threshold, params.rewardReceived);

        // Referral link display
        var linkDisplay = document.getElementById('ref-link-display');
        if (params.refLink) {
            // Show shortened version
            var shortLink = params.refLink.replace('https://', '').replace('http://', '');
            if (shortLink.length > 30) {
                shortLink = shortLink.substring(0, 28) + '...';
            }
            linkDisplay.textContent = shortLink;
        } else {
            linkDisplay.textContent = 'Ссылка недоступна';
        }

    }, 400); // skeleton delay
}

// ===== Event Listeners =====

// Close button
document.getElementById('close-btn').addEventListener('click', function () {
    haptic('light');
    tg.close();
});

// Share button
document.getElementById('share-btn').addEventListener('click', function () {
    haptic('medium');
    var params = getUrlParams();
    if (!params.refLink) {
        tg.showAlert('Ссылка не найдена!');
        return;
    }

    var shareText = '🎁 Нажми и получи ОТВЕТЫ НА ОГЭ!';
    var url = 'https://t.me/share/url?url=' + encodeURIComponent(params.refLink) + '&text=' + encodeURIComponent(shareText);
    tg.openTelegramLink(url);
});

// Copy link
document.getElementById('copy-link-box').addEventListener('click', function () {
    var params = getUrlParams();
    if (params.refLink) {
        copyRefLink(params.refLink);
    } else {
        showToast('Ссылка недоступна');
    }
});

// ===== Start =====
updateUI();
