// Enemy behavior
function updateWaveSpawner() {
  if (waveComplete || assaultWaiting) {
    return;
  }

  if (waveSpawnTimer > 0) {
    waveSpawnTimer--;
    return;
  }

  if (waveIndex >= waveEnemyTypeIndex.length) {
    waveComplete = true;
    return;
  }

  advanceFinishedWaveGroups();

  if (waveComplete || assaultWaiting) {
    return;
  }

  if (waveIndex >= waveCount.length || waveGroupIndex >= waveCount[waveIndex].length) {
    return;
  }

  if (waveGroupSpawned >= waveCount[waveIndex][waveGroupIndex]) {
    return;
  }

  let typeIndex = waveEnemyTypeIndex[waveIndex][waveGroupIndex];

  spawnEnemy(typeIndex);
  waveGroupSpawned++;

  if (waveGroupSpawned >= waveCount[waveIndex][waveGroupIndex]) {
    waveSpawnTimer = waveBufferAfter[waveIndex][waveGroupIndex];
  } else {
    waveSpawnTimer = waveSpacing[waveIndex][waveGroupIndex];
  }
}

function advanceFinishedWaveGroups() {
  if (waveIndex >= waveCount.length) {
    waveComplete = true;
    currentAssault = maxAssault;
    return;
  }

  if (waveGroupSpawned < waveCount[waveIndex][waveGroupIndex] || enemyX.length > 0) {
    return;
  }

  waveGroupIndex++;
  waveGroupSpawned = 0;

  if (waveGroupIndex >= waveCount[waveIndex].length) {
    waveIndex++;
    waveGroupIndex = 0;
    currentAssault = waveIndex + 1;
  }

  if (waveIndex >= waveCount.length) {
    waveComplete = true;
    currentAssault = maxAssault;
    return;
  }

  assaultWaiting = true;
}

function startAssault() {
  if (waveComplete || waveIndex >= waveCount.length) {
    return;
  }

  assaultWaiting = false;
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

  if (waveIndex >= waveCount.length) {
    return 0;
  }

  for (let group = waveGroupIndex; group < waveCount[waveIndex].length; group++) {
    if (group === waveGroupIndex) {
      queuedCount += waveCount[waveIndex][group] - waveGroupSpawned;
    } else {
      queuedCount += waveCount[waveIndex][group];
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

}

// Tower behavior
function towersAttack() {
  for (let i = 0; i < towerX.length; i++) {
    let typeIndex = towerTypeIndex[i];
    let towerSize = getTowerSize(typeIndex);
    let towerCenterX = towerX[i] + towerSize / 2;
    let towerCenterY = towerY[i] + towerSize / 2;
    let range = towerRangeByType[typeIndex];
    let damage = towerDamageByType[typeIndex];

    if (towerCooldown[i] > 0) {
      towerCooldown[i]--;
      continue;
    }

    let targetIndex = getNearestEnemyIndex(towerCenterX, towerCenterY, range, i);

    if (targetIndex !== -1) {
      fireProjectile(i, towerCenterX, towerCenterY, targetIndex, damage);

      towerCooldown[i] = towerCooldownMaxByType[typeIndex];
    }
  }
}

function fireProjectile(towerIndex, startX, startY, targetIndex, damage) {
  let targetAngle = getAngleDegrees(startX, startY, enemyX[targetIndex], enemyY[targetIndex]);

  if (towerTypeIndex[towerIndex] === machineGunTypeIndex) {
    targetAngle += (Math.random() * 2 - 1) * machineGunBulletSpreadDegrees;
  }

  let speed = 5;
  let angleRadians = targetAngle * Math.PI / 180;

  projectileX.push(startX);
  projectileY.push(startY);
  projectileVelocityX.push(Math.cos(angleRadians) * speed);
  projectileVelocityY.push(Math.sin(angleRadians) * speed);
  projectileAngle.push(angleRadians);
  projectileDamage.push(damage);
  projectileSpeed.push(speed);
}

function getNearestEnemyIndex(x, y, range, towerIndex) {
  let bestIndex = -1;
  let bestDist = Infinity;

  for (let i = 0; i < enemyX.length; i++) {
    let dx = enemyX[i] - x;
    let dy = enemyY[i] - y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < range && dist < bestDist && canTowerHitEnemy(towerIndex, x, y, i)) {
      bestDist = dist;
      bestIndex = i;
    }
  }

  return bestIndex;
}

function canTowerHitEnemy(towerIndex, towerCenterX, towerCenterY, enemyIndex) {
  if (towerTypeIndex[towerIndex] !== machineGunTypeIndex) {
    return true;
  }

  let enemyAngle = getAngleDegrees(
    towerCenterX,
    towerCenterY,
    enemyX[enemyIndex],
    enemyY[enemyIndex]
  );

  return getSmallestAngleDifference(towerAngle[towerIndex], enemyAngle) <= machineGunArcDegrees / 2;
}

function getAngleDegrees(startX, startY, endX, endY) {
  return (Math.atan2(endY - startY, endX - startX) * 180 / Math.PI + 360) % 360;
}

function getSmallestAngleDifference(angleA, angleB) {
  let difference = Math.abs(angleA - angleB) % 360;

  return Math.min(difference, 360 - difference);
}

function getArcRadians(angleDegrees, offsetDegrees) {
  return (angleDegrees + offsetDegrees) * Math.PI / 180;
}

function addTower(x, y, angle = 270) {
  let typeIndex = towerSelectedTypeIndex;

  playerMoney -= towerPrice[typeIndex];
  towerX.push(x);
  towerY.push(y);
  towerTypeIndex.push(typeIndex);
  towerCooldown.push(0);
  towerAngle.push(angle);
}

// Projectile behavior
function moveProjectiles() {
  for (let i = projectileX.length - 1; i >= 0; i--) {
    projectileX[i] += projectileVelocityX[i];
    projectileY[i] += projectileVelocityY[i];

    if (isProjectileOffscreen(i)) {
      removeProjectile(i);
      continue;
    }

    let hitIndex = getProjectileHitEnemyIndex(i);

    if (hitIndex !== -1) {
      enemyHealth[hitIndex] -= projectileDamage[i];
      removeProjectile(i);
    }
  }
}

function getProjectileHitEnemyIndex(projectileIndex) {
  for (let i = 0; i < enemyX.length; i++) {
    let dx = enemyX[i] - projectileX[projectileIndex];
    let dy = enemyY[i] - projectileY[projectileIndex];
    let hitRadius = Math.max(10, enemyTypeSpriteSize[enemyTypeIndex[i]] / 2);

    if (Math.sqrt(dx * dx + dy * dy) <= hitRadius) {
      return i;
    }
  }

  return -1;
}

function isProjectileOffscreen(projectileIndex) {
  let padding = 20;

  return (
    projectileX[projectileIndex] < -padding ||
    projectileX[projectileIndex] > canvas.width + padding ||
    projectileY[projectileIndex] < -padding ||
    projectileY[projectileIndex] > canvas.height + padding
  );
}

function removeProjectile(i) {
  projectileX.splice(i, 1);
  projectileY.splice(i, 1);
  projectileVelocityX.splice(i, 1);
  projectileVelocityY.splice(i, 1);
  projectileAngle.splice(i, 1);
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
  let towerSize = getTowerSize(typeIndex);
  let towerCenterX = towerX[towerIndex] + towerSize / 2;
  let towerCenterY = towerY[towerIndex] + towerSize / 2;

  if (typeIndex === machineGunTypeIndex) {
    drawMachineGunArc(ctx, towerCenterX, towerCenterY, towerRangeByType[typeIndex], towerAngle[towerIndex]);
  }

  drawTowerSprite(ctx, typeIndex, towerX[towerIndex], towerY[towerIndex]);
}

function drawMachineGunArc(ctx, x, y, range, angle) {
  let startAngle = getArcRadians(angle, -machineGunArcDegrees / 2);
  let endAngle = getArcRadians(angle, machineGunArcDegrees / 2);

  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#ffd84d";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, startAngle, endAngle);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.65;
  ctx.strokeStyle = "#ffd84d";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, range, startAngle, endAngle);
  ctx.stroke();
  ctx.restore();
}

