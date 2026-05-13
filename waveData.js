/*
Edit enemy types and waves here.

Add as many waves as you want. Each wave is a list of groups, and each group
spawns one enemy type before the next group starts.
*/

const enemyTypes = [
  {
    name: "tank",
    health: 300,
    speed: 0.7,
    damage: 3,
    reward: 25,
    spriteSize: 44
  },
  {
    name: "infantry",
    health: 60,
    speed: 1.5,
    damage: 1,
    reward: 10,
    spriteSize: 36
  },
  {
    name: "attackDog",
    health: 60,
    speed: 2.6,
    damage: 1,
    reward: 5,
    spriteSize: 28
  }
];

const waves = [
    [
    {
      enemy: "tank",
      count: 1,
      spacing: 80,
      bufferAfter: 120
    },
    {
      enemy: "attackDog",
      count: 300,
      spacing: 20,
      bufferAfter: 0
    }
  ],
  [
    {
      enemy: "tank",
      count: 5,
      spacing: 80,
      bufferAfter: 120
    },
    {
      enemy: "infantry",
      count: 20,
      spacing: 30,
      bufferAfter: 90
    },
    {
      enemy: "attackDog",
      count: 5,
      spacing: 20,
      bufferAfter: 0
    }
  ],
  [
    {
      enemy: "tank",
      count: 15,
      spacing: 70,
      bufferAfter: 0
    }
  ],
  [
    {
      enemy: "attackDog",
      count: 50,
      spacing: 15,
      bufferAfter: 0
    }
  ]
];

const enemyTypeName = enemyTypes.map((enemyType) => enemyType.name);
const enemyTypeHealth = enemyTypes.map((enemyType) => enemyType.health);
const enemyTypeSpeed = enemyTypes.map((enemyType) => enemyType.speed);
const enemyTypeDamage = enemyTypes.map((enemyType) => enemyType.damage);
const enemyTypeReward = enemyTypes.map((enemyType) => enemyType.reward);
const enemyTypeSpriteSize = enemyTypes.map((enemyType) => enemyType.spriteSize);

function getEnemyTypeIndex(enemyName) {
  const enemyTypeIndex = enemyTypeName.indexOf(enemyName);

  if (enemyTypeIndex === -1) {
    throw new Error(`Unknown enemy type in wave data: ${enemyName}`);
  }

  return enemyTypeIndex;
}

const waveEnemyTypeIndex = waves.map((wave) => {
  return wave.map((waveGroup) => getEnemyTypeIndex(waveGroup.enemy));
});
const waveCount = waves.map((wave) => {
  return wave.map((waveGroup) => waveGroup.count);
});
const waveSpacing = waves.map((wave) => {
  return wave.map((waveGroup) => waveGroup.spacing);
});
const waveBufferAfter = waves.map((wave) => {
  return wave.map((waveGroup) => waveGroup.bufferAfter);
});
