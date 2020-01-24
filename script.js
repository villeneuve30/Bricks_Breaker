const canvas = document.getElementById("gamecanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth/1.5;
canvas.height = window.innerHeight - 50;
ctx.imageSmoothingEnabled = false;

//declaration d'image
const backgroundImage = new Image();
backgroundImage.src = "img/backgroundSpace.png";
const userImage = new Image();
userImage.src = "img/user.png";
const ballImage = new Image();
ballImage.src = "img/ball.png";
const block1Image = new Image();
block1Image.src = "img/block1.png";
const block2Image = new Image();
block2Image.src = "img/block2.png";
const blockUnbreakable = new Image();
blockUnbreakable.src = "img/blockUnbreakable.png";



let M = {};
let C = {};
let V = {};

//Parent des éléments physique du jeu (User, blocks, ball)
class physicElement {
    constructor(posX,posY,width,height,status = true){
        this._posX = posX;
        this._posY = posY;
        this._width = width;
        this._height = height;
        this._status = status;
    }

    get posX(){ return this._posX; }
    set posX(value){ this._posX = value; }

    get posY(){ return this._posY;}
    set posY(value){ this._posY = value; }

    get width(){ return this._width; }
    set width(value){ this._width = value; }

    get height(){ return this._height; }
    set height(value){ this._height = value; }

    get status(){ return this._status; }
    set status(value){ this._status = value; }
}
class Block extends physicElement{
    constructor(posX,posY,width,height,status, life = 1){
        super(posX,posY,width,height,status);
        this._life = life;
    }
    get life(){return this._life;}
    loseLife(){this._life--}
}
class User extends physicElement{
    constructor(posX,posY,width,height,status,life = 3){
        super(posX,posY,width,height,status);
        this._life = life;
    }

    get life(){return this._life;}
    loseLife(){this._life--}

    moveUser(move){
        this._posX += move;
    }
}


class Ball extends physicElement{
    constructor(posX,posY,width,height,status, move, ballSpeed = 6){
        super(posX,posY,width,height,status);
        this._isMoving = move;
        this._ballSpeed = ballSpeed;
    }
    get ballSpeed(){ return this._ballSpeed}
    set ballSpeed(value){ this._ballSpeed = value}

    get isMoving(){
        return this._isMoving;
    }
    start(){
        this._isMoving = true;
    }
    stop(){
        this._isMoving = false;
    }
    moveBall(moveX, moveY){
        this._posX += moveX;
        this._posY += moveY;
    }
}

M = {
    blocksWidth: 40,
    blocksHeight: 40,
    blocksMatrice: [
        [0,3,2,2,2,2,3,0,3,2,2,2,2,3,0],
        [0,2,1,1,1,1,2,0,2,1,1,1,1,2,0],
        [0,2,1,1,1,1,2,0,2,1,1,1,1,2,0],
        [0,3,2,2,2,2,3,0,3,2,2,2,2,3,0]
    ],
    matriceLength: 0,
    blocksNumber: 0,

    canvasWidth: 0,

    ballWidth: 20,
    ballHeight: 20,

    userSpeed:10,
    userActualMove:0,
    userWidth: 100,
    userHeight: 15,

    moveX : 0,
    moveY : 0,

    user :{},
    ball :{},
    blocks: [],

    initBall: function(){
        M.ball = new Ball(M.user.posX + M.user.width/2 - M.ballWidth/2, M.user.posY - M.ballHeight , M.ballWidth, M.ballHeight, true, false);
        M.moveX = 1;
        M.moveY = -1;
    },
    resetUserPositionAndSize: function(){
        M.user.posX = canvas.width / 2 - M.userWidth/2;
        M.user.width = M.userWidth;
        M.user.height = M.userHeight;
    },
    init: function () {
        M.matriceLength = M.blocksMatrice[0].length;
        canvas.width = M.matriceLength*M.blocksWidth;

        for(let i = 0; i < M.blocksMatrice.length; i++) {
            for (let y = 0; y < M.blocksMatrice[i].length; y++) {
                if (M.blocksMatrice[i][y] > 0 && M.blocksMatrice[i][y] < 3) {
                    M.blocksNumber++;
                }
            }
        }

        M.user = new User(canvas.width / 2 - M.userWidth/2, canvas.height - 50, M.userWidth, M.userHeight, true);
        M.initBall();

        document.body.addEventListener('keydown', (e) => {
            if (e.key === "ArrowLeft") {
                if(M.userActualMove >= 0){
                    M.userActualMove = -M.userSpeed;
                }
            }
            if (e.key === "ArrowRight") {
                if(M.userActualMove <= 0){
                    M.userActualMove = M.userSpeed;
                }
            }
            if (e.key === " ") {
                M.ball.start();
            }
            C.sync_M_and_V();
        });
        document.body.addEventListener('keyup', (e) => {
            if(e.key === "ArrowLeft" || e.key === "ArrowRight"){
                M.userActualMove = 0;
            }
        });
        let posx = 0;
        let posy = 100;
        for(let i = 0; i < M.blocksMatrice.length; i++) {
            for (let y = 0; y < M.blocksMatrice[i].length; y++) {
                if (M.blocksMatrice[i][y] > 0) {
                    if(M.blocksMatrice[i][y] === 1)
                        M.blocks.push(new Block(posx, posy, M.blocksWidth, M.blocksHeight, true));
                    else if(M.blocksMatrice[i][y] === 2)
                        M.blocks.push(new Block(posx, posy, M.blocksWidth, M.blocksHeight, true, 2));
                    else if(M.blocksMatrice[i][y] === 3)
                        M.blocks.push(new Block(posx, posy, M.blocksWidth, M.blocksHeight, true, -1));
                }
                posx += M.blocksWidth;
            }
            posx = M.canvasWidth;
            posy += M.blocksHeight;
        }
    },
    isBorderLeftOrRightCollision: function (index) {
        return (M.ball.posX + M.ball.width - M.ball.ballSpeed < M.blocks[index].posX && M.moveX > 0) ||
            (M.ball.posX + M.ball.ballSpeed > M.blocks[index].posX + M.blocks[index].width && M.moveX < 0);
    },
    getBricksCollision: function () {
        for (let index = 0; index < M.blocks.length; index++) {
            if (M.blocks[index].status && M.isCollision(M.ball, M.blocks[index])) {
                if (M.isBorderLeftOrRightCollision(index)) {
                    M.moveX = -M.moveX;
                }else{
                    M.moveY = -M.moveY;
                }

                if(M.blocks[index].life !== -1)
                    M.blocks[index].loseLife();
                if(M.blocks[index].life === 0) {
                    M.blocks[index].status = false;
                    M.blocksNumber--;
                }

                return true;
            }
        }
    },
    getUserCollision: function () {
        if (M.isCollision(M.ball, M.user) && M.moveY > 0) {
            if (M.ball.posX + M.ball.width/2< M.user.posX + M.user.width / 4 && M.moveX > 0) {
                M.moveX = -M.moveX
            }
            if (M.ball.posX + M.ball.width/2> M.user.posX + M.user.width - M.user.width / 4 && M.moveX < 0) {
                M.moveX = -M.moveX
            }
            M.moveY = -M.moveY;
            return true;
        }
    },
    moveBall: function () {
        for(let y = 0; y < M.ball.ballSpeed; y++) {
            M.ball.moveBall(M.moveX, M.moveY);
            if (M.ball.posY < 0) {
                M.moveY = -M.moveY;
            }
            if (M.ball.posX + M.ball.width> canvas.width) {
                M.moveX = -M.moveX;
            }
            if (M.ball.posX < 0) {
                M.moveX = -M.moveX;
            }
            if (M.ball.posY > canvas.height) {
                M.resetUserPositionAndSize();
                M.initBall();
                M.user.loseLife();
                if (!M.user.life) {
                    M.init()
                }
            }

            if(M.getUserCollision() === true){
                break;
            }

            if(M.getBricksCollision() === true){
                break;
            }
        }
        if(M.blocksNumber === 0){
            M.ball.stop();
            alert("partie finie");
        }
        },
    moveUser: function(){
        M.user.moveUser(M.userActualMove);
        if(!M.ball.isMoving){
            M.ball.posX = M.user.posX + M.user.width/2 - M.ball.width/2;
        }
    },
    isCollision: function (elemA, elemB) {
        return elemA.posX < elemB.posX + elemB.width &&
            elemA.posX + elemA.width > elemB.posX &&
            elemA.posY < elemB.posY + elemB.height &&
            elemA.height + elemA.posY > elemB.posY;
    }
};
C = {
    init:function()
    {
        M.init();
        C.refresh();
    },
    refresh: function step() {
        if (M.ball.isMoving)
            M.moveBall();

        if(M.userActualMove !== 0)
            M.moveUser();

        C.sync_M_and_V();
        requestAnimationFrame(step);
    },
    sync_M_and_V: function()
    {
        V.clear();
        let user = M.user;
        let copyUser = {
            x: user.posX,
            y:user.posY,
            width: user.width,
            height: user.height,
            status: user.status,
        };

        let blocks = M.blocks;
        var copyBlocks = Array();
        blocks.forEach(function(e){
            copyBlocks.push({
                x: e.posX,
                y: e.posY,
                width: e.width,
                height: e.height,
                status: e.status,
                life: e.life
            })
        });

        let ball = M.ball;
        let copyBall= {
            x: ball.posX,
            y: ball.posY,
            width: ball.width,
            height: ball.height,
            status: ball.status
        };
        V.render_canvas(copyUser, copyBlocks, copyBall);
    }
};

V = {
    clear:function()
    {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    drawUser: function(user)
    {
        //render user
        ctx.drawImage(userImage, user.x,user.y, user.width, user.height);
    },
    drawBlocks:function(blocks)
    {
        //render blocks
        for(let e in blocks){
            if(blocks[e].status) {
                switch (blocks[e].life) {
                    case 1:
                        ctx.drawImage(block1Image, blocks[e].x, blocks[e].y, blocks[e].width, blocks[e].height);
                        break;

                    case 2:
                        ctx.drawImage(block2Image, blocks[e].x, blocks[e].y, blocks[e].width, blocks[e].height);
                        break;

                    case -1 :
                        ctx.drawImage(blockUnbreakable, blocks[e].x, blocks[e].y, blocks[e].width, blocks[e].height);
                        break;
                }
            }
        }
    },
    drawBall:function(ball){
        //render balls
        if(ball.status)
            ctx.drawImage(ballImage, ball.x, ball.y, ball.width, ball.height);
    },
    drawBackground:function(){
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height)
    },
    render_canvas(user, blocks, ball)
    {
        V.drawBackground();
        V.drawUser(user);
        V.drawBlocks(blocks);
        V.drawBall(ball)
    }
};

C.init();