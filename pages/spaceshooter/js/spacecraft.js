/**
 * Developed by Michal Goly on the 20/04/2016
 */

var Spacecraft = function(canvas, inputManager, assetsManager) {
    this.canvas = canvas;
    this.inputManager = inputManager;
    this.assetsManager = assetsManager;

    this.width = 90;
    this.height = 60;
    this.xPosition = 300 - (this.width / 2);
    this.yPosition = 600;
    this.mass = 100;
    this.xVelocity = 0;
    this.yVelocity = 0;
    this.maxVelocity = 100;
    this.accelerateFactor = 2;

    // circular collision detection variables
    this.radius = this.width / 2;
    this.xCentre = this.xPosition + this.radius;
    this.yCentre = this.yPosition + this.radius;

    // collisions with walls detection
    this.isLeftWall = false;
    this.isRightWall = false;
    this.isUpWall = false;
    this.isDownWall = false;

    this.bulletDelayTimer = 0;
    this.bullets = [];
    this.isBoltPower = false;
    this.boltDuration = 15000;
    this.boltTimer = 0;
    this.bulletCleanUpDelayTimer = 0;

    this.isShieldAnimating = false;
    this.isShieldUp = false;
    this.shieldDuriation = 15000;
    this.shieldDelayTimer = 0;
    this.shieldIndex = 0;
    this.isShieldUpAudio = false;
    this.isShieldDownAudio = false;

    this.livesRemaining = 3;
    this.score = 0;
};

Spacecraft.prototype.update = function(delta) {
    this.slowDown();
    this.updateDirection();

    this.yPosition += (this.yVelocity / 10);
    this.xPosition += (this.xVelocity / 10);

    this.radius = this.width / 2;
    this.xCentre = this.xPosition + this.radius;
    this.yCentre = this.yPosition + this.radius;

    // fire normal bullet every second, powered up bullet every 0.3 second
    this.bulletDelayTimer += delta;

    if (!this.isBoltPower && this.bulletDelayTimer > 1000) {
        this.fire("blue");
        this.bulletDelayTimer = 0;
    } else if (this.isBoltPower && this.bulletDelayTimer > 300) {
        this.fire("green");
        this.bulletDelayTimer = 0;
    }

    for (var i = 0; i < this.bullets.length; i++) {
        this.bullets[i].update(delta);
    }

    // every 10 seconds remove bullets that are off the screen
    this.bulletCleanUpDelayTimer += delta;

    if (this.bulletCleanUpDelayTimer > 10000) {
        //console.log("Before: " + this.bullets.length);
        for (var i = 0; i < this.bullets.length; i++) {
            if (this.bullets[i].yPosition < -50 || this.bullets[i].isExploded) {
                this.bullets.splice(i, 1);
                i--;
            }
        }

        //console.log("After: " + this.bullets.length);
        this.bulletCleanUpDelayTimer = 0;
    }

    this.updateShield(delta);
    this.updateBolt(delta);
};

Spacecraft.prototype.draw = function(ctx) {
    for (var i = 0; i < this.bullets.length; i++) {
        this.bullets[i].draw(ctx);
    }

    ctx.drawImage(this.assetsManager.images["spacecraft"], this.xPosition,
            this.yPosition, this.width, this.height);

    // draw the spacecraft's damage
    if (this.livesRemaining == 2) {
        ctx.drawImage(this.assetsManager.images["spacecraftSmallDamage"], this.xPosition,
            this.yPosition, this.width, this.height);
    } else if (this.livesRemaining == 1) {
        ctx.drawImage(this.assetsManager.images["spacecraftMediumDamage"], this.xPosition,
            this.yPosition, this.width, this.height);
    } else if (this.livesRemaining == 0){
        ctx.drawImage(this.assetsManager.images["spacecraftBigDamage"], this.xPosition,
            this.yPosition, this.width, this.height);
    }

    // draw the shield
    if (this.shieldIndex > 0) {
        ctx.drawImage(this.assetsManager.images["shield" + this.shieldIndex], this.xPosition,
            this.yPosition, this.width, this.height);
    }

    // collision outline for debugging
    //ctx.fillStyle = "#fff";
    //ctx.beginPath();
    //ctx.arc(this.xCentre, this.yCentre, this.radius, 0, 2 * Math.PI);
    //ctx.stroke();
    //
    //ctx.rect(this.xPosition, this.yPosition, this.width, this.height);
    //ctx.stroke();

};

Spacecraft.prototype.slowDown = function() {
    // prevents the bug where spacecraft would not stop after a collision
    if (this.xVelocity > -2 && this.xVelocity < 2) {
        this.xVelocity = 0;
    }

    if (this.yVelocity > -2 && this.yVelocity < 2) {
        this.yVelocity = 0;
    }

    // slow down when going up
    if (this.yVelocity < 0 && !this.inputManager.keys[38]) {
        this.yVelocity += this.accelerateFactor;
    }

    // slow down when going down
    if (this.yVelocity > 0 && !this.inputManager.keys[40]) {
        this.yVelocity -= this.accelerateFactor;
    }

    // slow down when going right
    if (this.xVelocity > 0 && !this.inputManager.keys[39]) {
        this.xVelocity -= this.accelerateFactor;
    }

    // slow down when going left
    if (this.xVelocity < 0 && !this.inputManager.keys[37]) {
        this.xVelocity += this.accelerateFactor;
    }
};

