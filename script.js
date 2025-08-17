// 應用狀態管理
class AppState {
    constructor() {
        this.currentUser = null;
        this.wines = JSON.parse(localStorage.getItem('wines')) || [];
        this.moods = JSON.parse(localStorage.getItem('moods')) || {};
        this.badges = JSON.parse(localStorage.getItem('badges')) || [];
        this.vipLevel = parseInt(localStorage.getItem('vipLevel')) || 1;
        this.deviceConnected = false;
        this.currentPage = 'homePage';
        this.timer = {
            isRunning: false,
            timeLeft: 30,
            interval: null
        };
        this.lighting = {
            red: 255,
            green: 255,
            blue: 255,
            brightness: 100,
            flashMode: 'off',
            flashInterval: null
        };
    }

    saveState() {
        localStorage.setItem('wines', JSON.stringify(this.wines));
        localStorage.setItem('moods', JSON.stringify(this.moods));
        localStorage.setItem('badges', JSON.stringify(this.badges));
        localStorage.setItem('vipLevel', this.vipLevel.toString());
    }

    addWine(wine) {
        this.wines.unshift(wine);
        this.saveState();
        this.checkBadges();
        this.updateVipLevel();
    }

    addMood(date, mood) {
        this.moods[date] = mood;
        this.saveState();
        this.checkBadges();
    }

    checkBadges() {
        const newBadges = [];
        
        // 第一個葡萄酒日誌
        if (this.wines.length >= 1 && !this.badges.includes('first_wine')) {
            newBadges.push('first_wine');
        }
        
        // 第一個藍牙連接
        if (this.deviceConnected && !this.badges.includes('first_bluetooth')) {
            newBadges.push('first_bluetooth');
        }
        
        // 7天心情追蹤
        const moodDates = Object.keys(this.moods);
        if (moodDates.length >= 7 && !this.badges.includes('mood_streak')) {
            newBadges.push('mood_streak');
        }
        
        // 10瓶葡萄酒記錄
        if (this.wines.length >= 10 && !this.badges.includes('wine_collector')) {
            newBadges.push('wine_collector');
        }

        if (newBadges.length > 0) {
            this.badges.push(...newBadges);
            this.saveState();
            newBadges.forEach(badge => showNotification(`獲得新徽章: ${getBadgeName(badge)}!`, 'success'));
        }
    }

    updateVipLevel() {
        const points = this.wines.length * 10 + Object.keys(this.moods).length * 5;
        this.vipLevel = Math.floor(points / 100) + 1;
        this.saveState();
    }
}

// 全局應用狀態
const appState = new AppState();

// 預定義標籤
const WINE_TAGS = [
    'fruity', 'floral', 'spicy', 'woody', 'herbal', 'mineral', 
    'nutty', 'smoky', 'citrus', 'vanilla', 'chocolate', 'leather',
    'earthy', 'tannic', 'acidic', 'sweet', 'dry', 'full-bodied',
    'light', 'complex'
];

// 徽章定義
const BADGE_DEFINITIONS = {
    'first_wine': { name: '葡萄酒新手', icon: 'fas fa-wine-bottle', description: '記錄第一瓶葡萄酒' },
    'first_bluetooth': { name: '設備連接', icon: 'fas fa-bluetooth-b', description: '首次連接藍牙設備' },
    'mood_streak': { name: '心情追蹤者', icon: 'fas fa-smile', description: '連續7天記錄心情' },
    'wine_collector': { name: '葡萄酒收藏家', icon: 'fas fa-trophy', description: '記錄10瓶葡萄酒' }
};

