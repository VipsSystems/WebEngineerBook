/**
 * Developed by Michal Goly on the 20/04/2016
 */

var Bullet = function(xPosition, yPosition, color, assetsManager) {
    this.xPosition = xPosition;
    this.yPosition = yPosition;
    this.color = color;
    this.assetsManager = assetsManager;
    this.speed = this.getSpeed(this.color);
    this.width = 13;
    this.height = 37;

    this.isExploding = false;
    this.explosionTimer = 0;
    this.isExploded = false;
    this.explosionIndex = 1;
};

Bullet.prototype.update = function(delta) {
    if (this.isExploded) {
        return;
    }

    if (!this.isExploded && !this.isExploding) {
        if (this.color === "blue" || this.color === "green") {
            this.yPosition -= (this.speed / 10);
        } else {
            this.yPosition += (this.speed / 10);
        }
    }

    if (this.isExploding) {
        this.explosionTimer += delta;

        if (this.explosionTimer > 100) {
            this.explosionIndex++;
            this.explosionTimer = 0;
        }

        if (this.explosionIndex > 2) {
            // end bullets's life :(
            this.isExploded = true;
            this.isExploding = false;
        }
    }
};

Bullet.prototype.draw = function(ctx) {
    if (!this.isExploded && !this.isExploding) {
        if (this.color === "blue") {
            ctx.drawImage(this.assetsManager.images["laserBlue1"],
                this.xPosition, this.yPosition);
            ctx.drawImage(this.assetsManager.images["laserBlue2"],
                this.xPosition, this.yPosition);
        } else if (this.color === "green") {
            ctx.drawImage(this.assetsManager.images["laserGreen1"],
                this.xPosition, this.yPosition);
            ctx.drawImage(this.assetsManager.images["laserGreen2"],
                this.xPosition, this.yPosition);
        } else if (this.color === "red") {
            ctx.drawImage(this.assetsManager.images["laserRed1"],
                this.xPosition, this.yPosition);
            ctx.drawImage(this.assetsManager.images["laserRed2"],
                this.xPosition, this.yPosition);
        } else {
            console.error(this.color + " is not a valid color!");
        }
    } else if (this.isExploding) {
        // draw explosion
        if (this.color === "blue") {
            ctx.drawImage(this.assetsManager.images["laserBlueExplosion" + this.explosionIndex],
                this.xPosition - this.width, this.yPosition);
        } else if (this.color === "green") {
            ctx.drawImage(this.assetsManager.images["laserGreenExplosion" + this.explosionIndex],
                this.xPosition - this.width, this.yPosition);
        } else if (this.color === "red") {
            ctx.drawImage(this.assetsManager.images["laserRedExplosion" + this.explosionIndex],
                this.xPosition - this.width, this.yPosition + this.height);
        } else {
            console.error(this.color + " is not a valid color!");
        }
    }
};

Bullet.prototype.getSpeed = function(color) {
    if (color === "blue" || color === "red") {
        return 50;
    } else if (color === "green") {
        return 100;
    } else {
        console.error(color + " is not a valid color to determine bullet speed");
        return NaN;
    }
};

Bullet.prototype.explode = function() {
    this.isExploding = true;
};

Bullet.prototype.isOnFire = function() {
    return this.isExploded || this.isExploding;
};