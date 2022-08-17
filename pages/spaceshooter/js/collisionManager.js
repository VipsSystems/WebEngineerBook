/**
 * Developed by Michal Goly on the 20/04/2016
 */

var CollisionManager = function(game) {
    this.game = game;
    this.spacecraft = game.spacecraft;
    this.meteors = game.meteors;
    this.powerUps = game.powerUps;
    this.enemies = game.enemies;

    this.collisionDelayTimer = 0;
};

CollisionManager.prototype.checkAndResolve = function(delta) {
    this.collisionDelayTimer += delta;

    if (this.collisionDelayTimer > 10) {
        this.checkMeteorsWithMeteors();
        this.checkSpacecraftWithMeteors();
        this.checkSpacecraftWithEnemies();
        this.checkSpacecraftBulletsWithMeteorsEnemies();
        this.checkEnemyBulletsWithSpacecraft();
        this.collisionDelayTimer = 0;
    }

    this.checkSpacecraftWithWalls();
    this.checkSpacecraftWithPowerUps();
};

CollisionManager.prototype.checkMeteorsWithMeteors = function() {
    if (this.meteors.length < 2) {
        return;
    }

    for (var i = 0; i < this.meteors.length - 1; i++) {
        for (var j = i + 1; j < this.meteors.length; j++) {
            if (!this.meteors[i].isOnFire() && !this.meteors[j].isOnFire()) {
                if (this.circleCircleCollision(this.meteors[i], this.meteors[j])) {
                    //console.log("meteor collison");
                    this.resolveElasticCollision(this.meteors[i], this.meteors[j]);
                    this.meteors[i].updateRotation(this.meteors[j].xCentre);
                    this.meteors[j].updateRotation(this.meteors[i].xCentre);
                }
            }
        }
    }
};

CollisionManager.prototype.checkSpacecraftWithWalls = function() {
    if (this.spacecraft.xPosition < 5) {
        //console.log("LEFT");
        this.spacecraft.xVelocity = 0;
        this.spacecraft.isLeftWall = true;
        this.spacecraft.xPosition = 5;
    }

    if (this.spacecraft.xPosition + this.spacecraft.width + 5 > this.game.canvas.width) {
        //console.log("RIGHT");
        this.spacecraft.xVelocity = 0;
        this.spacecraft.isRightWall = true;
        this.spacecraft.xPosition = this.game.canvas.width - this.spacecraft.width - 5;
    }

    if (this.spacecraft.yPosition < 5) {
        //console.log("TOP");
        this.spacecraft.yVelocity = 0;
        this.spacecraft.isUpWall = true;
        this.spacecraft.yPosition = 5;
    }

    if (this.spacecraft.yPosition + this.spacecraft.height + 5 > this.game.canvas.height) {
        //console.log("BOTTOM");
        this.spacecraft.yVelocity = 0;
        this.spacecraft.isDownWall = true;
        this.spacecraft.yPosition = this.game.canvas.height - this.spacecraft.height - 5;
    }
};

CollisionManager.prototype.checkSpacecraftWithEnemies = function() {
    for (var i = 0; i < this.enemies.length; i++) {
        if (!this.enemies[i].isOnFire() && this.rectRectCollision(this.spacecraft, this.enemies[i])) {
            if (this.circleRectCollision(this.spacecraft, this.enemies[i])) {
                //console.log("Spacecraft - enemy collision");

                this.resolveElasticCollision(this.spacecraft, this.enemies[i]);
                // blow up the enemy
                this.enemies[i].explode();

                if (!this.spacecraft.isShieldUp) {
                    this.spacecraft.livesRemaining--;
                } else {
                    this.spacecraft.score += 20;
                }
            }
        }
    }
};

CollisionManager.prototype.checkSpacecraftWithPowerUps = function() {
    // combine rectangular and circular collision detections
    for (var i = 0; i < this.powerUps.length; i++) {
        // rectangle-rectangle collision
        if (this.rectRectCollision(this.spacecraft, this.powerUps[i])) {
            if (this.circleRectCollision(this.spacecraft, this.powerUps[i])) {
                //console.log("SPACECRAFT-POWERUP COLLISION");
                if (this.powerUps[i].type === "boltPower") {
                    this.spacecraft.boltPowerUp();
                } else if (this.powerUps[i].type === "shieldPower") {
                    this.spacecraft.shieldUp();
                } else {
                    console.error(this.powerUps[i].type + " is not a proper powerUp");
                }
                this.powerUps[i].isPickedUp = true;
            }
        }
    }

    // clean up picked up power ups
    for (var i = 0; i < this.powerUps.length; i++) {
        if (this.powerUps[i].isPickedUp) {
            this.powerUps.splice(i, 1);
            i--;
        }
    }
};

CollisionManager.prototype.rectRectCollision = function(rect1, rect2) {
    return rect1.xPosition < rect2.xPosition + rect2.width
        && rect1.xPosition + rect1.width > rect2.xPosition
        && rect1.yPosition < rect2.yPosition + rect2.height
        && rect1.height + rect1.yPosition > rect2.yPosition;
};

