'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { BLOCKS, getBlockType, isSolid } = require('../game/js/blocks.js');

test('у воздуха id равен 0 и он не твёрдый', () => {
  assert.strictEqual(BLOCKS.AIR.id, 0);
  assert.strictEqual(isSolid(BLOCKS.AIR.id), false);
});

test('трава, земля и камень — твёрдые', () => {
  assert.strictEqual(isSolid(BLOCKS.GRASS.id), true);
  assert.strictEqual(isSolid(BLOCKS.DIRT.id), true);
  assert.strictEqual(isSolid(BLOCKS.STONE.id), true);
});

test('вода не твёрдая (сквозь неё можно пройти)', () => {
  assert.strictEqual(isSolid(BLOCKS.WATER.id), false);
});

test('getBlockType находит блок по id', () => {
  assert.strictEqual(getBlockType(BLOCKS.STONE.id).name, 'Камень');
});

test('неизвестный id считается воздухом', () => {
  assert.strictEqual(getBlockType(999), BLOCKS.AIR);
});

test('у всех блоков уникальные id', () => {
  const ids = Object.values(BLOCKS).map((b) => b.id);
  assert.strictEqual(new Set(ids).size, ids.length);
});
