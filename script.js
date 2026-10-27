/* ========================================
   SORRY KAJU KATLI - JAVASCRIPT
   Multi-step slideshow with fun interactions
   Fully Responsive + Touch Support + Telegram Notifications
   ======================================== */

// ========================================
// 🤖 TELEGRAM BOT CONFIGURATION
// ========================================
// Yahan apna Telegram Bot Token aur Chat ID paste karo:
const TELEGRAM_CONFIG = {
    botToken: '8940898567:AAEORf-flHMO50oGy-WRH23qT5SIftcdi3E', // Telegram @sorry_kaju_bot Token
    chatId: '5816487553', // Apna Telegram Chat ID
    enabled: true                // Telegram alerts enable/disable
};

// --- Telegram Notification Helper ---
async function sendTelegramNotification(message) {
    if (!TELEGRAM_CONFIG.enabled) return;
    if (!TELEGRAM_CONFIG.botToken || TELEGRAM_CONFIG.botToken === 'YOUR_BOT_TOKEN_HERE') {
        console.log('[Telegram Alert Skipped] Bot Token not set yet.');
        return;
    }
    if (!TELEGRAM_CONFIG.chatId || TELEGRAM_CONFIG.chatId === 'YOUR_CHAT_ID_HERE') {
        console.log('[Telegram Alert Skipped] Chat ID not set yet.');
        return;
    }

    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });
    } catch (error) {
        console.error('Telegram notification error:', error);
    }
}

// --- State ---
let currentSlide = 0;
const totalSlides = 7;
let isTouchDevice = false;
let hasNotifiedRunaway = false;

// --- Initialize on Load ---
document.addEventListener('DOMContentLoaded', () => {
    detectTouchDevice();
    setAppHeight();
    createFloatingHearts();
    createSparkles();
    initProgressDots();
    initSwipeSupport();
    setupRunawayButton();

    // Notify when website is opened (once per session)
    if (!sessionStorage.getItem('opened_notified')) {
        sessionStorage.setItem('opened_notified', 'true');
        const deviceType = isTouchDevice ? 'Mobile / Tablet 📱' : 'Laptop / PC 💻';
        const timeStr = new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        sendTelegramNotification(
            `🔔 <b>Kaju Katli ne website open kar li!</b> 💖\n\n` +
            `📱 <b>Device:</b> ${deviceType}\n` +
            `⏰ <b>Time:</b> ${timeStr}`
        );
    }
});

// --- Detect Touch Device ---
function detectTouchDevice() {
    isTouchDevice = ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0);
    
    if (isTouchDevice) {
        document.body.classList.add('touch-device');
    }
}

// --- Fix Mobile Viewport Height (100vh bug on mobile browsers) ---
function setAppHeight() {
    const vh = window.innerHeight;
    document.documentElement.style.setProperty('--app-height', `${vh}px`);
}

// Listen for resize (address bar show/hide on mobile)
window.addEventListener('resize', debounce(setAppHeight, 100));
window.addEventListener('orientationchange', () => {
    setTimeout(setAppHeight, 300);
});

// --- Debounce Utility ---
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// --- Floating Hearts ---
function createFloatingHearts() {
    const container = document.getElementById('heartsContainer');
    if (!container) return;

    const heartEmojis = ['💗', '💕', '💖', '💘', '💝', '♥️', '🩷', '🤍'];
    // Fewer hearts on mobile for performance
    const initialCount = isTouchDevice ? 10 : 20;
    const spawnInterval = isTouchDevice ? 1200 : 800;

    // Create initial batch
    for (let i = 0; i < initialCount; i++) {
        setTimeout(() => spawnHeart(container, heartEmojis), i * 300);
    }

    // Keep spawning hearts
    setInterval(() => spawnHeart(container, heartEmojis), spawnInterval);
}

