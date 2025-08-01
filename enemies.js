class Enemy {
  constructor(data, player, flipSquare, platforms, levelWidth, worldHeight) {
    this.x = data.x;
    // Align y to ground or nearest platform
    let spawnY = worldHeight - (data.height || 80); // Default to ground (y: 720 - height)
    for (const platform of platforms) {
      if (
        data.x >= platform.x &&
        data.x <= platform.x + platform.width &&
        platform.y < spawnY
      ) {
        spawnY = platform.y - (data.height || 80); // Align to platform top
      }
    }
    this.y = spawnY;
    this.width = data.width || 80;
    this.height = data.height || 80;
    this.type = data.type || "shooter";
    this.direction = data.direction || "right";
    this.velX = this.type === "sentry" ? 0 : (this.direction === "right" ? (this.type === "spider" ? 1.5 : 2) : (this.type === "spider" ? -1.5 : -2));
    this.velY = 0;
    this.speed = this.type === "spider" ? 1.5 : 2;
    this.grounded = false;
    this.patrolRange = this.type === "sentry" ? 0 : 100;
    this.spawnX = data.x;
    this.shootTimer = 0;
    this.shootInterval = 120; // 2 seconds at 60 FPS
    this.walkFrame = 0;
    this.walkTimer = 0;
    this.walkFrameRate = 10;
    this.isAttacking = false;
    this.attackFrame = 0;
    this.projectiles = [];
    this.player = player;
    this.flipSquare = flipSquare;
    this.platforms = platforms;
    this.levelWidth = levelWidth;
    this.worldHeight = worldHeight;

    // Load sprites
    const spritePath = `sprites/enemies/${this.type.toLowerCase()}/`;
    this.spriteIdle = new Image();
    this.spriteIdle.src = `${spritePath}idle.png`;
    this.spriteIdleLeft = new Image();
    this.spriteIdleLeft.src = `${spritePath}idle_left.png`;
    this.spriteWalk1 = new Image();
    this.spriteWalk1.src = `${spritePath}walk1.png`;
    this.spriteWalk1Left = new Image();
    this.spriteWalk1Left.src = `${spritePath}walk1_left.png`;
    this.spriteWalk2 = new Image();
    this.spriteWalk2.src = `${spritePath}walk2.png`;
    this.spriteWalk2Left = new Image();
    this.spriteWalk2Left.src = `${spritePath}walk2_left.png`;
    this.spriteAttack = new Image();
    this.spriteAttack.src = `${spritePath}attack.png`;
    this.spriteAttackLeft = new Image();
    this.spriteAttackLeft.src = `${spritePath}attack_left.png`;
    this.projectileImg = new Image();
    this.projectileImg.src = "sprites/enemies/projectile.png";

    // Load sound
    this.shootSound = new Audio("sounds/enemy_shoot.wav");
    this.shootSound.volume = 0.5;
  }

  update(checkCollision, gravity, friction) {
    // Update movement
    if (this.type !== "sentry") {
      if (this.x <= this.spawnX - this.patrolRange) {
        this.velX = this.speed;
        this.direction = "right";
      } else if (this.x >= this.spawnX + this.patrolRange) {
        this.velX = -this.speed;
        this.direction = "left";
      }
    }

    this.velY += (this.flipSquare.enabled && this.flipSquare.flipped) ? -gravity : gravity;
    this.velX *= friction;
    this.x += this.velX;
    this.y += this.velY;

    // Bound within level
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > this.levelWidth) this.x = this.levelWidth - this.width;

    // Platform collision
    this.grounded = false;
    for (const platform of this.platforms) {
      if (checkCollision(this, platform)) {
        if (this.flipSquare.enabled && this.flipSquare.flipped) {
          if (this.velY <= 0 && this.y - this.velY >= platform.y + platform.height) {
            this.y = platform.y + platform.height;
            this.velY = 0;
            this.grounded = true;
          }
        } else {
          if (this.velY >= 0 && this.y + this.height - this.velY <= platform.y) {
            this.y = platform.y - this.height;
            this.velY = 0;
            this.grounded = true;
          }
        }
      }
    }

    // Ground/ceiling collision
    if (this.flipSquare.enabled && this.flipSquare.flipped) {
      if (this.y + this.height > this.worldHeight) {
        this.y = this.worldHeight - this.height;
        this.velY = 0;
        this.grounded = true;
      }
    } else {
      if (this.y < 0) {
        this.y = 0;
        this.velY = 0;
        this.grounded = true;
      }
    }

    // Update walk animation
    if (Math.abs(this.velX) > 0.1 && this.grounded) {
      this.walkTimer++;
      if (this.walkTimer > this.walkFrameRate) {
        this.walkFrame = (this.walkFrame + 1) % 2;
        this.walkTimer = 0;
      }
    } else {
      this.walkFrame = 0;
      this.walkTimer = 0;
    }

    // Shooting logic
    this.shootTimer++;
    if (this.shootTimer >= this.shootInterval) {
      this.shootTimer = 0;
      this.isAttacking = true;
      this.attackFrame = 0;
      const projectileSpeed = 5;
      if (this.type === "conjurer") {
        this.projectiles.push({
          x: this.x + this.width / 2,
          y: this.y + this.height / 2,
          velX: -projectileSpeed,
          velY: 0,
          width: 20,
          height: 20,
        });
        this.projectiles.push({
          x: this.x + this.width / 2,
          y: this.y + this.height / 2,
          velX: projectileSpeed,
          velY: 0,
          width: 20,
          height: 20,
        });
      } else if (this.type === "spider") {
        this.projectiles.push({
          x: this.x + this.width / 2,
          y: this.y + this.height / 2,
          velX: -projectileSpeed,
          velY: 0,
          width: 20,
          height: 20,
        });
      } else if (this.type === "sentry") {
        const dx = this.player.x + this.player.width / 2 - (this.x + this.width / 2);
        const dy = this.player.y + this.player.height / 2 - (this.y + this.height / 2);
        const angle = Math.atan2(dy, dx);
        this.projectiles.push({
          x: this.x + this.width / 2,
          y: this.y + this.height / 2,
          velX: Math.cos(angle) * projectileSpeed,
          velY: Math.sin(angle) * projectileSpeed,
          width: 20,
          height: 20,
        });
      }
      if (this.shootSound) {
        this.shootSound.currentTime = 0;
        this.shootSound.play().catch((e) => console.error("Failed to play shoot sound:", e));
      }
    }

    // Update attack animation
    if (this.isAttacking) {
      this.attackFrame++;
      if (this.attackFrame > 15) this.isAttacking = false;
    }

    // Update projectiles
    this.projectiles = this.projectiles.filter((p) => {
      p.x += p.velX;
      p.y += p.velY;
      return p.x >= 0 && p.x <= this.levelWidth && p.y >= 0 && p.y <= this.worldHeight;
    });
  }

  draw(ctx, cameraX, flipSquare) {
    ctx.save();
    ctx.translate(-cameraX, 0);

    // Draw projectiles
    for (const projectile of this.projectiles) {
      if (this.projectileImg.complete && this.projectileImg.naturalWidth !== 0) {
        ctx.drawImage(this.projectileImg, projectile.x, projectile.y, projectile.width, projectile.height);
      } else {
        ctx.fillStyle = "orange";
        ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
      }
    }

    // Select sprite
    let spriteFacing = (flipSquare.enabled && flipSquare.flipped)
      ? this.direction === "left" ? "right" : "left"
      : this.direction;
    let imgToDraw;
    if (this.isAttacking) {
      imgToDraw = spriteFacing === "left" ? this.spriteAttackLeft : this.spriteAttack;
    } else if (Math.abs(this.velX) > 0.1 && this.grounded && this.type !== "sentry") {
      if (spriteFacing === "left") {
        imgToDraw = this.walkFrame === 0 ? this.spriteWalk1Left : this.spriteWalk2Left;
      } else {
        imgToDraw = this.walkFrame === 0 ? this.spriteWalk1 : this.spriteWalk2;
      }
    } else {
      imgToDraw = spriteFacing === "left" ? this.spriteIdleLeft : this.spriteIdle;
    }

    // Draw enemy
    if (imgToDraw.complete && imgToDraw.naturalWidth !== 0) {
      ctx.save();
      if (flipSquare.enabled && flipSquare.flipped) {
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(Math.PI);
        ctx.drawImage(imgToDraw, -this.width / 2, -this.height / 2, this.width, this.height);
      } else {
        ctx.drawImage(imgToDraw, this.x, this.y, this.width, this.height);
      }
      ctx.restore();
    } else {
      ctx.fillStyle = "purple";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    ctx.restore();
  }
}

window.Enemy = Enemy;