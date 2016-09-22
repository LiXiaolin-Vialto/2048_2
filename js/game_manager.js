/**
 * Created by lxl on 2016/9/18.
 */
function GameManager(size,InputManager,Actuator,StorageManager) {
    this.size = size;
    this.inputManager = new InputManager;
    this.actuator = new Actuator;
    this.storageManager = new StorageManager;

    this.startTiles = 2;

    this.inputManager.on("move",this.move.bind(this));
    this.inputManager.on("restart",this.restart.bind(this));
    this.inputManager.on("keepPlaying",this.keepPlaying.bind(this));
    
    this.setup();
}

GameManager.prototype.move = function (direction) {
    // 0: up, 1: right, 2: down, 3: left
    var self = this;

    if (this.isGameTerminated()) return; // Don't do anything if the game's over

    var cell, tile;

    var vector     = this.getVector(direction);
    var traversals = this.buildTraversals(vector);
    var moved      = false;

    // Save the current tile positions and remove merger information
    this.prepareTiles();

    // Traverse the grid in the right direction and move tiles
    traversals.x.forEach(function (x) {
        traversals.y.forEach(function (y) {
            cell = { x: x, y: y };
            tile = self.grid.cellContent(cell);

            if (tile) {
                var positions = self.findFarthestPosition(cell, vector);
                var next      = self.grid.cellContent(positions.next);
                // Only one merger per row traversal?
                if (next && next.value === tile.value && !next.mergedFrom) {
                    var merged = new Tile(positions.next, tile.value * 2);
                    merged.mergedFrom = [tile, next];

                    self.grid.insertTile(merged);
                    self.grid.removeTile(tile);

                    // Converge the two tiles' positions
                    tile.updatePosition(positions.next);

                    // Update the score
                    self.score += merged.value;

                    // The mighty 2048 tile
                    if (merged.value === 2048) self.won = true;
                } else {
                    self.moveTile(tile, positions.farthest);
                }

                if (!self.positionsEqual(cell, tile)) {
                    moved = true; // The tile moved from its original cell!
                }
            }
        });
    });

    if (moved) {
        this.addRandomTile();

        if (!this.movesAvailable()) {
            this.over = true; // Game over!
        }

        this.actuate();
    }
};

GameManager.prototype.restart = function(){

    this.storageManager.clearGameState();
    this.actuator.continueGame();
    this.setup();
};

GameManager.prototype.keepPlaying  = function () {

    this.keepPlaying = true;
    this.actuator.continueGame();
};

GameManager.prototype.setup = function () {

    var previousState = this.storageManager.getGameState();
    if(previousState){
        this.grid = new Grid(previousState.grid.size,
                                 previousState.grid.cells);
        this.score = previousState.score;
        this.over = previousState.over;
        this.won = previousState.won;
        this.keepPlaying = previousState.keepPlaying;
    }else {
        this.grid = new Grid(this.size);
        this.score = 0;
        this.over = false;
        this.won = false;
        this.keepPlaying = false;

        this.addStartTiles();
    }

    this.actuate();
};
GameManager.prototype.actuate = function () {
    if(this.storageManager.bestScore < this.score){
        this.storageManager.setBestScore(this.score);
    }

    //当游戏结束未赢时，清除游戏状态
    if(this.over){
        this.storageManager.clearGameState();
    }
    else {
        this.storageManager.setGameState(this.serialize());
    }

    this.actuator.actuate(this.grid,{
        score:this.score,
        over:this.over,
        won:this.won,
        bestScore:this.storageManager.getBestScore(),
        terminated:this.isGameTerminated()
    });
};

GameManager.prototype.isGameTerminated = function () {
    return this.over || (this.won && !this.keepPlaying);
};

GameManager.prototype.addStartTiles = function () {
    for(var i = 0;i<this.startTiles;i++){
        this.addRandomTile();
    }
};
GameManager.prototype.addRandomTile = function () {
        if(this.grid.cellsAvaliable()){
        var value = Math.random()<0.9?2:4;
        var tile = new Tile(this.grid.randomAvailibleCell(),value);

        this.grid.insertTile(tile);
    }
};

//将目前的游戏情况作为对象返回
GameManager.prototype.serialize = function () {
    return {
        grid:this.grid.serialize(),
        score:this.score,
        over:this.over,
        won:this.won,
        keepPlaying:this.keepPlaying
    }
};

//保存所有的方块信息，删除合并的信息
GameManager.prototype.prepareTiles = function () {

    this.grid.eachCell(function (x,y,tile) {
        if(tile){
            tile.mergedFrom = null;
            tile.savePosition();
        }
    });
};

GameManager.prototype.moveTile  = function (tile,cells) {
    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[cells.x][cells.y] = tile;
    tile.updatePosition(cells);
};

GameManager.prototype.getVector = function (direction) {
    var map = {
        0:{x:0,y:-1},//上
        1:{x:1,y:0},//右
        2:{x:0,y:1},//下
        3:{x:-1,y:0}//左
    };
    return map[direction];
};
//创建一系列的旋转方向，使之运动到合理的位置
GameManager.prototype.buildTraversals = function (vector) {
    var traversal = {x:[],y:[]};

    for(var pos = 0;pos<this.size;pos++){
        traversal.x.push(pos);
        traversal.y.push(pos);
    }

    if(vector.x == 1){
        traversal.x = traversal.x.reverse();
    }
    else if(vector.y == 1){
        traversal.y = traversal.y.reverse();
    }

    return traversal;
};
GameManager.prototype.findFarthestPosition = function(cell,vector){
   var previous;
    do{
        previous = cell;
        cell = {x:previous.x+vector.x,
                y:previous.y+vector.y};
    }
    while(this.grid.withinBounds(cell)&&
        this.grid.cellAvaliable(cell));

    return {
            farthest:previous,
            next:cell};
};
GameManager.prototype.movesAvailable = function () {
    return this.grid.cellsAvaliable()|| this.tileMatchesAvailable();
};
GameManager.prototype.tileMatchesAvailable = function () {
    var self = this;

    var tile;

    for(var x = 0;x<this.size;x++){
        for(var y = 0;y<this.size;y++){
            tile = this.grid.cellContent({x:x,y:y});

            if(tile){
                for(var direction = 0;direction < 4;direction++){
                    var vector = this.getVector(direction);
                    var cell = {x:tile.x+vector.x,y:tile.y+vector.y};

                    var other = self.grid.cellContent(cell);
                    if(other&&other.value == tile.value){
                        return true;
                    }
                }
            }
        }
    }
    return false;
};

GameManager.prototype.positionsEqual = function (first,next) {
    return first.x == next.x && first.y == next.y;
};