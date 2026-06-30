// ===== Инвентарь =====
// Инвентарь — это список слотов. В каждом слоте лежит тип блока и его количество.

(function (root) {
  'use strict';

  const blocks = (typeof module !== 'undefined' && module.exports)
    ? require('./blocks.js')
    : root.Game;
  const { BLOCKS, getBlockType } = blocks;

  // Создать инвентарь из нескольких слотов. Сначала все слоты пустые.
  function createInventory(size) {
    const slots = [];
    for (let i = 0; i < size; i++) {
      slots.push({ blockId: BLOCKS.AIR.id, count: 0 });
    }
    return { slots, selected: 0 };
  }

  // Добавить блок в инвентарь. Сначала ищем слот с таким же блоком,
  // потом — любой пустой. Возвращает true, если поместилось.
  function addBlock(inv, blockId, amount) {
    const n = amount || 1;
    // 1) есть ли уже слот с таким блоком?
    for (const slot of inv.slots) {
      if (slot.blockId === blockId && slot.count > 0) {
        slot.count += n;
        return true;
      }
    }
    // 2) ищем пустой слот
    for (const slot of inv.slots) {
      if (slot.count === 0) {
        slot.blockId = blockId;
        slot.count = n;
        return true;
      }
    }
    return false;  // места нет
  }

  // Убрать один блок из выбранного слота. Возвращает id блока или null.
  function removeFromSelected(inv) {
    const slot = inv.slots[inv.selected];
    if (!slot || slot.count <= 0) return null;
    const id = slot.blockId;
    slot.count -= 1;
    if (slot.count === 0) {
      slot.blockId = BLOCKS.AIR.id;  // слот опустел
    }
    return id;
  }

  // Выбрать слот по номеру (0, 1, 2, ...).
  function selectSlot(inv, index) {
    if (index >= 0 && index < inv.slots.length) {
      inv.selected = index;
      return true;
    }
    return false;
  }

  // Какой блок сейчас выбран (его id) или AIR, если слот пуст.
  function selectedBlockId(inv) {
    const slot = inv.slots[inv.selected];
    if (!slot || slot.count <= 0) return BLOCKS.AIR.id;
    return slot.blockId;
  }

  // Удобное название выбранного блока (для подсказки на экране).
  function selectedName(inv) {
    return getBlockType(selectedBlockId(inv)).name;
  }

  // ----- Экспорт -----
  const api = {
    createInventory, addBlock, removeFromSelected,
    selectSlot, selectedBlockId, selectedName,
  };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.Game = Object.assign(root.Game || {}, api);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
