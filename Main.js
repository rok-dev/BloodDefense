
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

const SCALE = 30;

const STAGE_WIDTH = 1000;
const STAGE_HEIGHT = 700;
const BLOOD_VESSEL_THICKNESS = 170;

const DIALOG_IMAGE_X = 450;
const DIALOG_IMAGE_Y = 350;

const STARTING_LIFE = 10;
const REMOVE_LIFE_ON_PANTH_FINISH = 1;

const STARTING_ENERGY = 200;
const ADD_ENERGY_ON_RED_FINISH = 5;
const WHITE_ENERGY_CREATION_COST = 100;

const END_GAME_ENERGY_NEEDED = 600;

var canvas, stage, world;
var debugCanvas;
var resourcesQueue;
var collisionDetection;
var environment;

var gameStateEnum = {INITIAL: 0, PLAYING: 1, PAUSE: 2};
var gameState;

//var backgroundLevel1;

var backgroundImage;
var darkStage;
var toolbar;
var circle;
var dialogContainer;

var messageField;
var circleSelectedColor;
var movingObject;
var isThereMovingObject;

var isDialogDisplayed;
var dialogTextArray;
var dialogTextCurrentIndex;

var spawnPointY;

var ballsArray;
var ballsContainer;

var whitesArray;
var whitesContainer;

var destroyBodyList;

var panthCreationTickCounter;
var playingTickCounter;

var panthProbabilitiesArray;

var youtubeIcon;

var energy;
var energyTextField;
var life;
var lifeTextField;

var wasFirstLifeLostAlready;

/**
 * TODO:
 *       - fine tune energy/health cifre
 *       - fine tune tick cifre
 */
function init() {
    gameState = gameStateEnum.INITIAL;

	canvas = document.getElementById("canvas");
	stage = new createjs.Stage(canvas);

    debugCanvas = document.getElementById("debugCanvas");
	
	// enable touch interactions if supported on the current device:
	createjs.Touch.enable(stage);



	messageField = new createjs.Text("LOADING...", "bold 24px Arial", "#000000");
	messageField.maxWidth = 1000;
	messageField.textAlign = "center";
	messageField.x = canvas.width / 2;
	messageField.y = canvas.height / 2;
	stage.addChild(messageField);

	stage.update();

	var manifest = [
        {id:"button", src:"Bilder/button.png"},
        {id:"banner", src:"Bilder/banner1.png"},
        {id:"businessWomanStart", src:"Bilder/businessWoman2.png"},
        {id:"neutrophil3D", src:"Bilder/neutrophil3D.png"},
        {id:"eosinophil3D", src:"Bilder/eosinophil3D.png"},
        {id:"virus3D", src:"Bilder/virus3D.png"},

		{id:"backgroundLevel1", src:"Bilder/backgroundLevel1.png"},
        {id:"backgroundLevel2", src:"Bilder/backgroundLevel2.png"},
		{id:"toolbarBackgroundImage", src:"Bilder/Symbolleiste.png"},
        {id:"dunkelHintergrund", src:"Bilder/dunkelHintergrund.png"},
        {id:"dialog", src:"Bilder/dialog5.png"},
        {id:"arrow", src:"Bilder/arrow.png"},
        {id:"youtube", src:"Bilder/youtube.png"},
        {id:"dead", src:"Bilder/dead.png"},
        {id:"win", src:"Bilder/win.png"},

        {id:"bacteria", src:"Bilder/bacteria.png"},
        {id:"parasite", src:"Bilder/parasite.png"},
        {id:"virusInfectedCell", src:"Bilder/virusInfectedCell.png"},
        {id:"redBloodCell", src:"Bilder/redBloodCell.png"},

		{id:"toolbarNeutrophil", src:"Bilder/toolbarNeutrophil.png"},
        {id:"toolbarEosinophil", src:"Bilder/toolbarEosinophil.png"},
        {id:"toolbarLymphocyte", src:"Bilder/toolbarLymphocyte.png"},

		{id:"neutrophil", src:"Bilder/Neutrophil3.png"},
        {id:"eosinophil", src:"Bilder/Eosinophil2.png"},
        {id:"lymphocyte", src:"Bilder/Lymphocyte2.png"},

        // SOUNDS
        {id:"backgroundSound", src:"Sounds/BamaCountry.ogg"},
        {id:"click", src:"Sounds/click.ogg"},
        {id:"error", src:"Sounds/error.ogg"}

	];
	
	resourcesQueue = new createjs.LoadQueue(false);
	resourcesQueue.installPlugin(createjs.Sound);
	resourcesQueue.addEventListener("complete", handleResourcesComplete);
	resourcesQueue.loadManifest(manifest);
}

