// ===== Сборка игры =====
// Этот файл соединяет все части вместе: рисует мир, читает клавиши и мышь,
// крутит игровой цикл. Чистую логику он берёт из других файлов (объект Game).

(function () {
  'use strict';

  const G = window.Game;
  const TILE = 32;                 // размер блока на экране в пикселях
  const COLS = 40;                 // ширина мира в блоках
  const ROWS = 22;                 // высота мира в блоках
  const REACH = 5;                 // на сколько клеток дотягивается герой

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  canvas.width = COLS * TILE;
  canvas.height = ROWS * TILE;

  // --- Состояние игры ---
  let world = G.createWorld(COLS, ROWS);
  G.generateTerrain(world, 8);
  let inventory = G.createInventory(8);
  // Положим немного блоков в инвентарь на старте.
  G.addBlock(inventory, G.BLOCKS.DIRT.id, 20);
  G.addBlock(inventory, G.BLOCKS.STONE.id, 20);
  G.addBlock(inventory, G.BLOCKS.WOOD.id, 20);
  let player = G.createPlayer(COLS / 2, 0);

  // Попробуем загрузить сохранение.
  const saved = G.loadGame(window.localStorage);
  if (saved) applySave(saved);

  function applySave(data) {
    world = { cols: data.world.cols, rows: data.world.rows, grid: data.world.grid };
    inventory = data.inventory;
    player = G.createPlayer(data.player.x, data.player.y);
  }

  // --- Ввод с клавиатуры ---
  const keys = {};
  window.addEventListener('keydown', function (e) {
    keys[e.key] = true;
    // Выбор слота клавишами 1..8
    if (e.key >= '1' && e.key <= '8') {
      G.selectSlot(inventory, Number(e.key) - 1);
    }
    if (e.key === 's' || e.key === 'S') doSave();
    if (e.key === 'l' || e.key === 'L') doLoad();
  });
  window.addEventListener('keyup', function (e) { keys[e.key] = false; });

  function doSave() {
    G.saveGame({ world, inventory, player }, window.localStorage);
    flash('Игра сохранена ✅');
  }
  function doLoad() {
    const data = G.loadGame(window.localStorage);
    if (data) { applySave(data); flash('Игра загружена 📂'); }
  }

  // --- Ввод мышью: копаем (левая) и ставим (правая) ---
  let mouse = { cx: 0, cy: 0 };
  canvas.addEventListener('mousemove', function (e) {
    const r = canvas.getBoundingClientRect();
    mouse.cx = Math.floor((e.clientX - r.left) / TILE);
    mouse.cy = Math.floor((e.clientY - r.top) / TILE);
  });
  canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  canvas.addEventListener('mousedown', function (e) {
    const r = canvas.getBoundingClientRect();
    const cx = Math.floor((e.clientX - r.left) / TILE);
    const cy = Math.floor((e.clientY - r.top) / TILE);
    if (!withinReach(cx, cy)) return;

    if (e.button === 0) {                         // левая кнопка — копать
      const dug = G.digBlock(world, cx, cy);
      if (dug !== null) G.addBlock(inventory, dug, 1);
    } else if (e.button === 2) {                  // правая кнопка — ставить
      const id = G.selectedBlockId(inventory);
      if (id !== G.BLOCKS.AIR.id && G.placeBlock(world, cx, cy, id)) {
        G.removeFromSelected(inventory);
      }
    }
  });

  function withinReach(cx, cy) {
    const dx = cx + 0.5 - (player.x + player.width / 2);
    const dy = cy + 0.5 - (player.y + player.height / 2);
    return Math.sqrt(dx * dx + dy * dy) <= REACH;
  }

  // --- Рисование ---
  function drawWorld() {
    // небо (плавный градиент)
    ctx.fillStyle = '#9bd3ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < world.rows; y++) {
      for (let x = 0; x < world.cols; x++) {
        const type = G.getBlockType(G.getBlock(world, x, y));
        if (!type.color) continue;
        ctx.fillStyle = type.color;
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        // лёгкая обводка, чтобы блоки были видны
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.strokeRect(x * TILE, y * TILE, TILE, TILE);
      }
    }
  }

  function drawPlayer() {
    ctx.fillStyle = '#d23b3b';
    ctx.fillRect(player.x * TILE, player.y * TILE, player.width * TILE, player.height * TILE);
    // глаза
    ctx.fillStyle = '#fff';
    ctx.fillRect((player.x + 0.15) * TILE, (player.y + 0.2) * TILE, 6, 6);
    ctx.fillRect((player.x + 0.5) * TILE, (player.y + 0.2) * TILE, 6, 6);
  }

  function drawCursor() {
    if (!withinReach(mouse.cx, mouse.cy)) return;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(mouse.cx * TILE, mouse.cy * TILE, TILE, TILE);
    ctx.lineWidth = 1;
  }

  function drawInventory() {
    const slotSize = 40;
    const startX = 10;
    const y = canvas.height - slotSize - 10;
    for (let i = 0; i < inventory.slots.length; i++) {
      const slot = inventory.slots[i];
      const x = startX + i * (slotSize + 6);
      ctx.fillStyle = (i === inventory.selected) ? '#ffffff' : 'rgba(0,0,0,0.4)';
      ctx.fillRect(x, y, slotSize, slotSize);
      const type = G.getBlockType(slot.blockId);
      if (slot.count > 0 && type.color) {
        ctx.fillStyle = type.color;
        ctx.fillRect(x + 6, y + 6, slotSize - 12, slotSize - 12);
        ctx.fillStyle = (i === inventory.selected) ? '#000' : '#fff';
        ctx.font = '12px Arial';
        ctx.fillText(String(slot.count), x + 4, y + slotSize - 4);
      }
      ctx.fillStyle = (i === inventory.selected) ? '#000' : '#fff';
      ctx.font = '10px Arial';
      ctx.fillText(String(i + 1), x + slotSize - 10, y + 12);
    }
  }

  let message = '';
  let messageTimer = 0;
  function flash(text) { message = text; messageTimer = 120; }
  function drawMessage() {
    if (messageTimer <= 0) return;
    messageTimer--;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(10, 10, 220, 28);
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText(message, 18, 30);
  }

  // --- Игровой цикл ---
  function loop() {
    let dir = 0;
    if (keys['ArrowLeft'] || keys['a']) dir = -1;
    if (keys['ArrowRight'] || keys['d']) dir = 1;
    const jump = keys['ArrowUp'] || keys[' '] || keys['w'];
    G.updatePlayer(player, world, dir, jump, {});

    drawWorld();
    drawCursor();
    drawPlayer();
    drawInventory();
    drawMessage();

    requestAnimationFrame(loop);
  }
  loop();
})();
