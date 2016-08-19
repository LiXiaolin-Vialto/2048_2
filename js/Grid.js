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
};
Grid.prototype.fromState = function (state) {
    var cells = [];
    for(var x = 0; x<this.size;x++){
        var row = cells[x];
        for(var y = 0;y<this.size;y++){
            var tile = state[x][y];
            row.push(tile? new Tile(tile.position,tile.value):null);
        }
    }
    return cells;
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
            row.push(this.cells[x][y]?this.cells[x][y].serialize() : null);
        }
    }

    return {
        size:this.size,
        cells:cellState
    }
};