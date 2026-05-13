/*
Data is stored in parallel arrays. Matching indices describe the same thing:

enemyX[0], enemyY[0], enemyHealth[0], and enemyPathIndex[0] are enemy 0.
towerX[0], towerY[0], towerTypeIndex[0], and towerCooldown[0] are tower 0.
*/

// Sprite data
const enemySoldierSprite = new Image();
enemySoldierSprite.src = "sprites/stalhelm.png";

const vickerSprite = new Image();
vickerSprite.src = "sprites/vickers.png";

const soldierSprite = new Image();
soldierSprite.src = "sprites/soldierTopDown.png";

const towerSprites = [soldierSprite, vickerSprite];
const towerSpriteSize = [36, 50];

// UI state
let currentAssault = 1;
let maxAssault = 7;
let towerSelectedTypeIndex = -1;

// Player state
let playerMoney = 1000;
let playerLives = 20;
let playerScore = 0;

// Tower type data
const towerTypeName = ["infantry", "machineGun"];
const towerPrice = [100, 200];
const towerRangeByType = [100, 140];
const towerDamageByType = [10, 18];
const towerCooldownMaxByType = [20, 14];

// Tower state
let towerX = [];
let towerY = [];
let towerTypeIndex = [];
let towerCooldown = [];
let towerWidth = 50;
let towerHeight = towerWidth;
let previewTower = null;

// Wave state
let waveGroupIndex = 0;
let waveGroupSpawned = 0;
let waveSpawnTimer = 0;
let waveComplete = false;

// Active enemy state
let enemyX = [];
let enemyY = [];
let enemyPathIndex = [];
let enemyHealth = [];
let enemyMaxHealth = [];
let enemySpeed = [];
let enemyDamage = [];
let enemyReward = [];
let enemyTypeIndex = [];

// Projectile state
let projectileX = [];
let projectileY = [];
let projectileTargetIndex = [];
let projectileDamage = [];
let projectileSpeed = [];
