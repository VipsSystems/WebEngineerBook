/**
 * Developed by Michal Goly on the 20/04/2016
 */

var AssetsManager = function() {
    this.images = [];
    this.audios = [];
};

// assets by Kenney Vleugels (www.kenney.nl)
AssetsManager.prototype.loadAll = function() {
    this.images["spacecraft"] = new Image();
    this.images["spacecraft"].src = "assets/PNG/playerShip2_blue.png";

    this.images["spacecraftSmallDamage"] = new Image();
    this.images["spacecraftSmallDamage"].src = "assets/PNG/Damage/playerShip2_damage1.png";
    this.images["spacecraftMediumDamage"] = new Image();
    this.images["spacecraftMediumDamage"].src = "assets/PNG/Damage/playerShip2_damage2.png";
    this.images["spacecraftBigDamage"] = new Image();
    this.images["spacecraftBigDamage"].src = "assets/PNG/Damage/playerShip2_damage3.png";

    this.images["shield1"] = new Image();
    this.images["shield1"].src = "assets/PNG/Effects/shield1.png";
    this.images["shield2"] = new Image();
    this.images["shield2"].src = "assets/PNG/Effects/shield2.png";
    this.images["shield3"] = new Image();
    this.images["shield3"].src = "assets/PNG/Effects/shield3.png";

    this.images["background"] = new Image();
    this.images["background"].src = "assets/Backgrounds/blueBig.png";

    this.images["laserBlue1"] = new Image();
    this.images["laserBlue1"].src = "assets/PNG/Lasers/laserBlue02.png";
    this.images["laserBlue2"] = new Image();
    this.images["laserBlue2"].src = "assets/PNG/Lasers/laserBlue06.png";
    this.images["laserGreen1"] = new Image();
    this.images["laserGreen1"].src = "assets/PNG/Lasers/laserGreen04.png";
    this.images["laserGreen2"] = new Image();
    this.images["laserGreen2"].src = "assets/PNG/Lasers/laserGreen12.png";
    this.images["laserRed1"] = new Image();
    this.images["laserRed1"].src = "assets/PNG/Lasers/laserRed02.png";
    this.images["laserRed2"] = new Image();
    this.images["laserRed2"].src = "assets/PNG/Lasers/laserRed06.png";

    this.images["meteorBig"] = new Image();
    this.images["meteorBig"].src = "assets/PNG/Meteors/meteorBrown_big4.png";
    this.images["meteorMedium"] = new Image();
    this.images["meteorMedium"].src = "assets/PNG/Meteors/meteorGrey_med1.png";
    this.images["meteorTiny"] = new Image();
    this.images["meteorTiny"].src = "assets/PNG/Meteors/meteorBrown_tiny1.png";

    // power ups
    this.images["shieldPower"] = new Image();
    this.images["shieldPower"].src = "assets/PNG/Power-ups/powerupYellow_shield.png";
    this.images["boltPower"] = new Image();
    this.images["boltPower"].src = "assets/PNG/Power-ups/powerupGreen_bolt.png";

    // explosions by Ville Seppanen, http://villeseppanen.com
    for (var i = 0; i < 21; i++) {
        this.images["explosion" + i] = new Image();
        this.images["explosion" + i].src = "assets/PNG/Effects/explosion" + i + ".png";
    }

    this.images["laserBlueExplosion1"] = new Image();
    this.images["laserBlueExplosion1"].src = "assets/PNG/Lasers/laserBlue09.png";
    this.images["laserBlueExplosion2"] = new Image();
    this.images["laserBlueExplosion2"].src = "assets/PNG/Lasers/laserBlue08.png";

    this.images["laserGreenExplosion1"] = new Image();
    this.images["laserGreenExplosion1"].src = "assets/PNG/Lasers/laserGreen15.png";
    this.images["laserGreenExplosion2"] = new Image();
    this.images["laserGreenExplosion2"].src = "assets/PNG/Lasers/laserGreen14.png";

    this.images["laserRedExplosion1"] = new Image();
    this.images["laserRedExplosion1"].src = "assets/PNG/Lasers/laserRed09.png";
    this.images["laserRedExplosion2"] = new Image();
    this.images["laserRedExplosion2"].src = "assets/PNG/Lasers/laserRed08.png";

    // enemies
    this.images["enemyBlue"] = new Image();
    this.images["enemyBlue"].src = "assets/PNG/Enemies/enemyBlue4.png";
    this.images["enemyRed"] = new Image();
    this.images["enemyRed"].src = "assets/PNG/Enemies/enemyRed4.png";
    this.images["enemyGreen"] = new Image();
    this.images["enemyGreen"].src = "assets/PNG/Enemies/enemyGreen3.png";
    this.images["enemyBlack"] = new Image();
    this.images["enemyBlack"].src = "assets/PNG/Enemies/enemyBlack3.png";

    // score panel
    this.images["livesRemaining"] = new Image();
    this.images["livesRemaining"].src = "assets/PNG/UI/playerLife2_blue.png";

    // icons by Gregor Črešnar
    this.images["pauseIcon"] = new Image();
    this.images["pauseIcon"].src = "assets/PNG/UI/pauseButton.png";
    this.images["resumeIcon"] = new Image();
    this.images["resumeIcon"].src = "assets/PNG/UI/resumeButton.png";

    this.loadSounds();
};

AssetsManager.prototype.loadSounds = function() {
    this.audios["shieldUp"] = new Audio("assets/Bonus/sfx_shieldUp.ogg");
    this.audios["shieldDown"] = new Audio("assets/Bonus/sfx_shieldDown.ogg");
    this.audios["laserPlayer"] = new Audio("assets/Bonus/sfx_laser1.ogg");
    this.audios["laserEnemy"] = new Audio("assets/Bonus/sfx_laser2.ogg");
    this.audios["gameOver"] = new Audio("assets/Bonus/sfx_lose.ogg");

    //Sound (c) by Michel Baradari apollo-music.de
    this.audios["explosion"] = new Audio("assets/Bonus/explodemini.wav");
};
