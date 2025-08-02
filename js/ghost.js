// Ghost properties
const ghost = {
  histories: [], // Array to store history for each life
  currentHistoryIndex: -1, // Index of history being replayed
  currentFrame: 0,
  opacity: 0.3,
  active: false,
  lifeCount: 0, // Tracks lives where ghost should appear
};

function updateGhost() {
  if (player.showDeathScreen) {
    if (ghost.active && ghost.currentHistoryIndex >= 0 && ghost.histories[ghost.currentHistoryIndex].length > 0) {
      ghost.currentFrame = (ghost.currentFrame + 1) % ghost.histories[ghost.currentHistoryIndex].length;
    }
    return;
  }

  // Record player state for current life's history
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
    flipped: flipSquare.flipped,
  });

  // Update ghost frame during gameplay if active and within life limit
  if (ghost.active && ghost.lifeCount < 5 && ghost.currentHistoryIndex >= 0 && ghost.histories[ghost.currentHistoryIndex].length > 0) {
    ghost.currentFrame = (ghost.currentFrame + 1) % ghost.histories[ghost.currentHistoryIndex].length;
  }
}