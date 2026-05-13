// Enemy behavior
function updateWaveSpawner() {
  if (waveComplete) {
    return;
  }

  if (waveSpawnTimer > 0) {
    waveSpawnTimer--;
    return;
  }

  if (waveGroupIndex >= waveGroupEnemyTypeIndex.length) {
    waveComplete = true;
    return;
  }

  if (waveGroupSpawned >= waveGroupCount[waveGroupIndex]) {
    waveGroupIndex++;
    waveGroupSpawned = 0;

    if (waveGroupIndex >= waveGroupEnemyTypeIndex.length) {
      waveComplete = true;
      return;
    }
  }

  let typeIndex = waveGroupEnemyTypeIndex[waveGroupIndex];

  spawnEnemy(typeIndex);
  waveGroupSpawned++;

  if (waveGroupSpawned >= waveGroupCount[waveGroupIndex]) {
    waveSpawnTimer = waveGroupBufferAfter[waveGroupIndex];
  } else {
    waveSpawnTimer = waveGroupSpacing[waveGroupIndex];
  }
}

function spawnEnemy(typeIndex) {
  enemyX.push(pathData.waypoints[0].x);
  enemyY.push(pathData.waypoints[0].y);
  enemyPathIndex.push(0);
  enemyHealth.push(enemyTypeHealth[typeIndex]);
  enemyMaxHealth.push(enemyTypeHealth[typeIndex]);
  enemySpeed.push(enemyTypeSpeed[typeIndex]);
  enemyDamage.push(enemyTypeDamage[typeIndex]);
  enemyReward.push(enemyTypeReward[typeIndex]);
  enemyTypeIndex.push(typeIndex);
}

function getQueuedEnemyCount() {
  if (waveComplete) {
    return 0;
  }

  let queuedCount = 0;

  for (let i = waveGroupIndex; i < waveGroupCount.length; i++) {
    if (i === waveGroupIndex) {
      queuedCount += waveGroupCount[i] - waveGroupSpawned;
    } else {
      queuedCount += waveGroupCount[i];
    }
  }

  return queuedCount;
}

function moveEnemies() {
  for (let i = enemyX.length - 1; i >= 0; i--) {
    let target = pathData.waypoints[enemyPathIndex[i] + 1];
    let speed = enemySpeed[i];

    if (!target) {
      playerLives = Math.max(0, playerLives - enemyDamage[i]);
      removeEnemy(i);
      continue;
    }

    let dx = target.x - enemyX[i];
    let dy = target.y - enemyY[i];
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < speed) {
      enemyX[i] = target.x;
      enemyY[i] = target.y;
      enemyPathIndex[i]++;
    } else {
      enemyX[i] += (dx / dist) * speed;
      enemyY[i] += (dy / dist) * speed;
    }
  }
}

function getHealthSegments(enemyIndex) {
  const percent = enemyHealth[enemyIndex] / enemyMaxHealth[enemyIndex];

  return Math.max(0, Math.min(5, Math.ceil(percent * 5)));
}

function removeDead() {
  for (let i = enemyHealth.length - 1; i >= 0; i--) {
    if (enemyHealth[i] <= 0) {
      playerMoney += enemyReward[i];
      playerScore += 1;
      removeEnemy(i);
    }
  }
}

function removeEnemy(enemyIndex) {
  enemyX.splice(enemyIndex, 1);
  enemyY.splice(enemyIndex, 1);
  enemyPathIndex.splice(enemyIndex, 1);
  enemyHealth.splice(enemyIndex, 1);
  enemyMaxHealth.splice(enemyIndex, 1);
  enemySpeed.splice(enemyIndex, 1);
  enemyDamage.splice(enemyIndex, 1);
  enemyReward.splice(enemyIndex, 1);
  enemyTypeIndex.splice(enemyIndex, 1);

  for (let p = projectileTargetIndex.length - 1; p >= 0; p--) {
    if (projectileTargetIndex[p] === enemyIndex) {
      removeProjectile(p);
    } else if (projectileTargetIndex[p] > enemyIndex) {
      projectileTargetIndex[p]--;
    }
  }
}

