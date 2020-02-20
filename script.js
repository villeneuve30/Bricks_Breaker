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
const heartImage = new Image();
heartImage.src = "img/heart.png";

const ballImage = new Image();
ballImage.src = "img/ball.png";

const block1Image = new Image();
block1Image.src = "img/block1.png";
const block2Image = new Image();
block2Image.src = "img/block2.png";
const block3Image = new Image();
block3Image.src = "img/block3.png";
const blockUnbreakable = new Image();
blockUnbreakable.src = "img/blockUnbreakable.png";

const doubleUserSize = new Image();
doubleUserSize.src = "img/bonus/doubleUserSize.png";
const weaponShot = new Image();
weaponShot.src = "img/bonus/weaponShot.png";
const threeBallsMore = new Image();
threeBallsMore.src = "img/bonus/threeBallsMore.png";
const increaseUserSpeed = new Image();
increaseUserSpeed.src = "img/bonus/increaseUserSpeed.png";
const splitUserSize = new Image();
splitUserSize.src = "img/bonus/splitUserSize.png";
const reverseControls = new Image();
reverseControls.src = "img/bonus/reverseControls.png";
const reduceUserSpeed = new Image();
reduceUserSpeed.src = "img/bonus/reduceUserSpeed.png";
const increaseBallSpeed = new Image();
increaseBallSpeed.src = "img/bonus/increaseBallSpeed.png";
const bombImage = new Image();
bombImage.src = "img/bonus/bomb.png";


let M = {};
let C = {};
let V = {};

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

//Parent des éléments physique du jeu (User, blocks, ball....)
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
class Bonus extends physicElement{
    constructor(posX,posY,width,height,status, name, duration){
        super(posX,posY,width,height,status);
        this._name = name;
        this._duration = duration;
        this._timer = null;
    }
    stopBonus(){
        clearTimeout(this._timer);
    }
    moveBonus(move){
        this.posY += move;
    }

    get name(){return this._name;}
    get duration(){return this._duration;}
}
class BonusDoubleUserSize extends Bonus{
    constructor(posX,posY, width, height, status, name, duration){
        super(posX,posY,width,height,status, name, duration);
    }

    startBonus(){
        this._timer = setTimeout(function(){
            M.user.width = M.userWidth;
        },this._duration*1000);
        M.user.width = M.userWidth*2
    }
}
class BonusSplitUserSize extends Bonus{
    constructor(posX,posY, width, height, status, name, duration){
        super(posX,posY,width,height,status, name, duration);
    }

    startBonus(){
        this._timer = setTimeout(function(){
            M.user.width = M.userWidth;
        },this._duration*1000);
        M.user.width = M.userWidth/2
    }
}
class BonusIncreaseUserSpeed extends Bonus{
    constructor(posX,posY, width, height, status, name, duration){
        super(posX,posY,width,height,status, name, duration);
    }

    startBonus(){
        this._timer = setTimeout(function(){
            M.user.speed = M.userSpeed;
        },this._duration*1000);
        M.user.speed = M.userSpeed*2;
    }
}
class BonusReduceUserSpeed extends Bonus{
    constructor(posX,posY, width, height, status, name, duration){
        super(posX,posY,width,height,status, name, duration);
    }

    startBonus(){
        this._timer = setTimeout(function(){
            M.user.speed = M.userSpeed;
        },this._duration*1000);
        M.user.speed = M.userSpeed/2;
    }
}
class BonusIncreaseBallSpeed extends Bonus{
    constructor(posX,posY, width, height, status, name, duration){
        super(posX,posY,width,height,status, name, duration);
    }

