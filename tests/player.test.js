'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { BLOCKS } = require('../game/js/blocks.js');
const { createWorld, generateTerrain, setBlock } = require('../game/js/world.js');
const { createPlayer, updatePlayer, collides } = require('../game/js/player.js');

test('collides находит твёрдый блок под героем', () => {
  const w = createWorld(6, 6);
  setBlock(w, 2, 5, BLOCKS.STONE.id);
  assert.strictEqual(collides(w, 2, 4.5, 0.8, 1.8), true);
  assert.strictEqual(collides(w, 0, 0, 0.8, 1.8), false);
});

test('герой падает под действием гравитации', () => {
  const w = createWorld(10, 20);
  const p = createPlayer(5, 0);
  const yBefore = p.y;
  updatePlayer(p, w, 0, false, {});
  assert.ok(p.y > yBefore, 'герой должен опуститься ниже');
});

test('герой не проваливается сквозь землю', () => {
  const w = createWorld(10, 20);
  generateTerrain(w, 8);
  const p = createPlayer(5, 0);
  // прокрутим много шагов физики — герой должен приземлиться
  for (let i = 0; i < 300; i++) updatePlayer(p, w, 0, false, {});
  assert.ok(p.onGround, 'герой должен стоять на земле');
  assert.ok(p.y < w.rows, 'герой остаётся внутри мира');
});

test('герой не проходит сквозь стену сбоку', () => {
  const w = createWorld(10, 8);
  // пол по всему низу, чтобы герой не провалился
  for (let x = 0; x < 10; x++) setBlock(w, x, 7, BLOCKS.STONE.id);
  // стена из камня в столбце 5
  for (let y = 0; y < 7; y++) setBlock(w, 5, y, BLOCKS.STONE.id);
  const p = createPlayer(3, 0);
  for (let i = 0; i < 100; i++) updatePlayer(p, w, 1, false, {}); // идём вправо
  // +0.001 — небольшой допуск из-за погрешности дробных чисел
  assert.ok(p.x + p.width <= 5.001, 'герой упёрся в стену и не прошёл сквозь неё');
});

test('герой может прыгнуть, стоя на земле', () => {
  const w = createWorld(10, 10);
  for (let x = 0; x < 10; x++) setBlock(w, x, 6, BLOCKS.STONE.id);
  const p = createPlayer(5, 0);
  for (let i = 0; i < 200; i++) updatePlayer(p, w, 0, false, {}); // приземлился
  assert.ok(p.onGround);
  const yGround = p.y;
  updatePlayer(p, w, 0, true, {});   // прыжок
  assert.ok(p.y < yGround, 'после прыжка герой поднялся вверх');
});
