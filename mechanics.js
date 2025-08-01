window.onload = function () {
  // Configurable background and world width
  const backgroundWidth = 2400;
  let worldHeight;

  // Hitbox scaling variables
  const playerHitboxScaleX = 0.1;
  const playerHitboxScaleY = 0.8;
  const spikeSmallHitboxScaleY = 0.5;
  const spikeBigHitboxScaleY = 0.25;

  // Player properties
  const player = {
    x: 100,
    y: 360, // Placeholder, will be set to worldHeight / 2 - height / 2 after canvas initialization
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
    y: 620, // Will be set to worldHeight - 80 after canvas initialization
    width: 60,
    height: 60,
    color: "blue",
    flipped: false, // Start with normal gravity
  };

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
    player.y = worldHeight / 2 - player.height / 2; // Center player on y-axis
    flipSquare.y = worldHeight - 80;
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
  playerImgCrouchLeft.src = "sprites/CrouchLeft.png";

  const spikeImgSmall = new Image();
  spikeImgSmall.src = "sprites/Spikes.png";
  spikeImgSmall.onerror = () =>
    console.error("Failed to load sprites/Spikes.png");
  const spikeImgBig = new Image();
  spikeImgBig.src = "sprites/SpikesLong.png";
  spikeImgBig.onerror = () =>
    console.error("Failed to load sprites/SpikesLong.png");

  // Sound effects
  const soundWalk = new Audio("sounds/walking.mp3");
  soundWalk.volume = 0.2;
  soundWalk.playbackRate = 1.5;
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

  // Get selected level from localStorage (default to 'level1')
  const selectedLevel = localStorage.getItem("selectedLevel") || "level1";

  // Level data
  let platforms = [];
  let spikes = [];
  let coins = [];
  let spawnPoint = { x: 100, y: 360 }; // Placeholder, y will be updated dynamically

  // Fallback level
  const fallbackLevel = {
    platforms: [
      { x: 0, y: 20, width: 2400, height: 20 },
      { x: 0, y: 720, width: 2400, height: 20 },
    ],
    spikes: [],
    coins: [],
    spawnPoint: { x: 100, y: 360 }, // Placeholder, y will be updated
  };

  // Load level design from JSON
  fetch(`levels/${selectedLevel}.json`)
    .then((res) => {
      if (!res.ok)
        throw new Error(
          `Failed to load levels/${selectedLevel}.json: ${res.status}`
        );
      return res.json();
    })
    .then((level) => {
      platforms = level.platforms || [];
      spikes = level.spikes || [];
      coins = level.coins || [];
      spawnPoint = level.spawnPoint || {
        x: 100,
        y: worldHeight / 2 - player.height / 2,
      };
      player.x = spawnPoint.x;
      player.y = worldHeight / 2 - player.height / 2; // Center player on y-axis
      console.log(`Loaded level: ${selectedLevel}, player.y: ${player.y}`);
    })
    .catch((error) => {
      console.error("Error loading level:", error);
      platforms = fallbackLevel.platforms;
      spikes = fallbackLevel.spikes;
      coins = fallbackLevel.coins;
      spawnPoint = fallbackLevel.spawnPoint;
      player.x = spawnPoint.x;
      player.y = worldHeight / 2 - player.height / 2; // Center player on y-axis
      console.log("Using fallback level, player.y: ${player.y}");
    });

  let facing = "right";
  let jumping = false;
  let wWasPressed = false;
  let crouching = false;

  // Walking animation state
  let walkFrame = 0;
  let walkTimer = 0;
  const walkFrameRate = 10;

  const gravity = 0.7;
  const friction = 0.8;
  const keys = {};

  // Event listeners for key presses
  document.addEventListener("keydown", (e) => {
    if (player.isDying || player.showDeathScreen) {
      if (player.showDeathScreen) {
        player.x = spawnPoint.x;
        player.y = worldHeight / 2 - player.height / 2; // Respawn at y-center
        player.velX = 0;
        player.velY = 0;
        player.isDying = false;
        player.deathTimer = 0;
        player.deathFrame = 0;
        player.showDeathScreen = false;
        flipSquare.flipped = false;
        jumping = false;
        crouching = false;
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

  document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    keys[key] = true;

    if (key === "a") facing = "left";
    if (key === "d") facing = "right";
  });

  document.addEventListener("keyup", (e) => {
    if (player.isDying || player.showDeathScreen) return;
    const key = e.key.toLowerCase();
    keys[key] = false;
    if ((e.code === "Space" || key === "w") && player.grounded) {
      e.preventDefault();
      if (crouching) crouching = false;

      // FIX: make jump direction correct
      player.velY = flipSquare.flipped ? player.jumpPower : -player.jumpPower;

      player.grounded = false;
      jumping = true;
      console.log(
        "Jump triggered, velY:",
        player.velY,
        "flipped:",
        flipSquare.flipped
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

  function update() {
    flipSquare.y = worldHeight - 80;

    if (player.isDying) {
      player.deathTimer++;
      if (player.deathTimer < 30) {
        if (player.deathTimer % 10 === 0) {
          player.deathFrame = (player.deathFrame + 1) % 3;
        }
      } else if (player.deathTimer >= 60) {
        player.showDeathScreen = true;
        player.deaths++;
      }
      return;
    }

    if (player.showDeathScreen) return;

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
      player.velX = -player.speed; // Always move left on screen
      facing = "left";
    } else if (keys["d"]) {
      player.velX = player.speed; // Always move right on screen
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

    // Check ground/ceiling collision
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

  function draw() {
    try {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw fallback rectangle
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (player.showDeathScreen) {
        ctx.filter = "blur(5px)";
      }

      ctx.save();
      ctx.translate(-cameraX, 0);

      if (caveBackground.complete && caveBackground.naturalWidth !== 0) {
        ctx.drawImage(caveBackground, 0, 0, backgroundWidth, canvas.height);
      } else {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, backgroundWidth, canvas.height);
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
        const isFlipped = flipSquare.flipped;
        if (img.complete && img.naturalWidth !== 0) {
          ctx.save();
          if ((!isUp && !isFlipped) || (isUp && isFlipped)) {
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
          } else {
            ctx.drawImage(img, spike.x, spike.y, spike.width, spike.height);
          }
          ctx.restore();
        } else {
          ctx.fillStyle = "gray";
          ctx.beginPath();
          if ((!isUp && !isFlipped) || (isUp && isFlipped)) {
            ctx.moveTo(spike.x, spike.y + spike.height);
            ctx.lineTo(spike.x + spike.width / 2, spike.y);
            ctx.lineTo(spike.x + spike.width, spike.y + spike.height);
            ctx.closePath();
          } else {
            ctx.moveTo(spike.x, spike.y);
            ctx.lineTo(spike.x + spike.width / 2, spike.y + spike.height);
            ctx.lineTo(spike.x + spike.width, spike.y);
            ctx.closePath();
          }
          ctx.fill();
        }
      }

      ctx.fillStyle = flipSquare.color;
      ctx.fillRect(
        flipSquare.x,
        flipSquare.y,
        flipSquare.width,
        flipSquare.height
      );

      let spriteFacing = flipSquare.flipped
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
            player.walkFrame === 0 ? playerImgWalkLeft1 : playerImgWalkLeft2;
        } else {
          imgToDraw =
            player.walkFrame === 0 ? playerImgWalkRight1 : playerImgWalkRight2;
        }
      } else if (spriteFacing === "left") {
        imgToDraw = playerImgLeft;
      } else {
        imgToDraw = playerImgRight;
      }

      if (imgToDraw.complete && imgToDraw.naturalWidth !== 0) {
        ctx.save();
        if (flipSquare.flipped) {
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

      if (!player.showDeathScreen) {
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(`Coins: ${player.coinsCollected}`, 10, 30);
        ctx.fillText(`Deaths: ${player.deaths}`, 10, 60);
        ctx.fillText(`Level: ${selectedLevel}`, 10, 90);
      } else {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.filter = "none";
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`You Died!`, canvas.width / 2, canvas.height / 2 - 30);
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
      }

      ctx.filter = "none";
    } catch (e) {
      console.error("Error in draw function:", e);
    }
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

