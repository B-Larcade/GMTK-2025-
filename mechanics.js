import { loadAsset } from "./loader.js";
window.onload = function () {
  let levelWidth = 3000;
  let worldHeight;

  const playerHitboxScaleX = 0.1;
  const playerHitboxScaleY = 0.8;
  const spikeSmallHitboxScaleY = 0.5;
  const spikeBigHitboxScaleY = 0.25;

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
  const backgroundFar=loadAsset("sprites/background/darkLayer.png");
  const backgroundMid = loadAsset("sprites/background/opening.png");
  const foregroundMid = loadAsset("sprites/background/spikesfloor.png");
  const foregroundNear = loadAsset("sprites/background/pillars.png");
  const foregroundStationary = loadAsset("sprites/background/frame.png");
  const coinImg = loadAsset("sprites/colectables/coinAnim.gif");
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
  let platforms = [];
  let spikes = [];
  let coins = [];
  let spawnPoint = { x: 100, y: 656 };
  let selectedLevel = localStorage.getItem("selectedLevel") || "level1";

  const fallbackLevel = {
    width: 3000,
    platforms: [
      { x: 0, y: 0, width: 3000, height: 64, tilePattern: ["left", "center1", "center2", "right"] },
      { x: 0, y: 720, width: 3000, height: 64, tilePattern: ["left", "center1", "center2", "right"] },
    ],
    spikes: [],
    coins: [],
    spawnPoint: { x: 100, y: 656 },
    finish: { x: 150, y: 64, width: 60, height: 60, color: "yellow" },
    flipSquare: { enabled: false },
  };

  function loadLevel() {
    fetch(`levels/${selectedLevel}.json`)
      .then((res) => {
        if (!res.ok)
          throw new Error(
            `Failed to load levels/${selectedLevel}.json: ${res.status}`
          );
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
            : ["left", "center1", "center2", "right"]
        }));
        spikes = level.spikes || [];
        coins = level.coins || [];
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
          };
        } else {
          flipSquare = { enabled: false };
        }
        player.x = spawnPoint.x;
        player.y = spawnPoint.y - player.height;
        console.log(`Loaded level: ${selectedLevel}, width: ${levelWidth}, platforms: ${platforms.length}, player.y: ${player.y}`);
      })
      .catch((error) => {
        console.error("Error loading level:", error);
        levelWidth = fallbackLevel.width;
        platforms = fallbackLevel.platforms;
        spikes = fallbackLevel.spikes;
        coins = fallbackLevel.coins;
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
          soundCrouch
            .play()
            .catch((e) => console.error("Failed to play crouch sound:", e));
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
      console.log(
        "Jump triggered, velY:",
        player.velY,
        "flipped:",
        flipSquare.enabled ? flipSquare.flipped : false
      );
      if (soundJump) {
        soundJump.currentTime = 0;
        soundJump
          .play()
          .catch((e) => console.error("Failed to play jump sound:", e));
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
      bBox.height =
        b.height *
        (b.type === "big" ? spikeBigHitboxScaleY : spikeSmallHitboxScaleY);
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
    }
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
    for (const platform of platforms) {
      if (checkCollision(player, platform)) {
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
      if (checkCollision(player, coin)) {
        player.coinsCollected++;
        return false;
      }
      return true;
    });

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > levelWidth)
      player.x = levelWidth - player.width;

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

    if (flipSquare.enabled && checkCollision(player, flipSquare)) {
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

      // Draw background layers
      if (backgroundFar.complete && backgroundFar.naturalWidth !== 0) {
        const farOffset = (cameraX * parallaxFar) % levelWidth;
        ctx.drawImage(backgroundFar, -farOffset, 0, levelWidth, canvas.height);
        ctx.drawImage(backgroundFar, -farOffset + levelWidth, 0, levelWidth, canvas.height);
      }
      if (backgroundMid.complete && backgroundMid.naturalWidth !== 0) {
        const midBgOffset = (cameraX * parallaxMidBg) % levelWidth;
        ctx.drawImage(backgroundMid, -midBgOffset, 0, levelWidth, canvas.height);
        ctx.drawImage(backgroundMid, -midBgOffset + levelWidth, 0, levelWidth, canvas.height);
      }
      if (foregroundMid.complete && foregroundMid.naturalWidth !== 0) {
        const midFgOffset = (cameraX * parallaxMidFg) % levelWidth;
        ctx.drawImage(foregroundMid, -midFgOffset, 0, levelWidth, canvas.height);
        ctx.drawImage(foregroundMid, -midFgOffset + levelWidth, 0, levelWidth, canvas.height);
      }
      if (foregroundNear.complete && foregroundNear.naturalWidth !== 0) {
        const nearOffset = (cameraX * parallaxNear) % levelWidth;
        ctx.drawImage(foregroundNear, -nearOffset, 0, levelWidth, canvas.height);
        ctx.drawImage(foregroundNear, -nearOffset + levelWidth, 0, levelWidth, canvas.height);
      }
      if (foregroundStationary.complete && foregroundStationary.naturalWidth !== 0) {
        const stationaryOffset = (cameraX * parallaxStationary) % levelWidth;
        ctx.drawImage(foregroundStationary, -stationaryOffset, 0, levelWidth, canvas.height);
        ctx.drawImage(foregroundStationary, -stationaryOffset + levelWidth, 0, levelWidth, canvas.height);
      }

      // Draw platforms
      const tileImages = {
        left: platformLeftImg,
        center1: platformCenter1Img,
        center2: platformCenter2Img,
        right: platformRightImg
      };

      for (const platform of platforms) {
        ctx.save();
        ctx.translate(platform.x, platform.y);
        if (flipSquare.enabled && flipSquare.flipped) {
          ctx.translate(platform.width / 2, platform.height / 2);
          ctx.rotate(Math.PI);
          ctx.translate(-platform.width / 2, -platform.height / 2);
        }
        if (!platform.tilePattern || platform.width < 100) {
          ctx.fillStyle = "green";
          ctx.fillRect(0, 0, platform.width, platform.height);
        } else {
          const tileWidth = 100;
          const tileHeight = platform.height;
          let currentX = 0;
          for (const tileType of platform.tilePattern) {
            const img = tileImages[tileType];
            if (img && img.complete && img.naturalWidth !== 0) {
              ctx.drawImage(img, currentX, 0, tileWidth, tileHeight);
            } else {
              ctx.fillStyle = "green";
              ctx.fillRect(currentX, 0, tileWidth, tileHeight);
            }
            currentX += tileWidth;
            if (currentX >= platform.width) break;
          }
          while (currentX < platform.width) {
            ctx.fillStyle = "green";
            const remainingWidth = Math.min(tileWidth, platform.width - currentX);
            ctx.fillRect(currentX, 0, remainingWidth, tileHeight);
            currentX += tileWidth;
          }
        }
        ctx.restore();
      }

      // Draw coins
      for (const coin of coins) {
        if (coinImg.complete && coinImg.naturalWidth !== 0) {
          ctx.drawImage(coinImg, coin.x, coin.y, coin.width, coin.height);
        } else {
          ctx.fillStyle = "yellow";
          ctx.fillRect(coin.x, coin.y, coin.width, coin.height);
        }
      }

      // Draw spikes
      for (const spike of spikes) {
        let img = spike.type === "big" ? spikeImgBig : spikeImgSmall;
        const isUp = spike.direction === "up";
        if (img.complete && img.naturalWidth !== 0) {
          ctx.save();
          if (isUp) {
            ctx.drawImage(img, spike.x, spike.y, spike.width, spike.height);
          } else {
            ctx.translate(
              spike.x + spike.width / 2,
              spike.y + spike.height / 2
            );
            ctx.rotate(Math.PI);
            ctx.drawImage(
              img,
              -spike.width / 2,
              -spike.height / 2,
              spike.width,
              spike.height
            );
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

      // Draw flip square and finish
      if (flipSquare.enabled) {
        ctx.fillStyle = flipSquare.color;
        ctx.fillRect(
          flipSquare.x,
          flipSquare.y,
          flipSquare.width,
          flipSquare.height
        );
      }

      ctx.fillStyle = finish.color;
      ctx.fillRect(
        finish.x,
        finish.y,
        finish.width,
        finish.height
      );

      // Draw ghost
      if (ghost.active && ghost.currentHistoryIndex >= 0 && ghost.histories[ghost.currentHistoryIndex].length > 0 && (player.showDeathScreen || ghost.lifeCount < 5)) {
        const ghostState = ghost.histories[ghost.currentHistoryIndex][ghost.currentFrame % ghost.histories[ghost.currentHistoryIndex].length];
        let imgToDraw;
        let spriteFacing = (flipSquare.enabled && ghostState.flipped)
          ? ghostState.facing === "left"
            ? "right"
            : "left"
          : ghostState.facing;

        if (ghostState.jumping) {
          imgToDraw =
            spriteFacing === "left" ? playerImgJumpLeft : playerImgJumpRight;
        } else if (ghostState.crouching) {
          imgToDraw =
            spriteFacing === "left" ? playerImgCrouchLeft : playerImgCrouchRight;
        } else if (ghostState.walkFrame !== 0) {
          if (spriteFacing === "left") {
            imgToDraw =
              ghostState.walkFrame === 0
                ? playerImgWalkLeft1
                : playerImgWalkLeft2;
          } else {
            imgToDraw =
              ghostState.walkFrame === 0
                ? playerImgWalkRight1
                : playerImgWalkRight2;
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
            ctx.translate(
              ghostState.x + player.width / 2,
              ghostState.y + player.height / 2
            );
            ctx.rotate(Math.PI);
            ctx.drawImage(
              imgToDraw,
              -player.width / 2,
              -player.height / 2,
              player.width,
              player.height
            );
          } else {
            ctx.drawImage(
              imgToDraw,
              ghostState.x,
              ghostState.y,
              player.width,
              player.height
            );
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
        ? facing === "left"
          ? "right"
          : "left"
        : facing;
      let imgToDraw;
      if (player.isDying) {
        if (player.deathFrame === 0) imgToDraw = deathImg1;
        else if (player.deathFrame === 1) imgToDraw = deathImg2;
        else imgToDraw = deathImg3;
      } else if (jumping) {
        imgToDraw =
          spriteFacing === "left" ? playerImgJumpLeft : playerImgJumpRight;
      } else if (crouching) {
        imgToDraw =
          spriteFacing === "left" ? playerImgCrouchLeft : playerImgCrouchRight;
      } else if ((keys["a"] || keys["d"]) && player.grounded) {
        if (spriteFacing === "left") {
          imgToDraw =
            walkFrame === 0 ? playerImgWalkLeft1 : playerImgWalkLeft2;
        } else {
          imgToDraw =
            walkFrame === 0 ? playerImgWalkRight1 : playerImgWalkRight2;
        }
      } else if (spriteFacing === "left") {
        imgToDraw = playerImgLeft;
      } else {
        imgToDraw = playerImgRight;
      }

      if (imgToDraw.complete && imgToDraw.naturalWidth !== 0) {
        ctx.save();
        if (flipSquare.enabled && flipSquare.flipped) {
          ctx.translate(
            player.x + player.width / 2,
            player.y + player.height / 2
          );
          ctx.rotate(Math.PI);
          ctx.drawImage(
            imgToDraw,
            -player.width / 2,
            -player.height / 2,
            player.width,
            player.height
          );
        } else {
          ctx.drawImage(
            imgToDraw,
            player.x,
            player.y,
            player.width,
            player.height
          );
        }
        ctx.restore();
      } else {
        ctx.fillStyle = "red";
        ctx.fillRect(player.x, player.y, player.width, player.height);
      }

      ctx.restore();

      // Draw UI
      if (!player.showDeathScreen && !player.finished) {
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(`Coins: ${player.coinsCollected}`, 10, 30);
        ctx.fillText(`Deaths: ${player.deaths}`, 10, 60);
        ctx.fillText(`Level: ${selectedLevel}`, 10, 90);
      } else if (player.showDeathScreen) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.filter = "none";
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`You Died!`, canvas.width / 2, canvas.height / 2 - 60);
        ctx.fillText(
          currentDeathMessage,
          canvas.width / 2,
          canvas.height / 2 - 30
        );
        ctx.fillText(
          `Coins: ${player.coinsCollected}`,
          canvas.width / 2,
          canvas.height / 2
        );
        ctx.fillText(
          `Deaths: ${player.deaths}`,
          canvas.width / 2,
          canvas.height / 2 + 30
        );
        ctx.fillText(
          `Press any key to continue`,
          canvas.width / 2,
          canvas.height / 2 + 60
        );
        ctx.textAlign = "left";
      } else if (player.finished) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.filter = "none";
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`You Win!`, canvas.width / 2, canvas.height / 2 - 60);
        ctx.fillText(
          `Congratulations, you reached the finish!`,
          canvas.width / 2,
          canvas.height / 2 - 30
        );
        ctx.fillText(
          `Coins: ${player.coinsCollected}`,
          canvas.width / 2,
          canvas.height / 2
        );
        ctx.fillText(
          `Deaths: ${player.deaths}`,
          canvas.width / 2,
          canvas.height / 2 + 30
        );
        ctx.fillText(
          `Press any key to play next level`,
          canvas.width / 2,
          canvas.height / 2 + 60
        );
        ctx.textAlign = "left";
      }

      applyCornerBlur();
      ctx.filter = "none";
    } catch (e) {
      console.error("Error in draw function:", e);
    }
  }

  function update() {
    updatePlayer();
    updateGhost();
  }
    function loop() {
    try {
      update();
      draw();
      requestAnimationFrame(loop);
    } catch (e) {
      console.error("Error in game loop:", e);
    }
  }
  console.log("Starting game loop");
  loop();

  
};
