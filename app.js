// Advanced Habit Tracker Application
class HabitTrackerPro {
    constructor() {
        this.data = this.loadData();
        this.currentPeriod = 'week';
        this.motivationalQuotes = [
            "Каждый день - новая возможность стать лучше!",
            "Маленькие шаги ведут к большим результатам.",
            "Твое тело может все, убеди в этом свой разум!",
            "Успех - это сумма маленьких усилий день за днем.",
            "Не останавливайся, пока не станешь гордиться собой!",
            "Дисциплина сильнее мотивации.",
            "Единственная плохая тренировка - та, которой не было.",
            "Ты сильнее, чем думаешь!",
            "Здоровье - это не цель, а образ жизни.",
            "Начни сегодня, благодари себя завтра."
        ];

        this.achievements = [
            { id: 'first_day', icon: '🌟', title: 'Первый шаг', desc: 'Начать отслеживать привычки', check: (data) => this.getTotalDays() >= 1 },
            { id: 'week_streak', icon: '🔥', title: 'Неделя силы', desc: '7 дней подряд', check: (data) => this.getMaxStreak() >= 7 },
            { id: 'month_streak', icon: '💪', title: 'Месяц мощи', desc: '30 дней подряд', check: (data) => this.getMaxStreak() >= 30 },
            { id: 'run_10k', icon: '🏃', title: 'Марафонец', desc: 'Пробежать 10 км', check: (data) => this.getMaxDistance('running') >= 10 },
            { id: 'run_50k', icon: '🏃‍♂️', title: 'Супер бегун', desc: 'Пробежать 50 км за месяц', check: (data) => this.getMonthlyDistance('running') >= 50 },
            { id: 'cycle_20k', icon: '🚴', title: 'Велогонщик', desc: 'Проехать 20 км', check: (data) => this.getMaxDistance('cycling') >= 20 },
            { id: 'cycle_100k', icon: '🚴‍♂️', title: 'Супер райдер', desc: 'Проехать 100 км за месяц', check: (data) => this.getMonthlyDistance('cycling') >= 100 },
            { id: 'eating_week', icon: '🍽️', title: 'Контроль недели', desc: '7 дней без переедания', check: (data) => this.calculateStreak(data.overeating) >= 7 },
            { id: 'eating_month', icon: '⭐', title: 'Идеальное питание', desc: '30 дней без переедания', check: (data) => this.calculateStreak(data.overeating) >= 30 },
            { id: 'all_three', icon: '👑', title: 'Мастер привычек', desc: 'Все 3 привычки в один день', check: (data) => this.getAllThreeInOneDay() },
            { id: 'fast_5k', icon: '⚡', title: 'Спринтер', desc: '5 км быстрее 30 мин', check: (data) => this.getFastestPace('running') <= 6 },
            { id: 'consistent', icon: '📊', title: 'Постоянство', desc: '10 тренировок за месяц', check: (data) => this.getMonthlyWorkouts() >= 10 }
        ];

        this.init();
    }

    init() {
        this.updateDate();
        this.showMotivationalQuote();
        this.setupEventListeners();
        this.renderAll();
        this.checkNewAchievements();
    }

    // Data Management
    loadData() {
        const stored = localStorage.getItem('habitTrackerProData');
        if (stored) {
            return JSON.parse(stored);
        }
        return {
            overeating: {},
            running: {},
            cycling: {},
            achievements: []
        };
    }

    saveData() {
        localStorage.setItem('habitTrackerProData', JSON.stringify(this.data));
    }

    getToday() {
        return new Date().toISOString().split('T')[0];
    }

    // Display current date
    updateDate() {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const today = new Date().toLocaleDateString('ru-RU', options);
        document.getElementById('currentDate').textContent = today;
    }