function handleResourcesComplete(event) {

	
	//stage.addEventListener("mousedown", handleDialogClick);
	//canvas.onclick = handleStartClick;
		
	createjs.Ticker.addEventListener("tick", tick);
	createjs.Ticker.setFPS(60);
	createjs.Ticker.useRAF = true;
	
	darkStage = new createjs.Bitmap(resourcesQueue.getResult("dunkelHintergrund"));
	circleSelectedColor = createjs.Graphics.getRGB(255, 244, 68);//(97, 91, 121);
	isThereMovingObject = false;

    stage.removeAllChildren();
    setupStartScreen();
}

function setupStartScreen() {
    var startBackgroundImage = new createjs.Bitmap(resourcesQueue.getResult("backgroundLevel1"));
    startBackgroundImage.x = 0;
    startBackgroundImage.y = 0;
    startBackgroundImage.alpha = 0.5;
    stage.addChild(startBackgroundImage);

    /*
    var businessWoman = new createjs.Bitmap(resourcesQueue.getResult("businessWomanStart"));
    businessWoman.x = 800;
    businessWoman.y = 200;
    stage.addChild(businessWoman);
*/


    var virus3D = new createjs.Bitmap(resourcesQueue.getResult("virus3D"));
    virus3D.x = 800;
    virus3D.y = 520;
    virus3D.scaleX = virus3D.scaleY = 0.4;
    stage.addChild(virus3D);

    var neutrophil3D = new createjs.Bitmap(resourcesQueue.getResult("neutrophil3D"));
    neutrophil3D.x = 180;
    neutrophil3D.y = 205;
    stage.addChild(neutrophil3D);

    var eosinophil3D = new createjs.Bitmap(resourcesQueue.getResult("eosinophil3D"));
    eosinophil3D.x = 520;
    eosinophil3D.y = 190;
    stage.addChild(eosinophil3D);

    var banner = new createjs.Bitmap(resourcesQueue.getResult("banner"));
    banner.x = 120;
    banner.y = 80;
    stage.addChild(banner);

    createButton(180, 500, "START GAME", handleStartClick);
    createButton(180, 570, "CREDITS", setupCreditsScreen);

    stage.update();

    createjs.Sound.stop();
    createjs.Sound.play("backgroundSound", {loop:-1});
}

function setupCreditsScreen() {
    stage.removeAllChildren();

    var startBackgroundImage = new createjs.Bitmap(resourcesQueue.getResult("backgroundLevel1"));
    startBackgroundImage.x = 0;
    startBackgroundImage.y = 0;
    startBackgroundImage.alpha = 0.5;
    stage.addChild(startBackgroundImage);

    var credits = "Author (programming, some images):" +
        "\nRok Povšič - rok.povsic@gmail.com" +
        "\n\nFrameworks:" +
        "\nCreateJS - www.createjs.com" +
        "\nBox2Dweb - code.google.com/p/box2dweb/" +
        "\n\nImages:" +
        "\nOpenGameArt - www.opengameart.org" +
        "\nWikipedia - en.wikipedia.org/wiki/White_blood_cell" +
        "\nGroovelock - http://www.flickr.com/photos/groovelock/" +
        "\n\nMusic:" +
        "\nBama Country Kevin MacLeod - www.incompetech.com" +
        "\nErokia, RADIY - www.freesound.org" +
        "\n\nThis is open source software! Find source at:" +
        "\nwww.github.com/rok-dev/BloodDefense";

    var txtCredits = new createjs.Text(credits, "bold 30px Monotype Corsiva", "#111111");
    txtCredits.maxWidth = 1000;
    txtCredits.textAlign = "center";
    txtCredits.x = STAGE_WIDTH / 2;
    txtCredits.y = 50;
    txtCredits.alpha = 0.8;
    stage.addChild(txtCredits);

    createButton(180, 630, "RETURN TO THE MAIN SCREEN", handleReturnToMainScreen);

    stage.update();
}

