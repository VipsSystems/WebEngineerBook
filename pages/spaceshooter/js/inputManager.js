/**
 * Developed by Michal Goly on the 20/04/2016
 */

var InputManager = function() {
    this.keys = [];
};

InputManager.prototype.registerKeyListener = function() {
    document.addEventListener("keydown", function(event) {
        this.keys[event.which] = true;
    }.bind(this), false);

    document.addEventListener("keyup", function(event) {
        this.keys[event.which] = false;
    }.bind(this), false);
};

// pause, resume game
InputManager.prototype.registerMouseListener = function(game) {
    game.canvas.addEventListener("click", function(event) {
        var x = event.clientX - game.canvas.getBoundingClientRect().left;
        var y = event.clientY - game.canvas.getBoundingClientRect().top;

        if (x > 5 && x < 30 && y > 669 && y < 694) {
            game.isPaused = game.isPaused ? false : true;
        }
    }.bind(this), false);
};