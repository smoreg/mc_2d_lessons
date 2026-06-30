// ===== Сохранение и загрузка =====
// Превращаем мир, инвентарь и героя в текст (JSON) и обратно.
// Это позволяет сохранить игру и вернуться к ней позже.

(function (root) {
  'use strict';

  const SAVE_KEY = 'mc2d-save';

  // Собрать всё состояние игры в один обычный объект.
  function serialize(state) {
    return {
      version: 1,
      world: { cols: state.world.cols, rows: state.world.rows, grid: state.world.grid },
      inventory: state.inventory,
      player: { x: state.player.x, y: state.player.y },
    };
  }

  // Сохранить игру в хранилище (в браузере — это localStorage).
  // storage передаём отдельно, чтобы файл можно было проверять автотестами.
  function saveGame(state, storage) {
    const store = storage || root.localStorage;
    const text = JSON.stringify(serialize(state));
    store.setItem(SAVE_KEY, text);
    return text;
  }

  // Загрузить игру. Возвращает разобранный объект или null, если сохранения нет.
  function loadGame(storage) {
    const store = storage || root.localStorage;
    const text = store.getItem(SAVE_KEY);
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;  // сохранение испорчено
    }
  }

  // Есть ли вообще сохранение?
  function hasSave(storage) {
    const store = storage || root.localStorage;
    return store.getItem(SAVE_KEY) !== null;
  }

  // Стереть сохранение.
  function clearSave(storage) {
    const store = storage || root.localStorage;
    store.removeItem(SAVE_KEY);
  }

  // ----- Экспорт -----
  const api = { serialize, saveGame, loadGame, hasSave, clearSave, SAVE_KEY };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.Game = Object.assign(root.Game || {}, api);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
