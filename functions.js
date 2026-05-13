// Enemy behavior
function moveEnemies() {
  const speed = 1.5;

  for (let enemy of enemyPositions) {
    let target = pathData.waypoints[enemy.pathIndex + 1];

    if (!target) continue; // reached end

    let dx = target.x - enemy.x;
    let dy = target.y - enemy.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < speed) {
      enemy.x = target.x;
      enemy.y = target.y;
      enemy.pathIndex++;
    } else {
      enemy.x += (dx / dist) * speed;
      enemy.y += (dy / dist) * speed;
    }
  }
}

function getHealthSegments(enemy) {
  const maxHealth = enemy.maxHealth; // adjust to your enemy base HP
  const percent = enemy.health / maxHealth;

  return Math.ceil(percent * 5);
}

function removeDead() {
  for (let i = enemyPositions.length - 1; i >= 0; i--) {
    if (enemyPositions[i].health <= 0) {
      enemyPositions.splice(i, 1);

      // remove projectiles targeting this enemy
      for (let p = projectileTargetIndex.length - 1; p >= 0; p--) {
        if (projectileTargetIndex[p] === i) {
          removeProjectile(p);
        }
      }
    }
  }
}

function damageDealt() {
}

function win() {
  if(enemyPositions[0].pathIndex+1 == pathData.waypoints.length){
    playerLives-=enemyPositions.damage;
  }
}

// Tower behavior
function towersAttack() {
  for (let i = 0; i < towerPositions.length; i++) {
    let tx = towerPositions[i].x;
    let ty = towerPositions[i].y;

    let range = towerRange[i];
    let damage = towerDamage[i];

    if (towerCooldown[i] > 0) {
      towerCooldown[i]--;
      continue;
    }

    let targetIndex = getNearestEnemyIndex(tx, ty, range);

    if (targetIndex !== -1) {
      projectileX.push(tx + towerWidth / 2);
      projectileY.push(ty + towerHeight / 2);
      projectileTargetIndex.push(targetIndex);
      projectileDamage.push(damage);
      projectileSpeed.push(4);

      towerCooldown[i] = 20;
    }
  }
}

function getNearestEnemyIndex(x, y, range) {
  let bestIndex = -1;
  let bestDist = Infinity;

  for (let i = 0; i < enemyPositions.length; i++) {
    let ex = enemyPositions[i].x;
    let ey = enemyPositions[i].y;

    let dx = ex - x;
    let dy = ey - y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < range && dist < bestDist) {
      bestDist = dist;
      bestIndex = i;
    }
  }

  return bestIndex;
}

function addTower(x, y) {
  playerMoney -= 100;

  towerPositions.push({ x, y });
  towerDamage.push(10);
  towerRange.push(100);
  towerCooldown.push(0);
}

// Projectile behavior
function moveProjectiles() {
  for (let i = projectileX.length - 1; i >= 0; i--) {
    let targetIndex = projectileTargetIndex[i];
    let target = enemyPositions[targetIndex];

    if (!target) {
      removeProjectile(i);
      continue;
    }

    let dx = target.x - projectileX[i];
    let dy = target.y - projectileY[i];
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < projectileSpeed[i]) {
      target.health -= projectileDamage[i];
      removeProjectile(i);
    } else {
      projectileX[i] += (dx / dist) * projectileSpeed[i];
      projectileY[i] += (dy / dist) * projectileSpeed[i];
    }
  }
}

function removeProjectile(i) {
  projectileX.splice(i, 1);
  projectileY.splice(i, 1);
  projectileTargetIndex.splice(i, 1);
  projectileDamage.splice(i, 1);
  projectileSpeed.splice(i, 1);
}

// Drawing helpers
function drawEnemy(ctx, enemy) {
  if (soldierSprite.complete) {
    ctx.drawImage(
      soldierSprite,
      enemy.x - soldierSpriteSize / 2,
      enemy.y - soldierSpriteSize / 2,
      soldierSpriteSize,
      soldierSpriteSize
    );
  } else {
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, 10, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTower(ctx, tower) {
  if (vickerSprite.complete) {
    ctx.drawImage(
      vickerSprite,
      tower.x,
      tower.y,
      vickerSpriteSize,
      vickerSpriteSize
    );
  } else {
    ctx.fillStyle = "red";
    ctx.fillRect(tower.x, tower.y, towerWidth, towerHeight);
  }
}

function drawPath(ctx, pathData) {
  const { waypoints, pathWidth } = pathData;

  if (!waypoints || waypoints.length < 2) return;

  // --- Draw road base ---
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(waypoints[0].x, waypoints[0].y);

  for (let i = 1; i < waypoints.length; i++) {
    ctx.lineTo(waypoints[i].x, waypoints[i].y);
  }

  ctx.strokeStyle = "#3a3a3a"; // asphalt
  ctx.lineWidth = pathWidth;
  ctx.stroke();

  // --- Draw road edge (subtle lighter outline) ---
  ctx.strokeStyle = "#5a5a5a";
  ctx.lineWidth = pathWidth * 1.1;
  ctx.globalCompositeOperation = "destination-over";
  ctx.stroke();

  ctx.restore();

  // --- Draw dashed center line ---
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(waypoints[0].x, waypoints[0].y);

  for (let i = 1; i < waypoints.length; i++) {
    ctx.lineTo(waypoints[i].x, waypoints[i].y);
  }

  ctx.strokeStyle = "#ffd84d";
  ctx.lineWidth = pathWidth * 0.15;
  ctx.setLineDash([10, 10]);
  ctx.lineDashOffset = 0;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.restore();
}

// Input helpers
const isBetween = (num, min, max) => num >= min && num <= max;

function checkValid(x, y) {
  if (playerMoney < 100) {
    return false;
  }

  if (!isBetween(x, 0, canvas.width) || !isBetween(y, 0, canvas.height)) {
    return false;
  }

  return true;
}


const muteBtn = document.getElementById("muteBtn");

muteBtn.addEventListener("click", () => {
  muteBtn.classList.toggle("muted");

  if (muteBtn.classList.contains("muted")) {
    muteBtn.textContent = "🔇";
  } else {
    muteBtn.textContent = "🔊";
  }
});