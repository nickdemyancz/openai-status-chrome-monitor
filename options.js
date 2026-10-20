const { DEFAULT_SELECTED_IDS, groupComponents } = OpenAIStatus;
const groupContainer = document.getElementById('component-groups');
const catalogStatus = document.getElementById('catalog-status');
const selectedCount = document.getElementById('selected-count');
const savedMessage = document.getElementById('saved-message');
const intervalEl = document.getElementById('interval');
const saveButton = document.getElementById('save');
let selected = new Set(DEFAULT_SELECTED_IDS);
let catalog = [];

function setSelectedCount() {
  selectedCount.textContent = String(selected.size);
  savedMessage.textContent = '';
}

function renderCatalog() {
  groupContainer.replaceChildren();
  if (!catalog.length) {
    catalogStatus.textContent = 'Список служб пока недоступен. Проверьте соединение и перезагрузите страницу.';
    catalogStatus.hidden = false;
    return;
  }
  catalogStatus.hidden = true;

  for (const group of groupComponents(catalog)) {
    const section = document.createElement('section');
    section.className = 'catalog-group';
    const title = document.createElement('h3');
    title.textContent = group.name;
    section.append(title);
    const grid = document.createElement('div');
    grid.className = 'checkbox-grid';

    for (const component of group.components) {
      const label = document.createElement('label');
      label.className = 'component-choice';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = 'component';
      checkbox.value = component.id;
      checkbox.checked = selected.has(component.id);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) selected.add(component.id);
        else selected.delete(component.id);
        setSelectedCount();
      });
      const text = document.createElement('span');
      text.textContent = component.name;
      label.append(checkbox, text);
      grid.append(label);
    }
    section.append(grid);
    groupContainer.append(section);
  }
  setSelectedCount();
}

async function fetchCatalog() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch('https://status.openai.com/api/v2/components.json', {
      cache: 'no-store', signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.components) || data.components.length === 0) {
      throw new Error('Пустой список служб');
    }
    const components = data.components.filter((c) =>
      c && typeof c.id === 'string' && typeof c.name === 'string'
    ).map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      position: c.position
    }));
    catalog = components;
    await chrome.storage.local.set({ componentCatalog: components });
    renderCatalog();
  } catch (error) {
    if (catalog.length === 0) renderCatalog();
    else {
      catalogStatus.textContent = 'Список с сайта временно недоступен — показана сохранённая версия.';
      catalogStatus.hidden = false;
    }
  } finally {
    clearTimeout(timer);
  }
}

async function init() {
  const values = await chrome.storage.local.get([
    'intervalMinutes', 'selectedIds', 'componentCatalog'
  ]);
  selected = new Set(Array.isArray(values.selectedIds)
    ? values.selectedIds
    : DEFAULT_SELECTED_IDS);
  intervalEl.value = String([0, 5, 30, 60].includes(values.intervalMinutes)
    ? values.intervalMinutes
    : 5);
  catalog = Array.isArray(values.componentCatalog) ? values.componentCatalog : [];
  renderCatalog();
  await fetchCatalog();
}

document.getElementById('select-all').addEventListener('click', () => {
  for (const component of catalog) selected.add(component.id);
  renderCatalog();
});
document.getElementById('clear-all').addEventListener('click', () => {
  selected.clear();
  renderCatalog();
});
document.getElementById('settings-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  saveButton.disabled = true;
  savedMessage.textContent = '';
  try {
    await chrome.storage.local.set({
      intervalMinutes: Number(intervalEl.value),
      selectedIds: [...selected]
    });
    savedMessage.textContent = 'Настройки сохранены';
  } catch (error) {
    savedMessage.textContent = 'Не удалось сохранить настройки';
  } finally {
    saveButton.disabled = false;
  }
});
intervalEl.addEventListener('change', () => { savedMessage.textContent = ''; });
void init();
