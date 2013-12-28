(function(window) {

	function Ball(x, y) {
		this.view = new createjs.Bitmap(resourcesQueue.getResult("ball"));
		this.view.regX = this.view.regY = 100;
		
		this.view.scaleX = this.view.scaleY = 0.1;
		
		var fixDef = new box2d.b2FixtureDef();
		fixDef.density = 5.0;
		fixDef.friction = 0.5;
		fixDef.restitution = 0.8;
		var bodyDef = new box2d.b2BodyDef();
		bodyDef.type = box2d.b2Body.b2_dynamicBody;
		bodyDef.position.x = x;
		bodyDef.position.y = y;
		fixDef.shape = new box2d.b2CircleShape(10 / SCALE);
		this.view.body = world.CreateBody(bodyDef);
		this.view.body.CreateFixture(fixDef);
		this.view.addEventListener("tick", tick.bind(this.view));
	}
	
	//Ball.prototype.update = function() {
	function tick() {
		this.x = this.body.GetPosition().x * SCALE;
		this.y = this.body.GetPosition().y * SCALE;
		this.rotation = this.body.GetAngle() * (180/Math.PI); // GetAngle is in radians, we convert to degrees (createjs uses degrees).
	}
	
	Ball.prototype.applyImpulse = function(degrees, power) {
	//function applyImpulse(degrees, power) {
		this.view.body.ApplyImpulse(new box2d.b2Vec2(Math.cos(degrees * (Math.PI / 180)) * power,
                                 Math.sin(degrees * (Math.PI / 180)) * power),
                                 this.view.body.GetWorldCenter());
	}
	
	window.Ball = Ball;

})(window);