// 工具函數
function getBadgeName(badgeId) {
    return BADGE_DEFINITIONS[badgeId]?.name || badgeId;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    const container = document.getElementById('notificationContainer');
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 頁面導航
function navigateToPage(pageId) {
    // 隱藏所有頁面
    document.querySelectorAll('.content-page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 顯示目標頁面
    document.getElementById(pageId).classList.add('active');
    
    // 更新底部導航
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
    
    appState.currentPage = pageId;
}

// 登入功能
function initializeLogin() {
    const loginBtn = document.getElementById('googleLoginBtn');
    loginBtn.addEventListener('click', () => {
        // 模擬 Google 登入
        appState.currentUser = {
            name: '葡萄酒愛好者',
            email: 'wine.lover@example.com'
        };
        
        document.getElementById('loginPage').classList.remove('active');
        document.getElementById('appPage').classList.add('active');
        
        updateUserInfo();
        showNotification('歡迎使用 Lisse Somm!', 'success');
    });
}

// 更新用戶信息
function updateUserInfo() {
    if (appState.currentUser) {
        document.getElementById('userName').textContent = appState.currentUser.name;
        document.getElementById('userEmail').textContent = appState.currentUser.email;
        document.getElementById('vipLevel').textContent = appState.vipLevel;
    }
}

// 計時器功能
class Timer {
    constructor() {
        this.isRunning = false;
        this.timeLeft = 30;
        this.interval = null;
        this.initializeTimer();
    }

    initializeTimer() {
        const slider = document.getElementById('timerSlider');
        const display = document.getElementById('timerDisplay');
        const startBtn = document.getElementById('startTimer');
        const pauseBtn = document.getElementById('pauseTimer');
        const resetBtn = document.getElementById('resetTimer');

        slider.addEventListener('input', (e) => {
            this.timeLeft = parseInt(e.target.value);
            display.textContent = formatTime(this.timeLeft);
        });

        startBtn.addEventListener('click', () => this.start());
        pauseBtn.addEventListener('click', () => this.pause());
        resetBtn.addEventListener('click', () => this.reset());
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            document.getElementById('startTimer').disabled = true;
            document.getElementById('pauseTimer').disabled = false;
            
            this.interval = setInterval(() => {
                this.timeLeft--;
                document.getElementById('timerDisplay').textContent = formatTime(this.timeLeft);
                
                if (this.timeLeft <= 0) {
                    this.complete();
                }
            }, 1000);
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.interval);
            document.getElementById('startTimer').disabled = false;
            document.getElementById('pauseTimer').disabled = true;
        }
    }

    reset() {
        this.pause();
        this.timeLeft = parseInt(document.getElementById('timerSlider').value);
        document.getElementById('timerDisplay').textContent = formatTime(this.timeLeft);
        document.getElementById('startTimer').disabled = false;
        document.getElementById('pauseTimer').disabled = true;
    }

    complete() {
        this.pause();
        showNotification('醒酒完成！', 'success');
        
        // 閃爍效果
        const display = document.getElementById('timerDisplay');
        let flashCount = 0;
        const flashInterval = setInterval(() => {
            display.style.opacity = display.style.opacity === '0.5' ? '1' : '0.5';
            flashCount++;
            if (flashCount >= 10) {
                clearInterval(flashInterval);
                display.style.opacity = '1';
            }
        }, 250);
    }
}

// 燈光控制功能
class LightingControl {
    constructor() {
        this.red = 255;
        this.green = 255;
        this.blue = 255;
        this.brightness = 100;
        this.flashMode = 'off';
        this.flashInterval = null;
        this.initializeLighting();
    }

    initializeLighting() {
        const redSlider = document.getElementById('redSlider');
        const greenSlider = document.getElementById('greenSlider');
        const blueSlider = document.getElementById('blueSlider');
        const brightnessSlider = document.getElementById('brightnessSlider');
        const preview = document.getElementById('colorPreview');

        const updateColor = () => {
            this.red = parseInt(redSlider.value);
            this.green = parseInt(greenSlider.value);
            this.blue = parseInt(blueSlider.value);
            this.brightness = parseInt(brightnessSlider.value);
            
            document.getElementById('redValue').textContent = this.red;
            document.getElementById('greenValue').textContent = this.green;
            document.getElementById('blueValue').textContent = this.blue;
            document.getElementById('brightnessValue').textContent = this.brightness + '%';
            
            const alpha = this.brightness / 100;
            preview.style.background = `rgba(${this.red}, ${this.green}, ${this.blue}, ${alpha})`;
        };

        redSlider.addEventListener('input', updateColor);
        greenSlider.addEventListener('input', updateColor);
        blueSlider.addEventListener('input', updateColor);
        brightnessSlider.addEventListener('input', updateColor);

        // 閃爍模式
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.setFlashMode(e.target.dataset.speed);
            });
        });

        updateColor();
    }

    setFlashMode(mode) {
        this.flashMode = mode;
        if (this.flashInterval) {
            clearInterval(this.flashInterval);
            this.flashInterval = null;
        }

        if (mode !== 'off') {
            const intervals = {
                'fast': 333,    // 3次/秒
                'medium': 1000, // 1次/秒
                'slow': 2000    // 1次/2秒
            };

            this.flashInterval = setInterval(() => {
                const preview = document.getElementById('colorPreview');
                preview.style.opacity = preview.style.opacity === '0.3' ? '1' : '0.3';
            }, intervals[mode]);
        }
    }
}

