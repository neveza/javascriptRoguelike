var Enemy = function(x, y, symbol, color){
    this._x = x;
    this._y = y;
    this.type = "Enemy";

    this.targetX = 0;
    this.targetY = 0;

    this.focusX = 0;
    this.focuxY = 0;

    this.symbol = symbol;
    this.color = color;

    this.cellVisual = [];
    this.cellInVision = [];
    this.visionLength = 0;

    this.patrolPoint = [];
    //this.fovUpdate();

    //behaviorFlags
    this.defaultBehavior = "idle" //this may change depending on enemy type, but will always default to this behavior after athreat or task is done
    this.currentBehavior = "idle" 
    this.defaultTickDown = 50;
    this.chaseTickDown = 0;
    this.inChaseTick = 0;

    //miss is 0,1, or true or false. If 1, then the enemy made a 'miss' or mistake resulting in incorrect determination of accuracy towards target. 
    //Reckless is the range for generating values for inflated mistakes; Higher the number, more reckless the decisions. For chase Behavior: increases per tick then resets during behavior shift.
    this.reckless = 0;
    this.nReckless = 0;
    this.miss = [];
    for(let i = 0; i < 10; i++)
    {       
        this.miss[i] = ROT.RNG.getUniformInt(0,1);
        this.reckless = this.recklessDefault;
    }
}

Enemy.prototype.getX = function(){ return this._x;}
Enemy.prototype.getY = function(){return this._y;}
Enemy.prototype.getPosition = function(){return this._x + "," + this._y;}
Enemy.prototype.getTargetPosition = function(){return this.targetX + "," + this.targetY}
Enemy.prototype.getFocusPosition = function(){return this.focusX + "," + this.focusY}

Enemy.Behaviors = {
    idle:"idle",
    patrol: "patrol",
    chase: "chase"
    
}

Enemy.prototype.computeBehavior = function(){

    //let key = this.cellInVision[ROT.RNG.getUniformInt(0,this.visionLength-1)].key;

    if (this.currentBehavior == Enemy.Behaviors.chase)
    {       
        if(this.getPosition() == this.getTargetPosition() || this.chaseTickDown <= 0 )
        {
            this.currentBehavior = Enemy.Behaviors.patrol;

            this.reckless = 5;
            this.nReckless = 0;
            this.inChaseTick = 0;

            this.retarget(this.patrolPoint[ROT.RNG.getUniformInt(0, this.patrolPoint.length)]);
                   

        }
        else
        {
            this.chaseTickDown--;
            this.inChaseTick++;

            if(this.inChaseTick % 2 == 0)
            {
                this.nReckless++;
            }

            this.reckless = 0 + this.nReckless;

            if (this.miss[ROT.RNG.getUniformInt(0,9)] == 1)
            {
                this.focusX = this.targetX;
                this.focusY = this.targetY;
                this.focusX += ROT.RNG.getUniformInt((-1*this.reckless), this.reckless);
                this.focusY += ROT.RNG.getUniformInt((-1*this.reckless), this.reckless);
            }
            else{
                this.focusX = this.targetX;
                this.focusY = this.targetY;
            }
        }
    }
    else if (this.currentBehavior == Enemy.Behaviors.idle)
    {
        this.currentBehavior = Enemy.Behaviors.patrol;
        this.retarget(this.patrolPoint[ROT.RNG.getUniformInt(0, this.patrolPoint.length)]);
        
        
    }
    else if (this.currentBehavior == Enemy.Behaviors.patrol)
    {       
            this.reckless = 5
            //console.log("distance: " + myUtilities.CalculateDistance(this.getPosition(), this.getTargetPosition()));
            if (myUtilities.CalculateDistance(this.getPosition(), this.getTargetPosition()) < 5) 
            {
                this.retarget(this.patrolPoint[ROT.RNG.getUniformInt(0, this.patrolPoint.length)]);
            }

            this.focusX = this.targetX;
            this.focusY = this.targetY;
        
    } 

}

Enemy.prototype.updatePatrol = function(key){

    this.patrolPoint.push(key);

}

Enemy.prototype.checkTarget = function(){

    //let visionLength = this.cellInVision.length;

    for (let i = 0; i < this.visionLength; i++)
    {
        let key = this.cellInVision[i].key;
        if(Game.isObjectInMap(key, "Player")) //if player is seen
        {

            this.retarget(key);

            this.currentBehavior = Enemy.Behaviors.chase;

            this.chaseTickDown = this.defaultTickDown;
            
            //this.reckless = 0 + this.nReckless;

            /*debug purpose
            for(let j = 0; j < this.cellVisual.length; j++)
            {
                if(this.cellVisual[j]._x == this.targetX && this.cellVisual[j]._y == this.targetY)
                {

                    this.cellVisual[j].color = "blue";

                }
            }*/
        }
    }

}

Enemy.prototype.retarget = function(key)
{
    if (Game.isInMap(key))
    {
        this.targetX = parseInt(key.split(",")[0]);
        this.targetY = parseInt(key.split(",")[1]);

        this.focusX = this.targetX;
        this.focusY = this.targetY;
    }
}
/*
Enemy.prototype.computeVision = function(x, y, r, visibility){


    const vision = {
        _x: x,
        _y: y,
        symbol: "3",
        color: "yellow",
        key: x + "," + y,
    }

    if(Game.isInMap(vision.key))
    {
        this.cellVisual.push(vision);
        this.cellInVision.push(vision);
        this.visionLength = this.cellInVision.length;
    }
    


}*/

Enemy.prototype.fovUpdate = function(){

    this.cellInVision = FOV.computeFOV(this._x, this._y, 5);
    this.cellVisual = this.cellInVision;
    this.visionLength = this.cellInVision.length;

    //console.log(GameMap.Cells);

}



Enemy.prototype.act = function(){
    //let targetX = Game.player.getX(); //maybe have a target function that will feed into act
    //let targetY = Game.player.getY();
    this.fovUpdate();
    this.checkTarget();
    this.computeBehavior();

    this.cellInVision = [];

    var passableCallback = function(x,y){
        let key = x + "," + y;
        return (Game.isInMap(key));
    }

    //console.log(x + "," + y + "enemey loc" + this._x + "," + this._y);
    var astar = new ROT.Path.AStar(this.focusX, this.focusY, passableCallback, {topology:4});

    var path = [];
    var pathCallback = function(x, y){
        path.push([x, y]);
    }

    astar.compute(this._x, this._y, pathCallback);
    //console.log(astar);
    //console.log(path);

    path.shift(); /*remove pedro's position*/
    //console.log(path.length);
    if (path.length < 1){
        //Game.engine.lock();
        //Game.textObject._draw("GameOver!!!!!!!!!!!!");
    }else {

        let key = path[0][0] + ',' + path[0][1];


        if (Game.isInMap(key))
        {
            this._x = path[0][0];
            this._y = path[0][1];
        }
    }    

}