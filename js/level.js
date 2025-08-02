// Level data
let platforms = [];
let spikes = [];
let coins = [];
let spawnPoint = { x: 100, y: 360 };

// Fallback level
const fallbackLevel = {
  platforms: [
    { x: 0, y: 20, width: 2400, height: 20 },
    { x: 0, y: 720, width: 2400, height: 20 },
  ],
  spikes: [],
  coins: [],
  spawnPoint: { x: 100, y: 360 },
};

// Load level design from JSON
function loadLevel() {
  const selectedLevel = localStorage.getItem("selectedLevel") || "level1";
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
      player.y = worldHeight / 2 - player.height / 2;
      console.log(`Loaded level: ${selectedLevel}, player.y: ${player.y}`);
    })
    .catch((error) => {
      console.error("Error loading level:", error);
      platforms = fallbackLevel.platforms;
      spikes = fallbackLevel.spikes;
      coins = fallbackLevel.coins;
      spawnPoint = fallbackLevel.spawnPoint;
      player.x = spawnPoint.x;
      player.y = worldHeight / 2 - player.height / 2;
      console.log("Using fallback level, player.y: ${player.y}");
    });
}
loadLevel();