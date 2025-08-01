window.onload = function () {
  // Level width (loaded from JSON)
  let levelWidth = 2400;
  let worldHeight;

  // Hitbox scaling variables
  const playerHitboxScaleX = 0.1;
  const playerHitboxScaleY = 0.8;
  const spikeSmallHitboxScaleY = 0.5;
  const spikeBigHitboxScaleY = 0.25;

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
    finished: false,
  };

  // Flip square (loaded from JSON)
  let flipSquare = {
    x: levelWidth - 80,
    y: 620,
    width: 60,
    height: 60,
    color: "blue",
    flipped: false,
    enabled: true,
  };

  // Finish area (loaded from JSON)
  let finish = {
    x: levelWidth - 140,
    y: 620,
    width: 60,
    height: 60,
    color: "yellow",
  };

  // Ghost properties
  const ghost = {
    histories: [],
    currentHistoryIndex: -1,
    currentFrame: 0,
    opacity: 0.3,
    active: false,
    lifeCount: 0,
  };

  // Death screen dialogs
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

  // Current death screen message
  let currentDeathMessage = "";

  // Get canvas and context
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

  // Set canvas size to browser window and update world height
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    worldHeight = canvas.height;
    player.y = worldHeight / 2 - player.height / 2;
    if (flipSquare.enabled) {
      flipSquare.y = worldHeight - flipSquare.height;
    }
    finish.y = worldHeight - finish.height;
    console.log(
      `Canvas resized: ${canvas.width}x${canvas.height}, player.y: ${player.y}`
    );
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Camera for scrolling
  let cameraX = 0;

  // Load images with error handling
  const caveBackground = new Image();
  caveBackground.src = "sprites/background.png";
  caveBackground.onerror = () =>
    console.error("Failed to load sprites/background.png");

  const coinImg = new Image();
  coinImg.src = "sprites/coin.png";
  coinImg.onerror = () => console.error("Failed to load sprites/coin.png");

  const deathImg1 = new Image();
  deathImg1.src = "sprites/death1.png";
  deathImg1.onerror = () => console.error("Failed to load sprites/death1.png");
  const deathImg2 = new Image();
  deathImg2.src = "sprites/death2.png";
  deathImg2.onerror = () => console.error("Failed to load sprites/death2.png");
  const deathImg3 = new Image();
  deathImg3.src = "sprites/death3.png";
  deathImg3.onerror = () => console.error("Failed to load sprites/death3.png");

  const playerImgRight = new Image();
  playerImgRight.src = "sprites/player.png";
  playerImgRight.onerror = () =>
    console.error("Failed to load sprites/player.png");
  const playerImgLeft = new Image();
  playerImgLeft.src = "sprites/playerLeft.png";
  const playerImgWalkRight1 = new Image();
  playerImgWalkRight1.src = "sprites/walk1.png";
  const playerImgWalkRight2 = new Image();
  playerImgWalkRight2.src = "sprites/walk2.png";
  const playerImgWalkLeft1 = new Image();
  playerImgWalkLeft1.src = "sprites/walk1Left.png";
  const playerImgWalkLeft2 = new Image();
  playerImgWalkLeft2.src = "sprites/walk2Left.png";
  const playerImgJumpRight = new Image();
  playerImgJumpRight.src = "sprites/jump.png";
  const playerImgJumpLeft = new Image();
  playerImgJumpLeft.src = "sprites/jumpLeft.png";
  const playerImgCrouchRight = new Image();
  playerImgCrouchRight.src = "sprites/crouchRight.png";
  const playerImgCrouchLeft = new Image();
  playerImgCrouchLeft.src = "sprites/crouchLeft.png";

  const spikeImgSmall = new Image();
  spikeImgSmall.src = "sprites/Spikes.png";
  spikeImgSmall.onerror = () =>
    console.error("Failed to load sprites/Spikes.png");
  const spikeImgBig = new Image();
  spikeImgBig.src = "sprites/SpikesLong.png";
  spikeImgBig.onerror = () =>
    console.error("Failed to load sprites/SpikesLong.png");

  // Sound effects
  const soundWalk = new Audio("sounds/playerwalk.wav");
  soundWalk.volume = 0.4;
  soundWalk.playbackRate = 3;
  const soundJump = new Audio("sounds/jump.wav");
  const soundCrouch = new Audio("sounds/crouch.wav");
  soundCrouch.volume = 0.5;
  soundCrouch.playbackRate = 0.8;
  const soundBackground = new Audio("sounds/background.wav");
  soundBackground.loop = true;
  soundBackground.volume = 0.5;
  soundBackground
    .play()
    .catch((e) => console.error("Failed to play background sound:", e));

  // Level data
  let platforms = [];
  let spikes = [];
  let coins = [];
  let spawnPoint = { x: 100, y: 360 };
  let selectedLevel = localStorage.getItem("selectedLevel") || "level1";

  // Fallback level
  const fallbackLevel = {
    width: 2400,
    platforms: [
      { x: 0, y: 20, width: 2400, height: 20 },
      { x: 0, y: 720, width: 2400, height: 20 },
    ],
    spikes: [],
    coins: [],
    spawnPoint: { x: 100, y: 360 },
    finish: { x: 2260, y: 620, width: 60, height: 60, color: "yellow" },
    flipSquare: { enabled: false },
  };

  // Load level design from JSON
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
        levelWidth = level.width || 2400;
        platforms = level.platforms || [];
        spikes = level.spikes || [];
        coins = level.coins || [];
        spawnPoint = level.spawnPoint || {
          x: 100,
          y: worldHeight / 2 - player.height / 2,
        };
        finish = level.finish || {
          x: levelWidth - 140,
          y: worldHeight - 80,
          width: 60,
          height: 60,
          color: "yellow",
        };
        flipSquare = level.flipSquare || { enabled: false };
        if (flipSquare.enabled) {
          flipSquare = {
            x: flipSquare.x || levelWidth - 80,
            y: flipSquare.y || worldHeight - 80,
            width: flipSquare.width || 60,
            height: flipSquare.height || 60,
            color: flipSquare.color || "blue",
            flipped: false,
            enabled: true,
          };
        } else {
          flipSquare = { enabled: false };
        }
        player.x = spawnPoint.x;
        player.y = worldHeight / 2 - player.height / 2;
        console.log(`Loaded level: ${selectedLevel}, width: ${levelWidth}, player.y: ${player.y}`);
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
        player.y = worldHeight / 2 - player.height / 2;
        selectedLevel = "level1";
        localStorage.setItem("selectedLevel", selectedLevel);
        console.log("Using fallback level, width:", levelWidth, "player.y:", player.y);
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

  // Event listeners for key presses
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
    player.y = worldHeight / 2 - player.height / 2;
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
    if (flipSquare.enabled) {
      flipSquare.y = worldHeight - flipSquare.height;
    }
    finish.y = worldHeight - finish.height;

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
      console.log("Reached finish area at x:", finish.x);
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

      if (caveBackground.complete && caveBackground.naturalWidth !== 0) {
        ctx.drawImage(caveBackground, 0, 0, levelWidth, canvas.height);
      } else {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, levelWidth, canvas.height);
      }

      ctx.fillStyle = "green";
      for (const platform of platforms) {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      }

      for (const coin of coins) {
        if (coinImg.complete && coinImg.naturalWidth !== 0) {
          ctx.drawImage(coinImg, coin.x, coin.y, coin.width, coin.height);
        } else {
          ctx.fillStyle = "yellow";
          ctx.fillRect(coin.x, coin.y, coin.width, coin.height);
        }
      }

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