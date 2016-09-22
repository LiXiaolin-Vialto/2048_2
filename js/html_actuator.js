/**
 * Created by lxl on 2016/9/18.
 */
function HTMLActuator() {
    this.tileContainer = document.querySelector(".tile-container");
    this.scoreContainer = document.querySelector(".score-container");
    this.bestContainer = document.querySelector(".best-container");
    this.messageContainer = document.querySelector(".game-message");

    this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
    var self = this;

    window.requestAnimationFrame(function () {
        self.clearContainer(self.tileContainer);
        grid.cells.forEach(function (column) {
            column.forEach(function (cell) {
                if(cell){
                    self.addTile(cell);
                }
            });
        });

        self.updateBestScore(metadata.bestScore);
        self.updateScore (metadata.score);

        if(metadata.terminated){
            console.log(metadata.won);
            if(metadata.won){
                self.message(true);
            }
            else if(metadata.over){
                self.message(false);
            }
        }
    });
};

HTMLActuator.prototype.continueGame = function () {
    this.clearMessage();
};
HTMLActuator.prototype.addTile = function (tile) {
    var self = this;

    var wrap   = document.createElement("div");
    var inner     = document.createElement("div");
    var position  = tile.previousPosition || { x: tile.x, y: tile.y };
    var positionClass = this.positionClass(position);

    // We can't use classlist because it somehow glitches when replacing classes
    var classes = ["tile", "tile-" + tile.value, positionClass];

    if (tile.value > 2048) classes.push("tile-super");

    this.applyClasses(wrap, classes);

    inner.classList.add("tile-inner");
    inner.textContent = tile.value;

    if (tile.previousPosition) {
        window.requestAnimationFrame(function () {
            classes[2] = self.positionClass({ x: tile.x, y: tile.y });
            self.applyClasses(wrap, classes); // Update the position
        });
    } else if (tile.mergedFrom){
        classes.push("tile-merged");
        this.applyClasses(wrap, classes);

        // Render the tiles that merged
        tile.mergedFrom.forEach(function (merge) {
            self.addTile(merge);
        });
    }else {
        classes.push("tile-new");
        this.applyClasses(wrap, classes);
    }

    wrap.appendChild(inner);

    this.tileContainer.appendChild(wrap);
};


HTMLActuator.prototype.clearContainer = function (container) {
    while(container.firstChild){
        container.removeChild(container.firstChild);
    }
};
HTMLActuator.prototype.applyClasses = function (element,classes) {
    element.setAttribute("class",classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
    return {x:position.x + 1 ,y:position.y + 1};
};

HTMLActuator.prototype.positionClass = function (position) {
    position = this.normalizePosition(position);
    return "tile-position-" + position.x + "-" + position.y;
};
HTMLActuator.prototype.updateScore = function (score) {
    this.clearContainer(this.scoreContainer);
    var different = score - this.score;
    this.score = score;
    this.scoreContainer.textContent = score;

    if(different > 0){
        var addition = document.createElement("div");
        addition.classList.add("score-addition");
        addition.textContent = "+"+different;
        this.scoreContainer.appendChild(addition);
    }

};
HTMLActuator.prototype.updateBestScore = function (bestScore) {
    this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
    var type = won ?"game-won":"game-over";
    var message = won? "You won!" :"Game over!";

    this.messageContainer.classList.add(type);
    this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};
HTMLActuator.prototype.clearMessage = function () {
    this.messageContainer.classList.remove("game-over");
    this.messageContainer.classList.remove("game-won");
};
