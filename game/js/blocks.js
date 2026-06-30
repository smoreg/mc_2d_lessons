// ===== Справочник блоков =====
// Здесь описаны все типы блоков нашего мира: их номер (id), название и цвет.
// Этот файл работает и в браузере (через <script>), и в Node (для автотестов).

(function (root) {
  'use strict';

  // У каждого блока есть числовой id. 0 — это «пусто» (воздух).
  const BLOCKS = {
    AIR:   { id: 0, name: 'Воздух', color: null,      solid: false },
    GRASS: { id: 1, name: 'Трава',  color: '#5fbf4f',  solid: true  },
    DIRT:  { id: 2, name: 'Земля',  color: '#8b5a2b',  solid: true  },
    STONE: { id: 3, name: 'Камень', color: '#9a9a9a',  solid: true  },
    WOOD:  { id: 4, name: 'Дерево', color: '#7a4a1e',  solid: true  },
    LEAVES:{ id: 5, name: 'Листва', color: '#3e9b3e',  solid: true  },
    SAND:  { id: 6, name: 'Песок',  color: '#e3d27a',  solid: true  },
    WATER: { id: 7, name: 'Вода',   color: '#3a7bd5',  solid: false },
  };

  // Быстрый поиск блока по его id (например, byId[1] === GRASS).
  const byId = {};
  for (const key in BLOCKS) {
    byId[BLOCKS[key].id] = BLOCKS[key];
  }

  // Вернуть описание блока по его id.
  function getBlockType(id) {
    return byId[id] || BLOCKS.AIR;
  }

  // Можно ли сквозь этот блок пройти? Воздух и вода — можно, остальное — нет.
  function isSolid(id) {
    return getBlockType(id).solid === true;
  }

  // ----- Экспорт -----
  const api = { BLOCKS, getBlockType, isSolid };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;            // Node (автотесты)
  } else {
    root.Game = Object.assign(root.Game || {}, api);  // браузер
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
