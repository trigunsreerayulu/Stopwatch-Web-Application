const hoursDisplay = document.getElementById("hours");
const minutesDisplay = document.getElementById("minutes");
const secondsDisplay = document.getElementById("seconds");
const millisecondsDisplay = document.getElementById("milliseconds");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const lapButton = document.getElementById("lapButton");
const resetButton = document.getElementById("resetButton");
const lapList = document.getElementById("lapList");
const emptyState = document.getElementById("emptyState");
const lapCount = document.getElementById("lapCount");
const lapsFootnote = document.getElementById("lapsFootnote");
const statusText = document.getElementById("statusText");
const liveIndicator = document.getElementById("liveIndicator");

let elapsedMilliseconds = 0;
let startedAt = 0;
let animationFrame = null;
let lastLapTime = 0;
let laps = [];

function getElapsedTime() {
    if (animationFrame === null) {
        return elapsedMilliseconds;
    }

    return elapsedMilliseconds + performance.now() - startedAt;
}

function formatTime(time) {
    const totalMilliseconds = Math.floor(time);
    const hours = Math.floor(totalMilliseconds / 3600000);
    const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
    const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
    const milliseconds = totalMilliseconds % 1000;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}

function renderTime(time) {
    const [hours, minutes, seconds, milliseconds] = formatTime(time).match(/\d+/g);
    hoursDisplay.textContent = hours;
    minutesDisplay.textContent = minutes;
    secondsDisplay.textContent = seconds;
    millisecondsDisplay.textContent = milliseconds;
}

function renderFrame() {
    renderTime(getElapsedTime());
    animationFrame = requestAnimationFrame(renderFrame);
}

function updateControls(isRunning) {
    startButton.disabled = isRunning;
    pauseButton.disabled = !isRunning;
    lapButton.disabled = elapsedMilliseconds === 0 && !isRunning;
    resetButton.disabled = elapsedMilliseconds === 0 && laps.length === 0 && !isRunning;
    startButton.querySelector("span:last-child").textContent = elapsedMilliseconds > 0 ? "Resume" : "Start";
    statusText.textContent = isRunning ? "TIME IS RUNNING" : elapsedMilliseconds > 0 ? "PAUSED / READY TO RESUME" : "READY WHEN YOU ARE";
    liveIndicator.classList.toggle("is-running", isRunning);
}

function startStopwatch() {
    if (animationFrame !== null) {
        return;
    }

    startedAt = performance.now();
    animationFrame = requestAnimationFrame(renderFrame);
    updateControls(true);
}

function pauseStopwatch() {
    if (animationFrame === null) {
        return;
    }

    elapsedMilliseconds += performance.now() - startedAt;
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
    renderTime(elapsedMilliseconds);
    updateControls(false);
}

function resetStopwatch() {
    if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }

    elapsedMilliseconds = 0;
    startedAt = 0;
    lastLapTime = 0;
    laps = [];
    renderTime(0);
    lapList.replaceChildren(emptyState);
    emptyState.hidden = false;
    lapCount.textContent = "00";
    lapsFootnote.textContent = "No laps recorded";
    updateControls(false);
}

function recordLap() {
    if (lapButton.disabled) {
        return;
    }

    const currentTime = getElapsedTime();
    const lapDuration = currentTime - lastLapTime;
    lastLapTime = currentTime;
    laps.push(lapDuration);

    const row = document.createElement("li");
    row.className = "lap-row";

    const index = document.createElement("span");
    index.className = "lap-index";
    index.textContent = `LAP ${String(laps.length).padStart(2, "0")}`;

    const split = document.createElement("span");
    split.className = "lap-value";
    split.textContent = formatTime(lapDuration);

    const total = document.createElement("span");
    total.className = "lap-value";
    total.textContent = formatTime(currentTime);

    row.append(index, split, total);
    lapList.prepend(row);
    emptyState.hidden = true;
    lapCount.textContent = String(laps.length).padStart(2, "0");
    lapsFootnote.textContent = `${laps.length} ${laps.length === 1 ? "lap" : "laps"} recorded`;

    const fastestLap = Math.min(...laps);
    lapList.querySelectorAll(".lap-row").forEach((lapRow, rowIndex) => {
        lapRow.classList.toggle("is-fastest", laps[laps.length - rowIndex - 1] === fastestLap);
    });
}

startButton.addEventListener("click", startStopwatch);
pauseButton.addEventListener("click", pauseStopwatch);
lapButton.addEventListener("click", recordLap);
resetButton.addEventListener("click", resetStopwatch);

renderTime(0);