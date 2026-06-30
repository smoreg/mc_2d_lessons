// ===== Мир из блоков =====
// Мир — это таблица (двумерный массив) из номеров блоков.
// world[y][x] — это блок в столбце x и строке y.

(function (root) {
  'use strict';

  // В Node блоки берём через require, в браузере — из уже загруженного Game.
  const blocks = (typeof module !== 'undefined' && module.exports)
    ? require('./blocks.js')
    : root.Game;
  const { BLOCKS, isSolid } = blocks;

  // Создать новый мир и сгенерировать в нём простой ландшафт.
  // cols — ширина в блоках, rows — высота в блоках.
  function createWorld(cols, rows) {
    const grid = [];
    for (let y = 0; y < rows; y++) {
      const line = [];
      for (let x = 0; x < cols; x++) {
        line.push(BLOCKS.AIR.id);
      }
      grid.push(line);
    }
    return { cols, rows, grid };
  }

  // Проверить, что клетка (x, y) находится внутри мира.
  function inBounds(world, x, y) {
    return x >= 0 && y >= 0 && x < world.cols && y < world.rows;
  }

  // Узнать id блока в клетке. За границей мира считаем, что там воздух.
  function getBlock(world, x, y) {
    if (!inBounds(world, x, y)) return BLOCKS.AIR.id;
    return world.grid[y][x];
  }

  // Поставить блок в клетку (просто записать его id).
  function setBlock(world, x, y, id) {
    if (!inBounds(world, x, y)) return false;
    world.grid[y][x] = id;
    return true;
  }

  // Сгенерировать ландшафт: небо сверху, потом трава, земля и камень.
  // surface — на какой строке начинается трава.
  function generateTerrain(world, surface) {
    const groundLevel = (typeof surface === 'number')
      ? surface
      : Math.floor(world.rows / 2);

    for (let x = 0; x < world.cols; x++) {
      // Небольшие холмы: высота поверхности слегка «гуляет».
      const hill = Math.round(2 * Math.sin(x / 3));
      const top = groundLevel + hill;

      for (let y = 0; y < world.rows; y++) {
        if (y < top) {
          setBlock(world, x, y, BLOCKS.AIR.id);            // небо
        } else if (y === top) {
          setBlock(world, x, y, BLOCKS.GRASS.id);          // трава сверху
        } else if (y < top + 4) {
          setBlock(world, x, y, BLOCKS.DIRT.id);           // слой земли
        } else {
          setBlock(world, x, y, BLOCKS.STONE.id);          // камень глубже
        }
      }
    }
    return world;
  }

  // Копать: убрать блок (поставить воздух). Возвращает id того, что выкопали,
  // или null, если копать было нечего.
  function digBlock(world, x, y) {
    const id = getBlock(world, x, y);
    if (id === BLOCKS.AIR.id) return null;       // там и так пусто
    setBlock(world, x, y, BLOCKS.AIR.id);
    return id;
  }

  // Поставить блок, но только если клетка пустая (воздух).
  // Возвращает true, если получилось.
  function placeBlock(world, x, y, id) {
    if (getBlock(world, x, y) !== BLOCKS.AIR.id) return false;  // занято
    return setBlock(world, x, y, id);
  }

  // ----- Экспорт -----
  const api = {
    createWorld, inBounds, getBlock, setBlock,
    generateTerrain, digBlock, placeBlock, isSolid,
  };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.Game = Object.assign(root.Game || {}, api);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
