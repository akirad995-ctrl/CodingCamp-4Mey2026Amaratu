// ===== Greeting & DateTime =====
function updateDateTime() {
  const now = new Date();
  const hour = now.getHours();

  let timeOfDay = 'Good night';
  if (hour >= 5 && hour < 12) timeOfDay = 'Good morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'Good afternoon';
  else if (hour >= 17 && hour < 21) timeOfDay = 'Good evening';

  const name = localStorage.getItem('userName');
  const greetingEl = document.getElementById('greeting-text');
  greetingEl.textContent = name ? `${timeOfDay}, ${name}!` : `${timeOfDay}!`;

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = now.toLocaleDateString(undefined, options);
  const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.getElementById('datetime').textContent = `${dateStr} • ${timeStr}`;
}

setInterval(updateDateTime, 1000);
updateDateTime();

// ===== Custom Name =====
const nameModal = document.getElementById('name-modal');
const nameInput = document.getElementById('name-input');

document.getElementById('name-btn').addEventListener('click', () => {
  nameInput.value = localStorage.getItem('userName') || '';
  nameModal.classList.remove('hidden');
  nameInput.focus();
});

document.getElementById('save-name-btn').addEventListener('click', () => {
  const val = nameInput.value.trim();
  if (val) localStorage.setItem('userName', val);
  else localStorage.removeItem('userName');
  nameModal.classList.add('hidden');
  updateDateTime();
});

document.getElementById('cancel-name-btn').addEventListener('click', () => {
  nameModal.classList.add('hidden');
});

nameModal.addEventListener('click', (e) => {
  if (e.target === nameModal) nameModal.classList.add('hidden');
});

// ===== Light / Dark Mode =====
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

const THEMES = {
  light: "url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&q=80')", // sakura + mount fuji (day)
  dark:  "url('https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=80')"  // tokyo night
};

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  document.body.style.backgroundImage = THEMES[theme];
  themeToggle.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
  localStorage.setItem('theme', theme);
}

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

applyTheme(localStorage.getItem('theme') || 'light');

// ===== Focus Timer =====
let timerDuration = parseInt(localStorage.getItem('timerDuration')) || 25;
let timeLeft = timerDuration * 60;
let timerInterval = null;
let running = false;

const timerDisplay = document.getElementById('timer-display');

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(timeLeft);
}

document.getElementById('start-btn').addEventListener('click', () => {
  if (running) return;
  running = true;
  timerInterval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      running = false;
      timerDisplay.textContent = '00:00';
      alert('Focus session complete! Take a break.');
      return;
    }
    timeLeft--;
    renderTimer();
  }, 1000);
});

document.getElementById('stop-btn').addEventListener('click', () => {
  clearInterval(timerInterval);
  running = false;
});

document.getElementById('reset-btn').addEventListener('click', () => {
  clearInterval(timerInterval);
  running = false;
  timeLeft = timerDuration * 60;
  renderTimer();
});

document.getElementById('set-time-btn').addEventListener('click', () => {
  const val = parseInt(document.getElementById('custom-minutes').value);
  if (!val || val < 1 || val > 120) return alert('Enter a valid number (1–120).');
  timerDuration = val;
  localStorage.setItem('timerDuration', val);
  timeLeft = val * 60;
  clearInterval(timerInterval);
  running = false;
  renderTimer();
  document.getElementById('custom-minutes').value = '';
});

renderTimer();

// ===== To-Do List =====
let todos = JSON.parse(localStorage.getItem('todos')) || [];

function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function getSortedTodos() {
  const sort = document.getElementById('sort-select').value;
  const copy = [...todos];
  if (sort === 'az') copy.sort((a, b) => a.text.localeCompare(b.text));
  else if (sort === 'za') copy.sort((a, b) => b.text.localeCompare(a.text));
  else if (sort === 'done') copy.sort((a, b) => Number(a.done) - Number(b.done));
  return copy;
}

