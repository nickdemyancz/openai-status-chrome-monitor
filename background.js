/* Manifest V3 service worker: polling and toolbar icon only. */
importScripts('shared.js');

const API_ROOT = 'https://status.openai.com/api/v2/';
const ALARM_NAME = 'openai-status-poll';
const REQUEST_TIMEOUT_MS = 12000;
let currentRefresh = null;

function iconPaths(color) {
  return {
    '16': `icons/${color}16.png`,
    '32': `icons/${color}32.png`,
    '48': `icons/${color}48.png`
  };
}

async function updateToolbar(snapshot) {
  const meta = !snapshot || snapshot.failed
    ? { color: 'gray', text: 'Нет данных' }
    : OpenAIStatus.overallMeta(snapshot.overallIndicator);
  let title = `OpenAI Status — ${meta.text}`;
  if (snapshot && snapshot.lastSuccessAt) {
    title += `\nПоследняя проверка: ${OpenAIStatus.formatDate(snapshot.lastSuccessAt)}`;
  }
  await Promise.all([
    chrome.action.setIcon({ path: iconPaths(meta.color) }),
    chrome.action.setTitle({ title })
  ]);
}

async function requestJson(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(API_ROOT + path, {
      signal: controller.signal,
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function normalizeComponents(components) {
  return components
    .filter((c) => c && typeof c.id === 'string' && typeof c.name === 'string')
    .map((c) => ({
      id: c.id,
      name: c.name,
      position: typeof c.position === 'number' ? c.position : 9999,
      status: typeof c.status === 'string' ? c.status : 'unknown'
    }));
}

async function performRefresh() {
  const stamp = new Date().toISOString();
  const { statusSnapshot: previous = {} } = await chrome.storage.local.get('statusSnapshot');
  try {
    const [statusData, componentsData] = await Promise.all([
      requestJson('status.json'),
      requestJson('components.json')
    ]);
    const indicator = statusData && statusData.status && statusData.status.indicator;
    if (typeof indicator !== 'string' || !Array.isArray(componentsData.components)) {
      throw new Error('Неверный формат данных OpenAI Status');
    }

    const components = normalizeComponents(componentsData.components);
    const snapshot = {
      overallIndicator: indicator,
      components,
      lastSuccessAt: new Date().toISOString(),
      lastAttemptAt: stamp,
      failed: false,
      error: null
    };
    await chrome.storage.local.set({ statusSnapshot: snapshot, componentCatalog: components });
    await updateToolbar(snapshot);
    return { ok: true };
  } catch (error) {
    const snapshot = {
      ...previous,
      lastAttemptAt: stamp,
      failed: true,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    };
    await chrome.storage.local.set({ statusSnapshot: snapshot });
    await updateToolbar(snapshot);
    return { ok: false, error: snapshot.error };
  }
}

function refresh() {
  if (currentRefresh) return currentRefresh;
  currentRefresh = performRefresh().finally(() => { currentRefresh = null; });
  return currentRefresh;
}

async function ensureAlarm(force = false) {
  const { intervalMinutes = 5 } = await chrome.storage.local.get('intervalMinutes');
  const existing = await chrome.alarms.get(ALARM_NAME);
  if (intervalMinutes === 0) {
    if (existing) await chrome.alarms.clear(ALARM_NAME);
    return;
  }
  if (![5, 30, 60].includes(intervalMinutes)) return;
  if (force || !existing || existing.periodInMinutes !== intervalMinutes) {
    await chrome.alarms.clear(ALARM_NAME);
    await chrome.alarms.create(ALARM_NAME, { periodInMinutes: intervalMinutes });
  }
}

async function initialize({ firstInstall = false } = {}) {
  if (firstInstall) {
    const values = await chrome.storage.local.get(['intervalMinutes', 'selectedIds']);
    const defaults = {};
    if (values.intervalMinutes === undefined) defaults.intervalMinutes = 5;
    if (!Array.isArray(values.selectedIds)) {
      defaults.selectedIds = OpenAIStatus.DEFAULT_SELECTED_IDS;
    }
    if (Object.keys(defaults).length) await chrome.storage.local.set(defaults);
  }
  await ensureAlarm();
  const { intervalMinutes = 5, statusSnapshot } = await chrome.storage.local.get([
    'intervalMinutes', 'statusSnapshot'
  ]);
  await updateToolbar(statusSnapshot);
  if (intervalMinutes !== 0) await refresh();
}

chrome.runtime.onInstalled.addListener(() => {
  void initialize({ firstInstall: true });
});
chrome.runtime.onStartup.addListener(() => {
  void initialize();
});
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) void refresh();
});
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace !== 'local' || !changes.intervalMinutes) return;
  void (async () => {
    await ensureAlarm(true);
    if (changes.intervalMinutes.newValue !== 0) await refresh();
  })();
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== 'REFRESH') return false;
  refresh().then(sendResponse).catch((error) => {
    sendResponse({ ok: false, error: String(error) });
  });
  return true;
});

// A worker can be restarted independently of the browser. Recreate a missing
// periodic alarm, rather than relying on alarm persistence across Chrome builds.
void ensureAlarm();
