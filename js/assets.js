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