function renderTodos() {
  const list = document.getElementById('todo-list');
  list.innerHTML = '';
  const sorted = getSortedTodos();

  sorted.forEach((todo) => {
    const realIndex = todos.findIndex(t => t.id === todo.id);
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.done ? ' done' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.done;
    checkbox.addEventListener('change', () => {
      todos[realIndex].done = checkbox.checked;
      saveTodos();
      renderTodos();
    });

    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = todo.text;

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.title = 'Edit';
    editBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.className = 'todo-edit-input';
      input.value = todo.text;
      li.replaceChild(input, span);
      input.focus();

      const saveEdit = () => {
        const newText = input.value.trim();
        if (!newText) return;
        // prevent duplicate on edit
        const duplicate = todos.some((t, i) => t.text.toLowerCase() === newText.toLowerCase() && i !== realIndex);
        if (duplicate) { alert('Task already exists!'); return; }
        todos[realIndex].text = newText;
        saveTodos();
        renderTodos();
      };

      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveEdit(); });
      editBtn.textContent = '💾';
      editBtn.removeEventListener('click', () => {});
      editBtn.onclick = saveEdit;
    });

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.title = 'Delete';
    delBtn.className = 'danger';
    delBtn.addEventListener('click', () => {
      todos.splice(realIndex, 1);
      saveTodos();
      renderTodos();
    });

    actions.append(editBtn, delBtn);
    li.append(checkbox, span, actions);
    list.appendChild(li);
  });
}

function addTask() {
  const input = document.getElementById('todo-input');
  const text = input.value.trim();
  if (!text) return;

  // prevent duplicate
  const duplicate = todos.some(t => t.text.toLowerCase() === text.toLowerCase());
  if (duplicate) { alert('Task already exists!'); return; }

  todos.push({ id: Date.now(), text, done: false });
  saveTodos();
  renderTodos();
  input.value = '';
}

document.getElementById('add-task-btn').addEventListener('click', addTask);
document.getElementById('todo-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});
document.getElementById('sort-select').addEventListener('change', renderTodos);

renderTodos();

// ===== Quick Links =====
let links = JSON.parse(localStorage.getItem('quickLinks')) || [];

function saveLinks() {
  localStorage.setItem('quickLinks', JSON.stringify(links));
}

function renderLinks() {
  const container = document.getElementById('links-list');
  container.innerHTML = '';
  links.forEach((link, i) => {
    const div = document.createElement('div');
    div.className = 'link-item';

    const a = document.createElement('a');
    a.href = link.url;
    a.textContent = link.name;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.title = 'Remove';
    delBtn.addEventListener('click', () => {
      links.splice(i, 1);
      saveLinks();
      renderLinks();
    });

    div.append(a, delBtn);
    container.appendChild(div);
  });
}

document.getElementById('add-link-btn').addEventListener('click', () => {
  const name = document.getElementById('link-name').value.trim();
  const url = document.getElementById('link-url').value.trim();
  if (!name || !url) return alert('Please fill in both name and URL.');
  links.push({ name, url });
  saveLinks();
  renderLinks();
  document.getElementById('link-name').value = '';
  document.getElementById('link-url').value = '';
});

renderLinks();


// ===== Weather =====
const WEATHER_ICONS = {
  '01': '☀️', '02': '⛅', '03': '☁️', '04': '☁️',
  '09': '🌧️', '10': '🌦️', '11': '⛈️', '13': '❄️', '50': '🌫️'
};

function getWeatherIcon(iconCode) {
  const key = iconCode.slice(0, 2);
  return WEATHER_ICONS[key] || '🌡️';
}

function showWeatherSetup() {
  document.getElementById('weather-setup').classList.remove('hidden');
  document.getElementById('weather-loading').classList.add('hidden');
  document.getElementById('weather-error').classList.add('hidden');
  document.getElementById('weather-content').classList.add('hidden');
  const saved = localStorage.getItem('weatherCity');
  if (saved) document.getElementById('weather-city').value = saved;
}

function showWeatherError() {
  document.getElementById('weather-loading').classList.add('hidden');
  document.getElementById('weather-error').classList.remove('hidden');
  document.getElementById('weather-content').classList.add('hidden');
  document.getElementById('weather-setup').classList.add('hidden');
}

async function fetchWeather() {
  const city = localStorage.getItem('weatherCity');
  const apiKey = localStorage.getItem('weatherApiKey');

  if (!city || !apiKey) { showWeatherSetup(); return; }

  document.getElementById('weather-loading').classList.remove('hidden');
  document.getElementById('weather-error').classList.add('hidden');
  document.getElementById('weather-content').classList.add('hidden');
  document.getElementById('weather-setup').classList.add('hidden');

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();

    document.getElementById('weather-icon').textContent = getWeatherIcon(data.weather[0].icon);
    document.getElementById('weather-temp').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('weather-desc').textContent = data.weather[0].description;
    document.getElementById('weather-meta').textContent =
      `${data.name} • Feels like ${Math.round(data.main.feels_like)}°C • Humidity ${data.main.humidity}%`;

    document.getElementById('weather-loading').classList.add('hidden');
    document.getElementById('weather-content').classList.remove('hidden');
  } catch {
    showWeatherError();
  }
}

