window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 900;
    canvas.height = 600;

    //mouse 
    class Mouse {
        constructor(game){
            this.game = game;
            this.x = undefined;
            this.y = undefined;
            this.width = 0.1;
            this.height = 0.1;
            let canvasPosition = canvas.getBoundingClientRect();
            canvas.addEventListener('mousemove', e => {
                this.x = e.x - canvasPosition.left;
                this.y = e.y - canvasPosition.top;
            });
            canvas.addEventListener('mouseleave', e => {
                this.x = undefined;
                this.y = undefined;
            });
            canvas.addEventListener('click', e => {

                 
                this.game.praticles?.forEach(praticle =>{
                    if(this.game.checkCollision(this, praticle)){
                        praticle.targetX = 10;
                        praticle.targetY = 10;
                        this.game.restore += 25;
                    }

                })

                this.game.fallSuns?.forEach(fallSun =>{
                    if(this.game.checkCollision(this, fallSun)){
                        fallSun.targetX = 10;
                        fallSun.targetY = 10;
                        this.game.restore += 50;
                    }

                })


                this.game.defenders.defs.forEach(defender => {
                    if(this.game.checkCollision(defender, this)){
                        if(this.game.restore >= defender.cost){
                            this.game.waitDef = new Def(this.game, this.x , this.y, defender.health ,defender.type , defender.cost)
                        }
                    }
                });

                const gridPositionX = this.x - (this.x % this.game.cellSize);
                const gridPositionY = this.y - (this.y % this.game.cellSize);

                if(this.game.waitDef && this.y > 100 &&  this.game.players.every(player => player.x !== gridPositionX || player.y !== gridPositionY)){
                    if(this.game.restore >= this.game.waitDef.cost){
                        if(this.game.waitDef.type === 1){
                            this.game.players.push(new PeaShooter(this.game, gridPositionX,gridPositionY, this.game.waitDef.health ,this.game.waitDef.cost)); 
                        } else if (this.game.waitDef.type === 0){
                            this.game.players.push(new SunFlower(this.game, gridPositionX,gridPositionY, this.game.waitDef.health ,this.game.waitDef.cost)); 
                        } else if(this.game.waitDef.type === 2){
                            this.game.players.push(new WallNut(this.game, gridPositionX,gridPositionY, this.game.waitDef.health ,this.game.waitDef.cost)); 
                        }
                        this.game.restore -= this.game.waitDef.cost;
                        this.game.waitDef = null;
                    } else {
                        this.game.waitDef = null;
                    }
                } 
            });

        }
    }

    class FallSun {
        constructor(game){
            this.game = game;
            this.x = this.game.width * Math.random();
            this.y = 0;
            this.maxY = 100 + (this.game.height - 100) * Math.random() ;
            this.image = document.getElementById('sun');
            this.width = 60;
            this.targetX = null;
            this.targetY = null;
            this.height = 60;
            this.speed = 0.3;
            this.markedForDeletion = false;
            this.timer = 0;
            this.maxTimer = 8000;
            this.timeCollect = 0;
        }
        update(deltatime){
            if(this.targetX && this.targetY){
                this.x -= (this.x - this.targetX) * 0.3;
                this.y -= (this.y - this.targetY) * 0.3;
                this.timeCollect += deltatime;
                if(this.timeCollect > 1000){
                    this.markedForDeletion = true;
                }
            } else {
                this.y += this.speed;
                if(this.y > this.maxY) this.y = this.maxY;
                if(this.timer > this.maxTimer){
                    this.markedForDeletion = true;
                } else {
                    this.timer += deltatime;
                }
                
            }
        }
        draw(context){
            context.drawImage(this.image, this.x , this.y , this.width, this.height);
        }
    }

    class Particle {
        constructor(game , x, y ){
            this.game = game;
            this.x = x;
            this.y = y;
            this.targetX = null;
            this.targetY = null; 
            this.image = document.getElementById("sun");
            this.spriteSize = 50;
            this.width = this.spriteSize;
            this.height = this.spriteSize;
            this.size = this.spriteSize;
            this.speedX = 0.5;
            this.speedY = -6;
            this.maxX = x + 14;
            this.gravity = 0.5;
            this.markedForDeletion = false; 
            this.angle = 0;
            this.va = Math.random() * 0.2 - 0.1;
            this.bounced = 0;
            this.bottomBounBoundary = y + 40; 
            this.timeSun = 0;
            this.timeCollect = 0;
            this.fps = 10;
            this.timeLimit = 100000/this.fps;
        }
        update(deltaTime){
            if(this.targetX && this.targetY){
                this.x -= (this.x - this.targetX) * 0.1;
                this.y -= (this.y - this.targetY) * 0.1;
                this.timeCollect += deltaTime;
                if(this.timeCollect > 1000){
                    this.markedForDeletion = true;
                }
            } else {
                this.angle += this.va;
                this.speedY += this.gravity;
                this.y += this.speedY ;

                if(this.x > this.maxX) {
                    this.x = this.maxX;
                    this.speedX = 0;
                }else this.x += this.speedX ;

                if(this.timeSun > this.timeLimit){
                    this.markedForDeletion = true;
                } else {
                    this.timeSun += deltaTime;
                }
                
                if(this.y > this.bottomBounBoundary ){
                    this.y = this.bottomBounBoundary;
                    this.speedY = 0;
                    this.gravity = 0;
                } 
            }
        }
        draw(context){
            //context.save();
            //context.translate(this.x, this.y);
            //context.rotate(this.angle);
            //context.fillStyle = 'black';
            //context.strokeRect(this.x,this.y, this.size,this.size)
            context.drawImage(this.image,this.x, this.y ,this.size, this.size);
            //context.restore();
        }
    }
    //defenes
    class SunFlower{
        constructor(game ,x ,y ,health , cost){
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 100;
            this.height = 100;
            this.image = document.getElementById("sunFlower");
            this.frameX = 0;
            this.health = health;
            this.cost = cost;
            this.frameY = 0;
            this.maxFrame = 6;
            this.timer = 0;
            this.timerInterval = 180;
            this.timerSun = 0;
            this.sunInterval = 10000;
        }
        update(deltaTime){
            if(this.timerSun > this.sunInterval){
                if(this.frameY === 0){
                    this.frameX = 0;
                }
                this.frameY = 1;
                if(this.timer > this.timerInterval){
                    this.timer = 0;
                    if(this.frameX === 3){
                        this.game.praticles.push(new Particle(this.game, this.x + this.width * 0.3, this.y + 20));
                    }
                    if(this.frameX >= 7){
                        this.timerSun = 0;
                        this.frameY = 0;
                    } else this.frameX++;
                } else {
                    this.timer += deltaTime;
                }
            } else {
                this.timerSun += deltaTime;
                if(this.timer > this.timerInterval){
                    this.timer = 0;
                    if(this.frameX < this.maxFrame) {
                        this.frameX++;
                    } else this.frameX = 0;
                } else {
                    this.timer += deltaTime;
                }
            }
          
            
        }
        draw(context){
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x , this.y, this.width, this.height);
            
        }
    }

    class Layer {
        constructor(game,image, x ,y , health ,type , cost){
            this.game = game;
            this.width = 155;
            this.height = 100;
            this.health = health;
            this.cost = cost;
            this.image = image;
            this.type = type;
            this.x = x;
            this.y = y;
        }
        draw(context){
            //context.strokeStyle = 'black';
            //context.strokeRect(this.x, this.y, this.width, this.height);
            //context.fillStyle = "gold";
            //context.font = '30px Arial';
            //context.fillText(Math.floor(this.health), this.x +  20, this.y + 50)
            context.drawImage(this.image, this.x , this.y , this.width * 0.8, this.height * 0.8);
        }
    }

    class Defenders {
        constructor(game){
            this.game = game;
            this.image1 = document.getElementById("image1");
            this.image2 = document.getElementById("image2");
            this.image3 = document.getElementById("image3");
            this.defender1 = new Layer(this.game,this.image1, 300 + 10 , 10 , 80 , 0 , 50);
            this.defender2 = new Layer(this.game,this.image2, 300 + 155  , 10 , 100 , 1 , 100);
            this.defender3 = new Layer(this.game,this.image3, 300 + 155 + 155 , 10 , 1000 , 2 , 50);
            this.defs = [this.defender1,  this.defender2 ,  this.defender3 ];
        }
        draw(context){
            this.defs.forEach(defender => defender.draw(context));  
        }
    }

    
    class Projectile {
        constructor(game, x, y , type , dame ,speed){
            this.game = game;
            this.x = x;
            this.y = y;
            this.type = type;
            this.width = 1;
            this.height = 1;
            this.widthSize = 32;
            this.heightSize = 32;
            this.speed = speed;
            this.dame = dame;
            this.markedForDeletion = false;
            this.image = document.getElementById("pea");
        }
        update(){
            this.x += this.speed;
            if(this.x > this.game.width ) this.markedForDeletion = true;
        }
        draw(context){
            //context.fillStyle = 'yellow';
            //context.fillRect(this.x , this.y, this.width, this.height );
            context.drawImage(this.image,this.type * this.width, 0, this.widthSize, this.heightSize, this.x , this.y, this.widthSize, this.heightSize);
        }
    }

    class WallNut {
        constructor(game, x , y , health , cost){
            this.game = game;
            this.x = x + 10;
            this.y = y + 10;
            this.width = 60;
            this.height = 80;
            this.sizeWidth = 1493/21;
            this.sizeHeight = 80;
            this.image = document.getElementById("wallnut");
            this.frameX = 0;
            this.health = health;
            this.cost = cost;
            this.maxFrame = 19;
            this.wallTimer = 0;
            this.wallInterval = 100;
            this.markedForDeletion = false;
        }
        update(deltaTime){
            if(this.wallTimer > this.wallInterval){
                this.wallTimer = 0;
                if(this.frameX > this.maxFrame){
                    this.frameX = 0;
                } else this.frameX++;
            } else {
                this.wallTimer += deltaTime;
            }
        }
        draw(context){
            context.drawImage(this.image, this.frameX * this.sizeWidth, 0 , this.sizeWidth, this.sizeHeight, this.x, this.y , this.sizeWidth, this.sizeHeight);
        }
    }

    
    class Shooter {
        constructor(game, x ,y , health , cost){
            this.game = game;
            this.x = x;
            this.y = y;
            this.cost = cost;
            this.health = health;
            this.width = 100;
            this.height = 100;
            this.markedForDeletion = false;
        }
        draw(context){
            context.drawImage(this.image, this.frameX * this.sizeWidth, 0, this.sizeWidth, this.sizeHeight, this.x + 20 , this.y + 10 , this.sizeWidth * 0.8 , this.sizeHeight * 0.8);
        }
    }   

    class PeaShooter extends Shooter {
        constructor(game, x, y , health , cost){
            super(game, x, y, health, cost);
            this.image = document.getElementById('peashooter');
            this.sizeWidth = 100;
            this.sizeHeight = 100;
            this.frameX = 0;
            this.maxFrame = 24;
            this.type = 0;
            this.dame = 20;
            this.speed = 5;
            this.timeStart = 0;
            this.timerInterval = 100;
        }
        update(deltaTime){
            if(this.timeStart > this.timerInterval ){
                this.timeStart = 0;
                if(this.frameX < this.maxFrame) {
                    this.frameX++;
                    if(this.frameX === 12){
                        this.game.projectiles.push(new Projectile(this.game,this.x + this.width * 0.8, this.y + 18 , this.type , this.dame , this.speed))
                    }
                } else this.frameX = 0;
            } else {
                this.timeStart += deltaTime;
            }
            
        }
        draw(context){
            super.draw(context);
            //context.fillStyle = 'blue';
            //context.fillRect(this.x , this.y, this.width, this.height);
            //context.fillStyle = "gold";
            //context.font = '30px Arial';
            //context.fillText(Math.floor(this.health), this.x + 20, this.y + 50);
        }
    }

   

    class Def {
        constructor(game, x , y , health , type , cost){
            this.game = game;
            this.x = x;
            this.y = y;
            this.health = health;
            this.type = type;
            this.cost = cost;
            this.image = document.getElementById("plants");

           // if(type ===)
        }
        update(){
            this.x = this.game.mouse.x;
            this.y = this.game.mouse.y;
        }
        draw(context){
            //context.fillStyle = 'blue';
            //context.fillRect(this.x - this.game.cellSize/2, this.y - this.game.cellSize/2, this.game.cellSize, this.game.cellSize);
            //context.fillStyle = "gold";
            //context.font = '30px Arial';
            //context.fillText(Math.floor(this.health), this.x, this.y);
            context.drawImage(this.image, this.type * 100 , 0 , 100 , 100, this.x - this.game.cellSize/2, this.y - this.game.cellSize/2, this.game.cellSize, this.game.cellSize )
        }
    }


    class Enemy {
        constructor(game){
            this.game = game;
            this.x = this.game.width;
            this.y = 100 + Math.floor(Math.random() * 5) * 100;
            this.width = 30;
            this.height = 100;
            this.sizeWidth = 100;
            this.sizeHeight = 120;
            this.image = document.getElementById('browncoatZombie');
            this.speed = -0.1;
            this.movement = this.speed;
            this.health = 200;
            this.size = 100;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 25;
            this.fps = 15;
            this.timer = 0;
            this.timerInterval = 1000/this.fps;
        }
        update(deltaTime){
            this.x += this.movement;
            if(this.timer > this.timerInterval){
                this.timer = 0;
                if(this.frameX < this.maxFrame) {
                    this.frameX++;
                } else this.frameX = 0;
            } else {
                this.timer += deltaTime;
            }
        }
        draw(context){
            context.drawImage(this.image, this.frameX * this.sizeWidth, this.frameY * this.sizeHeight, this.sizeWidth, this.sizeHeight, this.x , this.y - 40, this.sizeWidth * 1.2,this.sizeHeight * 1.2);
        }
    }

    class Background {
        constructor(game){
            this.game = game;
            this.x = 0;
            this.y = 110;
            this.width = this.game.width;
            this.height = this.game.height - 110;
            this.image = document.getElementById("background");
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }

    class Cell {
        constructor(game,x,y ) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = this.game.cellSize;
            this.height = this.game.cellSize;
        }
    }

    class TotalSun {
        constructor(game){
            this.game = game;
            this.fontSize = 25;
            this.x = 10;
            this.y = 10;
            this.width = 208;
            this.height = 68;
            this.color = "black";
            this.image = document.getElementById("totalsun");
        }
        draw(context){
            context.save();
            context.drawImage(this.image, 0 , 0, this.width, this.height, this.x, this.y , this.width * 0.8,this.height * 0.8)
            context.fillStyle = this.color;
            context.font = "400 40px Bangers";
            context.fillText( this.game.restore, this.x +  this.width * 0.35 , this.y + this.height * 0.6)
            context.restore();
        }
    }

    class UI {
        constructor(game){
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = "Bangers";
            this.color = "black";
        }
        draw(context){
            context.save();
            context.fillStyle = this.color;
            context.font = this.fontSize + "px " + this.fontFamily;
            context.fillText('Restore: ' + this.game.restore, 500 , 30)
            context.restore();
        }
    }
    class Game {
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.cellSize = 100;
            this.cellGap = 3;
            this.mouse = new Mouse(this);
            this.defenders = new Defenders(this);
            this.def = new Def(this);
            this.enemy = new Enemy(this);
            //this.ui = new UI(this);
            this.totalSun = new TotalSun(this);
            this.sunFlower = new SunFlower(this);
            this.background = new Background(this);
            this.fallSuns = [];
            this.enemies = [];
            this.gameGrid = [];
            this.players = [];
            this.praticles = [];
            this.projectiles = [];
            this.waitDef;
            this.restore = 100;
            this.enemyTimer = 0;
            this.enemyInterval = 10000;
            this.fallTime = 0;
            this.fallInterval = 20000;
        }    
        update(deltaTime){
            if(this.gameGrid.length <= 0){
                this.createGrid();
            }   
            this.waitDef?.update();  
             //enemies
             if(this.enemyTimer > this.enemyInterval){
                this.enemyTimer = 0;
                this.addEnemy();
            } else {
                this.enemyTimer += deltaTime;
            }; 
            if(this.fallTime > this.fallInterval){
                this.fallTime = 0;
                this.addSuns();
            } else {
                this.fallTime += deltaTime;
            }
            this.enemies.forEach(enemy => {
                enemy.update(deltaTime);
                this.projectiles?.forEach(projectile => {
                    if(this.checkCollision(projectile, enemy)){
                        enemy.health -= projectile.dame;
                        projectile.markedForDeletion = true;
                        if(enemy.health <= 0){
                            enemy.markedForDeletion = true;
                        }}
                })
                this.players.forEach(player =>{
                    if(this.checkCollision(player , enemy)){
                        enemy.frameY = 1;
                        enemy.movement = 0;
                        player.health -= 1;
                        if(player.health <= 0){
                            player.markedForDeletion = true;
                            enemy.movement = enemy.speed;
                            enemy.frameY = 0;
                        }
                    } 
                    
                })
            });
            this.praticles?.forEach(praticle => praticle.update(deltaTime));
            this.praticles = this.praticles?.filter(praticle => !praticle.markedForDeletion);
            this.projectiles?.forEach(projectile => projectile.update(deltaTime));
            this.projectiles = this.projectiles?.filter(projectile => !projectile.markedForDeletion);
            
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            this.players.forEach(player => player.update(deltaTime));
            this.players = this.players.filter(player => !player.markedForDeletion);
            this.fallSuns.forEach(fallSun => fallSun.update(deltaTime));
            this.fallSuns = this.fallSuns.filter(fallSun => !fallSun.markedForDeletion);
        }
        draw(context){
            this.background.draw(context);
            this.defenders.draw(context);
            this.waitDef?.draw(context);
            //this.ui.draw(context);
            this.totalSun.draw(context);
            this.players.forEach(player => player.draw(context));
            this.projectiles?.forEach(projectile => projectile.draw(context));
            this.enemies.forEach(enemy => enemy.draw(context));
            this.praticles?.forEach(praticle => praticle.draw(context));
            this.fallSuns.forEach(fallSun => fallSun.draw(context));
        }
        createGrid(){
            for(let y = this.cellSize; y < this.height ; y += this.cellSize){
                for(let x = 0; x < this.width ; x += this.cellSize){
                    this.gameGrid.push(new Cell(this, x, y ));
                }
            }
        }
        addEnemy() {
            this.enemies.push(new Enemy(this));
        }
        addSuns(){
            this.fallSuns.push(new FallSun(this));
        }
        checkCollision(rect1, rect2){
            return (        rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y 
)
        }
    }

    const game = new Game(canvas.width, canvas.height);


    let lastTime = 0;
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime)
        game.draw(ctx);
        requestAnimationFrame(animate)
    }
    animate(0);
})