function setupDeathScreen() {
    var startBackgroundImage = new createjs.Bitmap(resourcesQueue.getResult("backgroundLevel1"));
    startBackgroundImage.x = 0;
    startBackgroundImage.y = 0;
    startBackgroundImage.alpha = 0.5;
    stage.addChild(startBackgroundImage);

    var deadImage = new createjs.Bitmap(resourcesQueue.getResult("dead"));
    deadImage.x = 200;
    deadImage.y = 200;
    stage.addChild(deadImage);

    createButton(180, 430, "RETURN TO THE MAIN SCREEN", handleReturnToMainScreen);

    stage.update();
}

function setupWinScreen() {
    var startBackgroundImage = new createjs.Bitmap(resourcesQueue.getResult("backgroundLevel1"));
    startBackgroundImage.x = 0;
    startBackgroundImage.y = 0;
    startBackgroundImage.alpha = 0.5;
    stage.addChild(startBackgroundImage);

    var banner = new createjs.Bitmap(resourcesQueue.getResult("win"));
    banner.x = 200;
    banner.y = 200;
    stage.addChild(banner);

    var businessWoman = new createjs.Bitmap(resourcesQueue.getResult("businessWomanStart"));
    businessWoman.x = 30;
    businessWoman.y = 200;
    businessWoman.alpha = 1;
    stage.addChild(businessWoman);

    createButton(180, 430, "RETURN TO THE MAIN SCREEN", handleReturnToMainScreen);

    stage.update();
}

function createButton(x, y, text, clickListenerFunction) {
    var containerStart = new createjs.Container();
    var imgStart = new createjs.Bitmap(resourcesQueue.getResult("button"));
    imgStart.x = x;
    imgStart.y = y;
    containerStart.addChild(imgStart);

    var txtStart = new createjs.Text(text, "bold 26px Monotype Corsiva", "#FFFFFF");
    txtStart.maxWidth = 1000;
    txtStart.textAlign = "center";
    txtStart.x = x + 300;
    txtStart.y = y + 16;
    txtStart.alpha = 0.8;

    containerStart.addEventListener("click", clickListenerFunction);
    containerStart.addChild(txtStart);

    stage.addChild(containerStart);
}

function newGameInitialization() {
    setupPhysics();
    //setupDebugDraw();

    ballsContainer = new createjs.Container();
    whitesContainer = new createjs.Container();

    ballsArray = [];

    whitesArray = [];

    destroyBodyList = [];

    isDialogDisplayed = false;
    dialogTextArray = [];
    dialogTextCurrentIndex = 0;

    panthCreationTickCounter = 0;
    playingTickCounter = 0;

    youtubeIcon = null;

    wasFirstLifeLostAlready = false;

    stage.removeAllChildren();

    setBackground();
    setToolbar();
    stage.update();

    environment = new Environment(stage);
    environment.drawHills(3, 5);

    stage.addChild(whitesContainer);
    stage.addChild(ballsContainer);

    gameState = gameStateEnum.PLAYING;
    collisionDetection = new CollisionDetection();

    energy = STARTING_ENERGY;
    life = STARTING_LIFE;

    var lifeLabel = new createjs.Text("Health: ", "bold 20px Verdana", "#CC0000");
    lifeLabel.maxWidth = 1000;
    lifeLabel.x = 810;
    lifeLabel.y = 10;
    stage.addChild(lifeLabel);

    lifeTextField = new createjs.Text("", "20px Arial", "#CC0000");
    lifeTextField.maxWidth = 1000;
    lifeTextField.x = 910;
    lifeTextField.y = 13;
    stage.addChild(lifeTextField);

    var energyLabel = new createjs.Text("Energy: ", "bold 20px Verdana", "#0066FF");
    energyLabel.maxWidth = 1000;
    energyLabel.x = 810;
    energyLabel.y = 30;
    stage.addChild(energyLabel);

    energyTextField = new createjs.Text("", "20px Arial", "#0066FF");
    energyTextField.maxWidth = 1000;
    energyTextField.x = 910;
    energyTextField.y = 33;
    stage.addChild(energyTextField);
}

function handleStartClick(event) {
    newGameInitialization();
}

function handleReturnToMainScreen(event) {
    stage.removeAllChildren();

    setupStartScreen();
}

