// Brick Breaker game in JavaScript 
// HTML Canvas
var canvas = document.getElementById('gameCanvas');
var canvasContext = canvas.getContext('2d');
// Game properties
var paddleThickness = 10;
var paddleLength = 100;
var rows = 3;
var cols = 10;
var brickHeight = 20;
var brickLength = 50;
var brickOffset = 10;
const MAX_LIVES = 3;
// Game states
var onGameOverScreen = false;
var onStartScreen = false;
var paused = false;
var level = 1;
var newBall = false;

//
// Game Objects
//
var bricks = [];

var score = {
    lives: 0,
    level: 0,
    bricksBroken: 0,
    color: 'green',
    draw: function() {
        canvasContext.fillStyle = this.color;
        canvasContext.fillText('Lives: '+this.lives, canvas.width-150, 50);
        canvasContext.fillText('Score: '+this.bricksBroken, 100, 50);
    }
}

var ball = {
    x: 0,
    y: 0,
    radius: 10,
    speedX: 0,
    speedY: -10,
    color: 'Cyan',
    move: function() {
        var buffer = (this.radius+paddleThickness)/2;
        var angle = 0.2;
        if(this.x < 0 || this.x > canvas.width) {
            this.speedX = -this.speedX;
        }
        if(this.y > canvas.height - buffer) {
            this.speedY = -this.speedY;
            var deltaX = this.x - (playerPaddle.x+playerPaddle.width/2);
            this.speedX = deltaX * angle;
            if (playerPaddle.isCollision(this.x) === false) {
                missBall();
            }
        } 
        if(this.y < 0) {
            this.speedY = -this.speedY;
        }
        this.x += this.speedX;
        this.y += this.speedY;
    },
    draw: function() {
        colorCircle(this.x, this.y, this.radius, this.color);
    },
    reset: function() {
        this.x = (canvas.width-this.radius)/2;
        this.y = canvas.height-(this.radius+paddleThickness)/2;
        this.speedX = 0;
        this.speedY = -10;
    }
};

var playerPaddle = {
    x: (canvas.width-paddleLength)/2,
    y: canvas.height - paddleThickness,
    width: paddleLength,
    height: paddleThickness,
    speedX: 10,
    color: 'Green',
    draw: function() {
        colorRect(this.x,this.y,this.width,this.height,this.color);
    },
    isCollision: function(x) {
        var left = this.x;
        var right = this.x + this.width;
        if (x>left&&x<right) {
            return true;
        }
        return false;
    }
};

class Brick {
    constructor(x,y,color) {
        this.x = x;
        this.y = y;
        this.width = brickLength;
        this.height = brickHeight;
        this.color = color;
        this.broken = false;
    }
    draw() {
        colorRect(this.x,this.y,this.width,this.height,this.color);
    }
    isCollision(x,y) {
        var top = this.y;
        var bottom = this.y + this.height;
        var left = this.x;
        var right = this.x + this.width;
        if (this.broken) {
            return false;
        }
        if ((x>=left&&x<=right)&&(y>=top&&y<=bottom)) {
            return true;
        }
        return false;
    }
}

// 
// Game Functions
//
function startGame() {
    const FPS = 30;
    setInterval(function() {
            moveScene();
            drawScene();   
        }, 1000/FPS);
    // set up game
    resetGame();
    // Player paddle follows mouse
    canvas.addEventListener('mousemove', function(evt) {
        var mousePos = calculateMousePos(evt);
        playerPaddle.x = mousePos.x - playerPaddle.width/2;
    });
    // Click to restart game
    canvas.addEventListener('mousedown', handleMouseClick);
}

function resetGame() {
    score.lives = MAX_LIVES;
    onGameOverScreen = false;
    onStartScreen = true;
    score.level = 1;
    newBall = true;
    ball.reset();
    ball.y -= ball.radius;
    bricks = [];
    makeBricks();
    score.bricksBroken = 0;
}

function missBall() {
    newBall = true;
    score.lives--;
    if(score.lives <= 0) {
        onGameOverScreen = true;
    }
    ball.reset();
}

