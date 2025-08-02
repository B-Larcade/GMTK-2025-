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

function applyCornerBlur() {
  // Create a radial gradient for vignette effect
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

  // Save context state
  ctx.save();
  ctx.globalCompositeOperation = "destination-over";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function draw() {
  try {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    // Draw ghost if active and within first 5 lives or during death screen
    if (ghost.active && ghost.currentHistoryIndex >= 0 && ghost.histories[ghost.currentHistoryIndex].length > 0 && (player.showDeathScreen || ghost.lifeCount < 5)) {
      const ghostState = ghost.histories[ghost.currentHistoryIndex][ghost.currentFrame % ghost.histories[ghost.currentHistoryIndex].length];
      let imgToDraw;
      let spriteFacing = ghostState.flipped
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
        if (ghostState.flipped) {
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
    }

    // Apply corner blur effect
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