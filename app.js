// State
let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
let currentSession = [];
let personalRecords = JSON.parse(localStorage.getItem('personalRecords')) || {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initForms();
    loadExercises();
    updateStats();
    renderHistory();
    renderPRs();
});

// Tab Navigation
function initTabs() {
    const navBtns = document.querySelectorAll('.nav-btn');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // Remove active from all
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            
            // Add active to clicked
            btn.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

// Forms
function initForms() {
    document.getElementById('workout-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addExercise();
    });
}

// Add Exercise
function addExercise() {
    const exercise = document.getElementById('exercise').value;
    const sets = parseInt(document.getElementById('sets').value);
    const reps = parseInt(document.getElementById('reps').value);
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    
    const ex = {
        id: Date.now(),
        exercise,
        sets,
        reps,
        weight,
        timestamp: new Date().toISOString()
    };
    
    currentSession.push(ex);
    checkPR(exercise, weight, reps);
    renderCurrentSession();
    document.getElementById('workout-form').reset();
}

// Render Current Session
function renderCurrentSession() {
    const list = document.getElementById('current-session');
    
    if (currentSession.length === 0) {
        list.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No exercises yet</p>';
        document.getElementById('finish-btn').style.display = 'none';
        return;
    }
    
    document.getElementById('finish-btn').style.display = 'block';
    
    list.innerHTML = currentSession.map((ex, i) => `
        <div class="list-item">
            <strong style="color: var(--accent); font-size: 1.1rem;">${ex.exercise}</strong>
            <div style="color: var(--text-secondary); margin-top: 5px;">
                ${ex.sets} × ${ex.reps} ${ex.weight ? `@ ${ex.weight} lbs` : ''}
            </div>
            <button onclick="removeExercise(${i})" style="margin-top: 10px; padding: 8px; background: var(--danger); color: white; border: none; border-radius: 8px; width: 100%;">Remove</button>
        </div>
    `).join('');
}

function removeExercise(index) {
    currentSession.splice(index, 1);
    renderCurrentSession();
}

// Finish Workout
function finishWorkout() {
    if (currentSession.length === 0) return;
    
    const workout = {
        id: Date.now(),
        exercises: [...currentSession],
        date: new Date().toISOString()
    };
    
    workouts.unshift(workout);
    localStorage.setItem('workouts', JSON.stringify(workouts));
    
    currentSession = [];
    renderCurrentSession();
    updateStats();
    renderHistory();
    
    alert('🎉 Workout completed!');
}

// Update Stats
function updateStats() {
    document.getElementById('total-workouts').textContent = workouts.length;
    
    const totalVolume = workouts.reduce((sum, w) => {
        return sum + w.exercises.reduce((s, e) => s + (e.sets * e.reps * e.weight), 0);
    }, 0);
    document.getElementById('total-volume').textContent = Math.round(totalVolume / 1000) + 'K';
    
    const streak = calculateStreak();
    document.getElementById('streak').textContent = streak;
}

function calculateStreak() {
    if (workouts.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let workout of workouts) {
        const date = new Date(workout.date);
        date.setHours(0, 0, 0, 0);
        const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
        
        if (diff === streak) {
            streak++;
        } else if (diff > streak) {
            break;
        }
    }
    return streak;
}