function checkBrickCollisions() {
    var totalBricks = rows * cols;
    bricks.forEach(function(brick) {
        if(brick.isCollision(ball.x,ball.y)){
            // hit brick
            brick.broken = true;
            ball.speedY *= -1;
            ball.speedX *= -1;
            score.bricksBroken++;
        }
    });
    if(score.bricksBroken >= totalBricks) {
        onGameOverScreen = true;
    }
}

function makeBricks() {
    // var colors = ['red','orange','yellow','green','blue','purple'];
    var colors = ['DarkCyan','DarkOrchid','DarkBlue','Blue','Purple','DarkViolet'];
    var margin = (canvas.width - ((brickLength+brickOffset)*cols))/2;
    for (var r = 0; r < rows; r++) {
        for(var c = 0; c < cols; c++) {
            var x = (brickLength+brickOffset) * c + margin;
            var y = (brickHeight+brickOffset) * r + margin;
            var color = colors[Math.floor(Math.random()*colors.length)];
            var brick = new Brick(x,y,color);
            bricks.push(brick);
        }
    };
}

//
// Event Listeners
//
window.onload = function() {
    startGame();
}

function handleMouseClick(evt) {
    if(onStartScreen) {
        onStartScreen = false;
        newBall = false;
    } else if(onGameOverScreen) {
        resetGame();
    } else if(newBall){
        newBall = false;
    } else if(paused) {
        paused = false;
    } else {
        paused = true;
    }

}

//
// Functions for moving the game objects
//
function moveScene() {
    if(newBall){
        ball.x = playerPaddle.x + playerPaddle.width/2; 
        return;
    }
    if(paused){
        return;
    }
    if(onStartScreen){
        return;
    }
    if(onGameOverScreen){
        return;
    } 
    ball.move();
    checkBrickCollisions();
}

//
// Functions for drawing the scene
//
function drawScene() {
    // Clear screen with black rectangle
    colorRect(0,0,canvas.width,canvas.height,'black');

    // Draw game objects
    drawBricks();
    score.draw();
    if(onGameOverScreen){
        drawEndScreen();
        return;
    } 
    playerPaddle.draw();
    ball.draw();
    if(onStartScreen){
        drawStartScreen();
        return;
    }
    if(paused){
        drawPauseScreen();
    }

}

function drawStartScreen() {
    var title = "Brick Breaker";
    var startText = "Click to start";
    canvasContext.fillStyle = 'white';
    canvasContext.fillText(title, canvas.width/2-35, 50);
    canvasContext.fillText(startText, canvas.width/2-35, 250);
}

function drawPauseScreen() {
    var pauseText = "Paused";
    var resetText = "Click to continue";
    canvasContext.fillStyle = 'white';
    canvasContext.fillText(pauseText, canvas.width/2-16, 250);
    canvasContext.fillText(resetText, canvas.width/2-35, 300);
}

function drawEndScreen() {
    var endMessage = "Game Over";
    var resetText = "Click to continue";
    canvasContext.fillStyle = 'white';
    canvasContext.fillText(endMessage, canvas.width/2-25, 250);
    canvasContext.fillText(resetText, canvas.width/2-35, 300);
}

function drawBricks() {
    bricks.forEach(function(brick)  {
        if (brick.broken === false){
            brick.draw();  
        }
    });
}

//
// Helper Functions
//
function calculateMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;
    var mouseX = evt.clientX - rect.left - root.scrollLeft;
    var mouseY = evt.clientY - rect.top - root.scrollTop;
    return {
        x: mouseX,
        y: mouseY
    };
}

function colorCircle(centerX, centerY, radius, drawColor) {
    canvasContext.fillStyle = drawColor;
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, radius, 0,Math.PI*2,true);
    canvasContext.fill();
}

function colorRect(leftX,topY, width,height, drawColor) {
    canvasContext.fillStyle = drawColor;
    canvasContext.fillRect(leftX,topY, width,height);
}