Spacecraft.prototype.updateDirection = function() {
    //console.log(this.isMovingHorizontally() + ", " + this.xVelocity + ", "
    //    + this.isMovingVertically() + ", " + this.yVelocity);

    // start moving up
    if (this.inputManager.keys[38] && this.yVelocity === 0 && !this.isUpWall) {
        this.yVelocity -= this.accelerateFactor;
        this.isDownWall = false;
    }

    // accelerate further up
    if (this.inputManager.keys[38] && (Math.abs(this.yVelocity) <= this.maxVelocity)) {
        this.yVelocity -= this.accelerateFactor;
    }

    // start moving down
    if (this.inputManager.keys[40] && this.yVelocity === 0 && !this.isDownWall) {
        this.yVelocity += this.accelerateFactor;
        this.isUpWall = false;
    }

    // accelerate further down
    if (this.inputManager.keys[40] && (Math.abs(this.yVelocity) <= this.maxVelocity)) {
        this.yVelocity += this.accelerateFactor;
    }

    // start moving right
    if (this.inputManager.keys[39] && this.xVelocity === 0 && !this.isRightWall) {
        this.xVelocity += this.accelerateFactor;
        this.isLeftWall = false;
    }

    // accelerate further right
    if (this.inputManager.keys[39] && (Math.abs(this.xVelocity) <= this.maxVelocity)) {
        this.xVelocity += this.accelerateFactor;
    }

    // start moving left
    if (this.inputManager.keys[37] && this.xVelocity === 0 && !this.isLeftWall) {
        this.xVelocity -= this.accelerateFactor;
        this.isRightWall = false;
    }

    // accelerate further left
    if (this.inputManager.keys[37] && (Math.abs(this.xVelocity) <= this.maxVelocity)) {
        this.xVelocity -= this.accelerateFactor;
    }
};

Spacecraft.prototype.updateShield = function(delta) {
    // shield stuff
    if (this.isShieldAnimating && !this.isShieldUp) {
        this.shieldDelayTimer += delta;

        if (!this.isShieldUpAudio) {
            this.assetsManager.audios["shieldUp"].play();
            this.assetsManager.audios["shieldUp"].currentTime = 0;
            this.isShieldUpAudio = true;
        }

        if (this.shieldDelayTimer > 500) {
            if (this.shieldIndex < 3) {
                this.shieldIndex++;
                //console.log("Shield Up: " + this.shieldIndex);
            } else {
                this.isShieldUp = true;
                this.isShieldAnimating = false;
            }

            this.shieldDelayTimer = 0;
        }
    } else if (this.isShieldAnimating && this.isShieldUp) {
        // shield down
        this.shieldDelayTimer += delta;

        if (!this.isShieldDownAudio) {
            this.assetsManager.audios["shieldDown"].play();
            this.assetsManager.audios["shieldDown"].currentTime = 0;
            this.isShieldDownAudio = true;
        }

        if (this.shieldDelayTimer > 500) {
            if (this.shieldIndex > 0) {
                this.shieldIndex--;
                //console.log("Shield down: " + this.shieldIndex);
            } else {
                this.isShieldUp = false;
                this.isShieldAnimating = false;
            }

            this.shieldDelayTimer = 0;
        }
    } else if (this.isShieldUp) {
        // count time
        this.shieldDelayTimer += delta;

        if (this.isShieldDownAudio || this.isShieldUpAudio) {
            this.isShieldDownAudio = false;
            this.isShieldUpAudio = false;
        }

        if (this.shieldDelayTimer > this.shieldDuriation) {
            // put the shield down
            this.isShieldAnimating = true;
            this.shieldDelayTimer = 0;
        }
    }
};

Spacecraft.prototype.updateBolt = function(delta) {
    if (this.isBoltPower) {
        this.boltTimer += delta;
        //console.log("boltTimer: " + this.boltTimer);
        if (this.boltTimer > this.boltDuration) {
            // switch back to blue bullets
            this.isBoltPower = false;
            this.boltTimer = 0;
        }
    }
};

Spacecraft.prototype.fire = function(color) {
    if (color === "blue" || color === "green") {
        this.bullets.push(new Bullet(this.xPosition + (this.width / 2) - (14 / 2) ,
            this.yPosition, color, this.assetsManager));

        this.assetsManager.audios["laserPlayer"].play();
        this.assetsManager.audios["laserPlayer"].currentTime = 0;
    } else {
        console.error(color + " is not an appropriate color to fire a bullet!");
    }
};

Spacecraft.prototype.shieldUp = function() {
    if (this.isShieldUp) {
        this.shieldDelayTimer = 0;
        this.isShieldAnimating = false;
    } else {
        this.isShieldAnimating = true;
    }
};

Spacecraft.prototype.boltPowerUp = function() {
    if (this.isBoltPower) {
        this.boltTimer = 0;
    } else {
        this.isBoltPower = true;
    }
};