    startBonus(){
        this._timer = setTimeout(function(){
            for(let i = 0; i<M.ballsArray.length; i++) {M.ballsArray[i].speed = M.ballSpeed;}
        },this._duration*1000);
        for(let i = 0; i<M.ballsArray.length; i++) {M.ballsArray[i].speed = M.ballSpeed*1.5;}
    }
}
class BonusBomb extends Bonus{
    constructor(posX,posY, width, height, status, name, duration){
        super(posX,posY,width,height,status, name, duration);
    }
}
class BonusThreeBallsMore extends Bonus{
    constructor(posX,posY, width, height, status, name, duration){
        super(posX,posY,width,height,status, name, duration);
    }
}
class BonusWeaponShot extends Bonus{
    constructor(posX,posY, width, height, status, name, duration){
        super(posX,posY,width,height,status, name, duration);
        this._shotting = null;
    }
    startBonus(){
        this._shotting = setInterval(function(){
            M.missileArray.push(new missile(M.user.posX, M.user.posY, 10, 20, true, -1, 4))
        } ,1000);

        this._timer = setTimeout(function(){
            clearInterval(this._shotting);
        },this._duration*1000);
    }
}
class BonusReverseControls extends Bonus{
    constructor(posX,posY, width, height, status, name, duration) {
        super(posX, posY, width, height, status, name, duration);
    }

    startBonus(){
        this._timer = setTimeout(function(){
            M.user.confused = false;
        },this._duration*1000);
        M.user.confused = true;
    }
}

class Block extends physicElement{
    constructor(posX,posY,width,height,status, life){
        super(posX,posY,width,height,status);
        this._life = life;
    }
    get life(){return this._life;}
    loseLife(){this._life--}
}
class User extends physicElement{
    constructor(posX,posY,width,height,status,speed = M.userSpeed, life, bonusArray, confused = false){
        super(posX,posY,width,height,status);
        this._speed = speed;
        this._life = life;
        this._bonusArray = bonusArray;
        this._confused = confused;
    }

    get confused(){return this._confused};
    set confused(value){this._confused = value}

    get speed(){return this._speed;}
    set speed(value){this._speed = value}

    get life(){return this._life;}
    loseLife(){this._life--}

    get bonusArray(){return this._bonusArray}

    moveUser(move){
        this._posX += move;
    }
}
class Ball extends physicElement{
    constructor(posX,posY,width,height,status, isMoving, moveX, moveY, speed){
        super(posX,posY,width,height,status);
        this._isMoving = isMoving;
        this._speed = speed;
        this._moveX = moveX;
        this._moveY = moveY;
    }
    get speed(){ return this._speed}
    set speed(value){ this._speed = value}

    get isMoving(){return this._isMoving;}

    start(){
        this._isMoving = true;
    }
    stop(){
        this._isMoving = false;
    }
    get moveX(){return this._moveX}
    set moveX(value){this._moveX = value}

    get moveY(){return this._moveY}
    set moveY(value){this._moveY = value}

    moveBall(){
        this._posX += this._moveX;
        this._posY += this._moveY;
    }
}
class missile extends physicElement{
    constructor(posX,posY,width, height,status, moveY, speed){
        super(posX,posY,width,height,status);
        this._moveY = moveY;
        this._speed = speed;
    }

    get moveY(){return this._moveY}
    set moveY(value){this._moveY = value}

    get speed(){return this._speed}

    move(){
        this._posY += this._moveY;
    }
}