function drawProjectile(ctx, projectileIndex) {
  ctx.save();
  ctx.translate(projectileX[projectileIndex], projectileY[projectileIndex]);
  ctx.rotate(projectileAngle[projectileIndex]);

  ctx.fillStyle = "#2b2418";
  ctx.fillRect(-5, -2, 10, 4);

  ctx.fillStyle = "#d6a43a";
  ctx.fillRect(-3, -1.5, 6, 3);

  ctx.fillStyle = "#3a3326";
  ctx.beginPath();
  ctx.moveTo(5, -2);
  ctx.lineTo(9, 0);
  ctx.lineTo(5, 2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawTowerSprite(ctx, typeIndex, x, y) {
  let sprite = towerSprites[typeIndex];
  let size = towerSpriteSize[typeIndex];

  if (sprite.complete) {
    ctx.drawImage(
      sprite,
      x,
      y,
      size,
      size
    );
  } else {
    ctx.fillStyle = "red";
    ctx.fillRect(x, y, size, size);
  }
}

function getTowerSize(typeIndex) {
  if (typeIndex === -1) {
    return towerWidth;
  }

  return towerSpriteSize[typeIndex];
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

function getDistanceToSegment(x, y, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return Math.hypot(x - start.x, y - start.y);
  }

  const projection = ((x - start.x) * dx + (y - start.y) * dy) / lengthSquared;
  const t = Math.max(0, Math.min(1, projection));
  const closestX = start.x + t * dx;
  const closestY = start.y + t * dy;

  return Math.hypot(x - closestX, y - closestY);
}

function isOnPath(x, y, towerSize) {
  const padding = towerSize / 2;

  for (let i = 0; i < pathData.waypoints.length - 1; i++) {
    const distance = getDistanceToSegment(x, y, pathData.waypoints[i], pathData.waypoints[i + 1]);

    if (distance <= pathData.pathWidth / 2 + padding) {
      return true;
    }
  }

  return false;
}

function overlapsExistingTower(x, y, towerSize) {
  const radius = towerSize / 2;

  for (let i = 0; i < towerX.length; i++) {
    const existingSize = getTowerSize(towerTypeIndex[i]);
    const existingCenterX = towerX[i] + existingSize / 2;
    const existingCenterY = towerY[i] + existingSize / 2;
    const dx = x - existingCenterX;
    const dy = y - existingCenterY;

    if (Math.hypot(dx, dy) < radius + existingSize / 2) {
      return true;
    }
  }

  return false;
}

function isPlacingMachineGunAngle() {
  return pendingTower && pendingTower.typeIndex === machineGunTypeIndex;
}

function getPendingTowerAngle() {
  if (!isPlacingMachineGunAngle() || !previewTower) {
    return 270;
  }

  return getAngleDegrees(
    pendingTower.centerX,
    pendingTower.centerY,
    previewTower.centerX,
    previewTower.centerY
  );
}

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

  const towerSize = getTowerSize(towerSelectedTypeIndex);

  return !isOnPath(x, y, towerSize) && !overlapsExistingTower(x, y, towerSize);
}
