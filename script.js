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

  ui.towerButtons.forEach((button) => {
    let typeIndex = Number(button.dataset.towerTypeIndex);
    button.classList.toggle("selected", typeIndex === towerSelectedTypeIndex);
    button.disabled = playerMoney < towerPrice[typeIndex];
  });
}

ui.towerButtons.forEach((button) => {
  button.addEventListener("click", () => {
    towerSelectedTypeIndex = Number(button.dataset.towerTypeIndex);
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
  win();
  updateUI();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPath(ctx, pathData);

  for (let i = 0; i < towerX.length; i++) {
    drawTower(ctx, i);
  }

  for (let i = 0; i < enemyX.length; i++) {
    drawEnemy(ctx, i);
    drawHealthBar(ctx, i);
  }

  if (previewTower && towerSelectedTypeIndex !== -1) {
    ctx.globalAlpha = 0.5;
    drawTowerSprite(ctx, towerSelectedTypeIndex, previewTower.x, previewTower.y);
    ctx.globalAlpha = 1;
  }

  for (let i = 0; i < projectileX.length; i++) {
    let colors = ["yellow", "blue", "green", "cyan"];
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.beginPath();
    ctx.arc(projectileX[i], projectileY[i], 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Input setup
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();

  const x = Math.floor(e.clientX - rect.left);
  const y = Math.floor(e.clientY - rect.top);

  if (checkValid(x, y)) {
    let towerSize = getTowerSize(towerSelectedTypeIndex);

    addTower((x - towerSize / 2), (y - towerSize / 2));
    updateUI();
  }
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();

  const x = Math.floor(e.clientX - rect.left);
  const y = Math.floor(e.clientY - rect.top);
  const previewSize = getTowerSize(towerSelectedTypeIndex);

  previewTower = {
    x: x - previewSize / 2,
    y: y - previewSize / 2
  };
});

updateUI();
gameLoop();
