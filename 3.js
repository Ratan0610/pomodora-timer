let timer;
let isRunning = false;
let hours = 0;
let minutes = 0;
let seconds = 0;
let mode = "stopwatch"; // Default mode
let taskSchedule = []; // Stores task details
let currentTask = null;

const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const resetButton = document.getElementById("resetButton");
const hoursDisplay = document.getElementById("hours");
const minutesDisplay = document.getElementById("minutes");
const secondsDisplay = document.getElementById("seconds");
const modeSelect = document.getElementById("mode");
const countdownInput = document.getElementById("countdown-input");
const inputHours = document.getElementById("input-hours");
const inputMinutes = document.getElementById("input-minutes");
const inputSeconds = document.getElementById("input-seconds");
const taskInput = document.getElementById("taskInput");
const taskHours = document.getElementById("task-hours");
const taskMinutes = document.getElementById("task-minutes");
const taskSeconds = document.getElementById("task-seconds");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");
const timeUpList = document.getElementById("timeUpList"); // Time Up section

// Request notification permission
if ("Notification" in window) {
    Notification.requestPermission();
}

// Timer Function (Countdown Mode)
function runTimer() {
    if (mode === "countdown") {
        if (seconds === 0) {
            if (minutes === 0) {
                if (hours === 0) {
                    clearInterval(timer);
                    isRunning = false;
                    notifyTaskCompletion();
                    return;
                } else {
                    hours--;
                    minutes = 59;
                }
            } else {
                minutes--;
            }
            seconds = 59;
        } else {
            seconds--;
        }
    } else if (mode === "stopwatch") {
        seconds++;
        if (seconds >= 60) {
            seconds = 0;
            minutes++;
            if (minutes >= 60) {
                minutes = 0;
                hours++;
            }
        }
    }

    updateDisplay();
}

// Function to Update Timer Display
function updateDisplay() {
    hoursDisplay.textContent = String(hours).padStart(2, "0");
    minutesDisplay.textContent = String(minutes).padStart(2, "0");
    secondsDisplay.textContent = String(seconds).padStart(2, "0");
}

// Function to Reset Timer
function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    hours = 0;
    minutes = 0;
    seconds = 0;
    updateDisplay();
}

// Event Listeners for Timer
startButton.addEventListener("click", function () {
    if (!isRunning) {
        if (mode === "countdown") {
            hours = parseInt(inputHours.value) || 0;
            minutes = parseInt(inputMinutes.value) || 0;
            seconds = parseInt(inputSeconds.value) || 0;
            updateDisplay();
        }
        isRunning = true;
        timer = setInterval(runTimer, 1000);
    }
});

pauseButton.addEventListener("click", function () {
    clearInterval(timer);
    isRunning = false;
});

resetButton.addEventListener("click", resetTimer);

modeSelect.addEventListener("change", function () {
    mode = modeSelect.value;
    if (mode === "countdown") {
        countdownInput.classList.remove("hidden");
    } else {
        countdownInput.classList.add("hidden");
    }
    resetTimer();
});

// Task List Functionality
addTaskButton.addEventListener("click", addTask);

function addTask() {
    const taskText = taskInput.value.trim();
    const taskHrs = parseInt(taskHours.value) || 0;
    const taskMins = parseInt(taskMinutes.value) || 0;
    const taskSecs = parseInt(taskSeconds.value) || 0;

    if (taskText === "") return;

    const taskTime = `${String(taskHrs).padStart(2, "0")}:${String(taskMins).padStart(2, "0")}:${String(taskSecs).padStart(2, "0")}`;

    const li = document.createElement("li");
    li.innerHTML = `
        <span class="task-text">${taskText} (Time: ${taskTime})</span>
        <button class="start-task-btn">Start</button>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
    `;

    taskSchedule.push({ taskText, taskHrs, taskMins, taskSecs, extended: 0 });

    // Start Task Countdown
    li.querySelector(".start-task-btn").addEventListener("click", function () {
        startTask(taskText, taskHrs, taskMins, taskSecs);
    });

    // Delete Task
    li.querySelector(".delete-btn").addEventListener("click", function () {
        li.remove();
        taskSchedule = taskSchedule.filter(task => task.taskText !== taskText);
    });

    // Edit Task
    li.querySelector(".edit-btn").addEventListener("click", function () {
        const newTaskText = prompt("Edit task:", taskText);
        if (newTaskText) {
            li.querySelector(".task-text").textContent = `${newTaskText} (Time: ${taskTime})`;
        }
    });

    taskList.appendChild(li);
    taskInput.value = "";
}

// Function to Start Task as Countdown
function startTask(taskText, taskHrs, taskMins, taskSecs) {
    clearInterval(timer);
    hours = taskHrs;
    minutes = taskMins;
    seconds = taskSecs;
    updateDisplay();
    isRunning = true;
    timer = setInterval(runTimer, 1000);

    // Store task info for later reference
    currentTask = taskSchedule.find(task => task.taskText === taskText);
}

// Function to Notify User & Extend Task
function notifyTaskCompletion() {
    // Play alarm sound
    const alarm = new Audio("3.mp3");
    alarm.play();

    // Show message in "Time Up Tasks" section
    showTimeUpMessage(currentTask.taskText);

    // Show browser notification
    if (Notification.permission === "granted") {
        const notification = new Notification("Task Timer", {
            body: `Task "${currentTask.taskText}" completed! Click here to extend.`,
            requireInteraction: true  // Keeps notification visible
        });

        // Handle notification click (extend task)
        notification.onclick = () => {
            window.focus();
            extendTask(5);
            notification.close();
        };
    } else {
        let extend = confirm(`Task "${currentTask.taskText}" completed! Do you want to extend by 5 minutes?`);
        if (extend) {
            extendTask(5);
        } else {
            markTaskAsCompleted();
        }
    }
}

// Function to Show On-Screen "Time Up" Message
function showTimeUpMessage(taskText) {
    const li = document.createElement("li");
    li.innerHTML = `
        <span>⏳ Task "${taskText}" completed!</span>
        <button onclick="extendTask(5)">Extend by 5 Minutes</button>
    `;

    timeUpList.appendChild(li);
}

// Function to Extend Task by 5 Minutes
function extendTask(extraMinutes) {
    minutes += extraMinutes;
    if (minutes >= 60) {
        hours += Math.floor(minutes / 60);
        minutes %= 60;
    }

    if (currentTask) currentTask.extended++;

    updateDisplay();
    isRunning = true;
    timer = setInterval(runTimer, 1000);
}

// Initialize Timer Display
updateDisplay();


