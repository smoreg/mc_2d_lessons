// ===== Герой и физика =====
// Герой умеет ходить влево-вправо, падать (гравитация) и прыгать.
// Он не может проходить сквозь твёрдые блоки.

(function (root) {
  'use strict';

  const world = (typeof module !== 'undefined' && module.exports)
    ? require('./world.js')
    : root.Game;
  const { getBlock, isSolid } = world;

  // Размеры героя задаём в долях клетки (чуть меньше блока, чтобы пролезал).
  const PLAYER_W = 0.8;
  const PLAYER_H = 1.8;

  function createPlayer(x, y) {
    return {
      x: x, y: y,        // координаты в клетках (могут быть дробными)
      vx: 0, vy: 0,      // скорость по горизонтали и вертикали
      onGround: false,
      width: PLAYER_W,
      height: PLAYER_H,
    };
  }

  // Есть ли твёрдый блок в прямоугольнике героя в позиции (px, py)?
  function collides(world_, px, py, w, h) {
    const x0 = Math.floor(px);
    const x1 = Math.floor(px + w - 0.001);
    const y0 = Math.floor(py);
    const y1 = Math.floor(py + h - 0.001);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (isSolid(getBlock(world_, x, y))) return true;
      }
    }
    return false;
  }

  // Один шаг физики. dir — направление (-1 влево, 1 вправо, 0 стоим),
  // jump — true, если нажали прыжок. gravity и speed — настройки.
  function updatePlayer(player, world_, dir, jump, opts) {
    const o = opts || {};
    const speed = o.speed || 0.12;
    const gravity = o.gravity || 0.04;
    const jumpPower = o.jumpPower || 0.5;
    const w = player.width;
    const h = player.height;

    // --- движение по горизонтали ---
    player.vx = dir * speed;
    let nextX = player.x + player.vx;
    if (!collides(world_, nextX, player.y, w, h)) {
      player.x = nextX;
    } else {
      player.vx = 0;  // упёрлись в стену
    }

    // --- прыжок ---
    if (jump && player.onGround) {
      player.vy = -jumpPower;
      player.onGround = false;
    }

    // --- гравитация по вертикали ---
    player.vy += gravity;
    let nextY = player.y + player.vy;
    if (!collides(world_, player.x, nextY, w, h)) {
      player.y = nextY;
      player.onGround = false;
    } else {
      // упёрлись: если падали вниз — встали на землю
      if (player.vy > 0) player.onGround = true;
      player.vy = 0;
    }

    return player;
  }

  // ----- Экспорт -----
  const api = { createPlayer, updatePlayer, collides, PLAYER_W, PLAYER_H };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.Game = Object.assign(root.Game || {}, api);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