document.getElementById('weather-save-btn').addEventListener('click', () => {
  const city = document.getElementById('weather-city').value.trim();
  const apiKey = document.getElementById('weather-apikey').value.trim();
  if (!city || !apiKey) { alert('Please fill in both city and API key.'); return; }
  localStorage.setItem('weatherCity', city);
  localStorage.setItem('weatherApiKey', apiKey);
  document.getElementById('weather-setup').classList.add('hidden');
  fetchWeather();
});

document.getElementById('weather-config-btn').addEventListener('click', showWeatherSetup);
document.getElementById('weather-config-btn2').addEventListener('click', showWeatherSetup);

fetchWeather();
// Refresh weather every 10 minutes
setInterval(fetchWeather, 10 * 60 * 1000);


// ===== Analog Clock =====
(function () {
  const canvas = document.getElementById('analog-clock');
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const radius = cx - 10;

  function getColors() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      face:    dark ? '#1e293b' : '#ffffff',
      border:  dark ? '#818cf8' : '#4f46e5',
      numbers: dark ? '#f1f5f9' : '#1a1a2e',
      tick:    dark ? '#94a3b8' : '#555555',
      hour:    dark ? '#f1f5f9' : '#1a1a2e',
      minute:  dark ? '#818cf8' : '#4f46e5',
      second:  dark ? '#f87171' : '#ef4444',
      center:  dark ? '#f1f5f9' : '#1a1a2e',
    };
  }

  function drawHand(angle, length, width, color) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + length * Math.cos(angle - Math.PI / 2),
      cy + length * Math.sin(angle - Math.PI / 2)
    );
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function drawClock() {
    const now = new Date();
    const hrs = now.getHours() % 12;
    const min = now.getMinutes();
    const sec = now.getSeconds();
    const c = getColors();

    ctx.clearRect(0, 0, size, size);

    // Face
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = c.face;
    ctx.fill();
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Hour numbers
    ctx.fillStyle = c.numbers;
    ctx.font = `bold ${size * 0.09}px Segoe UI, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) {
      const angle = (i * Math.PI) / 6 - Math.PI / 2;
      const x = cx + (radius * 0.78) * Math.cos(angle);
      const y = cy + (radius * 0.78) * Math.sin(angle);
      ctx.fillText(i, x, y);
    }

    // Tick marks
    for (let i = 0; i < 60; i++) {
      const angle = (i * Math.PI) / 30 - Math.PI / 2;
      const isMajor = i % 5 === 0;
      const inner = radius * (isMajor ? 0.88 : 0.93);
      ctx.beginPath();
      ctx.moveTo(cx + inner * Math.cos(angle), cy + inner * Math.sin(angle));
      ctx.lineTo(cx + radius * 0.97 * Math.cos(angle), cy + radius * 0.97 * Math.sin(angle));
      ctx.strokeStyle = c.tick;
      ctx.lineWidth = isMajor ? 2 : 1;
      ctx.stroke();
    }

    // Hour hand
    const hourAngle = ((hrs + min / 60) * Math.PI) / 6;
    drawHand(hourAngle, radius * 0.5, 6, c.hour);

    // Minute hand
    const minAngle = ((min + sec / 60) * Math.PI) / 30;
    drawHand(minAngle, radius * 0.7, 4, c.minute);

    // Second hand
    const secAngle = (sec * Math.PI) / 30;
    drawHand(secAngle, radius * 0.85, 2, c.second);

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = c.center;
    ctx.fill();
  }

  setInterval(drawClock, 1000);
  drawClock();
})();
