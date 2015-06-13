//Making this game was mostly for me to learn javascript and become comfortable with the syntax
//If it helps you learn, feel free to use anything from here

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
canvas.width=1275;
canvas.height=640; 

var gameplay = document.getElementById('gameplay');
var gctx = gameplay.getContext('2d');
gameplay.width = 1275;
gameplay.height = 640;


//load all
bluePlayer = new Image();
bluePlayer.src = "visuals/Blue Player.png";

redPlayer = new Image();
redPlayer.src = "visuals/Red Player.png";

floorTile = new Image();
floorTile.src = "visuals/floor-tile.png";
floorTile.height = 42;
floorTile.width = 42;

wallTile = new Image();
wallTile.src = "visuals/wall-tile.png";
wallTile.height = 42;
wallTile.width = 42;

var ROWS = 15;
var COLS = 15;

window.onload = function() {
	
	blue = new Sprite(gctx, bluePlayer, 7, 7, 33, 36);
	blue.render();
	bluePlayer.addEventListener("load", gameLoop);
	
	maze1 = new Maze(ctx, generateMaze(ROWS, COLS), 5, 5);
	maze2 = new Maze(ctx, generateMaze(ROWS, COLS), 10+floorTile.width*ROWS, 5);
	
	maze1.render();
	maze2.render();
}

function Sprite(context, img, x, y, width, height) {
	this.context = context;
	this.image = img;
	this.xPos = x;
	this.yPos = y;
	this.width = width;
	this.height= height;
	this.direction = 0;
	this.frameIndex = 1;
	this.xSpeed = 0;
	this.ySpeed = 0;
}

Sprite.prototype.render = function() {
	this.context.drawImage(
		this.image,
		this.width * this.frameIndex,
		this.height * this.direction,
		this.width,
		this.height,
		this.xPos,
		this.yPos, 
		this.width,
		this.height);
}

Sprite.prototype.move = function() {
	this.xPos += this.xSpeed;
	this.yPos += this.ySpeed;
	var collide = wallCollision(this, maze1);
	var bounds = borderCollision(this, maze1);
	if(collide != null) {
		var extra = overlapAmount(this, collide, this.direction, 2);
		//char facing down
		if(this.direction === 0) {
			this.yPos -= extra;
		}
		//char facing right
		else if(this.direction === 1) {
			this.xPos -= extra;
		}
		//char facing up
		else if(this.direction === 2) {
			this.yPos += extra;
		}
		//char facing left
		else {
			this.xPos += extra;
		}
	}
	if(bounds != 0) {
		if(this.direction ==- 0) {
			this.yPos -= bounds;
		}
		else if(this.direction === 1) {
			this.xPos -= bounds;
		}
		else if(this.direction === 2) {
			this.yPos += bounds;
		}
		else {
			this.xPos += bounds;
		}
	}

	if(this.xSpeed + this.ySpeed != 0) {
		this.frameIndex = (this.frameIndex+1)%3;
	}
}

function gameLoop() {
	window.requestAnimationFrame(gameLoop);

	update();
	blue.render();
}

function update() {
	gctx.clearRect(0, 0, gameplay.width, gameplay.height);
	handleInput(blue, 3);
	blue.move();
}


function handleInput(player, speed) {
	document.onkeydown = function(e) {
		e = e || window.event;
		//direction value - 0 is down, 1 is right, 2 is up, and 3 is left
		//up arrow
		if(e.keyCode === 38) {
			player.direction = 2;
			player.ySpeed = -1*speed;
			player.xSpeed = 0;
		}
		//down arrow
		else if(e.keyCode === 40) {
			player.direction = 0;
			player.ySpeed = speed;
			player.xSpeed = 0;
		}
		//left arrow
		else if(e.keyCode === 37) {
			player.direction = 3;
			player.xSpeed = -1*speed;
			player.ySpeed = 0;
		}
		//right arrow
		else if(e.keyCode === 39) {
			player.direction = 1;
			player.xSpeed = speed;
			player.ySpeed = 0;
		}
	}

	document.onkeyup = function(e) {
		if(e.keyCode === 38 || e.keyCode === 40) {
			player.frameIndex = 1;
			player.ySpeed = 0;
		}
		if(e.keyCode === 37 || e.keyCode === 39) {
			player.frameIndex = 1;
			player.xSpeed = 0;
		}
	}
}


// accepts a Sprite and a Maze object as parameters
function wallCollision(player, mazeObj) {
	
	var tileList = mazeObj.getSpriteList(); 

	for(var i = 0; i< mazeObj.maze.length; i++) {
		for(var j = 0; j<mazeObj.maze.length; j++) {
			//if the tile we are currently looking at is a wall
			if(mazeObj.maze[i][j] === 1 && overlap(player, tileList[i][j], 2)) {
				return tileList[i][j];
			}
		}
	}
	return null;
}