function damageDealt() {
}

function win() {
}

// Tower behavior
function towersAttack() {
  for (let i = 0; i < towerX.length; i++) {
    let typeIndex = towerTypeIndex[i];
    let range = towerRangeByType[typeIndex];
    let damage = towerDamageByType[typeIndex];

    if (towerCooldown[i] > 0) {
      towerCooldown[i]--;
      continue;
    }

    let targetIndex = getNearestEnemyIndex(towerX[i], towerY[i], range);

    if (targetIndex !== -1) {
      projectileX.push(towerX[i] + towerWidth / 2);
      projectileY.push(towerY[i] + towerHeight / 2);
      projectileTargetIndex.push(targetIndex);
      projectileDamage.push(damage);
      projectileSpeed.push(4);

      towerCooldown[i] = towerCooldownMaxByType[typeIndex];
    }
  }
}

function getNearestEnemyIndex(x, y, range) {
  let bestIndex = -1;
  let bestDist = Infinity;

  for (let i = 0; i < enemyX.length; i++) {
    let dx = enemyX[i] - x;
    let dy = enemyY[i] - y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < range && dist < bestDist) {
      bestDist = dist;
      bestIndex = i;
    }
  }

  return bestIndex;
}

function addTower(x, y) {
  let typeIndex = towerSelectedTypeIndex;

  playerMoney -= towerPrice[typeIndex];
  towerX.push(x);
  towerY.push(y);
  towerTypeIndex.push(typeIndex);
  towerCooldown.push(0);
}

// Projectile behavior
function moveProjectiles() {
  for (let i = projectileX.length - 1; i >= 0; i--) {
    let targetIndex = projectileTargetIndex[i];

    if (targetIndex < 0 || targetIndex >= enemyX.length) {
      removeProjectile(i);
      continue;
    }

    let dx = enemyX[targetIndex] - projectileX[i];
    let dy = enemyY[targetIndex] - projectileY[i];
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < projectileSpeed[i]) {
      enemyHealth[targetIndex] -= projectileDamage[i];
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
function drawEnemy(ctx, enemyIndex) {
  let spriteSize = enemyTypeSpriteSize[enemyTypeIndex[enemyIndex]];

  if (enemySoldierSprite.complete) {
    ctx.drawImage(
      enemySoldierSprite,
      enemyX[enemyIndex] - spriteSize / 2,
      enemyY[enemyIndex] - spriteSize / 2,
      spriteSize,
      spriteSize
    );
  } else {
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(enemyX[enemyIndex], enemyY[enemyIndex], 10, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTower(ctx, towerIndex) {
  let typeIndex = towerTypeIndex[towerIndex];
  let sprite = towerSprites[typeIndex];
  let size = towerSpriteSize[typeIndex];

  if (sprite.complete) {
    ctx.drawImage(
      sprite,
      towerX[towerIndex],
      towerY[towerIndex],
      size,
      size
    );
  } else {
    ctx.fillStyle = "red";
    ctx.fillRect(towerX[towerIndex], towerY[towerIndex], towerWidth, towerHeight);
  }
}

function drawHealthBar(ctx, enemyIndex) {
  let segments = getHealthSegments(enemyIndex);
  let barWidth = 20;
  let barHeight = 4;
  let startX = enemyX[enemyIndex] - barWidth / 2;
  let startY = enemyY[enemyIndex] - 18;

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
  if (!isBetween(x, 0, canvas.width) || !isBetween(y, 0, canvas.height)) {
    return false;
  }

  if (towerSelectedTypeIndex === -1) {
    return false;
  }

  if (playerMoney < towerPrice[towerSelectedTypeIndex]) {
    return false;
  }

  return true;
}
