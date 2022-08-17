/**
 * Developed by Michal Goly on the 20/04/2016
 */

var Enemy = function(xPosition, yPosition, type, assetsManager, spacecraft) {
    this.xPosition = xPosition;
    this.yPosition = yPosition;
    this.type = type;
    this.assetsManager = assetsManager;
    this.spacecraft = spacecraft;
    this.width = 55;
    this.height = 56;

    this.xVelocity = 0;
    this.yVelocity = 0;
    this.mass = 200;

    this.radius = this.width / 2;
    this.xCentre = this.xPosition + this.radius;
    this.yCentre = this.yPosition + this.radius;

    if (this.type === "enemyBlue" || this.type === "enemyGreen") {
        this.accelerateFactor = 1;
        this.maxVelocity = 7;
    } else {
        this.accelerateFactor = 1;
        this.maxVelocity = 20;
    }

    this.behaviourStarted = false;

    // for blue and red behaviour (also last bit of black behaviour)
    if (this.type === "enemyBlue" || this.type === "enemyRed" || this.type === "enemyBlack") {
        // random value <100, 600>
        this.initialDescentDistance = Math.floor(Math.random() * (600 - 100 + 1)) + 100;
    }

    // green and black
    if (this.type === "enemyGreen" || this.type === "enemyBlack") {
        this.bulletDelayTimer = 0;
        this.bullets = [];
        this.startFire = false;
        this.bulletCleanUpDelayTimer = 0;
    }

    // black behaviour
    this.flewToPlayer = false;
    this.flewFromPlayer = false;
    this.flyingToLeftWall = false;
    this.flyingToRightWall = false;

    this.goDown = false;
    this.goUp = false;
    this.goRight = false;
    this.goLeft = false;

    this.isExploding = false;
    this.explosionTimer = 0;
    this.isExploded = false;
    this.explosionIndex = 0;
};

Enemy.prototype.update = function(delta) {
    if (this.isExploded && (this.type === "enemyBlue" || this.type === "enemyRed")) {
        return;
    } else if (this.isExploded && this.bullets.length !== 0) {
        // make sure bullets move even after enemy blew up
        for (var i = 0; i < this.bullets.length; i++) {
            this.bullets[i].update(delta);
        }

        // run bullet clean up code
        this.bulletsCleanUp(delta);
        return;
    } else if (this.isExploded) {
        return;
    }

    this.doBehaviour();
    this.slowDown();
    this.updateDirection();

    this.yPosition += (this.yVelocity / 10);
    this.xPosition += (this.xVelocity / 10);

    this.radius = this.width / 2;
    this.xCentre = this.xPosition + this.radius;
    this.yCentre = this.yPosition + this.radius;

    if ((this.type === "enemyGreen" || this.type === "enemyBlack") && this.startFire) {
        this.bulletDelayTimer += delta;

        if (this.bulletDelayTimer > 1000) {
            this.fire();
            this.bulletDelayTimer = 0;
        }

        for (var i = 0; i < this.bullets.length; i++) {
            this.bullets[i].update(delta);
        }

        this.bulletsCleanUp(delta);
    }

    if (this.isExploding) {
        this.explosionTimer += delta;

        if (this.explosionTimer > 50) {
            this.explosionIndex++;
            this.explosionTimer = 0;
        }

        if (this.explosionIndex > 20) {
            // end enemy's life :)
            this.isExploded = true;
            this.isExploding = false;
        }
    }
};

Enemy.prototype.draw = function(ctx) {
    if (!this.isExploded && !this.isExploding) {
        ctx.drawImage(this.assetsManager.images[this.type], this.xPosition, this.yPosition,
            this.width, this.height);
    } else if (this.isExploding) {
        ctx.drawImage(this.assetsManager.images["explosion" + this.explosionIndex],
            this.xCentre - this.radius, this.yCentre - this.radius, this.radius * 2,
            this.radius * 2);
    }

    if (this.type === "enemyGreen" || this.type === "enemyBlack") {
        for (var i = 0; i < this.bullets.length; i++) {
            this.bullets[i].draw(ctx);
        }
    }
};

Enemy.prototype.updateDirection = function() {
    // start moving up
    if (this.goUp && this.yVelocity === 0) {
        this.yVelocity -= this.accelerateFactor;
    }

    // accelerate further up
    if (this.goUp && (Math.abs(this.yVelocity) < this.maxVelocity)) {
        this.yVelocity -= this.accelerateFactor;
    }

    // start moving down
    if (this.goDown && this.yVelocity === 0) {
        this.yVelocity += this.accelerateFactor;
    }

    // accelerate further down
    if (this.goDown && (Math.abs(this.yVelocity) < this.maxVelocity)) {
        this.yVelocity += this.accelerateFactor;
    }

    // start moving right
    if (this.goRight && this.xVelocity === 0) {
        this.xVelocity += this.accelerateFactor;
    }

    // accelerate further right
    if (this.goRight && (Math.abs(this.xVelocity) < this.maxVelocity)) {
        this.xVelocity += this.accelerateFactor;
    }

    // start moving left
    if (this.goLeft && this.xVelocity === 0) {
        this.xVelocity -= this.accelerateFactor;
    }

    // accelerate further left
    if (this.goLeft && (Math.abs(this.xVelocity) < this.maxVelocity)) {
        this.xVelocity -= this.accelerateFactor;
    }
};

Enemy.prototype.slowDown = function() {
    // slow down when going up
    if (this.yVelocity < 0 && this.goDown) {
        this.yVelocity += this.accelerateFactor;
    }

    // slow down when going down
    if (this.yVelocity > 0 && this.goUp) {
        this.yVelocity -= this.accelerateFactor;
    }

    // slow down when going right
    if (this.xVelocity > 0 && this.goLeft) {
        this.xVelocity -= this.accelerateFactor;
    }

    // slow down when going left
    if (this.xVelocity < 0 && this.goRight) {
        this.xVelocity += this.accelerateFactor;
    }
};

