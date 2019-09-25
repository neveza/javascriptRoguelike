/* Maybe create individual objects as types of generation
such as Hospital, Police, park, dungeon... etc as a form of blueprint */

const myUtilities = {

    CalculateDistance(positionA, positionB)
    {
        let x_1 = parseInt(positionA.split(",")[0]);
        let x_2 = parseInt(positionB.split(",")[0]);

        let y_1 = parseInt(positionA.split(",")[1]);
        let y_2 = parseInt(positionB.split(",")[1]);

        let a = Math.pow((x_1 - x_2),2);
        let b = Math.pow((y_1 - y_2), 2);

        return Math.round(Math.sqrt(a + b));
    }
}

const GameMap = {
    FloorKeys: [],
    FloorMap: [], //purely to underlay the map visual, separate from ingame Cells
    Tile: ".",
    ObjectsInMap: [], //stores where an object is located per key of Cells
    WallMap: [],
    WallTile: "#",

    init: function(MapType){

        this.generateMap(MapType);

    },
};


GameMap.generateMap = function(MapType){
    let offsetY = 1; //for squeezing the generation on screen to allow text on top
    let digger = MapType.Digger;

    let digCallback = function(x, y, value){
        //the value defines what are walls or not, but not 100% how it idoes this. The result is making a larger accessible map though, and issues with FOV
        if(value) {
            let key = x + "," + (y+ offsetY)
            this.WallMap[key] = this.WallTile;
            return;}
        let key = x + "," + (y+ offsetY);

        this.FloorKeys.push(key);
        this.FloorMap[key] = ".";
        this.ObjectsInMap[key] = [];
        this.ObjectsInMap[key].push("null");
    }
    digger.create(digCallback.bind(this));

};

GameMap.placePieces = function (...args){

    for (let i = 0; i < args.length; i++)
    {
     let index = Math.floor(ROT.RNG.getUniform() * this.FloorKeys.length);
     let key = this.FloorKeys[index];
     let parts = key.split(",");
     args[i]._x = parseInt(parts[0]);
     args[i]._y = parseInt(parts[1]);
     this.ObjectsInMap[key].push(args[i]);
    }

}

GameMap.getRandomKey = function()
{
    return this.FloorKeys[ROT.RNG.getUniformInt(0, this.FloorKeys.length)];
}

GameMap.updatePiecePositionOnMap = function(someObject)
{  
    if (someObject === "null" || someObject === undefined)
    {
        //do nothing
    }
    else
    {
        position = someObject.getX() + "," + someObject.getY();

        //check list:
        let positionChanged = false;


        for (let i = 0; i < this.ObjectsInMap[position].length; i++) {

            let mapObject = this.ObjectsInMap[position][i];

            if (mapObject.type === someObject.type) {

                //do nothing for object is in position
                positionChanged = false;

            }
            else {

                positionChanged = true;

            }
        }

        if (positionChanged) {

            for (let i = 0; i < this.FloorKeys.length; i++) {
                let key = this.FloorKeys[i];

                for (let j = 0; j < this.ObjectsInMap[key].length; j++) {                   
                    let mapObject = this.ObjectsInMap[key][j];

                    if (mapObject.type === someObject.type) {

                        this.ObjectsInMap[key].splice(j, 1); // remove object from old position
                        
                        positionChanged = false;
                    }
                }
            }

            this.ObjectsInMap[position].push(someObject);

        }
    }
}

GameMap.pullMapInfoDebug = function()
{
    let playerObjects = [];
    let enemyObjects = [];
        for(let i = 0; i < this.FloorKeys.length; i++)
        {
            let key = this.FloorKeys[i];
            for(let j = 0; j < this.ObjectsInMap[key].length; j++){
                let mapObject = this.ObjectsInMap[key][j];

                if( mapObject.type == "Player")
                {
                    playerObjects.push(mapObject);
                }
                else if (mapObject.type == "Enemy")
                {
                    enemyObjects.push(mapObject);
                }
            }
        }

    console.log(playerObjects);
    console.log(enemyObjects);

}



/*
    From here on are MapTypes that will carry parameters for dungeon/map types.
*/

GameMap.GenericDungeonSmall = {

    Digger: new ROT.Map.Digger(),


}