'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { BLOCKS } = require('../game/js/blocks.js');
const {
  createInventory, addBlock, removeFromSelected,
  selectSlot, selectedBlockId,
} = require('../game/js/inventory.js');

test('createInventory создаёт пустые слоты', () => {
  const inv = createInventory(4);
  assert.strictEqual(inv.slots.length, 4);
  assert.strictEqual(inv.selected, 0);
  assert.strictEqual(inv.slots[0].count, 0);
});

test('addBlock кладёт блок в первый пустой слот', () => {
  const inv = createInventory(4);
  addBlock(inv, BLOCKS.DIRT.id, 3);
  assert.strictEqual(inv.slots[0].blockId, BLOCKS.DIRT.id);
  assert.strictEqual(inv.slots[0].count, 3);
});

test('addBlock складывает одинаковые блоки в один слот', () => {
  const inv = createInventory(4);
  addBlock(inv, BLOCKS.STONE.id, 2);
  addBlock(inv, BLOCKS.STONE.id, 5);
  assert.strictEqual(inv.slots[0].count, 7);
  // второй слот остался пустым
  assert.strictEqual(inv.slots[1].count, 0);
});

test('addBlock возвращает false, когда места нет', () => {
  const inv = createInventory(1);
  addBlock(inv, BLOCKS.DIRT.id, 1);
  assert.strictEqual(addBlock(inv, BLOCKS.STONE.id, 1), false);
});

test('selectSlot меняет выбранный слот, но не выходит за границы', () => {
  const inv = createInventory(3);
  assert.strictEqual(selectSlot(inv, 2), true);
  assert.strictEqual(inv.selected, 2);
  assert.strictEqual(selectSlot(inv, 5), false);
  assert.strictEqual(inv.selected, 2);
});

test('removeFromSelected забирает один блок из выбранного слота', () => {
  const inv = createInventory(4);
  addBlock(inv, BLOCKS.WOOD.id, 2);
  const id = removeFromSelected(inv);
  assert.strictEqual(id, BLOCKS.WOOD.id);
  assert.strictEqual(inv.slots[0].count, 1);
});

test('когда слот опустел, он снова становится воздухом', () => {
  const inv = createInventory(4);
  addBlock(inv, BLOCKS.WOOD.id, 1);
  removeFromSelected(inv);
  assert.strictEqual(inv.slots[0].count, 0);
  assert.strictEqual(inv.slots[0].blockId, BLOCKS.AIR.id);
});

test('removeFromSelected из пустого слота возвращает null', () => {
  const inv = createInventory(4);
  assert.strictEqual(removeFromSelected(inv), null);
});

test('selectedBlockId возвращает выбранный блок или воздух', () => {
  const inv = createInventory(4);
  assert.strictEqual(selectedBlockId(inv), BLOCKS.AIR.id);
  addBlock(inv, BLOCKS.SAND.id, 1);
  assert.strictEqual(selectedBlockId(inv), BLOCKS.SAND.id);
});