function spawnHeart(container, emojis) {
    if (!container) return;

    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    // Random positioning & timing
    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = (14 + Math.random() * 18) + 'px';
    heart.style.animationDuration = (5 + Math.random() * 8) + 's';
    heart.style.animationDelay = Math.random() * 2 + 's';
    heart.style.opacity = (0.3 + Math.random() * 0.5).toString();

    container.appendChild(heart);

    // Cleanup after animation — limit total hearts for performance
    const maxHearts = isTouchDevice ? 20 : 40;
    setTimeout(() => {
        if (heart.parentNode) heart.parentNode.removeChild(heart);
    }, 15000);

    // Remove excess hearts
    while (container.children.length > maxHearts) {
        container.removeChild(container.firstChild);
    }
}

// --- Sparkles ---
function createSparkles() {
    const container = document.getElementById('sparklesContainer');
    if (!container) return;

    const count = isTouchDevice ? 15 : 30;

    for (let i = 0; i < count; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDuration = (1.5 + Math.random() * 2) + 's';
        sparkle.style.animationDelay = Math.random() * 3 + 's';
        const size = (3 + Math.random() * 5) + 'px';
        sparkle.style.width = size;
        sparkle.style.height = size;
        container.appendChild(sparkle);
    }
}

// --- Slide Navigation ---
function nextSlide() {
    if (currentSlide >= totalSlides - 1) return;

    const current = document.getElementById(`slide-${currentSlide}`);
    const next = document.getElementById(`slide-${currentSlide + 1}`);
    if (!current || !next) return;

    // Animate out
    current.classList.remove('active');
    current.classList.add('exit-left');

    // Animate in
    setTimeout(() => {
        next.classList.add('active');
        // Scroll content to top when entering new slide
        const content = next.querySelector('.slide-content');
        if (content) content.scrollTop = 0;
    }, 100);

    // Clean up exit class after transition
    setTimeout(() => {
        current.classList.remove('exit-left');
    }, 700);

    currentSlide++;
    updateProgressDots();

    // Trigger final slide effects
    if (currentSlide === totalSlides - 1) {
        triggerFinalEffects();
    }
}

function prevSlide() {
    if (currentSlide <= 0) return;

    const current = document.getElementById(`slide-${currentSlide}`);
    const prev = document.getElementById(`slide-${currentSlide - 1}`);
    if (!current || !prev) return;

    current.classList.remove('active');

    setTimeout(() => {
        prev.classList.add('active');
    }, 100);

    currentSlide--;
    updateProgressDots();
}

function goToSlide(index) {
    if (index === currentSlide || index < 0 || index >= totalSlides) return;

    const current = document.getElementById(`slide-${currentSlide}`);
    const target = document.getElementById(`slide-${index}`);
    if (!current || !target) return;

    current.classList.remove('active');
    current.classList.add('exit-left');

    setTimeout(() => {
        target.classList.add('active');
        const content = target.querySelector('.slide-content');
        if (content) content.scrollTop = 0;
    }, 100);

    setTimeout(() => {
        current.classList.remove('exit-left');
    }, 700);

    currentSlide = index;
    updateProgressDots();

    if (currentSlide === totalSlides - 1) {
        triggerFinalEffects();
    }
}

// --- Swipe Support for Mobile ---
function initSwipeSupport() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    const minSwipeDistance = 50;

    const appContainer = document.querySelector('.app-container');
    if (!appContainer) return;

    appContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    appContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;

        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;

        // Only trigger swipe if horizontal movement is dominant
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
            if (diffX > 0) {
                // Swipe left → next slide (only if not on a question slide that hasn't been answered)
                const isQuestionSlide = currentSlide >= 3 && currentSlide <= 5;
                const answerDiv = document.getElementById(`answer-${currentSlide}`);
                const isAnswered = answerDiv && answerDiv.classList.contains('show');
                
                if (!isQuestionSlide || isAnswered) {
                    nextSlide();
                }
            } else {
                // Swipe right → previous slide
                prevSlide();
            }
        }
    }, { passive: true });
}

