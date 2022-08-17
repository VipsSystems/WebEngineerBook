/**
 * Developed by Michal Goly on the 20/04/2016
 */

var Meteor = function(xCentre, yCentre, type, assetsManager) {
    this.xCentre = xCentre;
    this.yCentre = yCentre;
    this.type = type;
    this.assetsManager = assetsManager;

    if (this.type === "big") {
        this.radius = 48;
        this.mass = 1000;
    } else if (this.type === "medium") {
        this.radius = 21;
        this.mass = 500;
    } else if (this.type === "tiny") {
        this.radius = 9;
        this.mass = 100;
    } else {
        console.error(this.type + " is not a valid type of a meteor!");
    }

    this.xPosition = this.xCentre - this.radius;
    this.yPosition = this.yCentre - this.radius;

    // xVelocity is later picked at random
    this.xVelocity = 0;
    this.yVelocity = 10;

    this.rotationAngle = 0;
    this.rotationDelayCounter = 0;

    this.initialiseRoute();

    this.isExploding = false;
    this.explosionTimer = 0;
    this.isExploded = false;
    this.explosionIndex = 0;
};

Meteor.prototype.initialiseRoute = function() {
    // get random number between 0 to 4 inclusive
    var type = Math.floor(Math.random() * 5);
    //var type = 2;
    //console.log("Meteor route: " + type);

    switch (type) {
        case 0:
            this.isRotatingClockwise = false;
            this.xVelocity = -2;
            break;
        case 1:
            this.isRotatingClockwise = false;
            this.xVelocity = -5;
            break;
        case 2:
            this.isRotatingClockwise = true;
            break;
        case 3:
            this.isRotatingClockwise = true;
            this.xVelocity = 2;
            break;
        case 4:
            this.isRotatingClockwise = true;
            this.xVelocity = 5;
            break;
        default:
            console.error(type + " is not a valid type of route of a meteor!");
            break;
    }

    // random yVelocity between 8 and 12
    this.yVelocity = Math.floor(Math.random() * (12 - 8 + 1)) + 8;
};

Meteor.prototype.update = function(delta) {
    if (this.isExploded) {
        return;
    }

    this.yPosition += (this.yVelocity / 10);
    this.xPosition += (this.xVelocity / 10);

    this.xCentre = this.xPosition + this.radius;
    this.yCentre = this.yPosition + this.radius;

    // rotation of the meteor
    this.rotationDelayCounter += delta;

    if (this.rotationDelayCounter > 25) {
        if (this.isRotatingClockwise) {
            this.rotationAngle += 1;
        } else {
            this.rotationAngle -= 1;
        }
        this.rotationDelayCounter = 0;
    }

    if (this.isExploding) {
        this.explosionTimer += delta;

        if (this.explosionTimer > 50) {
            this.explosionIndex++;
            this.explosionTimer = 0;
        }

        if (this.explosionIndex > 20) {
            // end meteor's life :(
            this.isExploded = true;
            this.isExploding = false;
        }
    }
};

Meteor.prototype.isGoingDown = function() {
    return this.yVelocity > 0;
};

Meteor.prototype.isGoingUp = function() {
    return this.yVelocity < 0;
};

Meteor.prototype.isGoingRight = function() {
    return this.xVelocity > 0;
};

Meteor.prototype.isGoingLeft = function() {
    return this.xVelocity < 0;
};

Meteor.prototype.draw = function(ctx) {
    if (!this.isExploded && !this.isExploding) {
        if (this.type === "big") {
            this.drawRotatedImage(ctx, this.assetsManager.images["meteorBig"],
                this.xCentre, this.yCentre, this.rotationAngle);
        } else if (this.type === "medium") {
            this.drawRotatedImage(ctx, this.assetsManager.images["meteorMedium"],
                this.xCentre, this.yCentre, this.rotationAngle);
        } else {
            this.drawRotatedImage(ctx, this.assetsManager.images["meteorTiny"],
                this.xCentre, this.yCentre, this.rotationAngle);
        }

        // DEBUG
        //ctx.fillStyle = "#fff";
        //ctx.beginPath();
        //ctx.arc(this.xCentre, this.yCentre, this.radius, 0, 2 * Math.PI);
        //ctx.stroke();
    } else if (this.isExploding) {
        ctx.drawImage(this.assetsManager.images["explosion" + this.explosionIndex],
            this.xCentre - this.radius, this.yCentre - this.radius, this.radius * 2,
            this.radius * 2);
    }
};

// Inspired by the example here by Seb Lee-Delisle
// http://creativejs.com/2012/01/day-10-drawing-rotated-images-into-canvas/
Meteor.prototype.drawRotatedImage = function(ctx, image, xPosition, yPosition, angle) {
    ctx.save();
    ctx.translate(xPosition, yPosition);
    ctx.rotate(angle * Math.PI / 180);
    ctx.drawImage(image, -(image.width / 2), -(image.height / 2));
    ctx.restore();
};

// xCentre of the object to collide with
Meteor.prototype.updateRotation = function(xCentre) {
    this.isRotatingClockwise = this.xCentre - xCentre > 0;
};

Meteor.prototype.explode = function() {
    this.isExploding = true;

    this.assetsManager.audios["explosion"].play();
    this.assetsManager.audios["explosion"].currentTime = 0;
};

Meteor.prototype.isOnFire = function() {
    return this.isExploded || this.isExploding;
};