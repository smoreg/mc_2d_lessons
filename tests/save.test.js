'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { BLOCKS } = require('../game/js/blocks.js');
const { createWorld, generateTerrain, setBlock, getBlock } = require('../game/js/world.js');
const { createInventory, addBlock } = require('../game/js/inventory.js');
const { serialize, saveGame, loadGame, hasSave, clearSave } = require('../game/js/save.js');

// Маленькое хранилище-заглушка вместо браузерного localStorage.
function fakeStorage() {
  const data = {};
  return {
    setItem: (k, v) => { data[k] = String(v); },
    getItem: (k) => (k in data ? data[k] : null),
    removeItem: (k) => { delete data[k]; },
  };
}

function makeState() {
  const world = createWorld(6, 6);
  generateTerrain(world, 3);
  setBlock(world, 1, 1, BLOCKS.WOOD.id);
  const inventory = createInventory(4);
  addBlock(inventory, BLOCKS.STONE.id, 5);
  const player = { x: 2, y: 1 };
  return { world, inventory, player };
}

test('serialize сохраняет размер мира, инвентарь и позицию героя', () => {
  const data = serialize(makeState());
  assert.strictEqual(data.world.cols, 6);
  assert.strictEqual(data.world.rows, 6);
  assert.strictEqual(data.player.x, 2);
  assert.strictEqual(data.inventory.slots[0].count, 5);
});

test('saveGame и loadGame возвращают тот же мир', () => {
  const store = fakeStorage();
  const state = makeState();
  saveGame(state, store);
  const loaded = loadGame(store);
  assert.strictEqual(loaded.world.grid[1][1], BLOCKS.WOOD.id);
  assert.strictEqual(loaded.inventory.slots[0].blockId, BLOCKS.STONE.id);
});

test('loadGame возвращает null, если сохранения нет', () => {
  const store = fakeStorage();
  assert.strictEqual(loadGame(store), null);
});

test('hasSave и clearSave работают', () => {
  const store = fakeStorage();
  assert.strictEqual(hasSave(store), false);
  saveGame(makeState(), store);
  assert.strictEqual(hasSave(store), true);
  clearSave(store);
  assert.strictEqual(hasSave(store), false);
});

test('сломанное сохранение не роняет игру, а даёт null', () => {
  const store = fakeStorage();
  store.setItem('mc2d-save', 'это-не-json{{{');
  assert.strictEqual(loadGame(store), null);
});

test('сохранение переживает «перезапуск» (новый объект мира)', () => {
  const store = fakeStorage();
  const state = makeState();
  state.world.grid[2][2] = BLOCKS.SAND.id;
  saveGame(state, store);

  const loaded = loadGame(store);
  const restored = { cols: loaded.world.cols, rows: loaded.world.rows, grid: loaded.world.grid };
  assert.strictEqual(getBlock(restored, 2, 2), BLOCKS.SAND.id);
});
