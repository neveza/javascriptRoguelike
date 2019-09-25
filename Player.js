let Player = function(x,y, symbol, color){
    this._x = x;
    this._y = y;
    this.symbol = symbol;
    this.color = color;
    this.type = "Player";

    this.cellVisual = [];
    this.cellInVision = [];
    this.visionLength = 0;
    this.memoryMap = [];
    //this.position = this._x + "," + this._y;
}

Player.prototype.getX = function(){ return this._x;}
Player.prototype.getY = function(){return this._y;}
Player.prototype.getPosition = function(){return this._x + "," + this._y;}

Player.prototype.updateFOV = function(){ 

    this.cellInVision = FOV.computeFOV(this._x, this._y, 10);
    this.cellVisual = this.cellInVision;
    this.visionLength = this.cellInVision.length;

    for(let i = 0; i < this.visionLength; i++)
    {

        let key = this.cellInVision[i].key;

        if(this.isInMemory(key))
        {
            //do nothing
        }
        else{
            this.memoryMap.push(key);
        }

    }
}

Player.prototype.isInView = function(key){

    //console.log("The Vision Length is: " + this.visionLength);
    for(let i = 0; i < this.visionLength; i++)
    {
        //console.log(cellInVision[i].key + " " + key);
        if(this.cellInVision[i].key == key)
        {
            return true;
        }
    }

    return false;

}

Player.prototype.isInMemory = function(key){

    for(let i = 0; i < this.memoryMap.length; i++)
    {
        //console.log("MemoryMapkey: " + this.memoryMap[i] + "key to validate: " + key)
        if(this.memoryMap[i] == key)
        {
            return true;
        }
    }
    return false;
}

Player.prototype.act = function(){
    //console.log(this);
    Game.engine.lock();
    window.addEventListener("keydown", this);
}

Player.prototype.handleEvent = function(e){
    let keyMap = {};
    keyMap[38] = 0;
    keyMap[33] = 1;
    keyMap[39] = 2;
    keyMap[34] = 3;
    keyMap[40] = 4;
    keyMap[35] = 5;
    keyMap[37] = 6;
    keyMap[36] = 7;

    var code = e.keyCode;

    this.updateFOV();

    if(code == 13 || code == 32){
        return;
    }

    if(!(code in keyMap)) {return;}

    var diff = ROT.DIRS[8][keyMap[code]];
    var newX = this._x + diff[0];
    var newY = this._y + diff[1];

    var newKey = newX + "," + newY;

    //this.updateFOV();

    if (Game.isInMap(newKey)){
    this._x = newX;
    this._y = newY;
    window.removeEventListener("keydown", this);
    Game.engine.unlock();
    Game.update();
    }

}