// 葡萄酒日誌功能
class WineJournal {
    constructor() {
        this.initializeJournal();
    }

    initializeJournal() {
        const addBtn = document.getElementById('addWineBtn');
        const modal = document.getElementById('addWineModal');
        const closeBtn = document.getElementById('closeWineModal');
        const cancelBtn = document.getElementById('cancelWine');
        const form = document.getElementById('wineForm');

        addBtn.addEventListener('click', () => {
            modal.classList.add('active');
            this.initializeForm();
        });

        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveWine();
        });

        // 點擊模態框外部關閉
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        this.renderWineList();
    }

    initializeForm() {
        // 重置表單
        document.getElementById('wineForm').reset();
        document.getElementById('ratingValue').textContent = '0.0';
        document.querySelectorAll('.stars i').forEach(star => {
            star.className = 'far fa-star';
        });

        // 初始化標籤
        const tagsContainer = document.getElementById('tagsContainer');
        tagsContainer.innerHTML = '';
        WINE_TAGS.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = tag;
            tagElement.addEventListener('click', () => {
                tagElement.classList.toggle('selected');
            });
            tagsContainer.appendChild(tagElement);
        });

        // 初始化評分
        document.querySelectorAll('.stars i').forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                this.updateRating(rating);
            });
        });

        // 初始化相機
        document.getElementById('captureLabel').addEventListener('click', () => {
            this.simulateCameraCapture();
        });
    }

    updateRating(rating) {
        const stars = document.querySelectorAll('.stars i');
        const ratingValue = document.getElementById('ratingValue');
        
        stars.forEach((star, index) => {
            if (index < rating) {
                star.className = 'fas fa-star';
            } else {
                star.className = 'far fa-star';
            }
        });
        
        ratingValue.textContent = rating.toFixed(1);
    }

    simulateCameraCapture() {
        const preview = document.getElementById('labelPreview');
        preview.innerHTML = '<i class="fas fa-camera" style="font-size: 3rem; color: #3498db;"></i><br>模擬拍攝酒標';
        preview.style.background = '#f8f9fa';
        
        // 模擬 OCR 識別
        setTimeout(() => {
            document.getElementById('wineName').value = 'Château Margaux 2015';
            document.getElementById('wineYear').value = '2015';
            document.getElementById('wineWinery').value = 'Château Margaux';
            document.getElementById('wineVarietal').value = 'Cabernet Sauvignon';
            showNotification('酒標識別完成！', 'success');
        }, 2000);
    }

    saveWine() {
        const wine = {
            id: Date.now(),
            name: document.getElementById('wineName').value,
            year: document.getElementById('wineYear').value,
            winery: document.getElementById('wineWinery').value,
            varietal: document.getElementById('wineVarietal').value,
            rating: parseFloat(document.getElementById('ratingValue').textContent),
            tags: Array.from(document.querySelectorAll('.tag.selected')).map(tag => tag.textContent),
            notes: document.getElementById('wineNotes').value,
            date: new Date().toISOString()
        };

        appState.addWine(wine);
        this.closeModal();
        this.renderWineList();
        this.renderWineCabinet();
        showNotification('葡萄酒記錄已儲存！', 'success');
    }

    closeModal() {
        document.getElementById('addWineModal').classList.remove('active');
    }

    renderWineList() {
        const wineList = document.getElementById('wineList');
        wineList.innerHTML = '';

        if (appState.wines.length === 0) {
            wineList.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 2rem;">還沒有葡萄酒記錄，點擊上方按鈕新增第一瓶葡萄酒！</p>';
            return;
        }

        appState.wines.forEach(wine => {
            const wineEntry = document.createElement('div');
            wineEntry.className = 'wine-entry';
            wineEntry.innerHTML = `
                <h4>${wine.name} ${wine.year}</h4>
                <p>${wine.winery} - ${wine.varietal}</p>
                <div class="wine-rating">
                    ${'★'.repeat(Math.floor(wine.rating))}${'☆'.repeat(5 - Math.floor(wine.rating))} ${wine.rating}
                </div>
                ${wine.tags.length > 0 ? `<p>標籤: ${wine.tags.join(', ')}</p>` : ''}
                ${wine.notes ? `<p>筆記: ${wine.notes}</p>` : ''}
            `;
            wineList.appendChild(wineEntry);
        });
    }

    renderWineCabinet() {
        const bottleContainer = document.getElementById('bottleContainer');
        bottleContainer.innerHTML = '';

        appState.wines.forEach((wine, index) => {
            const bottle = document.createElement('div');
            bottle.className = 'wine-bottle';
            bottle.title = `${wine.name} ${wine.year}`;
            bottle.style.animationDelay = `${index * 0.2}s`;
            bottleContainer.appendChild(bottle);
        });
    }
}