function borderCollision(player, mazeObj) {
	//colliding with left border
	if(player.xPos < mazeObj.xPos) {
		return mazeObj.xPos - player.xPos;
	}
	//colliding with right border
	else if(player.xPos + player.width > mazeObj.xPos + floorTile.width*COLS) {
		return (player.xPos + player.width) - (mazeObj.xPos + floorTile.width*COLS);
	}
	//colliding with top border
	else if(player.yPos < mazeObj.yPos) {
		return mazeObj.yPos - player.yPos;
	}
	//colliding with bottom border
	else if(player.yPos + player.height > mazeObj.xPos + floorTile.height*ROWS) {
		return (player.yPos + player.height) - (mazeObj.xPos + floorTile.height*ROWS);
	}

	else {
		return 0;
	}
}

//takes two sprites as parameters
function overlap(sprite1, sprite2, dev) {
	var verticalOverlap = false;
	var horizontalOverlap = false;
	//if intersects & sprite1 to the right of sprite2
	if(sprite1.xPos - sprite2.xPos > dev && (sprite2.xPos + sprite2.width) - sprite1.xPos > dev)
		horizontalOverlap = true;
	//if intersects & sprite1 to the left of sprite2
	else if((sprite1.xPos + sprite1.width) - sprite2.xPos > dev && (sprite2.xPos + sprite2.width) - (sprite1.xPos + sprite1.width) > dev)
		horizontalOverlap = true;
	//if intersects & sprite1 above sprite2
	if(sprite1.yPos + sprite1.height - sprite2.yPos > dev && (sprite2.yPos + sprite2.height) - (sprite1.yPos + sprite1.height) > dev)
		verticalOverlap = true;
	//if intersects & sprite2 above sprite1
	else if(sprite1.yPos - sprite2.yPos > dev && (sprite2.yPos + sprite2.height) - sprite1.yPos > dev)
		verticalOverlap = true;
	
	return (horizontalOverlap && verticalOverlap);
}

function overlapAmount(sprite1, sprite2, direction, dev) {
	//if char facing down
	if(direction === 0) {
		return sprite1.yPos + sprite1.height - sprite2.yPos - dev;
	}
	//char facing right
	else if(direction === 1) {
		return sprite1.xPos + sprite1.width - sprite2.xPos - dev;
	}
	//char facing up
	else if(direction === 2) {
		return sprite2.yPos + sprite2.height - sprite1.yPos - dev;
	}
	//char facing left
	else {
		return sprite2.xPos + sprite2.width - sprite1.xPos - dev;
	}
}

function Vector(x, y) {
	this.x_comp = x;
	this.y_comp = y;
}

Vector.prototype.getX = function() {
	return this.x_comp;
}

Vector.prototype.getY = function() {
	return this.y_comp;
}


//*************************************************************
// ALL THINGS RELATED TO GENERATING MAZES
//
// Maze object, creating 2d array, generating the maze array
//*************************************************************


//Maze object to describe a new maze
function Maze(context, array, startX, startY) {
	this.context = context;
	this.maze = array;
	this.xPos = startX;
	this.yPos = startY;
}

//Method to draw the entire maze
Maze.prototype.render = function() {
	for(var i = 0; i<ROWS; i++) {
		for(var j =0; j<COLS; j++) {
			if(this.maze[i][j] === 0)
				this.context.drawImage(floorTile, this.xPos+floorTile.width*i, this.yPos+floorTile.height*j);
			else
				this.context.drawImage(wallTile, this.xPos+wallTile.width*i, this.yPos+wallTile.height*j);
		}
	}
}

//return the maze array, but with Sprite objects representing each tile
Maze.prototype.getSpriteList = function() {
	//my array of tiles as Sprite objects
	var tileList = create2DArray(ROWS, COLS);
	for(var i = 0; i<this.maze.length; i++) {
		for(var j =0; j<this.maze[i].length; j++) {
			if(this.maze[i][j] === 0)
				tileList[i][j] = new Sprite(this.context, floorTile, this.xPos+floorTile.width*i,
					this.yPos+floorTile.height*j, floorTile.width, floorTile.height);
			else
				tileList[i][j] = new Sprite(this.context, wallTile, this.xPos+wallTile.width*i,
					this.yPos+wallTile.height*j, wallTile.width, wallTile.height);
		}
	}
	return tileList;
}

