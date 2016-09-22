/**
 * Created by lxl on 2016/8/19.
 */
function Grid(size,previousState) {
    this.size=size;
    this.cells = previousState?this.fromState(previousState):this.empty();
}
// 初始化一个grid
Grid.prototype.empty = function () {
    var cells = [];
    for(var x = 0;x<this.size;x++){
        var row = cells[x] = [];
        for(var y = 0;y<this.size;y++){
            row.push(null);
        }
    }
    return cells;
};
Grid.prototype.fromState = function (state) {
    var cells = [];
    for(var x = 0; x<this.size;x++){
        var row = cells[x] = [];
        for(var y = 0;y<this.size;y++){
            var tile = state[x][y];
            row.push(tile? new Tile(tile.position,tile.value):null);
        }
    }
    return cells;
};

Grid.prototype.cellAvaliable = function (cell) {
    return !this.cellOccupied(cell);
};
Grid.prototype.cellOccupied = function (cell) {
    return !!this.cellContent(cell);
};

Grid.prototype.cellsAvaliable = function () {
    return !!this.availibleCell().length;
};

Grid.prototype.cellContent = function (cell) {
    if(this.withinBounds(cell)){
        return this.cells[cell.x][cell.y];
    }else {
        return null
    }
};
//找到第一个随机的可用位置
Grid.prototype.availibleCell = function(){
    var cells = [];
    this.eachCell(function (x,y,tile) {
        if(!tile){
            cells.push({x:x,y:y});
        }
    });
    return cells;
};
Grid.prototype.randomAvailibleCell = function () {
    var cells = this.availibleCell();
    if(cells.length){
        return cells[Math.floor(Math.random()*cells.length)];
    }
};

//每个砖块的回调函数
Grid.prototype.eachCell = function (callback) {
    for(var i = 0;i<this.size;i++){
        for(var j = 0;j<this.size;j++){
           callback(i, j, this.cells[i][j]);
        }
    }
};
//在砖块的位置上插入砖块.
Grid.prototype.insertTile = function (tile) {
    this.cells[tile.x][tile.y] = tile;
};
Grid.prototype.removeTile = function (tile) {
    this.cells[tile.x][tile.y] = null;
};
Grid.prototype.withinBounds = function (position) {
    return position.x >= 0 && position.x<this.size
            && position.y >= 0 && position.y <this.size;
};

Grid.prototype.serialize = function () {
    var cellState = [];
    for(var x = 0;x<this.size;x++){
        var row = cellState[x] = [];
        for(var y = 0;y<this.size;y++){
            row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
        }
    }
    return {
        size:this.size,
        cells:cellState
    }
};
