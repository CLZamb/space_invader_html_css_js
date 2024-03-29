function tick() {
  let now = Date.now();
  let dt = now - GameManager.lastUpdated;
  GameManager.lastUpdated = now;
  GameManager.fps = parseInt(1000 / dt);

  $('#divFPS').text('FPS:' + GameManager.fps);

  GameManager.enemies.update(dt);

  if (GameManager.enemies.gameOver == true) {
    console.log('game over');
    showGameOver();
  } else {
    GameManager.bullets.update(dt);
    GameManager.player.update(dt);
    if (GameManager.player.lives <= 0) {
      console.log('game over');
      showGameOver();
    } else if (GameManager.phase == GameSettings.gamePhase.playing) {
      setTimeout(tick, GameSettings.targetFPS);
    }
  }
}

function setCountDownValue(val) {
  playSound('countdown');
  writeMessage(val);
}

function runCountDown() {
  createStars();
  GameManager.phase = GameSettings.gamePhase.countdownToStart;
  writeMessage(3);
  playSound('countdown');
  for (let i = 0; i < GameSettings.countDownValues.length; ++i) {
    setTimeout(setCountDownValue, GameSettings.countdownGap * (i + 1),
      GameSettings.countDownValues[i]);
  }
  setTimeout(endCountDown,
    (GameSettings.countDownValues.length + 1) * GameSettings.countdownGap);
}

function clearTimeouts() {
  for (let i = 0; i < GameManager.timeouts.length; ++i) {
    clearTimeout(GameManager.timeouts[i]);
  }
  GameManager.timeouts = [];
}

function showGameOver() {
  GameManager.phase = GameSettings.gameOver;

  pauseStars();
  clearTimeouts();

  if (GameManager.enemies.gameOver == true) {
    playSound('completed');
  } else {
    playSound('gameover');
  }

  writeMessage('Game Over');
  setTimeout(function() { appendMessage('Press Space to Reset');},
    GameSettings.pressSpaceDelay);
}

function endCountDown() {
  clearMessage();
  playSound('go');
  GameManager.phase = GameSettings.gamePhase.playing;
  GameManager.lastUpdated = Date.now();

  setTimeout(tick, GameSettings.targetFPS);
}

function writeMessage(text) {
  clearMessage();
  appendMessage(text);
}

function appendMessage(text) {
  $('#messageContainer').append('<div class="message">' + text + '</div>');
}

function clearMessage() {
  $('#messageContainer').empty();
}

function resetButtets() {
  if (GameManager.bullets != undefined) {
    GameManager.bullets.reset();
  } else {
    GameManager.bullets = new BulletCollection(GameManager.player);
  }
}

function resetEnemies() {
    if (GameManager.enemies != undefined) {
        GameManager.enemies.reset();
    } else {
        GameManager.enemies = new EnemyCollection(GameManager.player,
            GameManager.bullets,
            GameManager.explosions);
    }
}

function resetPlayer() {
  if (GameManager.player == undefined) {
    let asset = GameManager.assets['player_ship'];

    GameManager.player = new Player(GameSettings.playerDivName,
      new Point(GameSettings.playerStart.x, GameSettings.playerStart.y),
      asset,
      new Rect(40, 40, GameSettings.playAreaWidth - 60, GameSettings.playAreaHeight - 60)
    );

    GameManager.player.addToBoard(true);
  }
  console.log('resetPlayer() GameManager.player:', GameManager.player);
  GameManager.player.reset();
}

function resetExplosions() {
  GameManager.explosions = new Explosions('Explosion/explosion00_s');
}

function resetGame() {
  console.log("Main Game init()");
  clearTimeouts();
  removeStars();
  resetPlayer();
  resetButtets();
  resetExplosions();
  resetEnemies();

  GameManager.phase = GameSettings.gamePhase.readyToplay;
  GameManager.lastUpdated = Date.now();
  GameManager.elapsedTime = 0;
  writeMessage("Press Space To Start");
}

function processAsset(indexNum) {
  var img = new Image();
  var fileName = "assets/" + ImageFiles[indexNum] + '.png';
  img.src = fileName;
  img.onload = function() {
    GameManager.assets[ImageFiles[indexNum]] = {
      width: this.width,
      height: this.height,
      fileName: fileName
    };

    indexNum++;
    if (indexNum < ImageFiles.length) {
      processAsset(indexNum);
    } else {
      console.log("Assets Done:", GameManager.assets);
      resetGame()
    }
  }
}

$(function () {
  console.log('ready..!');
  console.log("GameSettings:GameSettings", GameSettings);
  initSounds();
  setUpSequences();
  $(document).keydown(function (e) {
    if(GameManager.phase == GameSettings.gamePhase.readyToplay) {
      if (e.which == GameSettings.keyPress.space) {
        runCountDown();
      }
    } else if (GameManager.phase == GameSettings.gamePhase.playing) {
      switch (e.which) {
        case GameSettings.keyPress.up:
          GameManager.player.move(0, direction.up);
          break;
        case GameSettings.keyPress.down:
          GameManager.player.move(0, direction.down);
          break;
        case GameSettings.keyPress.left:
          GameManager.player.move(direction.left, 0);
          break;
        case GameSettings.keyPress.right:
          GameManager.player.move(direction.right, 0);
          break;
      }
    } else if(GameManager.phase == GameSettings.gameOver) {
      if (e.which == GameSettings.keyPress.space) {
        resetGame();
      }
    }
  });
  processAsset(0);
});
