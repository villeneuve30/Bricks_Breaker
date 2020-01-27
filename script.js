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

/*
    goodEffects: ["doubleUserSize","weaponShot","threeBallsMore", "increaseUserSpeed"]
    badEffects: ["splitUserSize","reverseControls", "reduceUserSpeed", "increaseBallSpeed"]
 */
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
class Bonus extends physicElement{
    constructor(posX,posY,width,height,status, name, duration){
        super(posX,posY,width,height,status);
        this._name = name;
        this._duration = duration;
        this._timer = null;
    }

    startBonus(){
        this._timer = setTimeout(function(){
            switch (this._name) {
                case "doubleUserSize": M.user.width = M.userWidth;
                    break;
                case "splitUserSize": M.user.width = M.userWidth;
                    break;
                case "increaseUserSpeed": M.user.speed = M.userSpeed;
                    break;
                case "reduceUserSpeed": M.user.speed = M.userSpeed;
                    break;
                case "increaseBallSpeed": M.ball.speed = M.ballSpeed;
                    break;
            }
        }.bind(this), this._duration);

        switch (this._name) {
            case "doubleUserSize":  M.user.width = M.userWidth*2;
                break;
            case "splitUserSize":  M.user.width = M.userWidth/1.5;
                break;
            case "increaseUserSpeed": M.user.speed = M.userSpeed*2;
                break;
            case "reduceUserSpeed": M.user.speed = M.userSpeed/2;
                break;
            case "increaseBallSpeed": M.ball.speed = M.ballSpeed * 2;
                break;
        }
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
class Block extends physicElement{
    constructor(posX,posY,width,height,status, life){
        super(posX,posY,width,height,status);
        this._life = life;
    }
    get life(){return this._life;}
    loseLife(){this._life--}
}
class User extends physicElement{
    constructor(posX,posY,width,height,status,speed = M.userSpeed, life = 3, bonusArray = []){
        super(posX,posY,width,height,status);
        this._speed = speed;
        this._life = life;
        this._bonusArray = bonusArray;
    }

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
    constructor(posX,posY,width,height,status, move, speed = M.ballSpeed){
        super(posX,posY,width,height,status);
        this._isMoving = move;
        this._speed = speed;
    }
    get speed(){ return this._speed}
    set speed(value){ this._speed = value}

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
    /*blocksMatrice: [
        [0,1,1,1,1,1,1,0,1,1,1,1,1,1,0],
        [0,1,0,1,1,0,1,0,1,0,1,1,0,1,0],
        [0,1,1,0,0,1,1,0,1,1,0,0,1,1,0],
        [0,1,0,1,1,0,1,0,1,0,1,1,0,1,0]
    ],*/
    blocksMatrice: [
        [0,-1,3,3,3,3,-1,0,-1,3,3,3,3,-1,0],
        [0,3,0,2,2,0,3,0,3,0,2,2,0,3,0],
        [0,3,2,0,0,2,3,0,3,2,0,0,2,3,0],
        [0,2,0,3,3,0,2,0,2,0,3,3,0,2,0]
    ],
    matriceLength: 0,
    blocksNumber: 0,

    canvasWidth: 0,

    ballWidth: 20,
    ballHeight: 20,
    ballSpeed : 4,

    userSpeed:8,
    userActualMove:0,
    userWidth: 100,
    userHeight: 15,

    bonusFallingArray: [],
    bonusFallSpeed: 3,
    allBonus: [
        ["doubleUserSize" , 10],
        ["weaponShot" , 10],
        ["threeBallsMore" , -1],
        ["increaseUserSpeed" , 10],
        ["splitUserSize" , 10],
        ["reverseControls" , 10],
        ["reduceUserSpeed" , 10],
        ["increaseBallSpeed" , 10],
        ["bomb" , -1]
    ],

    moveX : 0,
    moveY : 0,
    ratioMax:0.9,

    user :{},
    ball :{},
    blocks: [],

    initBall: function(){
        M.ball = new Ball(M.user.posX + M.user.width/2 - M.ballWidth/2, M.user.posY - M.ballHeight , M.ballWidth, M.ballHeight, true, false);
        M.moveX = 1;
        M.moveY = -1;
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
    init: function () {
        M.matriceLength = M.blocksMatrice[0].length;
        canvas.width = M.matriceLength*M.blocksWidth;

        for(let i in M.blocksMatrice) {
            for (let y in M.blocksMatrice[i]) {
                if (M.blocksMatrice[i][y] > 0) {
                    M.blocksNumber++;
                }
            }
        }
        M.bonusFallingArray = [];
        M.user = new User(canvas.width / 2 - M.userWidth/2, canvas.height - 50, M.userWidth, M.userHeight, true);
        M.initBall();

        document.body.addEventListener('keydown', (e) => {
            if (e.key === "ArrowLeft") {
                if(M.userActualMove >= 0){
                    M.userActualMove = -M.user.speed;
                }
            }
            if (e.key === "ArrowRight") {
                if(M.userActualMove <= 0){
                    M.userActualMove = M.user.speed;
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
                if (M.blocksMatrice[i][y] !== 0) {
                        M.blocks.push(new Block(posx, posy, M.blocksWidth, M.blocksHeight, true, M.blocksMatrice[i][y]));
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
            M.init();
        }
    },
    isBorderLeftOrRightCollision: function (index) {
        return (M.ball.posX + M.ball.width - M.ball.speed < M.blocks[index].posX && M.moveX > 0) ||
            (M.ball.posX + M.ball.speed > M.blocks[index].posX + M.blocks[index].width && M.moveX < 0);
    },
    getBricksCollision: function () {
        for (let index in M.blocks) {
            if (M.blocks[index].status && M.isCollision(M.ball, M.blocks[index])) {
                if (M.isBorderLeftOrRightCollision(index)) {
                    M.moveX = -M.moveX;
                    M.ball.posX += M.moveX * 2;
                }else{
                    M.moveY = -M.moveY;
                    M.ball.posY += M.moveY * 2;
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
    getUserCollision: function () {
        if (M.isCollision(M.ball, M.user) && M.moveY > 0) {
            let middleUser = M.user.posX + M.user.width/2;
            let middleBall = M.ball.posX + M.ball.width/2;

            //Positive ratio if left side (37-30 / 40-30) = 0.7 -0.3 => for X and 1.7 for Y
            //Negative ratio if right side (47-30/ 40-30 = 1.7  0.3 => for Y and 1.7 for X 1.9
            let ratio = (middleBall - M.user.posX) / (middleUser - M.user.posX);
            let ratioY = 2;

            if (ratio < 1 && ratio < 1 - M.ratioMax){
                ratio = 1 - M.ratioMax;
            }else if (ratio > 1 && ratio > 1 + M.ratioMax){
                ratio = 1 + M.ratioMax;
            }
            //left side collision
            if (ratio < 1) {
                M.moveX = -(1-ratio);
                ratioY = 2-(1-ratio);
            }else if(ratio > 1){
                //right side collision
                M.moveX = (ratio-1);
                ratioY = 2-(ratio-1);
            }else{
                M.moveX = 0;
            }

            M.moveY = -ratioY;
            return true;
        }
    },
    getCanvasCollision: function () {
        if (M.ball.posY < 0) {
            M.moveY = -M.moveY;
            return true;
        }
        if (M.ball.posX + M.ball.width > canvas.width || M.ball.posX < 0) {
            M.moveX = -M.moveX;
            return true
        }
        if (M.ball.posY > canvas.height) {
            M.resetUserPositionAndSize();
            M.initBall();
            M.user.loseLife();
            M.getUserLife();
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
                        break;
                    case "bomb":
                        M.user.loseLife();
                        M.getUserLife();
                        break;
                }
            }
            M.bonusFallingArray.splice(index, 1);
            /*
                   setTimeout(function(){
                       M.user.width = M.userWidth;
                   }, 5000);
                   M.user.width = M.userWidth*1.5;

                   M.user.speed = M.userSpeed/2;
                   setTimeout(function(){
                       M.user.speed = M.userSpeed;
                   }, 5000);*/
        }
    },
    moveBall: function () {
        for(let y = 0; y < M.ball.speed; y++) {
            M.ball.moveBall(M.moveX, M.moveY);

            if(M.getCanvasCollision()){
                break;
            }

            if(M.getUserCollision()){
                break;
            }

            if(M.getBricksCollision()){
                break;
            }
        }
        if(M.blocksNumber === 0){
            M.ball.stop();
            alert("partie finie");
            M.init();
        }
    },
    moveUser: function(){
        M.user.moveUser(M.userActualMove);
        if(!M.ball.isMoving){
            M.ball.posX = M.user.posX + M.user.width/2 - M.ball.width/2;
        }
    },
    moveBonus: function(){
        for(let index in M.bonusFallingArray){
            M.bonusFallingArray[index].moveBonus(M.bonusFallSpeed);
            M.getBonusCollision(index);
        }
    },
    bonusDropping: function(index){
        let isDropping = getRandomInt(3);
        let bonus = null;
        //bonus is dropping
        if(isDropping === 0){
            let position = getRandomInt(M.allBonus.length);
            bonus = M.allBonus[position];
            M.bonusFallingArray.push(new Bonus(M.blocks[index].posX, M.blocks[index].posY, M.blocksWidth, M.blocksHeight, true, bonus[0], bonus[1]*1000));
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

        M.moveBonus();


        C.sync_M_and_V();
        requestAnimationFrame(step);
    },
    sync_M_and_V: function()
    {
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

        let copyBall= {
            x: M.ball.posX,
            y: M.ball.posY,
            width: M.ball.width,
            height: M.ball.height,
            status: M.ball.status,
            speed: M.ball.speed
        };

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
        V.render_canvas(copyUser, copyBlocks, copyBall, copyBonus);
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
        for(let i =1; i<= user.life; i++){
            ctx.drawImage(heartImage, canvas.width - 30*i, 10, 28, 28);
        }
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
    drawBall:function(ball){
        //render balls
        if(ball.status)
            ctx.drawImage(ballImage, ball.x, ball.y, ball.width, ball.height);
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
    render_canvas(user, blocks, ball, bonus)
    {
        V.drawBackground();
        V.drawBlocks(blocks);
        V.drawBall(ball);
        V.drawBonus(bonus);
        V.drawUser(user);
    }
};

C.init();