let Screen = function (){

    this.display = null;
    
    this.width = 150; 
    this.height = 49;

    this.init = function(){
        this.display = new ROT.Display({width:this.width, height:this.height});

        document.body.appendChild(this.display.getContainer());
    };

    this.updateVariety = function(...args) //mostly for debuging or things that won't be considered ingame objects
    {
        for(let i = 0; i < args.length; i++)
        {

            this.display.draw(args[i]._x, args[i]._y, 
                args[i].symbol, args[i].color)

        }

    }

    this.drawObject = function(theObject){

        this.display.draw(theObject._x, theObject._y, 
            theObject.symbol, theObject.color);
    };

    this.drawMap = function(key, symbol, color)
    {
        let parts = key.split(",");
        let x = parseInt(parts[0]);
        let y = parseInt(parts[1]);
        this.display.draw(x,y, symbol, color);        
        
    };

    this.clearMap = function(){
        this.display.clear();
    }

}

const Game = {

    init: function(){
        this.screen = new Screen();
        this.screen.init();
        GameMap.init(GameMap.GenericDungeonSmall);
        this.FOV = new ROT.FOV.RecursiveShadowcasting(this.lightPasses.bind(this));

        this.player = new Player(0, 0, "@", "red");
        this.enemy = new Enemy(0,0, "D", "green");
        for (let i = 0; i < 10; i++)
        {
            this.enemy.updatePatrol(GameMap.getRandomKey());
        }
        GameMap.placePieces(this.player,this.enemy);
        this.player.updateFOV();
        this.update();

        var scheduler = new ROT.Scheduler.Simple();
        scheduler.add(this.player, true);
        scheduler.add(this.enemy, true);
        this.engine = new ROT.Engine(scheduler);
        this.engine.start();
    },

    update:function(){    

        //this.screen.drawMap(GameMap);
        this.screen.clearMap();

        //console.log(this.player.memoryMap);

        for (let key in GameMap.FloorMap){

            //console.log(this.player.cellInVision);

            let seeAllTileDeBug = false;

            //console.log(this.player.isInMemory(key))
            if(this.player.isInMemory(key))
            {
                let symbol = GameMap.FloorMap[key];
                this.screen.drawMap(key, symbol, "grey");
            }

            if (this.player.isInView(key) || seeAllTileDeBug == true)
            {
                let symbol = GameMap.FloorMap[key];
                this.screen.drawMap(key, symbol, "white");
            }        
        
        }

        for (let key in GameMap.WallMap){

            if(this.player.isInMemory(key))
            {
                let symbol = GameMap.WallMap[key];
                this.screen.drawMap(key, symbol, "grey");
            }

            if (this.player.isInView(key))
            {
                let symbol = GameMap.WallMap[key];
                this.screen.drawMap(key, symbol, "white");
            }   
        }
        
        let length = this.enemy.cellVisual.length;
        for(let i = 0; i < length; i++)
        {
            //this.screen.updateVariety(this.enemy.cellVisual.pop());
        } 

        let pLength = this.player.cellVisual.length;
        for(let i = 0; i < pLength; i++)
        {
            //this.screen.updateVariety(this.player.cellVisual.pop());
        } 

        //this.screen.updateObjects(GameMap);

        /* This code below is bugged; maybe look if the objects are updating in the correct key list. */
        for(let i = 0; i < GameMap.FloorKeys.length; i++)
        {
            let key = GameMap.FloorKeys[i];
            
            if (Array.isArray(GameMap.ObjectsInMap[key])) {

                for (let j = 0; j < GameMap.ObjectsInMap[key].length; j++) {

                    let theObject = GameMap.ObjectsInMap[key][j];

                    GameMap.updatePiecePositionOnMap(theObject);

                     if (theObject === "null") {
                            //do nothing if no objects
                    }
                    else {
                        if (this.player.isInView(key)) {

                        this.screen.drawObject(theObject);
                        }

                    //console.log("I:" + i + "J: " + j + " " + map.ObjectsInMap[map.FloorKeys[i]][j].type, + " " + map.ObjectsInMap[map.FloorKeys[i]][j]._x + "," + map.ObjectsInMap[map.FloorKeys[i]][j]._y);
                    }
                }
            }
        }

        //GameMap.pullMapInfoDebug();
        //console.log("Player position" + this.player.getPosition());
        //console.log("Enemy position" + this.enemy.getPosition());

    },

    isInMap:function(position){
        
        for(let i = 0; i < GameMap.FloorKeys.length; i++)
        {
            //console.log(position + ", floor map: " + GameMap.FloorKeys[i]);
            if(position == GameMap.FloorKeys[i]){
                return true;
            }
        }

        return false;

    },

    isObjectInMap: function(position, objectType)
    {


        if(GameMap.FloorKeys.indexOf(position) > 0) //if position is in the key available list
        {
            
            if (GameMap.ObjectsInMap[position].length > 1)
            {          
                for(let i = 0; i < GameMap.ObjectsInMap[position].length; i++){

                    if (GameMap.ObjectsInMap[position][i] != "null" && GameMap.ObjectsInMap[position][i].type === objectType)
                    {
                        return true;
                    }
                }
            }
        }

        return false;
        },

    lightPasses: function(x,y){

        let key = x+","+y;

        return (Game.isInMap(key))

    },
    

}