// --- Progress Dots ---
function initProgressDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        const handler = () => {
            if (index <= currentSlide) {
                goToSlide(index);
            }
        };
        dot.addEventListener('click', handler);
        dot.addEventListener('touchend', (e) => {
            e.preventDefault();
            handler();
        });
    });
}

function updateProgressDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.remove('active', 'completed');
        if (index === currentSlide) {
            dot.classList.add('active');
        } else if (index < currentSlide) {
            dot.classList.add('completed');
        }
    });
}

// --- Question Handling & Telegram Answer Notification ---
function notifyTelegramAnswer(button, responseText) {
    const slide = button.closest('.slide');
    const questionTitle = slide ? (slide.querySelector('.question-title')?.textContent || '').trim() : `Question`;
    const questionText = slide ? (slide.querySelector('.question-text')?.textContent || '').trim() : '';
    const chosenOption = button.textContent.trim().replace(/\s+/g, ' ');

    const fullQuestion = questionText ? `<b>${questionTitle}</b>\n<i>"${questionText}"</i>` : `<b>${questionTitle}</b>`;
    const timeStr = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const msg = `💌 <b>Kaju Katli ka Jawab Aaya!</b> 🌸\n\n` +
                `❓ <b>Sawaal:</b>\n${fullQuestion}\n\n` +
                `👉 <b>Uska Answer:</b> <code>${chosenOption}</code>\n` +
                `💬 <b>Reaction Text:</b> <i>${responseText}</i>\n\n` +
                `⏰ <b>Time:</b> ${timeStr}`;

    sendTelegramNotification(msg);
}