function setBackground() {
	backgroundImage = new createjs.Bitmap(resourcesQueue.getResult("backgroundLevel2"));
	backgroundImage.regX = backgroundImage.regY = 0;
	backgroundImage.x = 0;
	backgroundImage.y = -75;
	
	stage.addChild(backgroundImage);
}

function setToolbar() {
	toolbar = new createjs.Container();
	toolbar.x = 0;
	toolbar.y = 625;
	
	var toolbarBackgroundImage = new createjs.Bitmap(resourcesQueue.getResult("toolbarBackgroundImage")); 
	toolbarBackgroundImage.x = toolbarBackgroundImage.y = 0;
	toolbar.addChild(toolbarBackgroundImage);
	
	var neutrophilToolbarImage = new createjs.Bitmap(resourcesQueue.getResult("toolbarNeutrophil"));
	neutrophilToolbarImage.x = 20;
	neutrophilToolbarImage.y = 5;
	neutrophilToolbarImage.addEventListener("click", handleClick_NeutrophilToolbarImage);
	toolbar.addChild(neutrophilToolbarImage);

	stage.addChild(toolbar);
}

function addEosinophilToToolbar() {
    var eosinophilToolbarImage = new createjs.Bitmap(resourcesQueue.getResult("toolbarEosinophil"));
    eosinophilToolbarImage.x = 100;
    eosinophilToolbarImage.y = 5;
    eosinophilToolbarImage.addEventListener("click", handleClick_EosinophilToolbarImage);
    toolbar.addChild(eosinophilToolbarImage);
}

function addLymphocyteToToolbar() {
    var lymphocyteToolbarImage = new createjs.Bitmap(resourcesQueue.getResult("toolbarLymphocyte"));
    lymphocyteToolbarImage.x = 180;
    lymphocyteToolbarImage.y = 5;
    lymphocyteToolbarImage.addEventListener("click", handleClick_LymphocyteToolbarImage);
    toolbar.addChild(lymphocyteToolbarImage);
}

function addDialog() {
    gameState = gameStateEnum.PAUSE;

    isDialogDisplayed = true;
    dialogTextCurrentIndex = 0;

    darkenStage();

    dialogContainer = new createjs.Container();

    var dialogImage = new createjs.Bitmap(resourcesQueue.getResult("dialog"));
    dialogImage.x = DIALOG_IMAGE_X;
    dialogImage.y = DIALOG_IMAGE_Y;
    dialogContainer.addChild(dialogImage);

    dialogContainer.addChild(getDialogText(dialogTextArray[dialogTextCurrentIndex]));
    dialogTextCurrentIndex++;

    dialogContainer.addEventListener("click", handleDialogClick);

    stage.addChild(dialogContainer);
}

function getDialogText(text) {
    var text = new createjs.Text(text, "bold 20px Arial", "#583d4e");
    text.maxWidth = 1000;
    text.textAlign = "center";
    text.x = DIALOG_IMAGE_X + 350;
    text.y = DIALOG_IMAGE_Y + 55;
    return text;
}

function handleClick_NeutrophilToolbarImage(event) {
    createWhiteBloodCellAndGoToPositiongMode("neutrophil");
}

function handleClick_EosinophilToolbarImage(event) {
    createWhiteBloodCellAndGoToPositiongMode("eosinophil");
}

function handleClick_LymphocyteToolbarImage(event) {
    createWhiteBloodCellAndGoToPositiongMode("lymphocyte");
}

function createWhiteBloodCellAndGoToPositiongMode(whiteBloodCellType) {
    if (gameState != gameStateEnum.PLAYING) return;

    if (energy >= WHITE_ENERGY_CREATION_COST) {
        energy -= WHITE_ENERGY_CREATION_COST;

        createjs.Sound.play("click");

        var whiteBloodCell = new WhiteBloodCell();
        whiteBloodCell.createCell(whiteBloodCellType);
        whitesContainer.addChild(whiteBloodCell.view);
        whitesArray.push(whiteBloodCell);

        goToPositioningMode();
    } else {
        createjs.Sound.play("error", {volume:0.3});

        addWarningText("You need at least " + WHITE_ENERGY_CREATION_COST + " energy to create a white blood cell.");
    }
}

function addWarningText(text) {
    var textLabel = new createjs.Text(text, "bold 20px Arial", "#ffffff");
    textLabel.maxWidth = 1000;
    textLabel.x = 270;
    textLabel.y = 650;
    textLabel.addEventListener("tick", function(event) {
        textLabel.alpha -= 0.01;
        if (textLabel.alpha <= 0) {
            stage.removeChild(textLabel);
        }
    })
    stage.addChild(textLabel);
}