M = {
    levelsArray : [
        //level 1
        [
            [ 0, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 0],
            [ 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
            [ 0, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 0],
        ],

        //level 2
        [
            [ 0, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 0],
            [ 0, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 0],
            [ 0, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 0],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [ 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2],
        ],

        //level 3
        [
            [ 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0],
            [ 0, 3,-1, 3,-1, 2,-1, 2,-1, 2,-1, 3,-1, 3, 0],
            [ 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [ 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3],
        ],

        //level 4
        [
            [ 0, 0, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 0, 0],
            [ 0, 0, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 0, 0],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [-1,-1,-1,-1, 0, 0, 0, 0, 0, 0, 0,-1,-1,-1,-1],
            [ 3, 3, 3, 3,-1, 0, 0, 0, 0, 0,-1, 3, 3, 3, 3],
            [ 0, 0, 0, 0, 0,-1, 0, 0, 0,-1, 0, 0, 0, 0, 0],
        ],

        //level 5
        [
            [ 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
            [ 0, 2, 0, 0,-1, 2, 0, 2,-1, 2, 0, 2,-1, 2, 0],
            [ 0, 2, 0,-1, 2, 0, 2,-1, 2, 0, 2,-1, 0, 2, 0],
            [ 0, 2,-1, 2, 0, 2,-1, 2, 0, 2,-1, 0, 0, 2, 0],
            [ 0,-1, 2, 0, 2,-1, 2, 0, 2,-1, 2, 2, 2, 3, 0],
        ],

        //level 6
        [
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [ 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0],
            [ 0,-1, 3, 3, 3,-1, 0, 0, 0,-1, 3, 3, 3,-1, 0],
            [ 0, 0,-1, 3,-1, 0, 0, 0, 0, 0,-1, 3,-1, 0, 0],
            [ 0, 0, 0,-1, 0, 0, 0, 0, 0, 0, 0,-1, 0, 0, 0],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [ 0, 0, 3, 3, 3, 0, 3, 3, 3, 0, 3, 3, 3, 0, 0],
            [ 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0],
        ],
    ],

    blocksWidth: 40,
    blocksHeight: 40,

    matriceLength: 0,
    blocksNumber: 0,

    canvasWidth: 0,

    ballWidth: 20,
    ballHeight: 20,
    ballSpeed : 4,
    ballsArray: [],

    userSpeed:8,
    userLifes : 3,
    userActualMove:0,
    userWidth: 100,
    userHeight: 15,

    bonusFallingArray: [],
    bonusFallSpeed: 2,

    missileArray : [],
    allBonus: [
        new BonusDoubleUserSize(    0,0, 0, 0,  false,"doubleUserSize",     10),
        new BonusSplitUserSize(     0,0, 0, 0,  false,"splitUserSize",      10),
        new BonusIncreaseUserSpeed( 0,0, 0, 0,  false,"increaseUserSpeed",  10),
        new BonusReduceUserSpeed(   0,0, 0, 0,  false,"reduceUserSpeed",    10),
        new BonusIncreaseBallSpeed( 0,0, 0, 0,  false,"increaseBallSpeed",  10),
        /*new BonusWeaponShot(              0,      0,       0,        0,        false,       "weaponShot",                 10),*/
        new BonusReverseControls( 0,0, 0, 0,  false,"reverseControls",    10),
        new BonusThreeBallsMore( 0,0, 0, 0,  false,"threeBallsMore",     -1),
        new BonusBomb( 0,0, 0, 0,  false,"bomb",-1),
        new BonusThreeBallsMore( 0,0, 0, 0,  false,"threeBallsMore",-1),
    ],

    ratioMax:0.9,

    user :{},
    blocks: [],
    actualLevel: 1,

    initBall: function(){
        M.ballsArray = [];
        let ball = new Ball(M.user.posX + M.user.width/2 - M.ballWidth/2, M.user.posY - M.ballHeight , M.ballWidth, M.ballHeight, true, false, 1, -1, M.ballSpeed);
        M.ballsArray.push(ball);
        M.ballsArray[0].stop();
    },
    resetUserPositionAndSize: function(){
        for(let i in M.user.bonusArray){
            M.user.bonusArray[i].stopBonus();
            M.user.bonusArray.splice(i,1);
        }
        M.user.posX = canvas.width / 2 - M.userWidth/2;
        M.user.width = M.userWidth;
        M.user.height = M.userHeight;
        M.userActualMove = 0;
    },
    init: function (level) {
        M.user ={};
        M.ballsArray = [];
        M.blocks= [];
        M.blocksNumber = 0;

        let matriceLevel = M.levelsArray[level-1];
        M.matriceLength = matriceLevel[0].length;
        canvas.width = M.matriceLength*M.blocksWidth;

        for(let i in matriceLevel) {
            for (let y in matriceLevel[i]) {
                if (matriceLevel[i][y] > 0) {
                    M.blocksNumber++;
                }
            }
        }
        M.bonusFallingArray = [];
        M.resetUserPositionAndSize();
        M.user = new User(canvas.width / 2 - M.userWidth/2, canvas.height - 50, M.userWidth, M.userHeight, true, M.userSpeed, M.userLifes, []);
        M.initBall();

        document.body.addEventListener('keydown', (e) => {
            if ((e.key === "ArrowLeft" && M.user.confused === false) || (e.key === "ArrowRight" && M.user.confused === true)) {
                if(M.userActualMove >= 0){
                    M.userActualMove = -M.user.speed;
                }
            }
            if ((e.key === "ArrowRight" && M.user.confused === false) || (e.key === "ArrowLeft" && M.user.confused === true)) {
                if(M.userActualMove <= 0){
                    M.userActualMove = M.user.speed;
                }
            }
            if (e.key === " ") {
                M.ballsArray.forEach(function(e){
                    e.start();
                });
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
        for(let i = 0; i < matriceLevel.length; i++) {
            for (let y = 0; y < matriceLevel[i].length; y++) {
                if (matriceLevel[i][y] !== 0) {
                        M.blocks.push(new Block(posx, posy, M.blocksWidth, M.blocksHeight, true, matriceLevel[i][y]));
                }
                posx += M.blocksWidth;
            }
            posx = M.canvasWidth;
            posy += M.blocksHeight;
        }
    },
    getUserLife: function(){
        if (!M.user.life) {
            alert("Tu n'as plus de vies, réessaye ?");
            M.init(M.actualLevel);
        }
    },
    isBorderLeftOrRightCollision: function (index, ball) {
        return (ball.posX + ball.width - ball.speed < M.blocks[index].posX && ball.moveX > 0) ||
            (ball.posX + ball.speed > M.blocks[index].posX + M.blocks[index].width && ball.moveX < 0);
    },
    getBricksCollision: function (ball) {
        for (let index in M.blocks) {
            if (M.blocks[index].status && M.isCollision(ball, M.blocks[index])) {
                if (M.isBorderLeftOrRightCollision(index, ball)) {
                    ball.moveX = -ball.moveX;
                    ball.posX += ball.moveX * 2;
                }else{
                    ball.moveY = -ball.moveY;
                    ball.posY += ball.moveY * 2;
                }

                if(M.blocks[index].life !== -1)
                    M.blocks[index].loseLife();
                if(M.blocks[index].life === 0) {
                    M.blocks[index].status = false;
                    M.blocksNumber--;
                    M.bonusDropping(index);
                }

                return true;
            }
        }
        return false;
    },
    getUserCollision: function (ball) {
        if (M.isCollision(ball, M.user) && ball.moveY > 0) {
            let middleUser = M.user.posX + M.user.width/2;
            let middleBall = ball.posX + ball.width/2;

            //Positive ratio if left side (37-30/ 40-30) = 0.7 -0.3 => for X and 1.7 for Y
            //Negative ratio if right side (47-30/ 40-30)= 1.7  0.3 => for Y and 1.7 for X
            let ratio = (middleBall - M.user.posX) / (middleUser - M.user.posX);
            let ratioY = 2;

            if (ratio < 1 && ratio < 1 - M.ratioMax){
                ratio = 1 - M.ratioMax;
            }else if (ratio > 1 && ratio > 1 + M.ratioMax){
                ratio = 1 + M.ratioMax;
            }
            //left side collision
            if (ratio < 1) {
                ball.moveX = -(1-ratio);
                ratioY = 2-(1-ratio);
            }else if(ratio > 1){
                //right side collision
                ball.moveX = (ratio-1);
                ratioY = 2-(ratio-1);
            }else{
                ball.moveX = 0;
            }

            ball.moveY = -ratioY;
            return true;
        }
    },
    getCanvasCollision: function (i) {
        if (M.ballsArray[i].posY < 0) {
            M.ballsArray[i].moveY = -M.ballsArray[i].moveY;
            return true;
        }
        if (M.ballsArray[i].posX + M.ballsArray[i].width > canvas.width || M.ballsArray[i].posX < 0) {
            M.ballsArray[i].moveX = -M.ballsArray[i].moveX;
            return true
        }
        if (M.ballsArray[i].posY > canvas.height) {
            if(M.ballsArray.length === 1) {
                M.resetUserPositionAndSize();
                M.initBall();
                M.user.loseLife();
                M.getUserLife();
            }else{
                M.ballsArray.splice(i,1);
            }
            return true
        }
        return false;
    },
    getBonusCollision: function (index) {
        if (M.isCollision(M.user, M.bonusFallingArray[index])) {
            let duration = M.bonusFallingArray[index].duration;
            let BFalling = M.bonusFallingArray[index].name;
            let BUser = null;
            if(duration > 0){
                for(let i in M.user.bonusArray){
                    BUser = M.user.bonusArray[i].name;
                    if(  BUser === BFalling ||
                        (BUser === "doubleUserSize" && BFalling === "splitUserSize") ||
                        (BUser === "splitUserSize" && BFalling === "doubleUserSize") ||
                        (BUser === "increaseUserSpeed" && BFalling === "reduceUserSpeed") ||
                        (BUser === "reduceUserSpeed" && BFalling === "increaseUserSpeed")){

                        M.user.bonusArray[i].stopBonus();
                        M.user.bonusArray.splice(i,1);
                    }
                }
                M.bonusFallingArray[index].startBonus();
                M.user.bonusArray.push(M.bonusFallingArray[index]);
            }else{
                switch (BFalling) {
                    case "threeBallsMore" :
                        let newBall1 = new Ball(M.ballsArray[0].posX,M.ballsArray[0].posY, M.ballsArray[0].width, M.ballsArray[0].height, true,true,M.ballsArray[0].moveX,-M.ballsArray[0].moveY,M.ballsArray[0].speed);
                        let newBall2 = new Ball(M.ballsArray[0].posX,M.ballsArray[0].posY, M.ballsArray[0].width, M.ballsArray[0].height, true,true,-M.ballsArray[0].moveX,-M.ballsArray[0].moveY,M.ballsArray[0].speed);
                        M.ballsArray.push(newBall1);
                        M.ballsArray.push(newBall2);
                        break;
                    case "bomb":
                        M.user.loseLife();
                        M.getUserLife();
                        break;
                }
            }
            M.bonusFallingArray.splice(index, 1);
            return true;
        }
        if(M.bonusFallingArray[index].posY > canvas.height){
            M.bonusFallingArray.splice(index, 1);
        }
    },
    checkEndLevel: function () {
        if (M.blocksNumber === 0) {
            if(M.actualLevel === 6){
                alert("Bravo !  tu as fini les 6 niveaux !");
                M.actualLevel = 1;
            }else if(confirm("Niveau "+ M.actualLevel +" fini ! Passer au suivant ?")){
                M.actualLevel += 1;
            }
            M.init(M.actualLevel);
        }
    },
    moveBall: function (i) {
        for(let y = 0; y < M.ballsArray[i].speed; y++) {
            M.ballsArray[i].moveBall();

            if(M.getCanvasCollision(i)){
                break;
            }

            if(M.getUserCollision(M.ballsArray[i])){
                break;
            }

            if(M.getBricksCollision(M.ballsArray[i])){
                break;
            }
        }
        M.checkEndLevel();
    },
    moveUser: function(){
        if(M.user.posX + M.userActualMove < 0) {
            M.user.posX = 0;
        }else if(M.user.posX + M.userActualMove + M.user.width > canvas.width){
            M.user.posX = canvas.width - M.user.width;
        }else{
            M.user.moveUser(M.userActualMove);
        }

        if(!M.ballsArray[0].isMoving){
            M.ballsArray[0].posX = M.user.posX + M.user.width/2 - M.ballsArray[0].width/2;
        }
    },
    moveBonus: function(){
        for(let index in M.bonusFallingArray){
            M.bonusFallingArray[index].moveBonus(M.bonusFallSpeed);
            M.getBonusCollision(index);
        }
    },
    moveMissiles: function(i){
        for(let y = 0; y < M.missileArray[i].speed; y++) {
            M.missileArray[i].move();
        }
    },
    bonusDropping: function(index){
        let isDropping = getRandomInt(4);
        if(isDropping === 0){
            let position = getRandomInt(M.allBonus.length);
            let bonus = M.allBonus[position];
            bonus.posX = M.blocks[index].posX;
            bonus.posY = M.blocks[index].posY;
            bonus.width = M.blocks[index].width;
            bonus.height = M.blocks[index].height;
            bonus.status = true;
            M.bonusFallingArray.push(bonus);

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
    init:function() {
        M.init(M.actualLevel);
        C.refresh();
    },
    refresh: function step() {
        for(let i = 0; i < M.ballsArray.length; i++) {
            if (M.ballsArray[i].isMoving)
                M.moveBall(i);
        }
        if(M.missileArray.length > 0){
            for(let k = 0; k < M.missileArray.length; k++) {
                M.moveMissiles(k);
            }
        }

        if(M.userActualMove !== 0)
            M.moveUser();

        M.moveBonus();


        C.sync_M_and_V();
        requestAnimationFrame(step);
    },
    sync_M_and_V: function() {
        V.clear();

        let copyUser = {
            x: M.user.posX,
            y:M.user.posY,
            width: M.user.width,
            height: M.user.height,
            status: M.user.status,
            life: M.user.life,
            speed: M.user.speed
        };

        let copyBlocks = Array();
        M.blocks.forEach(function(e){
            copyBlocks.push({
                x: e.posX,
                y: e.posY,
                width: e.width,
                height: e.height,
                status: e.status,
                life: e.life
            })
        });

        let copyBalls = Array();
        M.ballsArray.forEach(function(e){
            copyBalls.push({
                x: e.posX,
                y: e.posY,
                width: e.width,
                height: e.height,
                status: e.status,
                speed: e.speed
            })
        });

        let copyMissiles = Array();
        M.missileArray.forEach(function(e){
            copyMissiles.push({
                x: e.posX,
                y: e.posY,
                width: e.width,
                height: e.height,
                status: e.status,
                speed: e.speed
            })
        });

        let copyBonus = Array();
        M.bonusFallingArray.forEach(function(e){
            copyBonus.push({
                x: e.posX,
                y: e.posY,
                width: e.width,
                height: e.height,
                status: e.status,
                name: e.name
            });
        });

        V.render_canvas(copyUser, copyBlocks, copyBalls, copyBonus, copyMissiles);
    }
};
V = {
    clear:function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    drawUser: function(user) {
        //render user
        ctx.drawImage(userImage, user.x,user.y, user.width, user.height);
        for(let i =1; i<= user.life; i++){
            ctx.drawImage(heartImage, canvas.width - 30*i, 10, 28, 28);
        }
    },
    drawBlocks:function(blocks) {
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

                    case 3:
                        ctx.drawImage(block3Image, blocks[e].x, blocks[e].y, blocks[e].width, blocks[e].height);
                        break;

                    case -1 :
                        ctx.drawImage(blockUnbreakable, blocks[e].x, blocks[e].y, blocks[e].width, blocks[e].height);
                        break;
                }
            }
        }
    },
    drawBalls:function(balls){
        //render balls
        for(let i in balls)
        if(balls[i].status)
            ctx.drawImage(ballImage, balls[i].x, balls[i].y, balls[i].width, balls[i].height);
    },
    drawBackground:function(){
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height)
    },
    drawBonus: function(bonus){
        for(let e in bonus){
            let imageToDraw = null;
            //get the bonus name
            switch (bonus[e].name) {
                case "doubleUserSize" :  imageToDraw = doubleUserSize; break;
                case "weaponShot" : imageToDraw = weaponShot; break;
                case "threeBallsMore" : imageToDraw = threeBallsMore; break;
                case "increaseUserSpeed" : imageToDraw = increaseUserSpeed; break;
                case "splitUserSize" : imageToDraw = splitUserSize; break;
                case "reverseControls" : imageToDraw = reverseControls; break;
                case "reduceUserSpeed" : imageToDraw = reduceUserSpeed; break;
                case "increaseBallSpeed" : imageToDraw = increaseBallSpeed; break;
                case "bomb": imageToDraw = bombImage; break;
            }
            ctx.drawImage(imageToDraw, bonus[e].x, bonus[e].y, bonus[e].width, bonus[e].height)
        }
    },
    drawMissiles: function(missiles){
        for(let i in missiles)
            if(missiles[i].status)
                ctx.drawImage(ballImage, missiles[i].x, missiles[i].y, missiles[i].width, missiles[i].height);
    },
    render_canvas(user, blocks, balls, bonus, missiles) {
        V.drawBackground();
        V.drawBlocks(blocks);
        V.drawBalls(balls);
        V.drawBonus(bonus);
        V.drawMissiles(missiles);
        V.drawUser(user);
    }
};

C.init();