    // Motivational Quote
    showMotivationalQuote() {
        const quote = this.motivationalQuotes[Math.floor(Math.random() * this.motivationalQuotes.length)];
        document.getElementById('motivationQuote').textContent = quote;
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Overeating control
        document.getElementById('overeating-yes').addEventListener('click', () => {
            this.recordOvereating(true);
        });
        document.getElementById('overeating-no').addEventListener('click', () => {
            this.recordOvereating(false);
        });

        // Running
        document.getElementById('running-save').addEventListener('click', () => {
            const distance = parseFloat(document.getElementById('running-distance').value);
            const time = parseInt(document.getElementById('running-time').value);
            if (distance && time) {
                this.recordExercise('running', distance, time);
                document.getElementById('running-distance').value = '';
                document.getElementById('running-time').value = '';
            } else {
                this.showStatus('running', 'Заполните все поля', 'danger');
            }
        });

        // Cycling
        document.getElementById('cycling-save').addEventListener('click', () => {
            const distance = parseFloat(document.getElementById('cycling-distance').value);
            const time = parseInt(document.getElementById('cycling-time').value);
            if (distance && time) {
                this.recordExercise('cycling', distance, time);
                document.getElementById('cycling-distance').value = '';
                document.getElementById('cycling-time').value = '';
            } else {
                this.showStatus('cycling', 'Заполните все поля', 'danger');
            }
        });

        // Period selector
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentPeriod = e.target.dataset.period;
                document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderStatistics();
            });
        });

        // Export/Import
        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });
        document.getElementById('import-data').addEventListener('click', () => {
            document.getElementById('file-input').click();
        });
        document.getElementById('file-input').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });
    }

    // Tab Switching
    switchTab(tabName) {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');

        if (tabName === 'progress') {
            this.renderProgress();
        } else if (tabName === 'achievements') {
            this.renderAchievements();
        } else if (tabName === 'stats') {
            this.renderStatistics();
        }
    }

    // Record overeating control
    recordOvereating(success) {
        const today = this.getToday();
        this.data.overeating[today] = success;
        this.saveData();

        const message = success ? '✓ Отлично! День без переедания' : '✗ Записано. Завтра будет лучше!';
        const type = success ? 'success' : 'danger';
        this.showStatus('overeating', message, type);
        this.celebrate('overeating-card');
        this.renderAll();
        this.checkNewAchievements();
    }

    // Record exercise with sport-specific metrics
    recordExercise(type, distance, time) {
        const today = this.getToday();
        const pace = time / distance; // min/km
        const speed = (distance / time) * 60; // km/h
        const calories = this.calculateCalories(type, distance, time);

        this.data[type][today] = {
            distance,
            time,
            pace: pace.toFixed(2),
            speed: speed.toFixed(2),
            calories: Math.round(calories)
        };
        this.saveData();

        this.showStatus(type, `✓ Отлично! ${distance} км за ${time} мин`, 'success');
        this.celebrate(`${type}-card`);
        this.renderAll();
        this.checkNewAchievements();
    }

    // Calculate calories burned
    calculateCalories(type, distance, time) {
        // Приблизительные калории для среднего взрослого
        if (type === 'running') {
            return distance * 60; // ~60 ккал/км
        } else if (type === 'cycling') {
            return distance * 30; // ~30 ккал/км
        }
        return 0;
    }

    // Show status message
    showStatus(habit, message, type) {
        const statusEl = document.getElementById(`${habit}-status`);
        statusEl.textContent = message;
        statusEl.className = `habit-status ${type}`;

        setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'habit-status';
        }, 3000);
    }

    // Celebrate animation
    celebrate(cardId) {
        const card = document.getElementById(cardId);
        card.classList.add('celebrate');
        setTimeout(() => {
            card.classList.remove('celebrate');
        }, 400);
    }

    // Calculate streak
    calculateStreak(habitData) {
        let streak = 0;
        let currentDate = new Date();

        while (true) {
            const dateStr = currentDate.toISOString().split('T')[0];
            if (habitData[dateStr]) {
                if (typeof habitData[dateStr] === 'boolean') {
                    if (habitData[dateStr]) {
                        streak++;
                    } else {
                        break;
                    }
                } else {
                    streak++;
                }
            } else {
                break;
            }
            currentDate.setDate(currentDate.getDate() - 1);
        }

        return streak;
    }

    // Render all components
    renderAll() {
        this.renderDailySummary();
        this.renderStreaks();
        this.renderTodayStatus();
        this.renderTodayMetrics();
        this.renderCalendar();
    }

    // Render daily summary
    renderDailySummary() {
        const today = this.getToday();
        let completed = 0;
        let activeStreaks = 0;

        if (this.data.overeating[today] === true) completed++;
        if (this.data.running[today]) completed++;
        if (this.data.cycling[today]) completed++;

        if (this.calculateStreak(this.data.overeating) > 0) activeStreaks++;
        if (this.calculateStreak(this.data.running) > 0) activeStreaks++;
        if (this.calculateStreak(this.data.cycling) > 0) activeStreaks++;

        document.getElementById('active-streaks').textContent = activeStreaks;
        document.getElementById('today-completed').textContent = `${completed}/3`;
    }

    // Render streaks
    renderStreaks() {
        const overeatingStreak = this.calculateStreak(this.data.overeating);
        const runningStreak = this.calculateStreak(this.data.running);
        const cyclingStreak = this.calculateStreak(this.data.cycling);

        document.querySelector('#overeating-streak .streak-number').textContent = overeatingStreak;
        document.querySelector('#running-streak .streak-number').textContent = runningStreak;
        document.querySelector('#cycling-streak .streak-number').textContent = cyclingStreak;
    }

    // Render today's status
    renderTodayStatus() {
        const today = this.getToday();

        // Overeating card
        const overeatingCard = document.getElementById('overeating-card');
        if (this.data.overeating[today] !== undefined) {
            overeatingCard.classList.add('completed');
            const streak = this.calculateStreak(this.data.overeating);
            const monthTotal = this.getMonthSuccessDays('overeating');
            document.getElementById('overeating-progress').style.width = `${(monthTotal / 30) * 100}%`;
            document.getElementById('overeating-progress-text').textContent = `${monthTotal} дней без переедания в этом месяце`;
        } else {
            overeatingCard.classList.remove('completed');
            const monthTotal = this.getMonthSuccessDays('overeating');
            document.getElementById('overeating-progress').style.width = `${(monthTotal / 30) * 100}%`;
            document.getElementById('overeating-progress-text').textContent = `${monthTotal}/30 дней в этом месяце`;
        }

        // Running card
        const runningCard = document.getElementById('running-card');
        if (this.data.running[today]) {
            runningCard.classList.add('completed');
        } else {
            runningCard.classList.remove('completed');
        }
        const runningMonthTotal = this.getMonthlyDistance('running');
        document.getElementById('running-progress').style.width = `${Math.min((runningMonthTotal / 50) * 100, 100)}%`;
        document.getElementById('running-progress-text').textContent = `${runningMonthTotal.toFixed(1)}/50 км в этом месяце`;

        // Cycling card
        const cyclingCard = document.getElementById('cycling-card');
        if (this.data.cycling[today]) {
            cyclingCard.classList.add('completed');
        } else {
            cyclingCard.classList.remove('completed');
        }
        const cyclingMonthTotal = this.getMonthlyDistance('cycling');
        document.getElementById('cycling-progress').style.width = `${Math.min((cyclingMonthTotal / 100) * 100, 100)}%`;
        document.getElementById('cycling-progress-text').textContent = `${cyclingMonthTotal.toFixed(1)}/100 км в этом месяце`;
    }

    // Render today's metrics
    renderTodayMetrics() {
        const today = this.getToday();

        // Running metrics
        const runningMetricsEl = document.getElementById('running-metrics');
        if (this.data.running[today]) {
            const stats = this.data.running[today];
            runningMetricsEl.innerHTML = `
                <div class="metric-item">
                    <div class="metric-label">Темп</div>
                    <div class="metric-value">${stats.pace}<span class="metric-unit">мин/км</span></div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Скорость</div>
                    <div class="metric-value">${stats.speed}<span class="metric-unit">км/ч</span></div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Калории</div>
                    <div class="metric-value">${stats.calories}<span class="metric-unit">ккал</span></div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Дистанция</div>
                    <div class="metric-value">${stats.distance}<span class="metric-unit">км</span></div>
                </div>
            `;
        } else {
            runningMetricsEl.innerHTML = '';
        }

        // Cycling metrics
        const cyclingMetricsEl = document.getElementById('cycling-metrics');
        if (this.data.cycling[today]) {
            const stats = this.data.cycling[today];
            cyclingMetricsEl.innerHTML = `
                <div class="metric-item">
                    <div class="metric-label">Скорость</div>
                    <div class="metric-value">${stats.speed}<span class="metric-unit">км/ч</span></div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Темп</div>
                    <div class="metric-value">${stats.pace}<span class="metric-unit">мин/км</span></div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Калории</div>
                    <div class="metric-value">${stats.calories}<span class="metric-unit">ккал</span></div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Дистанция</div>
                    <div class="metric-value">${stats.distance}<span class="metric-unit">км</span></div>
                </div>
            `;
        } else {
            cyclingMetricsEl.innerHTML = '';
        }
    }

    // Render 7-day calendar
    renderCalendar() {
        const calendar = document.getElementById('calendar');
        calendar.innerHTML = '';

        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';
            if (i === 0) dayDiv.classList.add('today');

            const dayName = document.createElement('div');
            dayName.className = 'day-name';
            dayName.textContent = days[date.getDay()];

            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = date.getDate();

            const habitsDiv = document.createElement('div');
            habitsDiv.className = 'day-habits';

            // Overeating indicator
            const overeatingIndicator = document.createElement('div');
            overeatingIndicator.className = 'habit-indicator';
            overeatingIndicator.title = 'Контроль питания';
            if (this.data.overeating[dateStr] === true) {
                overeatingIndicator.classList.add('done');
            } else if (this.data.overeating[dateStr] === false) {
                overeatingIndicator.classList.add('failed');
            }

            // Running indicator
            const runningIndicator = document.createElement('div');
            runningIndicator.className = 'habit-indicator';
            runningIndicator.title = 'Бег';
            if (this.data.running[dateStr]) {
                runningIndicator.classList.add('done');
            }

            // Cycling indicator
            const cyclingIndicator = document.createElement('div');
            cyclingIndicator.className = 'habit-indicator';
            cyclingIndicator.title = 'Велосипед';
            if (this.data.cycling[dateStr]) {
                cyclingIndicator.classList.add('done');
            }

            habitsDiv.appendChild(overeatingIndicator);
            habitsDiv.appendChild(runningIndicator);
            habitsDiv.appendChild(cyclingIndicator);

            dayDiv.appendChild(dayName);
            dayDiv.appendChild(dayNumber);
            dayDiv.appendChild(habitsDiv);

            calendar.appendChild(dayDiv);
        }
    }

    // Render progress tab
    renderProgress() {
        this.renderCalendar();
        this.renderCharts();
        this.renderPersonalRecords();
    }

    // Render charts
    renderCharts() {
        this.renderChart('running');
        this.renderChart('cycling');
    }

    renderChart(type) {
        const container = document.getElementById(`${type}-chart`);
        container.innerHTML = '';

        const today = new Date();
        const data = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const value = this.data[type][dateStr]?.distance || 0;
            data.push({
                label: `${date.getDate()}`,
                value: value
            });
        }

        const maxValue = Math.max(...data.map(d => d.value), 1);

        data.forEach(item => {
            const barWrapper = document.createElement('div');
            barWrapper.style.flex = '1';
            barWrapper.style.display = 'flex';
            barWrapper.style.flexDirection = 'column';
            barWrapper.style.alignItems = 'center';

            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.height = `${(item.value / maxValue) * 180}px`;

            if (item.value > 0) {
                const value = document.createElement('div');
                value.className = 'chart-value';
                value.textContent = `${item.value}км`;
                bar.appendChild(value);
            }

            const label = document.createElement('div');
            label.className = 'chart-label';
            label.textContent = item.label;

            barWrapper.appendChild(bar);
            barWrapper.appendChild(label);
            container.appendChild(barWrapper);
        });
    }

    // Render personal records
    renderPersonalRecords() {
        const recordsGrid = document.getElementById('personal-records');
        recordsGrid.innerHTML = '';

        const records = [
            {
                icon: '🏃',
                value: `${this.getMaxDistance('running').toFixed(1)} км`,
                label: 'Лучшая пробежка'
            },
            {
                icon: '⚡',
                value: `${this.getFastestPace('running').toFixed(2)} мин/км`,
                label: 'Лучший темп (бег)'
            },
            {
                icon: '🚴',
                value: `${this.getMaxDistance('cycling').toFixed(1)} км`,
                label: 'Лучшая поездка'
            },
            {
                icon: '💨',
                value: `${this.getMaxSpeed('cycling').toFixed(1)} км/ч`,
                label: 'Макс скорость (вело)'
            },
            {
                icon: '🔥',
                value: this.getMaxStreak(),
                label: 'Лучшая серия'
            },
            {
                icon: '📅',
                value: this.getTotalDays(),
                label: 'Всего дней'
            }
        ];

        records.forEach(record => {
            const card = document.createElement('div');
            card.className = 'record-card';
            card.innerHTML = `
                <div class="record-icon">${record.icon}</div>
                <div class="record-value">${record.value}</div>
                <div class="record-label">${record.label}</div>
            `;
            recordsGrid.appendChild(card);
        });
    }

    // Render achievements
    renderAchievements() {
        const achievementsList = document.getElementById('achievements-list');
        achievementsList.innerHTML = '';

        let earned = 0;

        this.achievements.forEach(achievement => {
            const isEarned = this.data.achievements.includes(achievement.id);
            if (isEarned) earned++;

            const card = document.createElement('div');
            card.className = `achievement-card ${isEarned ? 'earned' : 'locked'}`;
            card.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            `;
            achievementsList.appendChild(card);
        });

        document.getElementById('achievements-earned').textContent = earned;
        document.getElementById('achievements-total').textContent = this.achievements.length;
    }

    // Check for new achievements
    checkNewAchievements() {
        let newAchievements = [];

        this.achievements.forEach(achievement => {
            if (!this.data.achievements.includes(achievement.id)) {
                if (achievement.check(this.data)) {
                    this.data.achievements.push(achievement.id);
                    newAchievements.push(achievement);
                }
            }
        });

        if (newAchievements.length > 0) {
            this.saveData();
            newAchievements.forEach(achievement => {
                this.showAchievementPopup(achievement);
            });
        }
    }

    // Show achievement popup
    showAchievementPopup(achievement) {
        const popup = document.getElementById('achievement-popup');
        popup.querySelector('.achievement-popup-icon').textContent = achievement.icon;
        popup.querySelector('.achievement-popup-title').textContent = achievement.title;
        popup.querySelector('.achievement-popup-desc').textContent = achievement.desc;

        popup.classList.add('show');

        setTimeout(() => {
            popup.classList.remove('show');
        }, 3000);
    }

    // Render statistics
    renderStatistics() {
        const period = this.currentPeriod;
        const statsGrid = document.getElementById('statistics-grid');
        statsGrid.innerHTML = '';

        let stats;
        if (period === 'week') {
            stats = this.getWeeklyStats();
        } else if (period === 'month') {
            stats = this.getMonthlyStats();
        } else {
            stats = this.getAllTimeStats();
        }

        const statCards = [
            { label: 'Дней без переедания', value: stats.overeatingSuccess },
            { label: 'Пробежек', value: stats.runningDays },
            { label: 'Км бегом', value: stats.runningDistance.toFixed(1) },
            { label: 'Калорий (бег)', value: Math.round(stats.runningCalories) },
            { label: 'Поездок', value: stats.cyclingDays },
            { label: 'Км на велосипеде', value: stats.cyclingDistance.toFixed(1) }
        ];

        statCards.forEach(stat => {
            const card = document.createElement('div');
            card.className = 'stat-card';
            card.innerHTML = `
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            `;
            statsGrid.appendChild(card);
        });

        this.renderDetailedStats(stats);
    }

    renderDetailedStats(stats) {
        // Eating details
        const eatingDetails = document.getElementById('eating-details');
        eatingDetails.innerHTML = `
            <div class="stat-row">
                <span class="stat-row-label">Успешных дней</span>
                <span class="stat-row-value">${stats.overeatingSuccess}</span>
            </div>
            <div class="stat-row">
                <span class="stat-row-label">Текущая серия</span>
                <span class="stat-row-value">${this.calculateStreak(this.data.overeating)} дней</span>
            </div>
            <div class="stat-row">
                <span class="stat-row-label">Процент успеха</span>
                <span class="stat-row-value">${stats.overeatingRate}%</span>
            </div>
        `;

        // Running details
        const runningDetails = document.getElementById('running-details');
        runningDetails.innerHTML = `
            <div class="stat-row">
                <span class="stat-row-label">Всего тренировок</span>
                <span class="stat-row-value">${stats.runningDays}</span>
            </div>
            <div class="stat-row">
                <span class="stat-row-label">Всего километров</span>
                <span class="stat-row-value">${stats.runningDistance.toFixed(1)} км</span>
            </div>
            <div class="stat-row">
                <span class="stat-row-label">Средний темп</span>
                <span class="stat-row-value">${stats.runningAvgPace.toFixed(2)} мин/км</span>
            </div>
            <div class="stat-row">
                <span class="stat-row-label">Калорий сожжено</span>
                <span class="stat-row-value">${Math.round(stats.runningCalories)} ккал</span>
            </div>
        `;

        // Cycling details
        const cyclingDetails = document.getElementById('cycling-details');
        cyclingDetails.innerHTML = `
            <div class="stat-row">
                <span class="stat-row-label">Всего поездок</span>
                <span class="stat-row-value">${stats.cyclingDays}</span>
            </div>
            <div class="stat-row">
                <span class="stat-row-label">Всего километров</span>
                <span class="stat-row-value">${stats.cyclingDistance.toFixed(1)} км</span>
            </div>
            <div class="stat-row">
                <span class="stat-row-label">Средняя скорость</span>
                <span class="stat-row-value">${stats.cyclingAvgSpeed.toFixed(2)} км/ч</span>
            </div>
            <div class="stat-row">
                <span class="stat-row-label">Калорий сожжено</span>
                <span class="stat-row-value">${Math.round(stats.cyclingCalories)} ккал</span>
            </div>
        `;
    }

    // Statistics helpers
    getWeeklyStats() {
        return this.getStatsForPeriod(7);
    }

    getMonthlyStats() {
        return this.getStatsForPeriod(30);
    }

    getAllTimeStats() {
        return this.getStatsForPeriod(365 * 10); // 10 years max
    }

    getStatsForPeriod(days) {
        const today = new Date();
        let overeatingSuccess = 0;
        let totalDays = 0;
        let runningDays = 0;
        let runningDistance = 0;
        let runningTime = 0;
        let runningCalories = 0;
        let cyclingDays = 0;
        let cyclingDistance = 0;
        let cyclingTime = 0;
        let cyclingCalories = 0;

        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            if (this.data.overeating[dateStr] !== undefined) {
                totalDays++;
                if (this.data.overeating[dateStr] === true) {
                    overeatingSuccess++;
                }
            }

            if (this.data.running[dateStr]) {
                runningDays++;
                runningDistance += this.data.running[dateStr].distance;
                runningTime += this.data.running[dateStr].time;
                runningCalories += this.data.running[dateStr].calories;
            }

            if (this.data.cycling[dateStr]) {
                cyclingDays++;
                cyclingDistance += this.data.cycling[dateStr].distance;
                cyclingTime += this.data.cycling[dateStr].time;
                cyclingCalories += this.data.cycling[dateStr].calories;
            }
        }

        return {
            overeatingSuccess,
            overeatingRate: totalDays > 0 ? Math.round((overeatingSuccess / totalDays) * 100) : 0,
            runningDays,
            runningDistance,
            runningAvgPace: runningDistance > 0 ? runningTime / runningDistance : 0,
            runningCalories,
            cyclingDays,
            cyclingDistance,
            cyclingAvgSpeed: cyclingTime > 0 ? (cyclingDistance / cyclingTime) * 60 : 0,
            cyclingCalories
        };
    }

    // Achievement helpers
    getMaxDistance(type) {
        let max = 0;
        Object.values(this.data[type]).forEach(entry => {
            if (entry.distance > max) max = entry.distance;
        });
        return max;
    }

    getMonthlyDistance(type) {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        let total = 0;

        for (let d = new Date(firstDay); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            if (this.data[type][dateStr]) {
                total += this.data[type][dateStr].distance;
            }
        }

        return total;
    }

    getFastestPace(type) {
        let fastest = Infinity;
        Object.values(this.data[type]).forEach(entry => {
            const pace = parseFloat(entry.pace);
            if (pace < fastest && pace > 0) fastest = pace;
        });
        return fastest === Infinity ? 0 : fastest;
    }

    getMaxSpeed(type) {
        let max = 0;
        Object.values(this.data[type]).forEach(entry => {
            const speed = parseFloat(entry.speed);
            if (speed > max) max = speed;
        });
        return max;
    }

    getMaxStreak() {
        const streaks = [
            this.calculateStreak(this.data.overeating),
            this.calculateStreak(this.data.running),
            this.calculateStreak(this.data.cycling)
        ];
        return Math.max(...streaks);
    }

    getTotalDays() {
        const allDates = new Set([
            ...Object.keys(this.data.overeating),
            ...Object.keys(this.data.running),
            ...Object.keys(this.data.cycling)
        ]);
        return allDates.size;
    }

    getAllThreeInOneDay() {
        const allDates = Object.keys(this.data.overeating);
        for (let date of allDates) {
            if (this.data.overeating[date] === true &&
                this.data.running[date] &&
                this.data.cycling[date]) {
                return true;
            }
        }
        return false;
    }

    getMonthlyWorkouts() {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        let count = 0;

        for (let d = new Date(firstDay); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            if (this.data.running[dateStr] || this.data.cycling[dateStr]) {
                count++;
            }
        }

        return count;
    }

    getMonthSuccessDays(habit) {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        let count = 0;

        for (let d = new Date(firstDay); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            if (this.data[habit][dateStr] === true) {
                count++;
            }
        }

        return count;
    }

    // Export data
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `habit-tracker-backup-${this.getToday()}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }

    // Import data
    importData(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                this.data = imported;
                this.saveData();
                this.renderAll();
                alert('Данные успешно импортированы!');
            } catch (error) {
                alert('Ошибка при импорте данных');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new HabitTrackerPro();
});
