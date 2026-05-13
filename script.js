// Canvas setup
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 700;
canvas.height = 600;

// Main loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function update() {
  moveEnemies();
  towersAttack();
  moveProjectiles();

  removeDead();
  win();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPath(ctx, pathData);

  for (let i = 0; i < towerPositions.length; i++) {
    let tower = towerPositions[i];

    drawTower(ctx, tower);
  }

  for (let i = 0; i < enemyPositions.length; i++) {
    let enemy = enemyPositions[i];

    drawEnemy(ctx, enemy);

    let segments = getHealthSegments(enemy);

    let barWidth = 20;
    let barHeight = 4;
    let startX = enemy.x - barWidth / 2;
    let startY = enemy.y - 18;

    for (let j = 0; j < 5; j++) {
      if (j < segments) {
        ctx.fillStyle = "limegreen";
      } else {
        ctx.fillStyle = "darkred";
      }

      ctx.fillRect(
        startX + (j * (barWidth / 5)),
        startY,
        barWidth / 5 - 1,
        barHeight
      );
    }
  }

  if (previewTower) {
    ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
    ctx.fillRect(
      previewTower.x,
      previewTower.y,
      towerWidth,
      towerHeight
    );
  }

  for (let i = 0; i < projectileX.length; i++) {
    let colors = ["yellow", "blue", "green", "cyan"];
    ctx.fillStyle = colors[Math.floor(Math.random() * 4) + 1];
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
    addTower((x - towerWidth / 2), (y - towerHeight / 2));
  }
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();

  const x = Math.floor(e.clientX - rect.left);
  const y = Math.floor(e.clientY - rect.top);

  previewTower = {
    x: x - towerWidth / 2,
    y: y - towerHeight / 2
  };
});

gameLoop();