function addCircle() {
    circle = new createjs.Shape();
    circle.graphics.beginFill(circleSelectedColor).drawCircle(0, 0, 100);
    circle.regX = circle.regY = -5;
    circle.alpha = 0.5;
    stage.addChildAt(circle, stage.getChildIndex(whitesContainer));
}

function removeCircle() {
    stage.removeChild(circle);
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

function goToPositioningMode() {
    darkenStage();
    addCircle();
}

function goOutOfPositioningMode() {
    removeDarkStage();
    removeCircle();
}

function handleDialogClick() {
    if (isDialogDisplayed) {
        createjs.Sound.play("click");

        if (dialogTextCurrentIndex < dialogTextArray.length) {
            dialogContainer.removeChildAt(1);

            var text;
            if (dialogTextArray[dialogTextCurrentIndex] instanceof Array) {
                text = dialogTextArray[dialogTextCurrentIndex][0];

                var arrowImage = new createjs.Bitmap(resourcesQueue.getResult("arrow"));
                arrowImage.x = dialogTextArray[dialogTextCurrentIndex][1];
                arrowImage.y = dialogTextArray[dialogTextCurrentIndex][2];
                arrowImage.alpha = 0.9;
                dialogContainer.addChild(arrowImage);
            } else {
                text = dialogTextArray[dialogTextCurrentIndex];
            }
            dialogContainer.addChildAt(getDialogText(text), 1); // Text is positioned under the arrow (if it exists).

            dialogTextCurrentIndex++;
        } else {
            stage.removeChild(dialogContainer);
            removeDarkStage();

            if (youtubeIcon) {
                stage.removeChild(youtubeIcon);
                youtubeIcon = null;
            }

            gameState = gameStateEnum.PLAYING;
            dialogTextCurrentIndex = 0;
            isDialogDisplayed = false;
        }
    }
}

function generateNewPanth() {
    var pathogenType;
    var pathogenScale;
    var rand = Math.random();
    if (rand < panthProbabilitiesArray["bacteria"]) {
        pathogenType = "bacteria";
        pathogenScale = 0.3;
    } else if (rand < panthProbabilitiesArray["parasite"]) {
        pathogenType = "parasite";
        pathogenScale = 0.3;
    } else if (rand < panthProbabilitiesArray["virusInfectedCell"]) {
        pathogenType = "virusInfectedCell";
        pathogenScale = 0.6;
    } else {
        pathogenType = "redBloodCell";
        pathogenScale = 0.4;
    }

    var posX = -10/SCALE;
    var posY = (spawnPointY + (Math.random() - 0.5) * BLOOD_VESSEL_THICKNESS) / SCALE;

	var b = new Ball();
    b.createPanth(posX, posY, pathogenType, pathogenScale);
	ballsArray.push(b);
	ballsContainer.addChild(b.view); // We add createjs object, not Ball object itself!

	setTimeout(b.applyImpulse(-(Math.random()-0.5)*150, 100), 1);
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
}

function removePanthCompletly(panthView) {
    panthView.removeEventListener("tick", panthView.eventListenerFunction);
    destroyBodyList.push(panthView.body);
    whitesContainer.removeChild(panthView);
    var index = ballsArray.indexOf(panthView.ballObject);
    ballsArray.splice(index, 1);
}

function addYoutubeIcon(url) {
    youtubeIcon = new createjs.Bitmap(resourcesQueue.getResult("youtube"));
    youtubeIcon.x = 930;
    youtubeIcon.y = 635;
    youtubeIcon.addEventListener("click", function(event) {
        window.open(url);
    });
    stage.addChild(youtubeIcon);
}

function tick(evt) {
    if (gameState == gameStateEnum.PLAYING) {

        /**
         * MAIN STORY
         */
        //console.log(playingTickCounter);

        if (playingTickCounter == 0) {
            // TODO: remove when finished
            playingTickCounter = 1 - 1;

            panthProbabilitiesArray = {bacteria: 0.0, parasite: 0.0, virusInfectedCell: 0.0};
        } else if (playingTickCounter == 200) {
            dialogTextArray = [
                "Hey there!" +
                    "\nWelcome to Blood Defense, a game" +
                    "\nthat makes learning about human" +
                    "\nimmune system fun!" +
                    "\n\nClick on me or the bubble to " +
                    "\ncontinue.",
                "What you see behind me is a" +
                    "\nhuman blood vessel. Passing " +
                    "\nthrough are red blood cells." +
                    "\n\nAgain, click or me or the bubble" +
                    "\nto continue.",
                "Red blood cells deliver oxygen to" +
                    "\nother cells in the body. They" +
                    "\nare also called erythrocytes." +
                    "\n\nThey contain a protein called" +
                    "\nhemoglobin which is the reason" +
                    "\nhumon blood is red.",
                "As the blood passes through the" +
                    "\nlungs, oxygen molecules get" +
                    "\nattached to the hemoglobin. Later, " +
                    "\nhemoglobin releases the oxygen " +
                    "\nto the cells." +
                    "\n\nWatch as red blood cells move" +
                    "\nthrough the blood vessel."];
            addDialog();
        } else if (playingTickCounter == 500) {
            dialogTextArray = [
                "Was that fun? I hope so!" +
                    "\n\nOther very important cells in human" +
                    "\nbody are white blood cells. They" +
                    "\nare your body's defenders against" +
                    "\nbacteria and other invadors.",
                "These invadors are always trying" +
                    "\nto enter your body and some" +
                    "\nare able to cause disease." +
                    "\n\nThe little blue things you will see" +
                    "\ncoming through the blood vessel" +
                    "\nare bacteria. ",
                ["Do you see the icon where arrow" +
                    "\npoints to? This is a white blood" +
                    "\ncell called neutrophil. " +
                    "\n\nAfter you close this dialog, click on" +
                    "\nit once to create and again to place" +
                    "\nthe neutrophil. You can place it" +
                    "\nanywhere outside of the" +
                    "\nblood vessel.", 0, 480]];
            addDialog();

            panthProbabilitiesArray = {bacteria: 0.15, parasite: 0.0, virusInfectedCell: 0.0};
        } else if (playingTickCounter == 2000) {
            dialogTextArray = [
                "Neutrophils are the most common" +
                    "\nwhite blood cell in human body." +
                    "\nThey protect us against bacteria" +
                    "\nand fungi.",
                "To create a white blood cell you" +
                    "\nneed " + WHITE_ENERGY_CREATION_COST + " energy." +
                    "\n\nBut don't worry. Every time a red" +
                    "\nblood cell gets through the vessel," +
                    "\nyou get " + ADD_ENERGY_ON_RED_FINISH + " energy.",
                "Add a few more to make sure" +
                    "\nbacteria don't come deeper" +
                    "\nin the body."];
            addDialog();

            panthProbabilitiesArray = {bacteria: 0.2, parasite: 0.0, virusInfectedCell: 0.0};

        } else if (playingTickCounter == 3000) {
            dialogTextArray = [
                "Click the YouTube icon below to" +
                    "\nwatch an actual chase and" +
                    "\nengulfment of bacteria by" +
                    "\na neutrophil." +
                    "\n\nDon't worry, the video will" +
                    "\nbe opened in a new window.",
                "You can see that the neutrophil" +
                    "\nliterally engulfs the bacteria" +
                    "\ncompletly." +
                    "\n\nThis process is called phagocytosis."];
            addDialog();

            addYoutubeIcon("http://www.youtube.com/watch?v=OWUmXx5V_wE");
        } else if (playingTickCounter == 5000) {
            var additionalEnergy = 200;
            energy += additionalEnergy;

            addEosinophilToToolbar();

            dialogTextArray = [
                "Good job coming this far! I just" +
                    "\ngave you " + additionalEnergy + " additional energy." +
                    "\n\nLet's get on with the show!",
                "Eosinophils are another type" +
                    "\nof white blood cells. They protect" +
                    "\nyou from multicellular parasites." +
                    "\n",
                ["This is eosinophil. Place it" +
                    "\noutside of the blood vessel" +
                    "\nto intercept the incoming parasites." +
                    "\n\nIn this game, parasites are painted " +
                    "\nwith violet color.", 80, 480]];
            addDialog();

            panthProbabilitiesArray = {bacteria: 0.1, parasite: 0.3, virusInfectedCell: 0.0};
        } else if (playingTickCounter == 7000) {
            dialogTextArray = [
                "Click on the YouTube icon below to" +
                    "\nsee an actual eosinophil."];
            addDialog();

            addYoutubeIcon("http://www.youtube.com/watch?v=IQaoPW9_Tyc");
        } else if (playingTickCounter == 8000) {
            var additionalEnergy = 300;
            energy += additionalEnergy;

            addLymphocyteToToolbar();

            dialogTextArray = [
                "Again, good job coming this far." +
                    "\nI gave you " + additionalEnergy + " additional" +
                    "\nenergy.",
                "The last type of white blood cells" +
                    "\nwe will meet in this game are" +
                    "\nnatural killer cells." +
                    "\n\nThey are part of a larger group" +
                    "\ncalled lymphocytes.",
                "Natural killer cells provide rapid" +
                    "\nresponses to cells infected by" +
                    "\nviruses and to tumor cells." +
                    "\n\nThey are important in human body" +
                    "\nas they allow for much faster" +
                    "\nimmune reaction.",
                ["This is a natural killer cell. Place" +
                    "\nit outside of the blood vessel to" +
                    "\nintercept the incoming virus infected" +
                    "\ncells." +
                    "\n\nIn this game, these virus infected" +
                    "\ncells are painted green.", 163, 480]];
            addDialog();

            panthProbabilitiesArray = {bacteria: 0.1, parasite: 0.3, virusInfectedCell: 0.5};
        } else if (playingTickCounter == 10000) {
            dialogTextArray = [
                "Click the YouTube icon" +
                    "\nbellow to watch an animation" +
                    "\nof how natural killer cell " +
                    "\nkills a virus infected cell."];
            addDialog();

            addYoutubeIcon("http://www.youtube.com/watch?v=HNP1EAYLhOs");
        } else if (playingTickCounter == 11000) {
            dialogTextArray = [
                "You are doing pretty well!" +
                    "\n\nTo recap: white blood cells" +
                    "\nare crucial in protecting human body" +
                    "\nagainst microscopic attackers.",
                "In this game we have met three" +
                    "\ntypes of white blood cells:" +
                    "\nneutrophils, eosinphils and" +
                    "\nnatural killer cells." +
                    "\n\nThey all perform different" +
                    "\nfunction in the body.",
                "Neutrophils kill bacteria and" +
                    "\nfungi, eosinophils protect" +
                    "\nyou from large parasites and" +
                    "\nnatural killer cells hunt down" +
                    "\nvirus infected cells.",
                "Other two types of white blood" +
                    "\ncells are basophils which release" +
                    "\nhistamine for inflammatory responses" +
                    "\nand monocytes which migrate to other" +
                    "\ntissues and differentiate into tissue" +
                    "\nresident macrophages.",
                "You're of your own now." +
                    "\n\nIn order to win in this game," +
                    "\nyou have to increase your energy" +
                    "\nup to " + END_GAME_ENERGY_NEEDED + "." +
                    "\n\nGood luck!"];
            addDialog();

            panthProbabilitiesArray = {bacteria: 0.2, parasite: 0.4, virusInfectedCell: 0.6};
        }

        playingTickCounter++;

        /**
         * UPDATE INFO TEXT FIELDS
         */
        energyTextField.text = energy;
        lifeTextField.text = life;

        /**
         * CHECK END
         */

        if (life <= 0) {
            stage.removeAllChildren();

            gameState = gameStateEnum.INITIAL;
            setupDeathScreen();
        }

        if (energy >= END_GAME_ENERGY_NEEDED) {
            stage.removeAllChildren();

            gameState = gameStateEnum.INITIAL;
            setupWinScreen();
        }

        /**
         * CREATING PANTHOGENS
         */
        panthCreationTickCounter++;
        if (panthCreationTickCounter > 50) {
            panthCreationTickCounter = 0;

            generateNewPanth();
        }

        if (isThereMovingObject) {
            circle.x = stage.mouseX;
            circle.y = stage.mouseY;
        }

        /**
         * UPDATING BOX2D
         */
        world.Step(1/60, 10, 10);
        world.ClearForces();

        /**
         * DESTROY NOT NEEDED BODIES
         */
        for (var i = 0; i < destroyBodyList.length; i++) {
            world.DestroyBody(destroyBodyList[i]);
        }
        destroyBodyList = [];
    }

	stage.update();
}