// 心情追蹤功能
class MoodTracker {
    constructor() {
        this.initializeMoodTracker();
    }

    initializeMoodTracker() {
        // 心情選擇器
        document.querySelectorAll('.mood-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.mood-option').forEach(opt => opt.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                
                const mood = e.currentTarget.dataset.mood;
                this.saveMood(mood);
            });
        });

        this.renderMoodCalendar();
        this.checkTodayMood();
    }

    saveMood(mood) {
        const today = new Date().toISOString().split('T')[0];
        appState.addMood(today, mood);
        this.renderMoodCalendar();
        showNotification('心情已記錄！', 'success');
    }

    checkTodayMood() {
        const today = new Date().toISOString().split('T')[0];
        const todayMood = appState.moods[today];
        
        if (todayMood) {
            document.querySelectorAll('.mood-option').forEach(option => {
                option.classList.remove('selected');
                if (option.dataset.mood === todayMood) {
                    option.classList.add('selected');
                }
            });
        }
    }

    renderMoodCalendar() {
        const calendar = document.getElementById('moodCalendar');
        calendar.innerHTML = '';

        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // 添加星期標題
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        weekdays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day';
            dayHeader.textContent = day;
            dayHeader.style.fontWeight = 'bold';
            calendar.appendChild(dayHeader);
        });

        // 填充月初空白天數
        for (let i = 0; i < startDate.getDay(); i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day';
            calendar.appendChild(emptyDay);
        }

        // 填充日期
        for (let date = 1; date <= endDate.getDate(); date++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = date;

            const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
            if (appState.moods[dateString]) {
                dayElement.classList.add('has-mood');
                dayElement.title = `心情: ${this.getMoodName(appState.moods[dateString])}`;
            }

            calendar.appendChild(dayElement);
        }
    }

    getMoodName(mood) {
        const moodNames = {
            'excellent': '極佳',
            'good': '良好',
            'neutral': '一般',
            'bad': '不佳',
            'terrible': '糟糕'
        };
        return moodNames[mood] || mood;
    }
}

// 徽章系統
class BadgeSystem {
    constructor() {
        this.renderBadges();
    }

    renderBadges() {
        const badgesGrid = document.getElementById('badgesGrid');
        badgesGrid.innerHTML = '';

        Object.entries(BADGE_DEFINITIONS).forEach(([badgeId, badge]) => {
            const badgeElement = document.createElement('div');
            badgeElement.className = `badge ${appState.badges.includes(badgeId) ? 'unlocked' : 'locked'}`;
            badgeElement.innerHTML = `
                <i class="${badge.icon}"></i>
                <span>${badge.name}</span>
            `;
            badgeElement.title = badge.description;
            badgesGrid.appendChild(badgeElement);
        });
    }
}