function handleAnswer(button, responseText, showNext) {
    const slideIndex = currentSlide;
    const answerDiv = document.getElementById(`answer-${slideIndex}`);
    const nextBtn = document.getElementById(`next-${slideIndex}`);

    // Mark selected option
    const options = button.parentElement.querySelectorAll('.option-btn');
    options.forEach(opt => {
        opt.classList.remove('selected');
        opt.style.pointerEvents = 'none';
        opt.style.opacity = '0.6';
    });
    button.classList.add('selected');
    button.style.opacity = '1';

    // Show response
    if (answerDiv) {
        answerDiv.innerHTML = `<p>${responseText}</p>`;
        answerDiv.classList.add('show');
    }

    // Send Telegram Notification
    notifyTelegramAnswer(button, responseText);

    // Show next button
    if (nextBtn) {
        setTimeout(() => {
            nextBtn.classList.remove('hidden');
            nextBtn.style.animation = 'fadeInUp 0.5s ease-out';
            
            // Scroll the button into view on mobile
            setTimeout(() => {
                nextBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }, 800);
    }

    // Burst of hearts on answer
    burstHearts(5);
}

// --- Runaway Button Setup ---
function setupRunawayButton() {
    const runawayBtn = document.getElementById('runawayBtn');
    if (!runawayBtn) return;

    if (isTouchDevice) {
        // On touch devices: button jumps on tap instead of hover
        let tapCount = 0;
        
        runawayBtn.addEventListener('touchstart', (e) => {
            tapCount++;

            if (!hasNotifiedRunaway) {
                hasNotifiedRunaway = true;
                sendTelegramNotification(
                    `🏃‍♀️ <b>Kaju Katli ne 'Nahi karungi! 😤' button dabane ki koshish ki!</b>\n` +
                    `Hehe button bhaag gaya! Maaf toh karna hi padega 😜💕`
                );
            }
            
            if (tapCount >= 4) {
                // After enough taps, let them click it
                runawayBtn.textContent = 'Okay okay... thik hai 😅';
                runawayBtn.onclick = function () {
                    handleAnswer(runawayBtn, 'Hehe finally maan gayi! 🤭💗 Mujhe pata tha tu maan jayegi!', false);
                    const nextBtn = document.getElementById('next-5');
                    if (nextBtn) {
                        setTimeout(() => {
                            nextBtn.classList.remove('hidden');
                            nextBtn.style.animation = 'fadeInUp 0.5s ease-out';
                        }, 800);
                    }
                };
                return;
            }
            
            e.preventDefault();
            moveButtonTouch(runawayBtn);
        }, { passive: false });

        // Store tap count for reset
        runawayBtn.dataset.tapCount = '0';
    }
    // Desktop hover behavior is handled via onmouseover in HTML
}

function moveButtonTouch(btn) {
    const parent = btn.parentElement;
    if (!parent) return;
    
    const parentRect = parent.getBoundingClientRect();
    const maxX = parentRect.width * 0.25;
    const maxY = 40;
    const randomX = (Math.random() - 0.5) * maxX;
    const randomY = (Math.random() - 0.5) * maxY;

    btn.style.transform = `translate(${randomX}px, ${randomY}px)`;
    btn.style.transition = 'transform 0.3s ease';
}

// --- Runaway Button (Desktop - mouseover) ---
function moveButton(btn) {
    if (isTouchDevice) return; // Skip on touch devices, handled separately

    if (!hasNotifiedRunaway) {
        hasNotifiedRunaway = true;
        sendTelegramNotification(
            `🏃‍♀️ <b>Kaju Katli ne mouse 'Nahi karungi! 😤' pe le gaya!</b>\n` +
            `Lekin button bhaag gaya! 😜💕`
        );
    }

    const parent = btn.parentElement;
    if (!parent) return;

    const maxX = Math.min(window.innerWidth * 0.3, 200);
    const maxY = 80;
    const randomX = (Math.random() - 0.5) * maxX;
    const randomY = (Math.random() - 0.5) * maxY;

    btn.style.transform = `translate(${randomX}px, ${randomY}px)`;
    btn.style.transition = 'transform 0.3s ease';

    // After a few dodges, let the user click it
    if (!btn.dataset.dodgeCount) btn.dataset.dodgeCount = '0';
    btn.dataset.dodgeCount = (parseInt(btn.dataset.dodgeCount) + 1).toString();

    if (parseInt(btn.dataset.dodgeCount) >= 5) {
        btn.style.transform = 'translate(0, 0)';
        btn.onmouseover = null;
        btn.textContent = 'Okay okay... thik hai 😅';
        btn.onclick = function () {
            handleAnswer(btn, 'Hehe finally maan gayi! 🤭💗 Mujhe pata tha tu maan jayegi!', false);
            const nextBtn = document.getElementById('next-5');
            if (nextBtn) {
                setTimeout(() => {
                    nextBtn.classList.remove('hidden');
                    nextBtn.style.animation = 'fadeInUp 0.5s ease-out';
                }, 800);
            }
        };
    }
}

// --- Burst Hearts Effect ---
function burstHearts(count) {
    const container = document.getElementById('heartsContainer');
    if (!container) return;

    const burstCount = isTouchDevice ? Math.min(count, 3) : count;

    for (let i = 0; i < burstCount; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.textContent = ['💗', '💕', '💖', '🩷'][Math.floor(Math.random() * 4)];
            heart.style.left = (30 + Math.random() * 40) + '%';
            heart.style.fontSize = (20 + Math.random() * 16) + 'px';
            heart.style.animationDuration = (3 + Math.random() * 3) + 's';
            heart.style.opacity = '0.9';
            container.appendChild(heart);

            setTimeout(() => {
                if (heart.parentNode) heart.parentNode.removeChild(heart);
            }, 8000);
        }, i * 200);
    }
}

