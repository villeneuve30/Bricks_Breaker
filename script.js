var canvas = document.getElementById("gamecanvas");
var ctx = canvas.getContext("2d");

var M = {};
var C = {};
var V = {};

class physicElement {
    constructor(posX,posY,width,height,status = true){
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
        this.status = status;
    }

    getX(){ return this.posX; }
    setX(value){ this.posX = value; }

    getY(){ return this.posY;}
    setY(value){ this.posY = value; }

    getWidth(){ return this.width; }
    setWidth(value){ this.width = value; }

    getHeight(){ return this.height; }
    setHeight(value){ this.height = value; }

    getStatus(){ return this.status; }
    setStatus(value){ this.status = value; }
}
class Block extends physicElement{
    constructor(posX,posY,width,height,status){
        super(posX,posY,width,height,status);
    }
}
class User extends physicElement{
    constructor(posX,posY,width,height,status,life = 3){
        super(posX,posY,width,height,status);
        this.life = life;
    }

    getLife(){return this.life;}
    loseLife(){this.life--}
}
User.prototype.moveUser = function(move){
    this.posX += move;
};


class Ball extends physicElement{
    constructor(posX,posY,width,height,status, move){
        super(posX,posY,width,height,status);
        this.move = move;
    }
}
Ball.prototype.isMoving = function(){
    return this.move
};
Ball.prototype.start = function(){
    this.move = true;
};
Ball.prototype.moveBall = function(moveX, moveY){
    this.posX += moveX;
    this.posY += moveY;
};

M = {
    blocksWidth: 60,
    blocksHeight: 40,

    ballSpeed: 5,
    ballWidth: 20,
    ballHeight: 20,

    userSpeed:10,
    userActualMove:0,
    userWidth: 80,
    userHeight: 10,

    moveX : 0,
    moveY : 0,

    user :{},
    ball :{},
    blocks: [],
    i:2,

    initBall: function(){
        M.ball = new Ball(M.user.getX() + M.user.getWidth()/2, M.user.getY() - M.ballHeight , M.ballWidth, M.ballHeight, true, false);
        M.moveX = M.ballSpeed;
        M.moveY = -M.ballSpeed;
    },
    resetUserPositionAndSize: function(){
        M.user.setX(canvas.width / 2 - M.userWidth/2);
        M.user.setWidth(M.userWidth);
        M.user.setHeight(M.userHeight);
    },
    init: function () {
        M.user = new User(canvas.width / 2 - M.userWidth/2, canvas.height - 50, M.userWidth, M.userHeight, true);
        M.initBall();

        document.body.addEventListener('keydown', (e) => {
            if (e.key === "ArrowLeft") {
                if(M.userActualMove >= 0){
                    M.userActualMove = -M.userSpeed;
                }
                C.sync_M_and_V();
            }
            if (e.key === "ArrowRight") {
                if(M.userActualMove <= 0){
                    M.userActualMove = M.userSpeed;
                }
                C.sync_M_and_V();
            }
            if (e.key === " ") {
                M.ball.start();
                C.sync_M_and_V();
            }
        });
        document.body.addEventListener('keyup', (e) => {
            if(e.key === "ArrowLeft" || e.key === "ArrowRight"){
                M.userActualMove = 0;
            }
        });
        var posx = 60;
        var posy = 100;
        for (let i = 0; i <= 10; i++) {
            M.blocks.push(new Block(posx, posy, M.blocksWidth, M.blocksHeight, true));
            posx += 60;
        }
    },
    moveBall: function () {
        if(M.ball.getY() - M.ball.getHeight()/2 < M.ballSpeed){
            M.moveY = -M.moveY;
        }
        if(M.ball.getX() > canvas.width){
            M.moveX = -M.moveX;
        }
        if(M.ball.getX() < 0){
            M.moveX = -M.moveX;
        }
        if (M.ball.getY() > canvas.height) {
            M.resetUserPositionAndSize();
            M.initBall();
            M.user.loseLife();
            if(!M.user.getLife()){
                M.init()
            }
        }

        if(M.isCollision(M.ball,M.user) && M.moveY > 0){
            if(M.ball.getX() < M.user.getX() + M.user.getWidth()/4 && M.moveX > 0){
                M.moveX = -M.moveX
            }
            if(M.ball.getX() > M.user.getX() + M.user.getWidth() - M.user.getWidth()/4 && M.moveX < 0){
                M.moveX = -M.moveX
            }
            M.moveY = -M.moveY;
        }
        M.blocks.forEach(function(e, index){
            if(M.blocks[index].getStatus() && M.isCollision(M.ball, M.blocks[index])){
                if(M.ball.getY() < M.blocks[index].getY() + M.blocks[index].getHeight() && M.ball.getY() > M.blocks[index].getY()){
                    M.moveX = -M.moveX;
                }
                M.moveY = -M.moveY;
                M.blocks[index].setStatus(false);
            }
        });


        M.ball.moveBall(M.moveX, M.moveY);

    },
    moveUser: function(){
        M.user.moveUser(M.userActualMove);
        if(!M.ball.isMoving()){
            M.ball.setX(M.user.getX()+M.user.getWidth()/2)
        }
    },
    isCollision: function (elemA, elemB) {
        return elemA.getX() < elemB.getX() + elemB.getWidth() &&
            elemA.getX() + elemA.getWidth() > elemB.getX() &&
            elemA.getY() < elemB.getY() + elemB.getHeight() &&
            elemA.getHeight() + elemA.getY() > elemB.getY();
    }
};
C = {
    init:function()
    {
        M.init();
        C.refresh();
    },
    refresh: function step() {
        if (M.ball.isMoving())
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
            x: user.getX(),
            y:user.getY(),
            width: user.getWidth(),
            height: user.getHeight(),
            status: user.getStatus(),
        };

        let blocks = M.blocks;
        var copyBlocks = Array();
        blocks.forEach(function(e){
            copyBlocks.push({
                x: e.getX(),
                y: e.getY(),
                width: e.getWidth(),
                height: e.getHeight(),
                status: e.getStatus()
            })
        });

        let ball = M.ball;
        let copyBall= {
            x: ball.getX(),
            y: ball.getY(),
            width: ball.getWidth(),
            height: ball.getHeight(),
            status: ball.getStatus()
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
        ctx.beginPath();
        ctx.rect(user.x, user.y, user.width, user.height);
        ctx.stroke();
        ctx.closePath();
    },
    drawBlocks:function(blocks)
    {
        ctx.beginPath();
        //render blocks
        for(e in blocks){
            if(blocks[e].status)
                ctx.rect(blocks[e].x, blocks[e].y, blocks[e].width, blocks[e].height)
        }
        ctx.stroke();
        ctx.closePath();
    },
    drawBall:function(ball){
        ctx.beginPath();
        //render balls
        if(ball.status)
            ctx.arc(ball.x, ball.y, ball.width/2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
    },
    render_canvas(user, blocks, ball)
    {
        V.drawUser(user);
        V.drawBlocks(blocks);
        V.drawBall(ball)
    }
};

C.init();