// 藍牙連接功能
function initializeBluetooth() {
    const bluetoothBtn = document.getElementById('bluetoothBtn');
    bluetoothBtn.addEventListener('click', () => {
        if (!appState.deviceConnected) {
            // 模擬藍牙連接
            setTimeout(() => {
                appState.deviceConnected = true;
                bluetoothBtn.style.color = '#27ae60';
                showNotification('設備連接成功！', 'success');
                appState.checkBadges();
            }, 2000);
        } else {
            appState.deviceConnected = false;
            bluetoothBtn.style.color = '#7f8c8d';
            showNotification('設備已斷開連接', 'info');
        }
    });
}

// 帳戶頁面
function initializeAccount() {
    const accountBtn = document.getElementById('accountBtn');
    accountBtn.addEventListener('click', () => {
        navigateToPage('accountPage');
        updateUserInfo();
        badgeSystem.renderBadges();
    });
}

// 快速操作按鈕
function initializeQuickActions() {
    document.getElementById('timerBtn').addEventListener('click', () => navigateToPage('timerPage'));
    document.getElementById('lightingBtn').addEventListener('click', () => navigateToPage('lightingPage'));
    document.getElementById('journalBtn').addEventListener('click', () => navigateToPage('journalPage'));
    document.getElementById('moodBtn').addEventListener('click', () => navigateToPage('moodPage'));
}

// 底部導航
function initializeBottomNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const pageId = e.currentTarget.dataset.page;
            navigateToPage(pageId);
        });
    });
}

// 初始化應用
let timer, lightingControl, wineJournal, moodTracker, badgeSystem;

document.addEventListener('DOMContentLoaded', () => {
    // 初始化所有功能
    initializeLogin();
    initializeBluetooth();
    initializeAccount();
    initializeQuickActions();
    initializeBottomNavigation();

    // 初始化功能類
    timer = new Timer();
    lightingControl = new LightingControl();
    wineJournal = new WineJournal();
    moodTracker = new MoodTracker();
    badgeSystem = new BadgeSystem();

    // 渲染初始數據
    wineJournal.renderWineCabinet();
    updateUserInfo();
});

// 模擬數據（用於演示）
function addDemoData() {
    // 添加一些示例葡萄酒
    const demoWines = [
        {
            id: Date.now() - 3000000,
            name: 'Château Margaux',
            year: '2015',
            winery: 'Château Margaux',
            varietal: 'Cabernet Sauvignon',
            rating: 4.8,
            tags: ['complex', 'full-bodied', 'tannic'],
            notes: '優雅的香氣，單寧細膩，餘韻悠長',
            date: new Date(Date.now() - 3000000).toISOString()
        },
        {
            id: Date.now() - 2000000,
            name: 'Dom Pérignon',
            year: '2012',
            winery: 'Moët & Chandon',
            varietal: 'Chardonnay',
            rating: 4.6,
            tags: ['fruity', 'citrus', 'mineral'],
            notes: '清新的柑橘香氣，氣泡細緻',
            date: new Date(Date.now() - 2000000).toISOString()
        }
    ];

    demoWines.forEach(wine => {
        if (!appState.wines.find(w => w.name === wine.name)) {
            appState.addWine(wine);
        }
    });

    // 添加一些示例心情
    const demoMoods = {
        [new Date(Date.now() - 86400000).toISOString().split('T')[0]]: 'good',
        [new Date(Date.now() - 172800000).toISOString().split('T')[0]]: 'excellent',
        [new Date(Date.now() - 259200000).toISOString().split('T')[0]]: 'neutral'
    };

    Object.entries(demoMoods).forEach(([date, mood]) => {
        if (!appState.moods[date]) {
            appState.addMood(date, mood);
        }
    });

    // 重新渲染
    wineJournal.renderWineList();
    wineJournal.renderWineCabinet();
    moodTracker.renderMoodCalendar();
    badgeSystem.renderBadges();
}

// 在開發模式下添加演示數據
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setTimeout(addDemoData, 1000);
}
