var height = window.innerHeight; 
var width = window.innerWidth; 

var config = {
    type: Phaser.AUTO,
    width: width, 
    height: height, 
    scene: {
        preload: preload, 
        update: update, 
        create: create
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: false
        }
    }
};

var game = new Phaser.Game(config);

var starTypes = ['star', 'pink_star', 'green_star'];
//  Preload images into the game 
function preload () {
    this.load.image('sky', "assets/sky.png"); 
    this.load.image('ground', 'assets/platform.png');
    this.load.image('crate', 'assets/crate.png');
    this.load.image('star', 'assets/star2.png');
    this.load.spritesheet('player', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    //  Preload all types of stars 
    for (var i = 0; i < 3; i++) {
        for (var j = 1; j <= 3; j++) {
            var starName = starTypes[i] + j.toString(); 
            this.load.image(starName, 'assets/' + starName + '.png');
        }
    }
}

var scene; 
var cursors; 
var gameStarted = false; 
var gameOver = false; 
var homeScreen;
//  Create initial game 
// TODO: instructions screen -> main game 
function create () {
    scene = this; 
    cursors = scene.input.keyboard.createCursorKeys();
    
    scene.add.image(width / 2, height / 2, 'sky').setScale(3);
    
    //  Add start screen/instructions 
    homeScreen = this.physics.add.staticGroup(); 
    var style = {color: "black", wordWrap: {width: 400}};

    var text = this.add.text(width / 2 - 200, 100, "In this game, your points are determined by the values in your 'array' of crates.", style);
    homeScreen.add(text); 
    
    homeScreen.create(width / 2 - 175, 200, 'crate').setScale(.25);
    text = this.add.text(width / 2 - 175, 225, "0"); 
    homeScreen.add(text); 
    text = this.add.text(width / 2 - 175, 163, "0", style);
    homeScreen.add(text); 
    text = this.add.text(width / 2 - 140, 170, "The black numbers above the crate represent the score in each crate. The white numbers represent the crate's index.", style);
    homeScreen.add(text); 

    text = this.add.text(width / 2 - 200, 270, "Get points by catching the falling stars! Different stars have different values and different effects. Each star will affect the crate whose index matches the 'CURRENT CRATE', which will change every time a star is collected.", style); 
    homeScreen.add(text); 

    homeScreen.create(width / 2 - 180, 425, 'star1').setScale(1.5);
    homeScreen.create(width / 2 - 180, 475, 'green_star1').setScale(1.5);
    homeScreen.create(width / 2 - 180, 525, 'pink_star1').setScale(1.5);
    
    text = this.add.text(width / 2 - 150, 410, "Yellow stars set the score in the crate to the value of the star.", style);
    homeScreen.add(text); 
    text = this.add.text(width / 2 - 150, 460, "Green stars multiply the score in a crate by the value of the star.", style);
    homeScreen.add(text); 
    text = this.add.text(width / 2 - 150, 510, "Pink stars increase the score in a crate by the value of the star.", style);
    homeScreen.add(text); 

    text = this.add.text(width / 2 - 200, 575, "Good luck, and try to maximize your score! Press space to begin!", style);
    homeScreen.add(text);
    //createLevel(); 
}

var curCrate; 
var crateText; 
var player; 
var stars; 
var crates = []; 
var crateNum = 10; 
var scores = []; 
var scoreTexts = []; 
//  Create a level with a certain number of random stars
function startGame () {
    //  Add background 
    var GROUND_WIDTH = 400;
    var ground = scene.physics.add.staticGroup(); 
    for (var start = 0; start <= width + GROUND_WIDTH; start += GROUND_WIDTH) {
        ground.create(start, height - 15, 'ground');
        ground.create(start, height - 200, 'ground');
    }

    for (var i = 0; i < crateNum; i++) {
        crates.push(scene.add.image(60 * i + 25, height - 53, 'crate').setScale(.25)); 
        scores.push(0); 
        scoreTexts[i] = scene.add.text(60 * i + 25, height - 90, scores[i], {color: "black"});
    }

    //  Setup crate numbers beneath crates 
    for (var i = 0; i < crateNum; i++) {
        scene.add.text(60 * i + 25, height - 30, "" + i);
    }

    //  Player. Animation code adapted from Phaser tutorial 
    player = scene.physics.add.sprite(width / 2, height - 300, 'player');
    scene.physics.add.collider(player, ground);

    if (gameStarted) {
        scene.anims.create({
            key: 'left',
            frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: 'turn',
            frames: [ { key: 'player', frame: 4 } ],
            frameRate: 20
        });

        scene.anims.create({
            key: 'right',
            frames: scene.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
    }
 
    //  Setup for gameplay
    stars = scene.physics.add.group();
    scene.physics.add.overlap(ground, stars, destroyStar, null, this); 
    scene.physics.add.overlap(player, stars, collectStar, null, this); 

    createLevel(); 
}

function createLevel () {
    var delay = 1000; 
    var repeat = 100; 
    curCrate = 0; 
    crateText = scene.add.text(150, height - 150, "CURRENT CRATE: 0", {color: "black", fontSize: "30px"});
    scene.time.addEvent({ delay: delay, callback: spawnObjects, callbackScope: this, repeat: repeat - 1 });
    scene.time.addEvent({ delay: delay * repeat + 5000, callback: endGame, callbackScope: this});
}

var finalScoreText; 
var restartText; 
function endGame () {
    gameOver = true; 

    var finalScore = 0; 
    for (var i = 0; i < scores.length; i++) {
        finalScore += scores[i]; 
    }
    var style = {color: "black", fontSize: '30px'};
    finalScoreText = scene.add.text(width / 2, 200, "Score: " + finalScore.toString(), style);
    finalScoreText.setX(width / 2 - finalScoreText.width / 2); 

    restartText = scene.add.text(width / 2, 300, "Press space to restart", {color: "black"});
    restartText.setX(width / 2 - restartText.width / 2);
}

//  Spawn random objects 
function spawnObjects () { 
    for (var i = 0; i < 3; i++) {
        //  Determine which type of star will be spawned 
        var starTypeIndex = Phaser.Math.Between(0, 2); 
        var starType = starTypes[starTypeIndex];
        var starValue = Phaser.Math.Between(1, 3);
        var starName = starType + starValue.toString(); 

        //  Spawn star and add data to remember effects 
        var star = stars.create(Phaser.Math.Between(0, width), 0, starName).setScale(1.5); 
        star.setData('starType', starType); 
        star.setData('starValue', starValue);
    }
}

// Response to inputs as game is played. 
function update () {
    //  Move and animate player 
    if (gameStarted && !gameOver) {
        var velocity = 200; 
        if (cursors.left.isDown) {
            player.setVelocityX(-velocity);
            player.anims.play('left', true);
        }
        else if (cursors.right.isDown) {
            player.setVelocityX(velocity);
            player.anims.play('right', true);
        }
        else {
            player.setVelocityX(0);
            player.anims.play('turn');
        }
        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-velocity);
        }
    }

    if (!gameStarted && cursors.space.isDown) {
        homeScreen.clear(true, true);
        gameStarted = true; 
        startGame();
    }

    if (gameOver && cursors.space.isDown) {
        //  Restart the game 
        for (var i = 0; i < scores.length; i++) {
            scores[i] = 0; 
        }
        for (var i = 0; i < scoreTexts.length; i++) {
            scoreTexts[i].setText("0"); 
        }
        crateText.destroy(); 
        restartText.destroy(); 
        finalScoreText.destroy();
        gameOver = false; 
        createLevel(); 
    }
}

//  Destroy the star once it hits the ground 
function destroyStar (ground, star) {
    star.destroy(); 
}

//  When a player hits a star, update scores accordingly 
function collectStar (player, star) {
    var starType = star.getData('starType');
    var starValue = star.getData('starValue');  
    star.destroy(); 
    if (starType == 'star') {
        scores[curCrate] = starValue; 
    }
    else if (starType == 'pink_star') {
        scores[curCrate] += starValue;
    }
    else { // starType == 'green_star'
        scores[curCrate] *= starValue; 
    }
    scoreTexts[curCrate].setText(scores[curCrate]);

    //  Switch crate
    curCrate = Phaser.Math.Between(0, crateNum - 1); 
    crateText.setText("CURRENT CRATE: " + curCrate); 
}