// History
function renderHistory() {
    const list = document.getElementById('history-list');
    
    if (workouts.length === 0) {
        list.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No history yet</p>';
        return;
    }
    
    list.innerHTML = workouts.slice(0, 20).map(w => {
        const date = new Date(w.date).toLocaleDateString();
        return `
            <div class="list-item">
                <strong style="color: var(--accent);">${date}</strong>
                ${w.exercises.map(ex => `
                    <div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 5px;">
                        ${ex.exercise}: ${ex.sets} × ${ex.reps} @ ${ex.weight} lbs
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
}

// Personal Records
function checkPR(exercise, weight, reps) {
    if (weight === 0) return;
    
    const estimated1RM = weight * (1 + reps / 30);
    
    if (!personalRecords[exercise] || estimated1RM > personalRecords[exercise].estimated1RM) {
        personalRecords[exercise] = {
            weight,
            reps,
            estimated1RM,
            date: new Date().toISOString()
        };
        localStorage.setItem('personalRecords', JSON.stringify(personalRecords));
        renderPRs();
        
        if (weight > 0) {
            alert(`🏆 NEW PR! ${exercise}: ${weight} lbs × ${reps}`);
        }
    }
}

function renderPRs() {
    const list = document.getElementById('pr-list');
    const prs = Object.entries(personalRecords);
    
    if (prs.length === 0) {
        list.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No PRs yet</p>';
        return;
    }
    
    list.innerHTML = prs.map(([exercise, data]) => `
        <div class="list-item">
            <strong style="color: var(--success);">${exercise}</strong>
            <div style="color: var(--text-secondary); margin-top: 5px;">
                ${data.weight} lbs × ${data.reps} reps
            </div>
            <div style="color: var(--text-muted); font-size: 0.85rem;">
                Est. 1RM: ${Math.round(data.estimated1RM)} lbs
            </div>
        </div>
    `).join('');
}

// Exercise Library
function loadExercises() {
    if (typeof exerciseLibrary === 'undefined') return;
    
    const list = document.getElementById('exercise-list');
    list.innerHTML = exerciseLibrary.slice(0, 20).map(ex => `
        <div class="list-item" onclick="selectExercise('${ex.name}')">
            <strong style="color: var(--accent);">${ex.name}</strong>
            <div style="color: var(--text-muted); font-size: 0.85rem; margin-top: 5px;">
                ${ex.muscle} | ${ex.equipment}
            </div>
        </div>
    `).join('');
}

function selectExercise(name) {
    document.getElementById('exercise').value = name;
    document.querySelector('[data-tab="log"]').click();
}

function filterExercises() {
    if (typeof exerciseLibrary === 'undefined') return;
    
    const search = document.getElementById('search').value.toLowerCase();
    const filtered = exerciseLibrary.filter(ex => 
        ex.name.toLowerCase().includes(search)
    );
    
    const list = document.getElementById('exercise-list');
    list.innerHTML = filtered.slice(0, 20).map(ex => `
        <div class="list-item" onclick="selectExercise('${ex.name}')">
            <strong style="color: var(--accent);">${ex.name}</strong>
            <div style="color: var(--text-muted); font-size: 0.85rem; margin-top: 5px;">
                ${ex.muscle} | ${ex.equipment}
            </div>
        </div>
    `).join('');
}

// Tools
function calculate1RM() {
    const weight = parseFloat(document.getElementById('rm-weight').value);
    const reps = parseInt(document.getElementById('rm-reps').value);
    
    if (!weight || !reps) {
        alert('Enter weight and reps');
        return;
    }
    
    const oneRM = weight * (1 + reps / 30);
    document.getElementById('rm-result').innerHTML = `
        <h3 style="color: var(--accent); margin-bottom: 10px;">Est. 1RM: ${Math.round(oneRM)} lbs</h3>
        <div style="font-size: 0.9rem;">
            <p>95%: ${Math.round(oneRM * 0.95)} lbs</p>
            <p>90%: ${Math.round(oneRM * 0.90)} lbs</p>
            <p>85%: ${Math.round(oneRM * 0.85)} lbs</p>
        </div>
    `;
}

function exportData() {
    let csv = 'Date,Exercise,Sets,Reps,Weight\n';
    workouts.forEach(w => {
        w.exercises.forEach(ex => {
            csv += `${new Date(w.date).toLocaleDateString()},${ex.exercise},${ex.sets},${ex.reps},${ex.weight}\n`;
        });
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gym-data.csv';
    a.click();
}

function clearData() {
    if (!confirm('Delete ALL data?')) return;
    localStorage.clear();
    location.reload();
}