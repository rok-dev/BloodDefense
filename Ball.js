(function(window) {

    const BOX2D_CIRCLE_SIZE = 30;
    const FORCE = 30;

    var panthogenInfo = {
        bacteria:               {regX: 25, regY: 15},
        parasite:               {regX: 35, regY: 29},
        virusInfectedCell:      {regX: 40, regY: 40},
        redBloodCell:           {regX: 51, regY: 47},
    };

	function Ball(x, y, panthogenType) {}

    Ball.prototype.createPanth = function(x, y, panthogenType, scale) {
        this.view = new createjs.Bitmap(resourcesQueue.getResult(panthogenType));
        this.view.regX = panthogenInfo[panthogenType]["regX"];
        this.view.regY = panthogenInfo[panthogenType]["regY"];
        this.view.scaleX = this.view.scaleY = scale;
        this.view.alpha = 0.9;

        this.view.panthogenType = panthogenType;
        this.view.isBeingAbsorbed = false;

        this.view.ballObject = this;

        var fixDef = new box2d.b2FixtureDef();
        fixDef.density = 30.0;
        fixDef.friction = 3;
        fixDef.restitution = 0.3;
        var bodyDef = new box2d.b2BodyDef();
        bodyDef.type = box2d.b2Body.b2_dynamicBody;
        bodyDef.position.x = x;
        bodyDef.position.y = y;
        fixDef.shape = new box2d.b2CircleShape(BOX2D_CIRCLE_SIZE * scale / SCALE);
        this.view.body = world.CreateBody(bodyDef);
        this.view.body.CreateFixture(fixDef);

        this.view.eventListenerFunction = tick.bind(this.view);
        this.view.addEventListener("tick", this.view.eventListenerFunction);    }

    Ball.prototype.applyImpulse = function(degrees, power) {
        //function applyImpulse(degrees, power) {
        this.view.body.ApplyImpulse(new box2d.b2Vec2(Math.cos(degrees * (Math.PI / 180)) * power,
            Math.sin(degrees * (Math.PI / 180)) * power),
            this.view.body.GetWorldCenter());
    }

    Ball.prototype.getCircleSize = function() {
        return BOX2D_CIRCLE_SIZE * this.view.scaleX;
    }

    //Ball.prototype.update = function() {
	function tick() {
        if (gameState != gameStateEnum.PLAYING) {
            return;
        }

		this.x = this.body.GetPosition().x * SCALE;
		this.y = this.body.GetPosition().y * SCALE;
		this.rotation = this.body.GetAngle() * (180/Math.PI); // GetAngle is in radians, we convert to degrees (createjs uses degrees).

        var force = new box2d.b2Vec2(FORCE, 0);
        this.body.ApplyForce(force, this.body.GetWorldCenter());

        if (this.x > STAGE_WIDTH + 50) {
            if (this.panthogenType == "redBloodCell") {
                energy += ADD_ENERGY_ON_RED_FINISH;
            } else {
                life -= REMOVE_LIFE_ON_PANTH_FINISH;

                if (!wasFirstLifeLostAlready) {

                    dialogTextArray = [
                        "Watch out! You lost " + REMOVE_LIFE_ON_PANTH_FINISH + " health" +
                            "\npoint because an invader managed" +
                            "\nto get past your defenses." +
                            "\n\nTry placing white blood cells" +
                            "\nstrategically.",];
                    addDialog();

                    wasFirstLifeLostAlready = true;
                }
            }

            removePanthCompletly(this);
        }
	}
	

	window.Ball = Ball;
})(window);