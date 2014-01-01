//(function() {

var box2d = {
   b2Vec2 : Box2D.Common.Math.b2Vec2,
   b2BodyDef : Box2D.Dynamics.b2BodyDef,
   b2Body : Box2D.Dynamics.b2Body,
   b2FixtureDef : Box2D.Dynamics.b2FixtureDef,
   b2Fixture : Box2D.Dynamics.b2Fixture,
   b2World : Box2D.Dynamics.b2World,
   b2MassData : Box2D.Collision.Shapes.b2MassData,
   b2PolygonShape : Box2D.Collision.Shapes.b2PolygonShape,
   b2CircleShape : Box2D.Collision.Shapes.b2CircleShape,
   b2DebugDraw : Box2D.Dynamics.b2DebugDraw,
   b2RevoluteJointDef : Box2D.Dynamics.Joints.b2RevoluteJointDef
};

var STAGE_WIDTH = 1000;
var STAGE_HEIGHT = 700;
var BLOOD_VESSEL_THICKNESS = 170;

var SCALE = 30;
var canvas, stage, world;
var debugCanvas;
var resourcesQueue;
var collisionDetection;
var environment;

//var backgroundLevel1;

var backgroundImage;
var darkStage;
var toolbar;
var circle;

var messageField;
var circleSelectedColor;
var movingObject;
var isThereMovingObject;

var spawnPointY;

var ballsArray;
var whitesArray;
var destroyBodyList;

function init() {
	canvas = document.getElementById("canvas");
	stage = new createjs.Stage(canvas);

    debugCanvas = document.getElementById("debugCanvas");
	
	// enable touch interactions if supported on the current device:
	createjs.Touch.enable(stage);

    ballsArray = [];
    whitesArray = [];
    destroyBodyList = [];

	messageField = new createjs.Text("Loading", "bold 24px Arial", "#000000");
	messageField.maxWidth = 1000;
	messageField.textAlign = "center";
	messageField.x = canvas.width / 2;
	messageField.y = canvas.height / 2;
	stage.addChild(messageField);
	stage.update();
	
	var manifest = [
		{id:"ball", src:"ball.png"},
		{id:"backgroundLevel1", src:"Bilder/backgroundLevel1.png"},
		{id:"toolbarBackgroundImage", src:"Bilder/Symbolleiste.png"},
		{id:"neutrophilToolbar", src:"Bilder/NeutrophilSymbolleiste.png"},
		{id:"neutrophil", src:"Bilder/Neutrophil3.png"},
		{id:"dunkelHintergrund", src:"Bilder/dunkelHintergrund_grun.png"},
	];
	
	resourcesQueue = new createjs.LoadQueue(false);
	resourcesQueue.installPlugin(createjs.Sound);
	resourcesQueue.addEventListener("complete", handleResourcesComplete);
	resourcesQueue.loadManifest(manifest);
}

function handleResourcesComplete(event) {
	setupPhysics();
    setupDebugDraw();
	
	//stage.addEventListener("mousedown", handleClick);
	canvas.onclick = handleStartClick;
		
	createjs.Ticker.addEventListener("tick", tick);
	createjs.Ticker.setFPS(60);
	createjs.Ticker.useRAF = true;
	
	darkStage = new createjs.Bitmap(resourcesQueue.getResult("dunkelHintergrund"));
	circleSelectedColor = createjs.Graphics.getRGB(255, 244, 68);//(97, 91, 121);
	isThereMovingObject = false;
	
	messageField.text = "Welcome! Click to play";
	stage.update();
}

function handleStartClick() {
	stage.removeChild(messageField);
	
	/* Flash way of loading stuff
	backgroundLevel1 = new lib.TestProject();
	stage.addChild(backgroundLevel1);
	stage.update();
	*/
	
	setBackground();
	setToolbar();
	stage.update();
	
	environment = new Environment(stage);
	environment.drawHills(4, 5);

    collisionDetection = new CollisionDetection();
	
	canvas.onclick = handleClick;
}

function setBackground() {
	backgroundImage = new createjs.Bitmap(resourcesQueue.getResult("backgroundLevel1"));
	backgroundImage.regX = backgroundImage.regY = 0;
	backgroundImage.x = 0;
	backgroundImage.y = -75;
	
	stage.addChild(backgroundImage);
}

