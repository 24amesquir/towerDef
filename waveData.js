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
      enemy: "infantry",
      count: 8,
      spacing: 45,
      bufferAfter: 0
    }
  ],
  [
    {
      enemy: "infantry",
      count: 12,
      spacing: 42,
      bufferAfter: 60
    },
    {
      enemy: "attackDog",
      count: 4,
      spacing: 35,
      bufferAfter: 0
    }
  ],
  [
    {
      enemy: "infantry",
      count: 16,
      spacing: 38,
      bufferAfter: 80
    },
    {
      enemy: "tank",
      count: 1,
      spacing: 80,
      bufferAfter: 0
    }
  ],
  [
    {
      enemy: "attackDog",
      count: 12,
      spacing: 28,
      bufferAfter: 60
    },
    {
      enemy: "infantry",
      count: 12,
      spacing: 34,
      bufferAfter: 0
    }
  ],
  [
    {
      enemy: "tank",
      count: 3,
      spacing: 90,
      bufferAfter: 80
    },
    {
      enemy: "infantry",
      count: 10,
      spacing: 30,
      bufferAfter: 0
    }
  ],
  [
    {
      enemy: "infantry",
      count: 24,
      spacing: 30,
      bufferAfter: 60
    },
    {
      enemy: "attackDog",
      count: 10,
      spacing: 24,
      bufferAfter: 0
    }
  ],
  [
    {
      enemy: "tank",
      count: 4,
      spacing: 80,
      bufferAfter: 80
    },
    {
      enemy: "infantry",
      count: 18,
      spacing: 28,
      bufferAfter: 0
    }
  ],
  [
    {
      enemy: "attackDog",
      count: 28,
      spacing: 18,
      bufferAfter: 80
    },
    {
      enemy: "tank",
      count: 2,
      spacing: 70,
      bufferAfter: 0
    }
  ],
  [
    {
      enemy: "infantry",
      count: 30,
      spacing: 24,
      bufferAfter: 70
    },
    {
      enemy: "tank",
      count: 5,
      spacing: 70,
      bufferAfter: 0
    }
  ],
  [
    {
      enemy: "tank",
      count: 8,
      spacing: 65,
      bufferAfter: 80
    },
    {
      enemy: "attackDog",
      count: 18,
      spacing: 20,
      bufferAfter: 0
    }
  ],
  [
    {
      enemy: "infantry",
      count: 36,
      spacing: 20,
      bufferAfter: 70
    },
    {
      enemy: "attackDog",
      count: 30,
      spacing: 16,
      bufferAfter: 70
    },
    {
      enemy: "tank",
      count: 6,
      spacing: 58,
      bufferAfter: 0
    }
  ],
  [
    {
      enemy: "infantry",
      count: 18,
      spacing: 34,
      bufferAfter: 90
    },
    {
      enemy: "tank",
      count: 3,
      spacing: 85,
      bufferAfter: 0
    }
  ],
  [
    {
      enemy: "tank",
      count: 10,
      spacing: 55,
      bufferAfter: 60
    },
    {
      enemy: "infantry",
      count: 40,
      spacing: 18,
      bufferAfter: 0
    }
  ],
  [
    {
      enemy: "attackDog",
      count: 45,
      spacing: 13,
      bufferAfter: 60
    },
    {
      enemy: "tank",
      count: 12,
      spacing: 50,
      bufferAfter: 0
    }
  ],
  [
    {
      enemy: "tank",
      count: 16,
      spacing: 45,
      bufferAfter: 45
    },
    {
      enemy: "attackDog",
      count: 55,
      spacing: 11,
      bufferAfter: 45
    },
    {
      enemy: "infantry",
      count: 60,
      spacing: 14,
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
