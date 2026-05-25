// Canvas setup
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 700;
canvas.height = 600;

// UI setup
const ui = {
  lives: document.getElementById("lives"),
  money: document.getElementById("money"),
  score: document.getElementById("score"),
  assault: document.getElementById("assault"),
  maxAssault: document.getElementById("maxAssault"),
  enemyCount: document.getElementById("enemyCount"),
  startAssaultBtn: document.getElementById("startAssaultBtn"),
  muteBtn: document.getElementById("muteBtn"),
  towerButtons: document.querySelectorAll(".tower-button")
};

function updateUI() {
  ui.lives.textContent = playerLives;
  ui.money.textContent = playerMoney;
  ui.score.textContent = playerScore;
  ui.assault.textContent = currentAssault;
  ui.maxAssault.textContent = maxAssault;
  ui.enemyCount.textContent = enemyX.length + getQueuedEnemyCount();
  ui.startAssaultBtn.hidden = !assaultWaiting || waveComplete;

  ui.towerButtons.forEach((button) => {
    let typeIndex = Number(button.dataset.towerTypeIndex);
    button.classList.toggle("selected", typeIndex === towerSelectedTypeIndex);
  });
}

ui.towerButtons.forEach((button) => {
  button.addEventListener("click", () => {
    towerSelectedTypeIndex = Number(button.dataset.towerTypeIndex);
    pendingTower = null;
    updateUI();
  });
});

ui.muteBtn.addEventListener("click", () => {
  ui.muteBtn.classList.toggle("muted");

  if (ui.muteBtn.classList.contains("muted")) {
    ui.muteBtn.textContent = "Muted";
  } else {
    ui.muteBtn.textContent = "Sound";
  }
});

ui.startAssaultBtn.addEventListener("click", () => {
  startAssault();
  updateUI();
});

// Main loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function update() {
  updateWaveSpawner();
  moveEnemies();
  towersAttack();
  moveProjectiles();
  removeDead();
  updateUI();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPath(ctx, pathData);

  for (let i = 0; i < towerX.length; i++) {
    drawTower(ctx, i);
  }

  if (isPlacingMachineGunAngle()) {
    drawMachineGunArc(
      ctx,
      pendingTower.centerX,
      pendingTower.centerY,
      towerRangeByType[pendingTower.typeIndex],
      getPendingTowerAngle()
    );
  }

  for (let i = 0; i < enemyX.length; i++) {
    drawEnemy(ctx, i);
    drawHealthBar(ctx, i);
  }

  if (isPlacingMachineGunAngle()) {
    ctx.globalAlpha = 0.5;
    drawTowerSprite(ctx, pendingTower.typeIndex, pendingTower.x, pendingTower.y);
    ctx.globalAlpha = 1;
  } else if (previewTower && towerSelectedTypeIndex !== -1) {
    ctx.globalAlpha = 0.5;
    drawTowerSprite(ctx, towerSelectedTypeIndex, previewTower.x, previewTower.y);
    ctx.globalAlpha = 1;
  }

  for (let i = 0; i < projectileX.length; i++) {
    drawProjectile(ctx, i);
  }
}

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();

  // Deselect tower selection
  towerSelectedTypeIndex = -1;

  // Cancel previews / placement
  previewTower = null;
  pendingTower = null;

  updateUI();
});

// Input setup
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();

  const x = Math.floor(e.clientX - rect.left);
  const y = Math.floor(e.clientY - rect.top);

    
  if (isPlacingMachineGunAngle()) {
    addTower(pendingTower.x, pendingTower.y, getPendingTowerAngle());
    pendingTower = null;
    updateUI();
    return;
  }

  if (checkValid(x, y)) {
    let towerSize = getTowerSize(towerSelectedTypeIndex);
    let towerX = x - towerSize / 2;
    let towerY = y - towerSize / 2;

    if (towerSelectedTypeIndex === machineGunTypeIndex) {
      pendingTower = {
        x: towerX,
        y: towerY,
        centerX: x,
        centerY: y,
        typeIndex: towerSelectedTypeIndex
      };
      updateUI();
      return;
    }

    addTower(towerX, towerY);
    updateUI();
  }
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();

  const x = Math.floor(e.clientX - rect.left);
  const y = Math.floor(e.clientY - rect.top);
  const previewSize = getTowerSize(towerSelectedTypeIndex);
  if (towerSelectedTypeIndex !== -1) {
    previewTower = {
      x: x - previewSize / 2,
      y: y - previewSize / 2,
      centerX: x,
      centerY: y
    };
  }

});

updateUI();
gameLoop();