function darkenStage() {
	darkStage.regX = darkStage.regY = 0;
	darkStage.x = 0;
	darkStage.y = 0;
	darkStage.alpha = 0.5;
	
	stage.addChildAt(darkStage, stage.getChildIndex(backgroundImage) + 1);
}

function removeDarkStage() {
	stage.removeChild(darkStage);
}

function setToolbar() {
	toolbar = new createjs.Container();
	toolbar.x = 0;
	toolbar.y = 625;
	
	var toolbarBackgroundImage = new createjs.Bitmap(resourcesQueue.getResult("toolbarBackgroundImage")); 
	toolbarBackgroundImage.x = toolbarBackgroundImage.y = 0;
	toolbar.addChild(toolbarBackgroundImage);
	
	var neutrophilToolbarImage = new createjs.Bitmap(resourcesQueue.getResult("neutrophilToolbar"));
	neutrophilToolbarImage.x = 20;
	neutrophilToolbarImage.y = 20;
	neutrophilToolbarImage.addEventListener("click", handleClick_NeutrophilToolbarImage);
	toolbar.addChild(neutrophilToolbarImage);
	
	stage.addChild(toolbar);
}

function handleClick_NeutrophilToolbarImage(event)
{
	darkenStage();
	
	circle = new createjs.Shape();
	circle.graphics.beginFill(circleSelectedColor).drawCircle(0, 0, 100);
	circle.regX = circle.regY = -5;
	circle.x = event.stageX;
	circle.y = event.stageY;
	circle.alpha = 0.5;
	stage.addChild(circle);

    var whiteBloodCell = new WhiteBloodCell();
    whiteBloodCell.createCell();
    stage.addChild(whiteBloodCell.view);
    whitesArray.push(whiteBloodCell);
}

function handleClick() {	
	var b = new Ball(10/SCALE, (spawnPointY + (Math.random() - 0.5) * BLOOD_VESSEL_THICKNESS) / SCALE);
	ballsArray.push(b);
	stage.addChild(b.view); // We add createjs object, not Ball object itself!

	setTimeout(b.applyImpulse(-(Math.random()-0.5)*150, 20), 1);
}

function setupDebugDraw() {
    var debugDraw = new box2d.b2DebugDraw();
    debugDraw.SetSprite(debugCanvas.getContext('2d'));
    debugDraw.SetDrawScale(SCALE);
    debugDraw.SetFlags(box2d.b2DebugDraw.e_shapeBit | box2d.b2DebugDraw.e_jointBit);
    debugDraw.SetFillAlpha(0.7);
    world.SetDebugDraw(debugDraw);
}

function setupPhysics() {
	var gravity = new box2d.b2Vec2(0, 0);
	world = new box2d.b2World(gravity, true); // Gravity defined here

    /*
    // Create ground
    var fixDef = new box2d.b2FixtureDef();
    fixDef.density = 1;
    fixDef.friction = 0.5;
    var bodyDef = new box2d.b2BodyDef();
    bodyDef.type = box2d.b2Body.b2_staticBody;
    bodyDef.position.x = 400 / SCALE;
    bodyDef.position.y = 600 / SCALE;
    fixDef.shape = new box2d.b2PolygonShape();
    fixDef.shape.SetAsBox(400 / SCALE, 20 / SCALE);
    world.CreateBody(bodyDef).CreateFixture(fixDef); // vor wurde diese nicht kommentiert
    */
}


function tick(evt) {
/*
	for (var i = 0; i < ballsArray.length; i++) {
		var b = ballsArray[i];
		b.update();
	}
	*/

    /*
    console.log("WHITES ARRAY: ");
    for (var i = 0; i < whitesArray.length; i++) {
        var white = whitesArray[i];
        console.log(white.isBeingDragged);
    }
    */
    //console.log("TICKKKKK");
	
	if (isThereMovingObject) {
		//var moveSprite = -27;
		//movingObject.x = stage.mouseX + moveSprite;
		//movingObject.y = stage.mouseY + moveSprite;
        ////movingObject.setPosition(stage.mouseX + moveSprite, stage.mouseY + moveSprite);

		circle.x = stage.mouseX;
		circle.y = stage.mouseY;
	}

	stage.update();
	
	world.DrawDebugData(); // vor wurde diese kommentiert
	
	world.Step(1/60, 10, 10);
	world.ClearForces();

    for (var i = 0; i < destroyBodyList.length; i++) {
        world.DestroyBody(destroyBodyList[i]);
    }
    destroyBodyList = [];
}

//})();