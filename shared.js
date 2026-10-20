/* Shared display data. Component IDs, not names, identify services. */
(() => {
  const DEFAULT_SELECTED_IDS = [
    '01JMXBNJXGV1T5GT2M9XA83XNG', // ChatGPT / Conversations
    '01JMXBNJXG1S2D9V65P1ZZTD94', // ChatGPT / Login
    '01JMXBNJXGKKP51D4DEJ2HZJ8Q', // ChatGPT / Search
    '01JVCV8YSWZFRSM1G5CVP253SK'  // Codex / Codex Web
  ];

  // The public components API supplies a stable ID and position, but not the
  // visual section headings currently used on the OpenAI status website.
  const GROUP_BOUNDARIES = new Map([
    ['01JMXBRMFE6N2NNT7DG6XZQ6PW', 'APIs'],
    ['01JMXBNJXGV1T5GT2M9XA83XNG', 'ChatGPT'],
    ['01JVCV8YSWZFRSM1G5CVP253SK', 'Codex'],
    ['01KKAD7C71MCCH3FTREMJH4AAS', 'FedRAMP'],
    ['01KTQBYVARFJ5KMCSECM06VKCF', 'Ads Platform']
  ]);

  const COLORS = {
    green: '#22c55e',
    yellow: '#eab308',
    red: '#ef4444',
    gray: '#9ca3af'
  };

  function overallMeta(indicator) {
    switch (indicator) {
      case 'none': return { color: 'green', text: 'Всё работает' };
      case 'minor': return { color: 'yellow', text: 'Частичные проблемы' };
      case 'major':
      case 'critical': return { color: 'red', text: 'Серьёзный сбой' };
      case 'maintenance': return { color: 'yellow', text: 'Обслуживание' };
      default: return { color: 'gray', text: 'Статус неизвестен' };
    }
  }

  function componentMeta(status) {
    switch (status) {
      case 'operational': return { color: 'green', text: 'Работает' };
      case 'degraded_performance': return { color: 'yellow', text: 'Снижена производительность' };
      case 'partial_outage': return { color: 'yellow', text: 'Частичный сбой' };
      case 'under_maintenance': return { color: 'yellow', text: 'Обслуживание' };
      case 'major_outage': return { color: 'red', text: 'Серьёзный сбой' };
      default: return { color: 'gray', text: 'Статус неизвестен' };
    }
  }

  function groupComponents(components) {
    const ordered = [...components].sort((a, b) =>
      (Number(a.position) || 0) - (Number(b.position) || 0)
    );
    const groups = [];
    let activeGroup = 'Другие службы';
    for (const component of ordered) {
      if (GROUP_BOUNDARIES.has(component.id)) {
        activeGroup = GROUP_BOUNDARIES.get(component.id);
      }
      if (!groups.length || groups[groups.length - 1].name !== activeGroup) {
        groups.push({ name: activeGroup, components: [] });
      }
      groups[groups.length - 1].components.push(component);
    }
    return groups;
  }

  function formatDate(dateString) {
    if (!dateString) return 'ещё не выполнялась';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'неизвестно';
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  }

  globalThis.OpenAIStatus = {
    DEFAULT_SELECTED_IDS, COLORS, overallMeta,
    componentMeta, groupComponents, formatDate
  };
})();