// --- Final Slide Effects ---
function triggerFinalEffects() {
    // Emoji rain
    const rainContainer = document.getElementById('finalRain');
    if (!rainContainer) return;

    const rainEmojis = ['💗', '💕', '🐻', '🐼', '💖', '✨', '🥺', '💝', '🩷'];
    const rainCount = isTouchDevice ? 8 : 15;

    for (let i = 0; i < rainCount; i++) {
        setTimeout(() => {
            const emoji = document.createElement('div');
            emoji.className = 'rain-emoji';
            emoji.textContent = rainEmojis[Math.floor(Math.random() * rainEmojis.length)];
            emoji.style.left = Math.random() * 100 + '%';
            emoji.style.animationDuration = (2 + Math.random() * 3) + 's';
            emoji.style.animationDelay = Math.random() * 2 + 's';
            rainContainer.appendChild(emoji);
        }, i * 200);
    }

    // Confetti burst
    triggerConfetti();

    // Extra floating hearts
    burstHearts(isTouchDevice ? 8 : 15);

    // Send Telegram Notification
    sendTelegramNotification(
        `🎉 <b>YAYYY! Kaju Katli ne Final Slide dekh li!</b> 🐻💗🐼\n\n` +
        `✨ Usne poora apology aur promise dekh liya hai! Mission Successful! 💖`
    );
}

// --- Confetti ---
function triggerConfetti() {
    const colors = ['#ff4d94', '#ff80b5', '#ffb3d1', '#ffd6e7', '#fff0f5', '#ffffff', '#ff6b9d'];
    const confettiCount = isTouchDevice ? 25 : 50;

    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            const size = (6 + Math.random() * 8) + 'px';
            confetti.style.width = size;
            confetti.style.height = size;
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            document.body.appendChild(confetti);

            setTimeout(() => {
                if (confetti.parentNode) confetti.parentNode.removeChild(confetti);
            }, 4000);
        }, i * 60);
    }
}

// --- Replay ---
function replayFromStart() {
    hasNotifiedRunaway = false;

    // Reset all slides
    document.querySelectorAll('.slide').forEach(slide => {
        slide.classList.remove('active', 'exit-left');
    });

    // Reset answers and buttons
    for (let i = 3; i <= 5; i++) {
        const answerDiv = document.getElementById(`answer-${i}`);
        if (answerDiv) {
            answerDiv.classList.remove('show');
            answerDiv.innerHTML = '';
        }
        const nextBtn = document.getElementById(`next-${i}`);
        if (nextBtn) nextBtn.classList.add('hidden');
    }

    // Reset option buttons
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.style.pointerEvents = '';
        btn.style.opacity = '';
        btn.style.transform = '';
    });

    // Reset runaway button
    const runawayBtn = document.getElementById('runawayBtn');
    if (runawayBtn) {
        runawayBtn.textContent = 'Nahi karungi! 😤';
        runawayBtn.dataset.dodgeCount = '0';
        runawayBtn.style.transform = '';

        if (isTouchDevice) {
            // Re-setup touch handler
            setupRunawayButton();
        } else {
            runawayBtn.onmouseover = function () { moveButton(this); };
            runawayBtn.onclick = function () {
                handleAnswer(this, 'Hehe button toh pakad! 😜 Maaf toh karna hi padega! 💕', false);
            };
        }
    }

    // Clear final rain
    const finalRain = document.getElementById('finalRain');
    if (finalRain) finalRain.innerHTML = '';

    // Go to first slide
    currentSlide = 0;
    const firstSlide = document.getElementById('slide-0');
    if (firstSlide) firstSlide.classList.add('active');
    updateProgressDots();

    // Telegram notification for replay
    sendTelegramNotification(`🔄 <b>Kaju Katli ne 'Phir se dekho 🔄💗' dabaya!</b>\nWebsite dobara shuru hui hai! 🥺`);
}

// --- Prevent iOS bounce/overscroll ---
document.body.addEventListener('touchmove', (e) => {
    // Allow scrolling inside slide-content
    const slideContent = e.target.closest('.slide-content');
    if (slideContent && slideContent.scrollHeight > slideContent.clientHeight) {
        return; // Allow scroll inside overflowing content
    }
    // Prevent page bounce
    if (e.target.closest('.options-container') || e.target.closest('.btn-next')) {
        return;
    }
}, { passive: true });