Enemy.prototype.doBehaviour = function() {
    if (this.type === "enemyBlue") {
        this.doBlueBehaviour();
    } else if (this.type === "enemyRed") {
        this.doRedBehaviour();
    } else if (this.type === "enemyGreen") {
        this.doGreenBehaviour();
    } else if (this.type === "enemyBlack") {
        this.doBlackBehaviour();
    }
};

// slowly fly into the spacecraft, don't shoot
Enemy.prototype.doBlueBehaviour = function() {
    if (!this.behaviourStarted) {
        this.goDown = true;
        this.behaviourStarted = true;
    } else {
        if (this.yPosition < this.initialDescentDistance) {
            return;
        }

        if (this.xCentre < this.spacecraft.xCentre) {
            this.goLeft = false;
            this.goRight = true;
        } else if (this.xCentre > this.spacecraft.xCentre) {
            this.goLeft = true;
            this.goRight = false;
        } else {
            this.goLeft = false;
            this.goRight = false;
        }
    }
};

// like blue but quicker
Enemy.prototype.doRedBehaviour = function() {
    if (!this.behaviourStarted) {
        this.goDown = true;
        this.behaviourStarted = true;
    } else {
        if (this.yPosition < this.initialDescentDistance) {
            return;
        }

        if (this.xCentre < this.spacecraft.xCentre) {
            this.goLeft = false;
            this.goRight = true;
        } else if (this.xCentre > this.spacecraft.xCentre) {
            this.goLeft = true;
            this.goRight = false;
        } else {
            this.goLeft = false;
            this.goRight = false;
        }
    }
};

// fly slowly straight down the screen while shooting
Enemy.prototype.doGreenBehaviour = function() {
    if (!this.behaviourStarted) {
        this.goDown = true;
        this.behaviourStarted = true;
    } else if (this.yPosition > 0) {
        // stop shooting after leaving the screen
        if (this.yPosition >= 700) {
            this.startFire = false;
        } else {
            this.startFire = true;
        }
    }
};

// fly down, move in the direction of the player, fly into the direction of the
// wall further away, finally switch to the red behaviour while shooting constantly
Enemy.prototype.doBlackBehaviour = function() {
    if (!this.behaviourStarted){
        this.goDown = true;
        this.behaviourStarted = true;
    } else {
        if (this.yPosition > 0) {
            this.startFire = true;
        }

        if (this.yPosition > 10 && !this.flewToPlayer && !this.flewFromPlayer) {
            this.goDown = false;
            this.yVelocity = 0;

            if (this.xCentre > this.spacecraft.xPosition && this.xCentre
                < this.spacecraft.xPosition + this.spacecraft.width) {
                this.flewToPlayer = true;
            } else if (this.xCentre < this.spacecraft.xCentre) {
                this.goLeft = false;
                this.goRight = true;
            } else  {
                this.goLeft = true;
                this.goRight = false;
            }
        } else if (this.flewToPlayer && !this.flewFromPlayer) {

            if (this.xCentre > 300 && !this.flyingToRightWall) {
                this.goLeft = true;
                this.goRight = false;
                this.flyingToLeftWall = true;
            } else if (!this.flyingToLeftWall){
                this.goLeft = false;
                this.goRight = true;
                this.flyingToRightWall = true;
            }

            // check if next to wall
            if (this.xPosition < 50 || this.xPosition > 500) {
                this.goDown = true;
                this.goLeft = false;
                this.goRight = false;
                this.xVelocity = 0;
                this.flewFromPlayer = true;
            }
        } else if (this.flewFromPlayer && this.flewToPlayer) {
            // final bit, do red behaviour
            if (this.yPosition < this.initialDescentDistance) {
                return;
            }

            if (this.xCentre < this.spacecraft.xCentre) {
                this.goLeft = false;
                this.goRight = true;
            } else if (this.xCentre > this.spacecraft.xCentre) {
                this.goLeft = true;
                this.goRight = false;
            } else {
                this.goLeft = false;
                this.goRight = false;
            }

            // stop shooting after leaving the screen
            if (this.yPosition >= 700) {
                this.startFire = false;
            }
        }
    }
};

Enemy.prototype.bulletsCleanUp = function(delta) {
    // every 10 seconds remove bullets that are off the screen
    this.bulletCleanUpDelayTimer += delta;

    if (this.bulletCleanUpDelayTimer > 10000) {
        //console.log("Before: " + this.bullets.length);
        for (var i = 0; i < this.bullets.length; i++) {
            if (this.bullets[i].yPosition > 1000 || this.bullets[i].isExploded) {
                this.bullets.splice(i, 1);
                i--;
            }
        }

        //console.log("After: " + this.bullets.length);
        this.bulletCleanUpDelayTimer = 0;
    }
};

Enemy.prototype.fire = function() {
    this.bullets.push(new Bullet(this.xPosition + (this.width / 2) - (14 / 2),
        this.yPosition + this.height / 2, "red", this.assetsManager));

    this.assetsManager.audios["laserEnemy"].play();
    this.assetsManager.audios["laserEnemy"].currentTime = 0;
};

Enemy.prototype.explode = function() {
    this.isExploding = true;
    this.startFire = false;

    this.assetsManager.audios["explosion"].play();
    this.assetsManager.audios["explosion"].currentTime = 0;
};

Enemy.prototype.isOnFire = function() {
    return this.isExploded || this.isExploding;
};