CollisionManager.prototype.circleCircleCollision = function(circle1, circle2) {
    var distanceX = circle1.xCentre - circle2.xCentre;
    var distanceY = circle1.yCentre - circle2.yCentre;
    var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    return circle1.radius + circle2.radius > distance;
};

// http://stackoverflow.com/questions/21089959/detecting-collision-of-rectangle-with-circle
CollisionManager.prototype.circleRectCollision = function(circle, rect) {
    var distanceX = Math.abs(circle.xCentre - rect.xPosition - rect.width / 2);
    var distanceY = Math.abs(circle.yCentre - rect.yPosition - rect.height / 2);

    if (distanceX > (rect.width / 2 + circle.radius)) {
        return false;
    }

    if (distanceY > (rect.height / 2 + circle.radius)) {
        return false;
    }

    if (distanceX <= (rect.width / 2)) {
        return true;
    }

    if (distanceY <= (rect.height / 2)) {
        return true;
    }

    var dx = distanceX - rect.width / 2;
    var dy = distanceY - rect.height / 2;

    return dx * dx + dy * dy <= (circle.radius * circle.radius);
};

CollisionManager.prototype.checkSpacecraftWithMeteors = function() {
    for (var i = 0; i < this.meteors.length; i++) {
        if (!this.meteors[i].isOnFire() && this.circleCircleCollision(this.spacecraft, this.meteors[i])) {
            if (this.circleRectCollision(this.meteors[i], this.spacecraft)) {

                this.resolveElasticCollision(this.spacecraft, this.meteors[i]);
                // blow the meteor up
                this.meteors[i].explode();

                if (!this.spacecraft.isShieldUp) {
                    this.spacecraft.livesRemaining--;
                } else {
                    this.spacecraft.score += 10;
                }
            }
        }
    }
};

CollisionManager.prototype.checkSpacecraftBulletsWithMeteorsEnemies = function() {
    for (var i = 0; i < this.spacecraft.bullets.length; i++) {
        // ignore bullets that have already hit a target
        if (this.spacecraft.bullets[i].isOnFire()) {
            continue;
        }

        // check bullets/meteors
        for (var j = 0; j < this.meteors.length; j++) {
            if (this.meteors[j].isOnFire()) {
                continue;
            }

            if (this.circleRectCollision(this.meteors[j], this.spacecraft.bullets[i])) {
                //console.log("Bullet - Meteor Collision");
                this.meteors[j].explode();
                this.spacecraft.bullets[i].explode();
                this.spacecraft.score += 10;
            }
        }

        // check bullets/enemies
        for (var k = 0; k < this.enemies.length; k++) {
            if (this.enemies[k].isOnFire()) {
                continue;
            }

            if (this.rectRectCollision(this.enemies[k], this.spacecraft.bullets[i])) {
                //console.log("Bullet - Enemy collision");
                this.enemies[k].explode();
                this.spacecraft.bullets[i].explode();
                this.spacecraft.score += 20;
            }
        }
    }
};

CollisionManager.prototype.checkEnemyBulletsWithSpacecraft = function() {
    for (var i = 0; i < this.enemies.length; i++) {

        if (this.enemies[i].type === "enemyBlue" || this.enemies[i].type === "enemyRed") {
            // blue and red enemies have no bullets
            continue;
        }

        for (var j = 0; j < this.enemies[i].bullets.length; j++) {
            if (this.enemies[i].bullets[j].isOnFire()) {
                continue;
            }

            if (this.rectRectCollision(this.spacecraft, this.enemies[i].bullets[j])) {
                if (this.circleRectCollision(this.spacecraft, this.enemies[i].bullets[j])) {
                    this.enemies[i].bullets[j].explode();

                    if (!this.spacecraft.isShieldUp) {
                        this.spacecraft.livesRemaining--;
                    }
                }
            }
        }
    }
};

CollisionManager.prototype.resolveElasticCollision = function(body1, body2) {
    var tempVelX = body1.xVelocity;
    var tempVelY = body1.yVelocity;
    var totalMass = body1.mass + body2.mass;

    // velocity after elastic collision, floor used to simplify the implementation
    body1.xVelocity = Math.floor((body1.xVelocity * (body1.mass - body2.mass)
        + 2 * body2.mass * body2.xVelocity) / totalMass);

    body1.yVelocity = Math.floor((body1.yVelocity * (body1.mass - body2.mass)
        + 2 * body2.mass * body2.yVelocity) / totalMass);

    body2.xVelocity = Math.floor((body2.xVelocity * (body2.mass - body1.mass)
        + 2 * body1.mass * tempVelX) / totalMass);

    body2.yVelocity = Math.floor((body2.yVelocity * (body2.mass - body1.mass)
        + 2 * body1.mass * tempVelY) / totalMass);
};
