// Configurable background and world width
const backgroundWidth = 2400;
let worldHeight;

// Player properties
const player = {
  x: 100,
  y: 360,
  width: 100,
  height: 100,
  velX: 0,
  velY: 0,
  speed: 3,
  jumpPower: 17,
  grounded: false,
  coinsCollected: 0,
  deaths: 0,
  isDying: false,
  deathFrame: 0,
  deathTimer: 0,
  showDeathScreen: false,
};

// Flip square
const flipSquare = {
  x: backgroundWidth - 80,
  y: 620,
  width: 60,
  height: 60,
  color: "blue",
  flipped: false,
};

// Player movement states
let facing = "right";
let jumping = false;
let crouching = false;
let walkFrame = 0;
let walkTimer = 0;
const walkFrameRate = 10;
const gravity = 0.7;
const friction = 0.8;
const keys = {};

// Hitbox scaling variables
const playerHitboxScaleX = 0.1;
const playerHitboxScaleY = 0.8;
const spikeSmallHitboxScaleY = 0.5;
const spikeBigHitboxScaleY = 0.25;

function checkCollision(a, b, isSpike = false) {
  let aBox = { x: a.x, y: a.y, width: a.width, height: a.height };
  let bBox = { x: b.x, y: b.y, width: b.width, height: b.height };

  if (isSpike) {
    aBox.width = a.width * playerHitboxScaleX;
    aBox.height = a.height * playerHitboxScaleY;
    aBox.x += (a.width - aBox.width) / 2;
    aBox.y += (a.height - aBox.height) / 2;
    const isUp = b.direction === "up";
    const isFlipped = flipSquare.flipped;
    if ((!isUp && !isFlipped) || (isUp && isFlipped)) {
      bBox.height =
        b.height *
        (b.type === "big" ? spikeBigHitboxScaleY : spikeSmallHitboxScaleY);
      bBox.y = b.y + b.height - bBox.height;
    } else {
      bBox.height =
        b.height *
        (b.type === "big" ? spikeBigHitboxScaleY : spikeSmallHitboxScaleY);
      bBox.y = b.y;
    }
  }

  return (
    aBox.x < bBox.x + bBox.width &&
    aBox.x + aBox.width > bBox.x &&
    aBox.y < bBox.y + bBox.height &&
    aBox.y + aBox.height > bBox.y
  );
}

function updatePlayer() {
  flipSquare.y = worldHeight - 80;

  if (player.isDying) {
    player.deathTimer++;
    if (player.deathTimer < 30) {
      if (player.deathTimer % 10 === 0) {
        player.deathFrame = (player.deathFrame + 1) % 3;
      }
    } else if (player.deathTimer >= 60) {
      player.showDeathScreen = true;
      if (player.deaths === 0) {
        player.deaths = 1;
        ghost.active = true;
      }
      currentDeathMessage = ghost.active
        ? loopDeathDialogs[Math.floor(Math.random() * loopDeathDialogs.length)]
        : firstDeathDialogs[Math.floor(Math.random() * firstDeathDialogs.length)];
    }
    return;
  }

  if (player.showDeathScreen) {
    return;
  }

  let walking = false;
  if ((keys["a"] || keys["d"]) && player.grounded) {
    walking = true;
    if (soundWalk && soundWalk.paused) {
      soundWalk.currentTime = 0;
      soundWalk
        .play()
        .catch((e) => console.error("Failed to play walk sound:", e));
    }
  } else {
    if (soundWalk && !soundWalk.paused) {
      soundWalk.pause();
      soundWalk.currentTime = 0;
    }
  }
  if (keys["a"]) {
    player.velX = -player.speed;
    facing = "left";
  } else if (keys["d"]) {
    player.velX = player.speed;
    facing = "right";
  } else {
    player.velX = 0;
  }

  if (walking) {
    walkTimer++;
    if (walkTimer > walkFrameRate) {
      walkFrame = (walkFrame + 1) % 2;
      walkTimer = 0;
    }
  } else {
    walkFrame = 0;
    walkTimer = 0;
  }

  player.velY += flipSquare.flipped ? -gravity : gravity;
  player.velX *= friction;
  player.x += player.velX;
  player.y += player.velY;

  cameraX = Math.max(
    0,
    Math.min(
      player.x + player.width / 2 - canvas.width / 2,
      backgroundWidth - canvas.width
    )
  );

  player.grounded = false;
  for (const platform of platforms) {
    if (checkCollision(player, platform)) {
      if (flipSquare.flipped) {
        if (
          player.velY <= 0 &&
          player.y - player.velY >= platform.y + platform.height
        ) {
          player.y = platform.y + platform.height;
          player.velY = 0;
          player.grounded = true;
          jumping = false;
          console.log("Landed on platform (upside-down), y:", player.y);
        }
      } else {
        if (
          player.velY >= 0 &&
          player.y + player.height - player.velY <= platform.y
        ) {
          player.y = platform.y - player.height;
          player.velY = 0;
          player.grounded = true;
          jumping = false;
          console.log("Landed on platform (normal), y:", player.y);
        }
      }
    }
  }

  if (flipSquare.flipped) {
    if (player.y + player.height > worldHeight) {
      player.y = worldHeight - player.height;
      player.velY = 0;
      player.grounded = true;
      jumping = false;
      console.log("Landed on ground (upside-down), y:", player.y);
    }
  } else {
    if (player.y < 0) {
      player.y = 0;
      player.velY = 0;
      player.grounded = true;
      jumping = false;
      console.log("Landed on ceiling (normal), y:", player.y);
    }
  }

  coins = coins.filter((coin) => {
    if (checkCollision(player, coin)) {
      player.coinsCollected++;
      return false;
    }
    return true;
  });

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > backgroundWidth)
    player.x = backgroundWidth - player.width;

  for (const spike of spikes) {
    if (checkCollision(player, spike, true)) {
      player.isDying = true;
      player.deathTimer = 0;
      player.deathFrame = 0;
      player.velX = 0;
      player.velY = 0;
      console.log("Hit spike at x:", spike.x, "y:", spike.y);
    }
  }

  if (checkCollision(player, flipSquare)) {
    flipSquare.flipped = !flipSquare.flipped;
    console.log("Gravity flipped, flipped:", flipSquare.flipped);
  }

  console.log(
    "Player state - grounded:",
    player.grounded,
    "y:",
    player.y,
    "velY:",
    player.velY
  );
}

function respawnPlayer() {
  player.x = spawnPoint.x;
  player.y = worldHeight / 2 - player.height / 2;
  player.velX = 0;
  player.velY = 0;
  player.isDying = false;
  player.deathTimer = 0;
  player.deathFrame = 0;
  player.showDeathScreen = false;
  flipSquare.flipped = false;
  jumping = false;
  crouching = false;
  ghost.currentFrame = 0;
  if (ghost.active) {
    ghost.lifeCount++;
    ghost.histories.push([]);
  } else {
    ghost.histories = [[]];
  }
  ghost.currentHistoryIndex = ghost.histories.length - 2;
  currentDeathMessage = "";
  for (let key in keys) {
    keys[key] = false;
  }
  cameraX = Math.max(
    0,
    Math.min(
      player.x + player.width / 2 - canvas.width / 2,
      backgroundWidth - canvas.width
    )
  );
  console.log("Respawned player at x:", player.x, "y:", player.y);
}