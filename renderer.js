/**
 * QuizMaster Pro - Renderer Router & State Coordinator
 * Handles view switching and state maintenance across screens.
 */

let currentAppState = null;
let currentActiveView = 'dashboard';

// Dynamic Page Loader using File Protocol Fix
async function navigateTo(pageName, context = {}) {
  const container = document.getElementById('view-container');
  try {
    // Relative path fix for Electron local filesystem
    const response = await fetch(`./pages/${pageName}.html`);
    if (!response.ok) throw new Error(`Failed to load view: ${pageName}`);
    
    const html = await response.text();
    container.innerHTML = html;
    currentActiveView = pageName;

    // Highlight menu button
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === pageName);
    });

    // Load corresponding JS file dynamically if needed
    loadPageScript(pageName, context);

  } catch (err) {
    console.error('Navigation Error:', err);
    container.innerHTML = `<div style="padding: 20px; color: red;">Error loading ${pageName} page. Check path or developer console.</div>`;
  }
}

// Helper to safely trigger page initialization functions
function loadPageScript(pageName, context) {
  if (pageName === 'dashboard' && typeof initDashboard === 'function') initDashboard(context);
  if (pageName === 'quiz' && typeof initQuiz === 'function') initQuiz(context);
  if (pageName === 'result' && typeof initResult === 'function') initResult(context);
  if (pageName === 'leaderboard' && typeof initLeaderboard === 'function') initLeaderboard(context);
  if (pageName === 'settings' && typeof initSettings === 'function') initSettings(context);
}

// Global UI refresh
function updateGlobalUserDisplay() {
  if (currentAppState && currentAppState.settings) {
    const name = currentAppState.settings.username || 'Student';
    const avatarEl = document.getElementById('global-avatar');
    const userEl = document.getElementById('global-username');
    if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
    if (userEl) userEl.textContent = name;
  }
}

// Core App Initialization
async function initApp() {
  currentAppState = await window.quizAPI.getAppData();
  updateGlobalUserDisplay();

  // Attach navigation listeners
  document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', () => {
      const targetPage = button.dataset.page;
      navigateTo(targetPage);
    });
  });

  // Default initial load
  navigateTo('dashboard');
}

document.addEventListener('DOMContentLoaded', initApp);