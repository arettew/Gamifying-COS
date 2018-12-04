var height = window.innerHeight;
var width = window.innerWidth;;

//  Initial game setup 
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
            gravity: { y: 0 },
            debug: false
        }
    }
};

var game = new Phaser.Game(config);
var scene; 

var cursors; //  controls cursors 

//  Preloads assets 
function preload () {
    this.load.image('sky', 'assets/night_sky.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('blue_star', 'assets/blue_star.png'); 
    this.load.image('pink_star', 'assets/pink_star.png'); 
    this.load.image('green_star', 'assets/green_star.png');

    //  Ties keyboard's cursors to the cursors variable 
    cursors = this.input.keyboard.createCursorKeys();
}

var objectNo; 
var score = 0; 
var isGameOver = false; 
var onStartScreen = true; 
var startText; 
var instructionsText; 
//  Creates the initial game board 
function create () {
    this.add.image(width / 2, height / 2, 'sky').setScale(3);
    scene = this;

    //  Create start screen 
    var style = {wordWrap: {width: 500}};
    startText = this.add.text(width / 2, height / 2 - 15, "Press space to start game", {fontSize: '30px'}); 
    startText.setX(width / 2 - startText.width / 2);

    instructionsText = this.add.text(width / 2 - 250, height / 2 + 40, "Once the game starts, count the shooting stars and pick the answer corresponding to the correct number as you aim for a high score!", style);
}

function startGame () { 
    instructionsText.destroy(); 
    startText.destroy(); 
    onStartScreen = false; 

    scoreText = scene.add.text(16, 16, 'Score: 0', { fontSize: '32px'});
    objectNo = 10; 
    createLevel();
}

var left; 
var right; 
var scoreText; 
var duration = 750; 
var maxNum = 20; 
//  Create a level in the game, where stars fly across the screen and a user is then prompted 
//  to give an answer 
function createLevel () {
    console.log("Actual number of stars: " + objectNo);
    if (left != null) {
        //  Destroy star objects 
        left.clear(true, true);
        right.clear(true, true);
    }
    //  Increase star speed 
    if (duration >= 500) {
        duration = duration - 50; 
    }
    //  Increase max mumber of stars 
    if (maxNum < 200) {
        maxNum = maxNum + 20; 
    }

    left = scene.physics.add.group(); 
    right = scene.physics.add.group(); 
    var delay = 100; 
    scene.time.addEvent({ delay: delay, callback: createObjects, callbackScope: this, repeat: objectNo / 2 });
    scene.time.addEvent({ delay: delay * objectNo / 2 + 500, callback: createChoices, callbackScope: this });
}

var starButtons; 
var starTexts; 
//  Create choices for the player after the end of the 
function createChoices () {
    starButtons = scene.physics.add.group(); 
    //  Add buttons 
    var pinkStar = createStar('pink_star', .5, .25);
    var greenStar = createStar('green_star', .25, .75);
    var blueStar = createStar('blue_star', .75, .75);
    starButtons.addMultiple([pinkStar, greenStar, blueStar]);

    starTexts = scene.physics.add.group(); 
    var correctFound = false; 
    createText(pinkStar, 1, correctFound);
    createText(greenStar, 2, pinkStar.getData('isCorrect'));
    createText(blueStar, 3, pinkStar.getData('isCorrect') || greenStar.getData('isCorrect'));
}

//  Create the text choices that determine which star is the correct once
function createText(star, order, correctFound) {
    var style = {align: 'center'}; //  The text styling 
    var ineqs = ['<', '>'];
    var LT = 0; 

    //  Generate choices and answers
    if (order != 3) {
        //  Do not do this for 3rd star, which is always "else"
        var ineqChoice = Phaser.Math.Between(0, 1); 
        var numChoice = Phaser.Math.Between(objectNo / 2, objectNo * 2);
        var isCorrect; 
        if (correctFound == true) {
            //  Earlier statement in if/else was already true 
            isCorrect = false;
        }
        else if (ineqChoice == LT) {
            isCorrect = (objectNo < numChoice); 
        }
        else { //  ineqChoice == GT
            isCorrect = (objectNo > numChoice);
        } 
    }
    else { //  order == 3
        //  "Else" is right if previous two were wrong, wrong otherwise 
        isCorrect = !correctFound;
    }
    star.setData('isCorrect', isCorrect); 

    //  Add and create text
    if (order == 1) {
        var textFirst = scene.add.text(star.x - 50, star.y - 100, "if", style);
        var textStar = scene.add.image(star.x - 10, star.y - 95, 'star');
        var textSecond = scene.add.text(star.x + 10, star.y - 100, ineqs[ineqChoice] + " " + numChoice);
        starTexts.addMultiple([textFirst, textStar, textSecond]);
    }
    else if (order == 2) {
        var textFirst = scene.add.text(star.x - 70, star.y - 100, "else if", style);
        var textStar = scene.add.image(star.x + 20, star.y - 95, 'star');
        var textSecond = scene.add.text(star.x + 40, star.y - 100, ineqs[ineqChoice] + " " + numChoice);
        starTexts.addMultiple([textFirst, textStar, textSecond]);
    }
    else { //  order == 3
        var text = scene.add.text(star.x, star.y - 100, "else", style);
        text.setX(star.x - text.width / 2)
        starTexts.add(text); 
    }
}

//  Creates a star button
function createStar (starName, widthMultiplier, heightMultiplier) {
    var star = scene.add.image(width * widthMultiplier, height * heightMultiplier, starName).setScale(3).setInteractive(); //.setInteractive() makes it interactive
    star.on('pointerup', processChoice, {"star": star});
    return star; 
}

//  Processes the choice made by the player 
function processChoice() {
    if (isGameOver) {
        return; 
    }
    if (this.star.getData('isCorrect')) {
        //  Update score
        score += 1;
        scoreText.setText('Score: ' + score);

        //  Set new object number
        objectNo = Phaser.Math.Between(1, maxNum); 
        objectNo = objectNo + objectNo % 2; 

        //  Clear buttons and text
        starButtons.clear(true, true); 
        starTexts.clear(true, true); 

        createLevel(); 
    }
    else {
        gameOver(); 
    }
}

var gameOverText; 
var actualStarsText; 
var restartText; 
//  Ends the game 
function gameOver () {
    isGameOver = true; 
    score = 0; 
    //scoreText.destroy(); 
    //starButtons.destroy(true, true); 
    //starTexts.destroy(true, true); 
    
    //  Indicate correct answer 
    starButtons.children.iterate(function (child) {
        if (!child.getData('isCorrect')) {
            child.setAlpha(.2); 
        }
    });

    //  Add game over text
    gameOverText = scene.add.text(width / 2, height / 2, "GAME OVER", {fontSize: "50px", align: "center"});
    gameOverText.setX(width / 2 - gameOverText.width / 2);
    gameOverText.setY(height / 2 - gameOverText.height / 2 - 30);

    actualStarsText = scene.add.text(width / 2, height / 2, "Actual number: " + objectNo);
    actualStarsText.setX(width / 2 - actualStarsText.width / 2);

    restartText = scene.add.text(width / 2, height - 100, "Press space to restart");
    restartText.setX(width / 2 - restartText.width / 2); 
}

// Reset the game 
function reset () {
    // Destroy old game objects 
    gameOverText.destroy(); 
    actualStarsText.destroy(); 
    starButtons.clear(true, true); 
    starTexts.clear(true, true); 
    restartText.destroy();
    
    score = 0; 
    isGameOver = false; 
    objectNo = 10; 
    scoreText.setText('Score: ' + score);
    duration = 750; 
    maxNum = 20; 

    createLevel(); 
}

//  Create objects and move them across the screen
function createObjects () {
    var objLeft = left.create(0, Phaser.Math.Between(0, height), 'star');
    scene.tweens.add({
        targets: objLeft,
        x: width + 20,
        duration: duration,
    });
    var objRight = right.create(width, Phaser.Math.Between(0, height), 'star');
    scene.tweens.add({
        targets: objRight, 
        x: -20, 
        duration: duration,
    })
}

//  Handles updates to the game state 
function update () {
    if (isGameOver && cursors.space.isDown) {
        reset(); 
    }

    if (onStartScreen && cursors.space.isDown) {
        startGame(); 
    }
}
