window.onload = function () {
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
    flipSquare.y = worldHeight - 80;
    console.log(
      `Canvas resized: ${canvas.width}x${canvas.height}, player.y: ${player.y}`
    );
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Event listeners for key presses
  document.addEventListener("keydown", (e) => {
    if (player.isDying || player.showDeathScreen) {
      if (player.showDeathScreen) {
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