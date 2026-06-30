'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { BLOCKS } = require('../game/js/blocks.js');
const {
  createWorld, inBounds, getBlock, setBlock,
  generateTerrain, digBlock, placeBlock,
} = require('../game/js/world.js');

test('createWorld делает таблицу нужного размера, заполненную воздухом', () => {
  const w = createWorld(5, 3);
  assert.strictEqual(w.cols, 5);
  assert.strictEqual(w.rows, 3);
  assert.strictEqual(w.grid.length, 3);
  assert.strictEqual(w.grid[0].length, 5);
  assert.strictEqual(getBlock(w, 0, 0), BLOCKS.AIR.id);
});

test('inBounds различает клетки внутри и снаружи мира', () => {
  const w = createWorld(4, 4);
  assert.strictEqual(inBounds(w, 0, 0), true);
  assert.strictEqual(inBounds(w, 3, 3), true);
  assert.strictEqual(inBounds(w, -1, 0), false);
  assert.strictEqual(inBounds(w, 4, 0), false);
  assert.strictEqual(inBounds(w, 0, 4), false);
});

test('за границей мира всегда воздух', () => {
  const w = createWorld(4, 4);
  assert.strictEqual(getBlock(w, -5, -5), BLOCKS.AIR.id);
  assert.strictEqual(getBlock(w, 100, 100), BLOCKS.AIR.id);
});

test('setBlock ставит блок, а за границей возвращает false', () => {
  const w = createWorld(4, 4);
  assert.strictEqual(setBlock(w, 1, 1, BLOCKS.STONE.id), true);
  assert.strictEqual(getBlock(w, 1, 1), BLOCKS.STONE.id);
  assert.strictEqual(setBlock(w, 99, 99, BLOCKS.STONE.id), false);
});

test('generateTerrain кладёт траву на поверхность, землю и камень ниже', () => {
  const w = createWorld(10, 20);
  generateTerrain(w, 8);
  // на самом верху должен быть воздух
  assert.strictEqual(getBlock(w, 0, 0), BLOCKS.AIR.id);
  // где-то глубоко внизу должен быть камень
  assert.strictEqual(getBlock(w, 0, 19), BLOCKS.STONE.id);
  // в мире должна появиться трава
  let hasGrass = false;
  for (let x = 0; x < w.cols; x++) {
    for (let y = 0; y < w.rows; y++) {
      if (getBlock(w, x, y) === BLOCKS.GRASS.id) hasGrass = true;
    }
  }
  assert.strictEqual(hasGrass, true);
});

test('digBlock убирает блок и возвращает его id', () => {
  const w = createWorld(4, 4);
  setBlock(w, 2, 2, BLOCKS.DIRT.id);
  const dug = digBlock(w, 2, 2);
  assert.strictEqual(dug, BLOCKS.DIRT.id);
  assert.strictEqual(getBlock(w, 2, 2), BLOCKS.AIR.id);
});

test('digBlock по пустой клетке возвращает null', () => {
  const w = createWorld(4, 4);
  assert.strictEqual(digBlock(w, 1, 1), null);
});

test('placeBlock ставит блок только в пустую клетку', () => {
  const w = createWorld(4, 4);
  assert.strictEqual(placeBlock(w, 1, 1, BLOCKS.WOOD.id), true);
  assert.strictEqual(getBlock(w, 1, 1), BLOCKS.WOOD.id);
  // повторно поставить в занятую клетку нельзя
  assert.strictEqual(placeBlock(w, 1, 1, BLOCKS.STONE.id), false);
  assert.strictEqual(getBlock(w, 1, 1), BLOCKS.WOOD.id);
});
