import { loadAsset } from "./loader.js";

window.onload = function () {
  let levelWidth = 3000;
  let worldHeight;

  const playerHitboxScaleX = 0.1;
  const playerHitboxScaleY = 0.8;
  const spikeSmallHitboxScaleY = 0.5;
  const spikeBigHitboxScaleY = 0.25;
  const activationCooldown = 180; // 3 seconds at 60 FPS
  const targetFPS = 60;
  const timeStep = 1000 / targetFPS; // 16.67ms

  const player = {
    x: 100,
    y: 550,
    width: 100,
    height: 100,
    velX: 0,
    velY: 0,
    speed: 4,
    jumpPower: 17,
    grounded: false,
    coinsCollected: 0,
    deaths: 0,
    isDying: false,
    deathFrame: 0,
    deathTimer: 0,
    showDeathScreen: false,
    finished: false,
  };

  let flipSquare = {
    x: 2700,
    y: 656,
    width: 60,
    height: 64,
    color: "blue",
    flipped: false,
    enabled: true,
    lastActivated: -activationCooldown,
  };

  let finish = {
    x: 150,
    y: 64,
    width: 60,
    height: 60,
    color: "yellow",
  };

  const ghost = {
    histories: [],
    currentHistoryIndex: -1,
    currentFrame: 0,
    opacity: 0.3,
    active: false,
    lifeCount: 0,
  };

  const firstDeathDialogs = [
    "Hello, newcomer! Welcome to the cave.",
    "You're new here, aren't you? Conjurer coded this trap just for you!",
    "First time? RatChat drew those spikes with love.",
    "Braxtyn's audio haunts this place. Hear it echo?",
    "A fresh soul! Conjurer says 'enjoy the bugs!'",
    "RatChat's art makes death look so pretty, right?",
    "Braxtyn programmed that jump sound just for your first fall!",
    "Newbie! Conjurer hid some secrets in the code.",
    "First death? RatChat sketched your doom in pixels.",
    "Welcome! Braxtyn's music loops like your fate."
  ];
  const loopDeathDialogs = [
    "You're back... again. Don't you feel it?",
    "This isn't the first time you've died here.",
    "The cave remembers your every step.",
    "Why does this feel so familiar?",
    "You're trapped in a cycle, aren't you?",
    "Your shadow moves before you do...",
    "How many times have you run this path?",
    "The spikes know your name now.",
    "You can't escape the loop, can you?",
    "Your ghost walks where you fell."
  ];

  let currentDeathMessage = "";
  let frameCount = 0;
  let lastTime = performance.now();
  let frameCountForFPS = 0;
  let fps = 0;
  let accumulatedTime = 0;

  const canvas = document.getElementById("myCanvas");
  if (!canvas) {
    console.error('Canvas element with id="myCanvas" not found');
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Failed to get 2D context for canvas");
    return;
  }

  function resizeCanvas() {
    canvas.width = 1280;
    canvas.height = 720;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    worldHeight = canvas.height;
    console.log(`Canvas set: ${canvas.width}x${canvas.height}, styled to ${canvas.style.width}x${canvas.style.height}`);
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  let cameraX = 0;

  const backgroundFar = loadAsset("sprites/background/darkLayer.png");
  const backgroundMid = loadAsset("sprites/background/opening.png");
  const foregroundMid = loadAsset("sprites/background/spikesfloor.png");
  const foregroundNear = loadAsset("sprites/background/pillars.png");
  const foregroundStationary = loadAsset("sprites/background/frame.png");
  const coinImg = loadAsset("sprites/colectables/coinAnim.gif");
  const winAnimImg = loadAsset("sprites/winningAnim.gif");
  const deathImg1 = loadAsset("sprites/player/death/death1.png");
  const deathImg2 = loadAsset("sprites/player/death/death2.png");
  const deathImg3 = loadAsset("sprites/player/death/death3.png");
  const playerImgRight = loadAsset("sprites/player/player.png");
  const playerImgLeft = loadAsset("sprites/player/playerLeft.png");
  const playerImgWalkRight1 = loadAsset("sprites/player/walk/walk1.png");
  const playerImgWalkRight2 = loadAsset("sprites/player/walk/walk2.png");
  const playerImgWalkLeft1 = loadAsset("sprites/player/walk/walk1Left.png");
  const playerImgWalkLeft2 = loadAsset("sprites/player/walk/walk2Left.png");
  const playerImgJumpRight = loadAsset("sprites/player/jump/jump.png");
  const playerImgJumpLeft = loadAsset("sprites/player/jump/jumpLeft.png");
  const playerImgCrouchRight = loadAsset("sprites/player/crouch/crouchRight.png");
  const playerImgCrouchLeft = loadAsset("sprites/player/crouch/crouchLeft.png");
  const spikeImgSmall = loadAsset("sprites/spikes/spikes.png");
  const spikeImgBig = loadAsset("sprites/spikes/spikesLong.png");
  const platformLeftImg = loadAsset("sprites/platform/platformLeft.png");
  const platformCenter1Img = loadAsset("sprites/platform/center1.png");
  const platformCenter2Img = loadAsset("sprites/platform/center2.png");
  const platformRightImg = loadAsset("sprites/platform/platformRight.png");
  const platformRedOnLeftImg = loadAsset("sprites/platform/redLeft.png");
  const platformRedOnCenter1Img = loadAsset("sprites/platform/red1.png");
  const platformRedOnCenter2Img = loadAsset("sprites/platform/red2.png");
  const platformRedOnRightImg = loadAsset("sprites/platform/redRight.png");
  const platformRedOffLeftImg = loadAsset("sprites/platform/redLeftDeact.png");
  const platformRedOffCenter1Img = loadAsset("sprites/platform/red1Deact.png");
  const platformRedOffCenter2Img = loadAsset("sprites/platform/red2Deact.png");
  const platformRedOffRightImg = loadAsset("sprites/platform/redRightDeact.png");
  const platformBlueOnLeftImg = loadAsset("sprites/platform/blueLeft.png");
  const platformBlueOnCenter1Img = loadAsset("sprites/platform/blue1.png");
  const platformBlueOnCenter2Img = loadAsset("sprites/platform/blue2.png");
  const platformBlueOnRightImg = loadAsset("sprites/platform/blueRight.png");
  const platformBlueOffLeftImg = loadAsset("sprites/platform/blueLeftDeact.png");
  const platformBlueOffCenter1Img = loadAsset("sprites/platform/blue1Deact.png");
  const platformBlueOffCenter2Img = loadAsset("sprites/platform/blue2Deact.png");
  const platformBlueOffRightImg = loadAsset("sprites/platform/blueRightDeact.png");
  const leverImg = loadAsset("sprites/lever/lever.png");
  const finishImg = loadAsset("sprites/finishline.png");
  const flipBoxImg = loadAsset("sprites/flipBox/flipBox.png");

  const soundWalk = loadAsset("sounds/playerwalk.wav");
  soundWalk.volume = 0.2;
  soundWalk.playbackRate = 3;
  const soundJump = loadAsset("sounds/jump.wav");
  soundJump.volume = 0.2;
  const soundCrouch = loadAsset("sounds/crouch.wav");
  soundCrouch.volume = 1;
  soundCrouch.playbackRate = 0.8;
  const soundBackground = loadAsset("sounds/background.wav");
  soundBackground.loop = true;
  soundBackground.volume = 0.5;
  soundBackground.play().catch((e) => console.error("Failed to play background sound:", e));

  let platforms = [];
  let spikes = [];
  let coins = [];
  let levers = [];
  let spawnPoint = { x: 100, y: 656 };
  let selectedLevel = localStorage.getItem("selectedLevel") || "level1";

  const fallbackLevel = {
    width: 3000,
    platforms: [
      { x: 0, y: 0, width: 3000, height: 64, tilePattern: ["left", "center1", "center2", "right"], enabled: true, color: "default" },
      { x: 0, y: 720, width: 3000, height: 64, tilePattern: ["left", "center1", "center2", "right"], enabled: true, color: "default" },
    ],
    spikes: [],
    coins: [],
    levers: [],
    spawnPoint: { x: 100, y: 656 },
    finish: { x: 150, y: 64, width: 60, height: 60, color: "yellow" },
    flipSquare: { enabled: false },
  };

  function loadLevel() {
    fetch(`levels/${selectedLevel}.json`)
      .then((res) => {
        if (!res.ok)
          throw new Error(`Failed to load levels/${selectedLevel}.json: ${res.status}`);
        return res.json();
      })
      .then((level) => {
        levelWidth = level.width || 3000;
        platforms = level.platforms || [];
        platforms = platforms.map(platform => ({
          ...platform,
          tilePattern: Array.isArray(platform.tilePattern) &&
            platform.tilePattern.every(t => ["left", "center1", "center2", "right"].includes(t))
            ? platform.tilePattern
            : ["left", "center1", "center2", "right"],
          enabled: platform.enabled !== undefined ? platform.enabled : true,
          color: platform.color || "default"
        }));
        spikes = level.spikes || [];
        coins = level.coins || [];
        levers = level.levers || [];
        levers = levers.map(lever => ({
          ...lever,
          active: false,
          targetPlatforms: Array.isArray(lever.targetPlatforms) ? lever.targetPlatforms : [],
          color: lever.color || "purple",
          lastActivated: -activationCooldown
        }));
        spawnPoint = level.spawnPoint || { x: 100, y: 656 };
        finish = level.finish || {
          x: 150,
          y: 64,
          width: 60,
          height: 60,
          color: "yellow",
        };
        flipSquare = level.flipSquare || { enabled: false };
        if (flipSquare.enabled) {
          flipSquare = {
            x: flipSquare.x || 2700,
            y: flipSquare.y || 656,
            width: flipSquare.width || 60,
            height: flipSquare.height || 64,
            color: flipSquare.color || "blue",
            flipped: false,
            enabled: true,
            lastActivated: -activationCooldown,
          };
        } else {
          flipSquare = { enabled: false };
        }
        player.x = spawnPoint.x;
        player.y = spawnPoint.y - player.height;
        console.log(`Loaded level: ${selectedLevel}, width: ${levelWidth}, platforms: ${platforms.length}, levers: ${levers.length}, player.y: ${player.y}`);
      })
      .catch((error) => {
        console.error("Error loading level:", error);
        levelWidth = fallbackLevel.width;
        platforms = fallbackLevel.platforms;
        spikes = fallbackLevel.spikes;
        coins = fallbackLevel.coins;
        levers = fallbackLevel.levers;
        spawnPoint = fallbackLevel.spawnPoint;
        finish = fallbackLevel.finish;
        flipSquare = fallbackLevel.flipSquare;
        player.x = spawnPoint.x;
        player.y = spawnPoint.y - player.height;
        selectedLevel = "level1";
        localStorage.setItem("selectedLevel", selectedLevel);
        console.log("Using fallback level, width:", levelWidth, "platforms:", platforms.length, "player.y:", player.y);
      });
  }
  loadLevel();

  let facing = "right";
  let jumping = false;
  let crouching = false;
  let walkFrame = 0;
  let walkTimer = 0;
  const walkFrameRate = 10;
  const gravity = 0.7;
  const friction = 0.8;
  const keys = {};

  document.addEventListener("keydown", (e) => {
    if (player.isDying || player.showDeathScreen || player.finished) {
      if (player.showDeathScreen || player.finished) {
        respawnPlayer();
      }
      return;
    }
    const key = e.key.toLowerCase();
    keys[key] = true;
    if (key === "a") facing = "left";
    if (key === "d") facing = "right";
    if (key === " " || key === "w") {
      e.preventDefault();
      if (player.grounded && !crouching) {
        crouching = true;
        if (soundCrouch) {
          soundCrouch.currentTime = 0;
          soundCrouch.play().catch((e) => console.error("Failed to play crouch sound:", e));
        }
      }
    }
  });

  document.addEventListener("keyup", (e) => {
    if (player.isDying || player.showDeathScreen || player.finished) return;
    const key = e.key.toLowerCase();
    keys[key] = false;
    if ((e.code === "Space" || key === "w") && player.grounded) {
      e.preventDefault();
      if (crouching) crouching = false;
      player.velY = flipSquare.enabled && flipSquare.flipped ? player.jumpPower : -player.jumpPower;
      player.grounded = false;
      jumping = true;
      console.log("Jump triggered, velY:", player.velY, "flipped:", flipSquare.enabled ? flipSquare.flipped : false);
      if (soundJump) {
        soundJump.currentTime = 0;
        soundJump.play().catch((e) => console.error("Failed to play jump sound:", e));
      }
    }
  });

  function checkCollision(a, b, isSpike = false) {
    let aBox = { x: a.x, y: a.y, width: a.width, height: a.height };
    let bBox = { x: b.x, y: b.y, width: b.width, height: b.height };

    if (isSpike) {
      aBox.width = a.width * playerHitboxScaleX;
      aBox.height = a.height * playerHitboxScaleY;
      aBox.x += (a.width - aBox.width) / 2;
      aBox.y += (a.height - aBox.height) / 2;
      const isUp = b.direction === "up";
      bBox.height = b.height * (b.type === "big" ? spikeBigHitboxScaleY : spikeSmallHitboxScaleY);
      bBox.y = isUp ? b.y : b.y + b.height - bBox.height;
    }

    return (
      aBox.x < bBox.x + bBox.width &&
      aBox.x + aBox.width > bBox.x &&
      aBox.y < bBox.y + bBox.height &&
      aBox.y + aBox.height > bBox.y
    );
  }

  function applyCornerBlur() {
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      Math.min(canvas.width, canvas.height) * 0.3,
      canvas.width / 2,
      canvas.height / 2,
      Math.max(canvas.width, canvas.height) * 0.7
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.7)");

    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  function respawnPlayer() {
    const wasFinished = player.finished;
    player.x = spawnPoint.x;
    player.y = spawnPoint.y - player.height;
    player.velX = 0;
    player.velY = 0;
    player.isDying = false;
    player.deathTimer = 0;
    player.deathFrame = 0;
    player.showDeathScreen = false;
    player.finished = false;
    if (flipSquare.enabled) {
      flipSquare.flipped = false;
      flipSquare.lastActivated = -activationCooldown;
    }
    levers.forEach(lever => {
      lever.active = false;
      lever.lastActivated = -activationCooldown;
      lever.targetPlatforms.forEach(obj => {
        if (platforms[obj.index]) platforms[obj.index].enabled = false;
      });
    });
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
    if (wasFinished) {
      const currentLevelNum = parseInt(selectedLevel.replace("level", "")) || 1;
      selectedLevel = `level${currentLevelNum + 1}`;
      localStorage.setItem("selectedLevel", selectedLevel);
      loadLevel();
      console.log(`Advancing to next level: ${selectedLevel}`);
    }
    cameraX = Math.max(
      0,
      Math.min(
        player.x + player.width / 2 - canvas.width / 2,
        levelWidth - canvas.width
      )
    );
    console.log("Respawned player at x:", player.x, "y:", player.y);
  }

  function updatePlayer() {
    if (player.isDying) {
      player.deathTimer++;
      if (player.deathTimer < 30) {
        if (player.deathTimer % 10 === 0) {
          player.deathFrame = (player.deathFrame + 1) % 3;
        }
      } else if (player.deathTimer >= 60) {
        player.showDeathScreen = true;
        if (!currentDeathMessage) {
          if (player.deaths === 0) {
            player.deaths = 1;
            ghost.active = true;
            currentDeathMessage = firstDeathDialogs[Math.floor(Math.random() * firstDeathDialogs.length)];
          } else {
            currentDeathMessage = loopDeathDialogs[Math.floor(Math.random() * loopDeathDialogs.length)];
          }
        }
      }
      return;
    }

    if (player.showDeathScreen || player.finished) {
      return;
    }

    let walking = false;
    if ((keys["a"] || keys["d"]) && player.grounded) {
      walking = true;
      if (soundWalk && soundWalk.paused) {
        soundWalk.currentTime = 0;
        soundWalk.play().catch((e) => console.error("Failed to play walk sound:", e));
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

    player.velY += (flipSquare.enabled && flipSquare.flipped) ? -gravity : gravity;
    player.velX *= friction;
    player.x += player.velX;
    player.y += player.velY;

    cameraX = Math.max(
      0,
      Math.min(
        player.x + player.width / 2 - canvas.width / 2,
        levelWidth - canvas.width
      )
    );

    player.grounded = false;
    const cameraLeft = cameraX - 100;
    const cameraRight = cameraX + canvas.width + 100;
    for (const platform of platforms) {
      if (platform.enabled && platform.x + platform.width >= cameraLeft && platform.x <= cameraRight && checkCollision(player, platform)) {
        if (flipSquare.enabled && flipSquare.flipped) {
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

    if (flipSquare.enabled && flipSquare.flipped) {
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
      if (coin.x + coin.width >= cameraLeft && coin.x <= cameraRight && checkCollision(player, coin)) {
        player.coinsCollected++;
        return false;
      }
      return true;
    });

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > levelWidth)
      player.x = levelWidth - player.width;

    for (const spike of spikes) {
      if (spike.x + spike.width >= cameraLeft && spike.x <= cameraRight && checkCollision(player, spike, true)) {
        player.isDying = true;
        player.deathTimer = 0;
        player.deathFrame = 0;
        player.velX = 0;
        player.velY = 0;
        console.log("Hit spike at x:", spike.x, "y:", spike.y);
      }
    }

    for (const lever of levers) {
      if (lever.x + lever.width >= cameraLeft && lever.x <= cameraRight && checkCollision(player, lever) && frameCount - lever.lastActivated >= activationCooldown) {
        lever.lastActivated = frameCount;
        lever.active = !lever.active;
        lever.targetPlatforms.forEach(obj => {
          if (obj.color === "red" && platforms[obj.index]) {
            platforms[obj.index].enabled = !lever.active;
            console.log(`Toggled red platform ${obj.index} to enabled: ${platforms[obj.index].enabled}`);
          } else if (obj.color === "blue" && platforms[obj.index]) {
            platforms[obj.index].enabled = lever.active;
            console.log(`Toggled blue platform ${obj.index} to enabled: ${platforms[obj.index].enabled}`);
          }
        });
      }
    }

    if (flipSquare.enabled && flipSquare.x + flipSquare.width >= cameraLeft && flipSquare.x <= cameraRight && checkCollision(player, flipSquare) && frameCount - flipSquare.lastActivated >= activationCooldown) {
      flipSquare.lastActivated = frameCount;
      flipSquare.flipped = !flipSquare.flipped;
      console.log("Gravity flipped, flipped:", flipSquare.flipped);
    }

    if (checkCollision(player, finish)) {
      player.finished = true;
      console.log("Reached finish area at x:", finish.x, "y:", finish.y);
    }
  }

  function updateGhost() {
    if (player.showDeathScreen || player.finished) {
      if (ghost.active && ghost.currentHistoryIndex >= 0 && ghost.histories[ghost.currentHistoryIndex].length > 0) {
        ghost.currentFrame = (ghost.currentFrame + 1) % ghost.histories[ghost.currentHistoryIndex].length;
      }
      return;
    }

    if (ghost.histories.length === 0) {
      ghost.histories.push([]);
    }
    ghost.histories[ghost.histories.length - 1].push({
      x: player.x,
      y: player.y,
      facing: facing,
      jumping: jumping,
      crouching: crouching,
      walkFrame: walkFrame,
      flipped: flipSquare.enabled ? flipSquare.flipped : false,
    });

    if (ghost.active && ghost.lifeCount < 5 && ghost.currentHistoryIndex >= 0 && ghost.histories[ghost.currentHistoryIndex].length > 0) {
      ghost.currentFrame = (ghost.currentFrame + 1) % ghost.histories[ghost.currentHistoryIndex].length;
    }
  }

  function draw() {
    try {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (player.showDeathScreen || player.finished) {
        ctx.filter = "blur(5px)";
      }

      ctx.save();
      ctx.translate(-cameraX, 0);

      const parallaxFar = 0.2;
      const parallaxMidBg = 0.4;
      const parallaxMidFg = 0.6;
      const parallaxNear = 0.8;
      const parallaxStationary = 0.0;

      // Draw backgrounds every frame
      if (backgroundFar.complete && backgroundFar.naturalWidth !== 0) {
        const farOffset = (cameraX * parallaxFar) % levelWidth;
        ctx.drawImage(backgroundFar, -farOffset, 0, levelWidth, canvas.height);
        ctx.drawImage(backgroundFar, -farOffset + levelWidth, 0, levelWidth, canvas.height);
      } else {
        console.warn("Failed to load darkLayer.png");
      }
      if (backgroundMid.complete && backgroundMid.naturalWidth !== 0) {
        const midBgOffset = (cameraX * parallaxMidBg) % levelWidth;
        ctx.drawImage(backgroundMid, -midBgOffset, 0, levelWidth, canvas.height);
        ctx.drawImage(backgroundMid, -midBgOffset + levelWidth, 0, levelWidth, canvas.height);
      } else {
        console.warn("Failed to load opening.png");
      }
      if (foregroundMid.complete && foregroundMid.naturalWidth !== 0) {
        const midFgOffset = (cameraX * parallaxMidFg) % levelWidth;
        ctx.drawImage(foregroundMid, -midFgOffset, 0, levelWidth, canvas.height);
        ctx.drawImage(foregroundMid, -midFgOffset + levelWidth, 0, levelWidth, canvas.height);
      } else {
        console.warn("Failed to load spikesfloor.png");
      }
      if (foregroundNear.complete && foregroundNear.naturalWidth !== 0) {
        const nearOffset = (cameraX * parallaxNear) % levelWidth;
        ctx.drawImage(foregroundNear, -nearOffset, 0, levelWidth, canvas.height);
        ctx.drawImage(foregroundNear, -nearOffset + levelWidth, 0, levelWidth, canvas.height);
      } else {
        console.warn("Failed to load pillars.png");
      }
      if (foregroundStationary.complete && foregroundStationary.naturalWidth !== 0) {
        const stationaryOffset = (cameraX * parallaxStationary) % levelWidth;
        ctx.drawImage(foregroundStationary, -stationaryOffset, 0, levelWidth, canvas.height);
        ctx.drawImage(foregroundStationary, -stationaryOffset + levelWidth, 0, levelWidth, canvas.height);
      } else {
        console.warn("Failed to load frame.png");
      }

      // Draw platforms
      const tileImages = {
        default: {
          left: platformLeftImg,
          center1: platformCenter1Img,
          center2: platformCenter2Img,
          right: platformRightImg
        },
        red: {
          on: {
            left: platformRedOnLeftImg,
            center1: platformRedOnCenter1Img,
            center2: platformRedOnCenter2Img,
            right: platformRedOnRightImg
          },
          off: {
            left: platformRedOffLeftImg,
            center1: platformRedOffCenter1Img,
            center2: platformRedOffCenter2Img,
            right: platformRedOffRightImg
          }
        },
        blue: {
          on: {
            left: platformBlueOnLeftImg,
            center1: platformBlueOnCenter1Img,
            center2: platformBlueOnCenter2Img,
            right: platformBlueOnRightImg
          },
          off: {
            left: platformBlueOffLeftImg,
            center1: platformBlueOffCenter1Img,
            center2: platformBlueOffCenter2Img,
            right: platformBlueOffRightImg
          }
        }
      };

      const cameraLeft = cameraX - 100;
      const cameraRight = cameraX + canvas.width + 100;
      for (const platform of platforms) {
        if (platform.x + platform.width < cameraLeft || platform.x > cameraRight) continue;
        ctx.save();
        ctx.translate(platform.x, platform.y);
        if (flipSquare.enabled && flipSquare.flipped) {
          ctx.translate(platform.width / 2, platform.height / 2);
          ctx.rotate(Math.PI);
          ctx.translate(-platform.width / 2, -platform.height / 2);
        }
        const tiles = tileImages[platform.color] || tileImages.default;
        const tileImg = platform.enabled && tiles.on ? tiles.on : tiles.off || tileImages.default;
        if (!platform.tilePattern || platform.width < 100) {
          ctx.fillStyle = platform.color === "red" ? (platform.enabled ? "red" : "rgba(255, 0, 0, 0.3)") : 
                          platform.color === "blue" ? (platform.enabled ? "blue" : "rgba(0, 0, 255, 0.3)") : "green";
          ctx.fillRect(0, 0, platform.width, platform.height);
        } else {
          const tileWidth = 100;
          const tileHeight = platform.height;
          let currentX = 0;
          for (const tileType of platform.tilePattern) {
            const img = tileImg[tileType] || tileImages.default[tileType];
            if (img && img.complete && img.naturalWidth !== 0) {
              ctx.drawImage(img, currentX, 0, tileWidth, tileHeight);
            } else {
              ctx.fillStyle = platform.color === "red" ? (platform.enabled ? "red" : "rgba(255, 0, 0, 0.3)") : 
                              platform.color === "blue" ? (platform.enabled ? "blue" : "rgba(0, 0, 255, 0.3)") : "green";
              ctx.fillRect(currentX, 0, tileWidth, tileHeight);
              console.warn(`Failed to load image for ${platform.color} platform, tile: ${tileType}, using fallback color`);
            }
            currentX += tileWidth;
            if (currentX >= platform.width) break;
          }
          while (currentX < platform.width) {
            ctx.fillStyle = platform.color === "red" ? (platform.enabled ? "red" : "rgba(255, 0, 0, 0.3)") : 
                            platform.color === "blue" ? (platform.enabled ? "blue" : "rgba(0, 0, 255, 0.3)") : "green";
            const remainingWidth = Math.min(tileWidth, platform.width - currentX);
            ctx.fillRect(currentX, 0, remainingWidth, tileHeight);
            currentX += tileWidth;
          }
        }
        ctx.restore();
      }

      // Draw coins
      for (const coin of coins) {
        if (coin.x + coin.width < cameraLeft || coin.x > cameraRight) continue;
        if (coinImg.complete && coinImg.naturalWidth !== 0) {
          ctx.drawImage(coinImg, coin.x, coin.y, coin.width, coin.height);
        } else {
          ctx.fillStyle = "yellow";
          ctx.fillRect(coin.x, coin.y, coin.width, coin.height);
          console.warn("Failed to load coinAnim.gif, using fallback yellow rectangle");
        }
      }

      // Draw spikes
      for (const spike of spikes) {
        if (spike.x + spike.width < cameraLeft || spike.x > cameraRight) continue;
        let img = spike.type === "big" ? spikeImgBig : spikeImgSmall;
        const isUp = spike.direction === "up";
        if (img.complete && img.naturalWidth !== 0) {
          ctx.save();
          if (isUp) {
            ctx.drawImage(img, spike.x, spike.y, spike.width, spike.height);
          } else {
            ctx.translate(spike.x + spike.width / 2, spike.y + spike.height / 2);
            ctx.rotate(Math.PI);
            ctx.drawImage(img, -spike.width / 2, -spike.height / 2, spike.width, spike.height);
          }
          ctx.restore();
        } else {
          ctx.fillStyle = "gray";
          ctx.beginPath();
          if (isUp) {
            ctx.moveTo(spike.x, spike.y);
            ctx.lineTo(spike.x + spike.width / 2, spike.y + spike.height);
            ctx.lineTo(spike.x + spike.width, spike.y);
            ctx.closePath();
          } else {
            ctx.moveTo(spike.x, spike.y + spike.height);
            ctx.lineTo(spike.x + spike.width / 2, spike.y);
            ctx.lineTo(spike.x + spike.width, spike.y + spike.height);
            ctx.closePath();
          }
          ctx.fill();
        }
      }

      // Draw levers
      for (const lever of levers) {
        if (lever.x + lever.width < cameraLeft || lever.x > cameraRight) continue;
        if (leverImg && leverImg.complete && leverImg.naturalWidth !== 0) {
          ctx.drawImage(leverImg, lever.x, lever.y, lever.width, lever.height);
        } else {
          ctx.fillStyle = lever.active ? "green" : lever.color;
          ctx.fillRect(lever.x, lever.y, lever.width, lever.height);
          console.warn("Failed to load lever.png, using fallback color");
        }
      }

      // Draw flip square
      if (flipSquare.enabled && flipSquare.x + flipSquare.width >= cameraLeft && flipSquare.x <= cameraRight) {
        if (flipBoxImg.complete && flipBoxImg.naturalWidth !== 0) {
          ctx.drawImage(flipBoxImg, flipSquare.x, flipSquare.y, flipSquare.width, flipSquare.height);
        } else {
          ctx.fillStyle = flipSquare.color;
          ctx.fillRect(flipSquare.x, flipSquare.y, flipSquare.width, flipSquare.height);
          console.warn("Failed to load flipBox.png, using fallback blue rectangle");
        }
      }

      // Draw finish
      if (finish.x + finish.width >= cameraLeft && finish.x <= cameraRight) {
        if (finishImg.complete && finishImg.naturalWidth !== 0) {
          ctx.drawImage(finishImg, finish.x, finish.y, finish.width, finish.height);
        } else {
          ctx.fillStyle = finish.color;
          ctx.fillRect(finish.x, finish.y, finish.width, finish.height);
          console.warn("Failed to load finish.png, using fallback yellow rectangle");
        }
      }

      // Draw ghost
      if (ghost.active && ghost.currentHistoryIndex >= 0 && ghost.histories[ghost.currentHistoryIndex].length > 0 && (player.showDeathScreen || ghost.lifeCount < 5)) {
        const ghostState = ghost.histories[ghost.currentHistoryIndex][ghost.currentFrame % ghost.histories[ghost.currentHistoryIndex].length];
        if (ghostState.x + player.width < cameraLeft || ghostState.x > cameraRight) {
          ctx.restore();
          return; // Skip drawing ghost if out of view
        }
        let imgToDraw;
        let spriteFacing = (flipSquare.enabled && ghostState.flipped)
          ? ghostState.facing === "left" ? "right" : "left"
          : ghostState.facing;

        if (ghostState.jumping) {
          imgToDraw = spriteFacing === "left" ? playerImgJumpLeft : playerImgJumpRight;
        } else if (ghostState.crouching) {
          imgToDraw = spriteFacing === "left" ? playerImgCrouchLeft : playerImgCrouchRight;
        } else if (ghostState.walkFrame !== 0) {
          if (spriteFacing === "left") {
            imgToDraw = ghostState.walkFrame === 0 ? playerImgWalkLeft1 : playerImgWalkLeft2;
          } else {
            imgToDraw = ghostState.walkFrame === 0 ? playerImgWalkRight1 : playerImgWalkRight2;
          }
        } else if (spriteFacing === "left") {
          imgToDraw = playerImgLeft;
        } else {
          imgToDraw = playerImgRight;
        }

        if (imgToDraw.complete && imgToDraw.naturalWidth !== 0) {
          ctx.save();
          ctx.globalAlpha = ghost.opacity;
          if (flipSquare.enabled && ghostState.flipped) {
            ctx.translate(ghostState.x + player.width / 2, ghostState.y + player.height / 2);
            ctx.rotate(Math.PI);
            ctx.drawImage(imgToDraw, -player.width / 2, -player.height / 2, player.width, player.height);
          } else {
            ctx.drawImage(imgToDraw, ghostState.x, ghostState.y, player.width, player.height);
          }
          ctx.restore();
        } else {
          ctx.save();
          ctx.globalAlpha = ghost.opacity;
          ctx.fillStyle = "white";
          ctx.fillRect(ghostState.x, ghostState.y, player.width, player.height);
          ctx.restore();
        }
      }

      // Draw player
      let spriteFacing = (flipSquare.enabled && flipSquare.flipped)
        ? facing === "left" ? "right" : "left"
        : facing;
      let imgToDraw;
      if (player.isDying) {
        if (player.deathFrame === 0) imgToDraw = deathImg1;
        else if (player.deathFrame === 1) imgToDraw = deathImg2;
        else imgToDraw = deathImg3;
      } else if (jumping) {
        imgToDraw = spriteFacing === "left" ? playerImgJumpLeft : playerImgJumpRight;
      } else if (crouching) {
        imgToDraw = spriteFacing === "left" ? playerImgCrouchLeft : playerImgCrouchRight;
      } else if ((keys["a"] || keys["d"]) && player.grounded) {
        if (spriteFacing === "left") {
          imgToDraw = walkFrame === 0 ? playerImgWalkLeft1 : playerImgWalkLeft2;
        } else {
          imgToDraw = walkFrame === 0 ? playerImgWalkRight1 : playerImgWalkRight2;
        }
      } else if (spriteFacing === "left") {
        imgToDraw = playerImgLeft;
      } else {
        imgToDraw = playerImgRight;
      }

      if (imgToDraw.complete && imgToDraw.naturalWidth !== 0) {
        ctx.save();
        if (flipSquare.enabled && flipSquare.flipped) {
          ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
          ctx.rotate(Math.PI);
          ctx.drawImage(imgToDraw, -player.width / 2, -player.height / 2, player.width, player.height);
        } else {
          ctx.drawImage(imgToDraw, player.x, player.y, player.width, player.height);
        }
        ctx.restore();
      } else {
        ctx.fillStyle = "red";
        ctx.fillRect(player.x, player.y, player.width, player.height);
        console.warn("Failed to load player image, using fallback red rectangle");
      }

      // Draw winning animation
      if (player.finished && winAnimImg.complete && winAnimImg.naturalWidth !== 0) {
        ctx.save();
        ctx.drawImage(winAnimImg, player.x, player.y, player.width, player.height);
        ctx.restore();
      }

      ctx.restore();

      // Draw UI
      if (!player.showDeathScreen && !player.finished) {
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(`Coins: ${player.coinsCollected}`, 10, 30);
        ctx.fillText(`Deaths: ${player.deaths}`, 10, 60);
        ctx.fillText(`Level: ${selectedLevel}`, 10, 90);
        ctx.fillText(`FPS: ${fps.toFixed(1)}`, 10, 120);
      } else if (player.showDeathScreen) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.filter = "none";
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`You Died!`, canvas.width / 2, canvas.height / 2 - 60);
        ctx.fillText(currentDeathMessage, canvas.width / 2, canvas.height / 2 - 30);
        ctx.fillText(`Coins: ${player.coinsCollected}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText(`Deaths: ${player.deaths}`, canvas.width / 2, canvas.height / 2 + 30);
        ctx.fillText(`Press any key to continue`, canvas.width / 2, canvas.height / 2 + 60);
        ctx.textAlign = "left";
      } else if (player.finished) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.filter = "none";
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`You Win!`, canvas.width / 2, canvas.height / 2 - 60);
        ctx.fillText(`Congratulations, you reached the finish!`, canvas.width / 2, canvas.height / 2 - 30);
        ctx.fillText(`Coins: ${player.coinsCollected}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText(`Deaths: ${player.deaths}`, canvas.width / 2, canvas.height / 2 + 30);
        ctx.fillText(`Press any key to play next level`, canvas.width / 2, canvas.height / 2 + 60);
        ctx.textAlign = "left";
      }

      applyCornerBlur();
      ctx.filter = "none";
    } catch (e) {
      console.error("Error in draw function:", e);
    }
  }

  function update() {
    frameCount++;
    frameCountForFPS++;
    const currentTime = performance.now();
    if (currentTime - lastTime >= 1000) {
      fps = (frameCountForFPS * 1000) / (currentTime - lastTime);
      frameCountForFPS = 0;
      lastTime = currentTime;
      if (fps < 50) {
        console.warn(`Low FPS: ${fps.toFixed(1)}`);
      } else {
        console.log(`FPS: ${fps.toFixed(1)}`);
      }
    }
    updatePlayer();
    updateGhost();
  }

  function loop(timestamp) {
    try {
      accumulatedTime += timestamp - lastTime;
      lastTime = timestamp;

      while (accumulatedTime >= timeStep) {
        update();
        accumulatedTime -= timeStep;
      }

      draw();
      requestAnimationFrame(loop);
    } catch (e) {
      console.error("Error in game loop:", e);
    }
  }

  console.log("Starting game loop");
  requestAnimationFrame((timestamp) => {
    lastTime = timestamp;
    loop(timestamp);
  });
};