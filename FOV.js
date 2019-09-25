/*

if I were to construct a separate means of FOV that can be utilized everywhere, how would I accomplish this? Possibly an object.

inputs:

Map data and player location

process:
Defining visible and non-visible per area of radius of sight.

Output: Array of visible locations


*/

const FOV = {

    fov: new ROT.FOV.RecursiveShadowcasting(Game.lightPasses.bind(this)),

    fovArray: [],

}


FOV.computeVision = function(x, y, r, visibility){


    const vision = {
        _x: x,
        _y: y,
        symbol: "3",
        color: "yellow",
        key: x + "," + y,
    }

    if(Game.isInMap(vision.key))
    {
        this.fovArray.push(vision);
        //this.cellVisual.push(vision);
        //this.cellInVision.push(vision);
        //this.visionLength = this.cellInVision.length;
    }
    


}

FOV.computeFOV = function(x, y, radius){

    if (this.fovArray.length > 0)
    {
        this.fovArray = [];
    }

    this.fov.compute(x, y, radius , this.computeVision.bind(this));

    return this.fovArray;

    //console.log(GameMap.Cells);

}