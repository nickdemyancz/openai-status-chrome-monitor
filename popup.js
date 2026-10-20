const { componentMeta, overallMeta, groupComponents, formatDate, DEFAULT_SELECTED_IDS } = OpenAIStatus;
const servicesEl = document.getElementById('services');
const overviewDot = document.getElementById('overall-dot');
const overviewText = document.getElementById('overall-text');
const checkedAt = document.getElementById('checked-at');
const warning = document.getElementById('warning');
const countEl = document.getElementById('selection-count');
const refreshButton = document.getElementById('refresh');

function dot(color) {
  const span = document.createElement('span');
  span.className = `status-dot ${color}`;
  span.setAttribute('aria-hidden', 'true');
  return span;
}

function createGroup(title, components, isStale) {
  const group = document.createElement('section');
  group.className = 'service-group';
  const heading = document.createElement('h2');
  heading.className = 'group-heading';
  heading.textContent = title;
  group.append(heading);

  for (const component of components) {
    const meta = componentMeta(component.status);
    const row = document.createElement('div');
    row.className = 'service-row';
    if (isStale) row.classList.add('stale');
    const name = document.createElement('span');
    name.className = 'service-name';
    name.textContent = component.name;
    const right = document.createElement('span');
    right.className = 'service-right';
    const status = document.createElement('span');
    status.className = 'service-status';
    status.textContent = meta.text;
    right.append(status, dot(meta.color));
    row.append(name, right);
    group.append(row);
  }
  return group;
}

async function render() {
  const { statusSnapshot: snapshot, selectedIds, intervalMinutes = 5 } =
    await chrome.storage.local.get(['statusSnapshot', 'selectedIds', 'intervalMinutes']);
  const selected = new Set(Array.isArray(selectedIds) ? selectedIds : DEFAULT_SELECTED_IDS);
  const hasSnapshot = snapshot && Array.isArray(snapshot.components);
  const hasError = Boolean(snapshot && snapshot.failed);
  const overall = !hasSnapshot || hasError
    ? { color: 'gray', text: hasError ? 'Не удалось получить данные' : 'Нет данных' }
    : overallMeta(snapshot.overallIndicator);

  overviewDot.className = `status-dot large ${overall.color}`;
  overviewText.textContent = overall.text;
  checkedAt.textContent = hasSnapshot && snapshot.lastSuccessAt
    ? `Обновлено: ${formatDate(snapshot.lastSuccessAt)}`
    : 'Данные ещё не загружены';

  warning.hidden = true;
  if (hasError) {
    warning.textContent = hasSnapshot && snapshot.lastSuccessAt
      ? `Нет связи с OpenAI Status. Ниже сохранённые данные от ${formatDate(snapshot.lastSuccessAt)}.`
      : 'Не удалось получить данные OpenAI Status. Попробуйте обновить вручную.';
    warning.hidden = false;
  } else if (!hasSnapshot && intervalMinutes === 0) {
    warning.textContent = 'Ручной режим: нажмите кнопку обновления вверху.';
    warning.hidden = false;
  }

  servicesEl.replaceChildren();
  countEl.textContent = String(selected.size);
  if (selected.size === 0) {
    addPlaceholder('Службы не выбраны. Откройте настройки, чтобы добавить их.');
    return;
  }
  if (!hasSnapshot) {
    addPlaceholder('Список служб появится после первой успешной проверки.');
    return;
  }

  const groups = groupComponents(snapshot.components);
  let shownCount = 0;
  for (const group of groups) {
    const matching = group.components.filter((item) => selected.has(item.id));
    if (!matching.length) continue;
    servicesEl.append(createGroup(group.name, matching, hasError));
    shownCount += matching.length;
  }
  if (!shownCount) {
    addPlaceholder('Выбранные службы отсутствуют в последнем ответе OpenAI. Проверьте настройки.');
  } else if (shownCount !== selected.size) {
    const note = document.createElement('p');
    note.className = 'tiny-note';
    note.textContent = `Не найдено служб: ${selected.size - shownCount}`;
    servicesEl.append(note);
  }
}

function addPlaceholder(message) {
  const node = document.createElement('div');
  node.className = 'empty-state';
  node.textContent = message;
  servicesEl.append(node);
}

document.getElementById('settings').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});
refreshButton.addEventListener('click', async () => {
  refreshButton.disabled = true;
  refreshButton.classList.add('refreshing');
  try {
    await chrome.runtime.sendMessage({ type: 'REFRESH' });
  } catch (error) {
    warning.hidden = false;
    warning.textContent = 'Не удалось выполнить проверку. Попробуйте ещё раз.';
  } finally {
    refreshButton.disabled = false;
    refreshButton.classList.remove('refreshing');
    await render();
  }
});
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' &&
      (changes.statusSnapshot || changes.selectedIds || changes.intervalMinutes)) {
    void render();
  }
});
void render();
