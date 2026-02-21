// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('Service Worker registered'))
        .catch(err => console.log('Service Worker registration failed'));
}

// App State
let workouts = JSON.parse(localStorage.getItem('workouts')) || [];

// DOM Elements
const workoutForm = document.getElementById('workout-form');
const workoutList = document.getElementById('workout-list');
const exerciseInput = document.getElementById('exercise');
const setsInput = document.getElementById('sets');
const repsInput = document.getElementById('reps');
const weightInput = document.getElementById('weight');

// Initialize
renderWorkouts();
updateStats();

// Add Workout
workoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const workout = {
        id: Date.now(),
        exercise: exerciseInput.value,
        sets: parseInt(setsInput.value),
        reps: parseInt(repsInput.value),
        weight: parseFloat(weightInput.value) || 0,
        date: new Date().toISOString()
    };
    
    workouts.unshift(workout);
    saveWorkouts();
    renderWorkouts();
    updateStats();
    
    // Reset form
    workoutForm.reset();
    exerciseInput.focus();
});

// Render Workouts
function renderWorkouts() {
    const today = new Date().toDateString();
    const todayWorkouts = workouts.filter(w => 
        new Date(w.date).toDateString() === today
    );
    
    if (todayWorkouts.length === 0) {
        workoutList.innerHTML = '<p style="color: #666; text-align: center;">No workouts logged today. Start tracking!</p>';
        return;
    }
    
    workoutList.innerHTML = todayWorkouts.map(workout => `
        <div class="workout-item">
            <div class="workout-info">
                <div class="workout-name">${workout.exercise}</div>
                <div class="workout-details">
                    ${workout.sets} sets × ${workout.reps} reps
                    ${workout.weight ? ` @ ${workout.weight} lbs` : ''}
                </div>
            </div>
            <button class="btn-delete" onclick="deleteWorkout(${workout.id})">Delete</button>
        </div>
    `).join('');
}

// Delete Workout
function deleteWorkout(id) {
    workouts = workouts.filter(w => w.id !== id);
    saveWorkouts();
    renderWorkouts();
    updateStats();
}

// Update Stats
function updateStats() {
    document.getElementById('total-workouts').textContent = workouts.length;
    
    const totalSets = workouts.reduce((sum, w) => sum + w.sets, 0);
    document.getElementById('total-sets').textContent = totalSets;
}

// Save to LocalStorage
function saveWorkouts() {
    localStorage.setItem('workouts', JSON.stringify(workouts));
}