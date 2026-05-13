/*
Player State
money
lives
score

Towers

Properties:

position
range
damage
fire rate

Behavior:

Find nearest enemy in range
Shoot at intervals

Enemies

Properties:

position (x, y)
health
speed
path index (where they are on the path)

Behavior:

Move along the path every frame
Die when health <= 0
Damage player if they reach the end
*/

// World data
const pathData = {
  width: 700,
  height: 600,
  pathWidth: 35,
  waypoints: [
    { x: 680, y: 0 },
    { x: 680, y: 50 },
    { x: 680, y: 100 },
    { x: 680, y: 120 },

    { x: 600, y: 120 },
    { x: 550, y: 120 },
    { x: 550, y: 80 },
    { x: 500, y: 80 },
    { x: 450, y: 80 },
    { x: 400, y: 80 },
    { x: 350, y: 80 },
    { x: 300, y: 80 },
    { x: 250, y: 80 },
    { x: 200, y: 80 },
    { x: 150, y: 80 },
    { x: 100, y: 80 },

    { x: 100, y: 140 },
    { x: 100, y: 200 },
    { x: 140, y: 200 },
    { x: 180, y: 200 },
    { x: 200, y: 240 },
    { x: 200, y: 300 },

    { x: 260, y: 300 },
    { x: 300, y: 300 },
    { x: 300, y: 240 },
    { x: 300, y: 200 },
    { x: 360, y: 200 },

    { x: 360, y: 260 },
    { x: 360, y: 320 },
    { x: 360, y: 380 },
    { x: 420, y: 380 },
    { x: 480, y: 380 },

    { x: 480, y: 300 },
    { x: 480, y: 240 },
    { x: 540, y: 240 },
    { x: 600, y: 240 },

    { x: 600, y: 320 },
    { x: 600, y: 400 },
    { x: 600, y: 480 },
    { x: 550, y: 520 },
    { x: 480, y: 520 },
    { x: 400, y: 520 },
    { x: 320, y: 520 },
    { x: 240, y: 520 },
    { x: 160, y: 520 },

    { x: 100, y: 520 },
    { x: 100, y: 560 },
    { x: 100, y: 600 }
  ]
};

// Sprite data
const soldierSprite = new Image();
soldierSprite.src = "sprites/stalhelm.png";
const vickerSprite = new Image();
vickerSprite.src = "sprites/vickers.png";

const soldierSpriteSize = 36;
const vickerSpriteSize = 50;

// Player state
let playerMoney = 1000;
let playerLives = 20;
let playerScore = 0;

// Tower state
let towerPositions = [{ x: 300, y: 300 }, { x: 500, y: 500 }];
let towerRange = [];
let towerDamage = [];
let towerCooldown = [];
let towerWidth = 50;
let towerHeight = towerWidth;
let previewTower = null;

// Enemy state
let enemyPositions = [
  { x: pathData.waypoints[0].x, y: pathData.waypoints[0].y, pathIndex: 0, health: 30, maxHealth: 30, damage: 1},
  { x: pathData.waypoints[1].x, y: pathData.waypoints[1].y, pathIndex: 1, health: 30, maxHealth: 30, damage: 1},
  { x: pathData.waypoints[2].x, y: pathData.waypoints[2].y, pathIndex: 2, health: 150, maxHealth: 150, damage: 1},
  { x: pathData.waypoints[3].x, y: pathData.waypoints[3].y, pathIndex: 3, health: 30, maxHealth: 30, damage: 1},
  { x: pathData.waypoints[4].x, y: pathData.waypoints[4].y, pathIndex: 4, health: 40, maxHealth: 40, damage: 1},
  { x: pathData.waypoints[5].x, y: pathData.waypoints[5].y, pathIndex: 5, health: 40, maxHealth: 40, damage: 1},
  { x: pathData.waypoints[6].x, y: pathData.waypoints[6].y, pathIndex: 6, health: 200, maxHealth: 200, damage: 1},
  { x: pathData.waypoints[7].x, y: pathData.waypoints[7].y, pathIndex: 7, health: 50, maxHealth: 50, damage: 1},
  { x: pathData.waypoints[8].x, y: pathData.waypoints[8].y, pathIndex: 8, health: 50, maxHealth: 50, damage: 1}
];
let enemyHealth = [];

// Projectile state
let projectileX = [];
let projectileY = [];
let projectileTargetIndex = [];
let projectileDamage = [];
let projectileSpeed = [];