//Creates an integer array that represents a maze with r rows and c columns
//The maze is generated using Prim's algorithm
//Walls of the maze are 1's and paths are 0's 
function generateMaze(r, c) {
	//the maze represented by a 2d array with 1's representing the walls and 0's representing the floors
	//create a grid full of walls
	var maze = create2DArray(r, c);
	for(var i = 0; i<r; i++) {
		for(var j = 0; j<c; j++) {
			maze[i][j] = 1;
		}
	}
	//initial start place
	maze[0][0] = 0;

	//add adjacent walls to the wall list
	var walls = new Array();
	walls.push(new Vector(0, 1));
	walls.push(new Vector(1, 0)); 

	//while there are walls in the list
	while(walls.length > 0) {
		//pick a random wall from the list
		var random = Math.floor((Math.random())*walls.length);
		var randomX = walls[random].getX();
		var randomY = walls[random].getY(); 
		//which direction did the wall come from? look in the direction opposite
		//if the cell on the opposite side isnt in the maze yet

		//if left of wall is in the maze and is a passage, then look to the right
		//if the right is not in the maze, add it and the wall to the maze, and add
		//adjacent walls to the wall list
		if(randomX - 1 >=0 && maze[randomX -1][randomY] === 0)
		{
			if(randomX +1 <= maze.length-1 && maze[randomX+1][randomY] === 1) 
			{
				maze[randomX][randomY] = 0;
				maze[randomX +1][randomY] = 0;
				if(randomX+2 <=maze.length-1 && maze[randomX+2][randomY] === 1) {
					walls.push(new Vector(randomX+2, randomY));
				}
				if(randomY+1 <=maze.length-1 && maze[randomX+1][randomY+1] ===1) {
					walls.push(new Vector(randomX+1,randomY+1));
				}
				if(randomY-1 >= 0 && maze[randomX+1][randomY-1] === 1) {
					walls.push(new Vector(randomX+1, randomY-1));
				}
			}
		}
 
		//if the right wall is in the maze and is a passge, do the same thing to the left
		else if(randomX + 1 <=maze.length-1 && maze[randomX +1][randomY] === 0)
		{
			if(randomX -1 >= 0 && maze[randomX-1][randomY] === 1) 
			{
				maze[randomX][randomY] = 0;
				maze[randomX -1][randomY] = 0;
				if(randomX-2 >= 0 && maze[randomX-2][randomY] === 1) {
					walls.push(new Vector(randomX-2, randomY));
				}
				if(randomY+1 <=maze.length-1 && maze[randomX-1][randomY+1] ===1) {
					walls.push(new Vector(randomX-1,randomY+1));
				}
				if(randomY-1 >= 0 && maze[randomX-1][randomY-1] === 1) {
					walls.push(new Vector(randomX-1, randomY-1));
				}
			}
		}

		//if the bottom wall is in the maze and is a passsage, do the same thing to the top wall
		else if(randomY + 1 <=maze.length-1 && maze[randomX][randomY+1] === 0)
		{
			if(randomY -1 >= 0 && maze[randomX][randomY -1] === 1) 
			{
				maze[randomX][randomY] = 0;
				maze[randomX][randomY-1] = 0;
				if(randomX-1 >= 0 && maze[randomX-1][randomY-1] === 1) {
					walls.push(new Vector(randomX-1, randomY-1));
				}
				if(randomY-2 >= 0 && maze[randomX][randomY-2] ===1) {
					walls.push(new Vector(randomX,randomY-2));
				}
				if(randomX+1 <=maze.length-1 && maze[randomX+1][randomY-1] === 1) {
					walls.push(new Vector(randomX+1, randomY-1));
				}
			}
		}

		//if the top wall is in the maze and is a passage, do the same thing to the bottom wall
		else if(randomY - 1 >=0 && maze[randomX][randomY -1] === 0)
		{
			if(randomY +1 <= maze.length-1 && maze[randomX][randomY +1] === 1) 
			{
				maze[randomX][randomY] = 0;
				maze[randomX][randomY +1] = 0;
				if(randomY+2 <= maze.length-1 && maze[randomX][randomY+2] === 1) {
					walls.push(new Vector(randomX, randomY+2));
				}
				if(randomX+1 <=maze.length-1 && maze[randomX+1][randomY+1] ===1) {
					walls.push(new Vector(randomX+1,randomY+1));
				}
				if(randomX-1 >= 0 && maze[randomX-1][randomY+1] === 1) {
					walls.push(new Vector(randomX-1, randomY+1));
				}
			}
		}
		//remove the wall from the list
		removeWall(walls, random);
	}
	return maze;
}

//Returns an empty 2d array with 'rows' rows and 'cols' columns
function create2DArray(rows, cols) {
	var array = new Array(rows);
	for(var i = 0; i<rows; i++) {
		array[i] = new Array(cols);
	} 
	return array;
}

//remove an element from an unordered array
function removeWall(list, index) {
	var v = list[list.length-1];
	list[index] = v;
	list.pop();
}