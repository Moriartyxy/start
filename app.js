// Habit Tracker Application
class HabitTracker {
    constructor() {
        this.data = this.loadData();
        this.init();
    }

    init() {
        this.updateDate();
        this.setupEventListeners();
        this.renderAll();
    }

    // Data Management
    loadData() {
        const stored = localStorage.getItem('habitTrackerData');
        if (stored) {
            return JSON.parse(stored);
        }
        return {
            overeating: {},
            running: {},
            cycling: {}
        };
    }

    saveData() {
        localStorage.setItem('habitTrackerData', JSON.stringify(this.data));
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

    // Event Listeners
    setupEventListeners() {
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

    // Record overeating control
    recordOvereating(success) {
        const today = this.getToday();
        this.data.overeating[today] = success;
        this.saveData();

        const message = success ? 'Отлично! День без переедания' : 'Записано. Завтра будет лучше!';
        const type = success ? 'success' : 'danger';
        this.showStatus('overeating', message, type);
        this.celebrate('overeating-card');
        this.renderAll();
    }

    // Record exercise
    recordExercise(type, distance, time) {
        const today = this.getToday();
        this.data[type][today] = { distance, time, pace: (time / distance).toFixed(2) };
        this.saveData();

        this.showStatus(type, `Записано: ${distance} км за ${time} мин`, 'success');
        this.celebrate(`${type}-card`);
        this.renderAll();
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
        }, 500);
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
        this.renderStreaks();
        this.renderTodayStatus();
        this.renderCalendar();
        this.renderMonthlyStats();
    }

    // Render streaks
    renderStreaks() {
        const overeatingStreak = this.calculateStreak(this.data.overeating);
        const runningStreak = this.calculateStreak(this.data.running);
        const cyclingStreak = this.calculateStreak(this.data.cycling);

        document.getElementById('overeating-streak').textContent = `${overeatingStreak} дней`;
        document.getElementById('running-streak').textContent = `${runningStreak} дней`;
        document.getElementById('cycling-streak').textContent = `${cyclingStreak} дней`;
    }

    // Render today's status
    renderTodayStatus() {
        const today = this.getToday();

        // Overeating card
        const overeatingCard = document.getElementById('overeating-card');
        if (this.data.overeating[today] !== undefined) {
            overeatingCard.classList.add('completed');
        } else {
            overeatingCard.classList.remove('completed');
        }

        // Running card and stats
        const runningCard = document.getElementById('running-card');
        const runningStatsEl = document.getElementById('running-stats');
        if (this.data.running[today]) {
            runningCard.classList.add('completed');
            const stats = this.data.running[today];
            runningStatsEl.innerHTML = `
                <p><strong>Сегодня:</strong></p>
                <p>Дистанция: ${stats.distance} км</p>
                <p>Время: ${stats.time} мин</p>
                <p>Темп: ${stats.pace} мин/км</p>
            `;
        } else {
            runningCard.classList.remove('completed');
            runningStatsEl.innerHTML = '';
        }

        // Cycling card and stats
        const cyclingCard = document.getElementById('cycling-card');
        const cyclingStatsEl = document.getElementById('cycling-stats');
        if (this.data.cycling[today]) {
            cyclingCard.classList.add('completed');
            const stats = this.data.cycling[today];
            cyclingStatsEl.innerHTML = `
                <p><strong>Сегодня:</strong></p>
                <p>Дистанция: ${stats.distance} км</p>
                <p>Время: ${stats.time} мин</p>
                <p>Темп: ${stats.pace} мин/км</p>
            `;
        } else {
            cyclingCard.classList.remove('completed');
            cyclingStatsEl.innerHTML = '';
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

    // Render monthly statistics
    renderMonthlyStats() {
        const statsGrid = document.getElementById('monthly-stats');
        statsGrid.innerHTML = '';

        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        let overeatingSuccess = 0;
        let totalRunningDistance = 0;
        let totalRunningTime = 0;
        let runningDays = 0;
        let totalCyclingDistance = 0;
        let totalCyclingTime = 0;
        let cyclingDays = 0;

        // Calculate monthly stats
        for (let d = new Date(firstDayOfMonth); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];

            if (this.data.overeating[dateStr] === true) {
                overeatingSuccess++;
            }

            if (this.data.running[dateStr]) {
                totalRunningDistance += this.data.running[dateStr].distance;
                totalRunningTime += this.data.running[dateStr].time;
                runningDays++;
            }

            if (this.data.cycling[dateStr]) {
                totalCyclingDistance += this.data.cycling[dateStr].distance;
                totalCyclingTime += this.data.cycling[dateStr].time;
                cyclingDays++;
            }
        }

        // Create stat cards
        const stats = [
            {
                label: 'Дней без переедания',
                value: overeatingSuccess
            },
            {
                label: 'Дней с пробежками',
                value: runningDays
            },
            {
                label: 'Километров бегом',
                value: totalRunningDistance.toFixed(1)
            },
            {
                label: 'Минут бега',
                value: Math.round(totalRunningTime)
            },
            {
                label: 'Дней с велосипедом',
                value: cyclingDays
            },
            {
                label: 'Километров на велосипеде',
                value: totalCyclingDistance.toFixed(1)
            }
        ];

        stats.forEach(stat => {
            const card = document.createElement('div');
            card.className = 'stat-card';
            card.innerHTML = `
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            `;
            statsGrid.appendChild(card);
        });
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
    new HabitTracker();
});
