(function(window) {

    const BOX2D_CIRCLE_SIZE = 20;
    const HIT_RANGE = 100;
    const MOVE_SPRITE = -22;
    const BACK_TO_STANDING_POSITION_SPEED = 1;

    function WhiteBloodCell() {
    }

    WhiteBloodCell.prototype.createCell = function() {
        this.view = new createjs.Bitmap(resourcesQueue.getResult("neutrophil"));
        var bounds = this.view.getBounds();
        this.view.regX = bounds.x / 2;
        this.view.regY = bounds.y / 2;

        //this.view.x = event.stageX + MOVE_SPRITE;
        //this.view.y = event.stageY + MOVE_SPRITE;
        this.view.moving = false;

        isThereMovingObject = true;
        this.view.isBeingDragged = true;
        this.view.sup = "sup"

        movingObject = this.view;
        this.view.addEventListener("click", handleWhiteClick.bind(this.view));

        var fixDef = new box2d.b2FixtureDef();
        fixDef.density = 5.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.8;
        var bodyDef = new box2d.b2BodyDef();
        bodyDef.allowSleep = false;

        /*
        this.view.x = Math.random()*300;
        this.view.y = 200;
        bodyDef.position.x = this.view.x/SCALE;
        bodyDef.position.y = this.view.y/SCALE;
        */

        bodyDef.type = box2d.b2Body.b2_kinematicBody;
        fixDef.shape = new box2d.b2CircleShape(BOX2D_CIRCLE_SIZE / SCALE);
        this.view.body = world.CreateBody(bodyDef);
        this.view.body.CreateFixture(fixDef);

        this.view.addEventListener("tick", tick.bind(this.view));
        stage.addChild(this.view);
    }

    function handleWhiteClick(evt) {
        //console.log("istheremoving: " + this.isThereMovingObject);
        //console.log("sup: " + this.sup);
        if (isThereMovingObject) {
            this.isBeingDragged = false;
            removeDarkStage();
        } else {
            this.isBeingDragged = true;
            darkenStage();
        }

        isThereMovingObject = !isThereMovingObject;
    }

    // TODO: check if not already being eaten by some other
    function findClosestPanth(panthsInRange) {
        var minPanth = panthsInRange[0][0];
        var minDist = panthsInRange[0][1];

        for (var i = 0; i < panthsInRange.length; i++) {
            var panthInRange = panthsInRange[i];
            var panth = panthInRange[0];
            var dist = panthInRange[1];

            if (dist < minDist) {
                minDist = dist;
                minPanth = panth;
            }
        }

        return [minPanth, minDist];
    }

    function tick() {
        //this.body.ApplyForce(- this.body.GetMass() * world.GetGravity(), this.body.GetWorldCenter());
        /*
        var newX = stage.mouseX;
        var newY = stage.mouseY;
        this.body.SetPosition(new box2d.b2Vec2(newX / SCALE, newY / SCALE), 0);
        return;
        */
        //console.log("dragged " + this.isBeingDragged);

        if (this.isBeingDragged) {
            var newX = stage.mouseX;
            var newY = stage.mouseY;
            this.body.SetPosition(new box2d.b2Vec2(newX / SCALE, newY / SCALE), 0);
            this.standingPositionX = this.body.GetPosition().x * SCALE;
            this.standingPositionY = this.body.GetPosition().y * SCALE;

            var bloodRectsArray = environment.getRectanglesArray();
            for (var i = 0; i < bloodRectsArray.length; i++) {
                var curRect = bloodRectsArray[i];
                if (collisionDetection.intersectsCircleRect(newX, newY, BOX2D_CIRCLE_SIZE, curRect)) {
                    //console.log("Collision betweeen white blood cell & blood vessel");
                }
            }

            // TODO: Check collision between other white.
        } else {
            var whiteCenterX = this.x - MOVE_SPRITE;
            var whiteCenterY = this.y - MOVE_SPRITE;

            var panthsInRange = [];
            for (var i = 0; i < ballsArray.length; i++) {
                var panth = ballsArray[i];
                //console.log(this.x + " " + this.y);
                if (collisionDetection.intersectsCircleCircle(whiteCenterX, whiteCenterY, HIT_RANGE,
                                                                panth.view.x, panth.view.y, panth.getCircleSize())) {
                    //console.log("Collision range white & panth");
                    panthsInRange.push([panth, collisionDetection.distanceBetween(whiteCenterX, whiteCenterY, panth.view.x, panth.view.y)]);
                }
            }

            if (panthsInRange.length > 0) {
                var a = findClosestPanth(panthsInRange);
                var closestPanth = a[0];
                var closestDist = a[1];
                //console.log("closest dist: " + closestDist);

                // Move towards the closest.
                var direction = new box2d.b2Vec2((closestPanth.view.x+ MOVE_SPRITE - this.x) / SCALE, (closestPanth.view.y+ MOVE_SPRITE - this.y) / SCALE);
                this.body.SetLinearVelocity(direction);
                //console.log("direction: " + direction.x + " " + direction.y);

                if (closestDist < 50) {
                    if (typeof this.joint == "undefined" || this.joint == null) {
                        //joint_def = new Box2D.Dynamics.Joints.b2DistanceJointDef();
                        var joint_def = new Box2D.Dynamics.Joints.b2DistanceJointDef();
                        joint_def.bodyA = this.body;
                        joint_def.bodyB = closestPanth.view.body;
                        joint_def.localAnchorA = new box2d.b2Vec2(0, 0);
                        joint_def.localAnchorB = new box2d.b2Vec2(0, 0);
                        //joint_def.dampingRatio = 50;
                        joint_def.length = closestDist / SCALE;
                        this.joint = world.CreateJoint(joint_def);
                    } else {

                    }

                    /*
                    if (closestDist < 5) {
                        joint_def = new box2d.b2RevoluteJointDef();
                        joint_def.bodyA = this.body;
                        joint_def.bodyB = closestPanth.view.body;
                        joint_def.localAnchorA = new box2d.b2Vec2(0, 0);
                        joint_def.localAnchorB = new box2d.b2Vec2(0, 0);
                        //joint_def.dampingRatio = 50;
                        joint_def.maxForce = 5;
                        world.CreateJoint(joint_def);
                    }
                    */
                }

                if (!(typeof this.joint == "undefined" || this.joint == null)) {
                    if (this.joint.GetLength() > 5/SCALE) {
                        //joint_def.length -= 1/SCALE;
                        this.joint.SetLength(this.joint.GetLength() - 1/SCALE);
                        //world.CreateJoint(joint_def);
                        //console.log("len: " + this.joint.GetLength());
                    } else {
                        this.body.SetLinearVelocity(new box2d.b2Vec2(0, 0));

                        closestPanth.view.alpha -= 0.02;

                        if (closestPanth.view.alpha < 0) {

                            this.joint = null;
                            destroyBodyList.push(closestPanth.view.body);
                            stage.removeChild(closestPanth.view);
                            var index = ballsArray.indexOf(closestPanth);
                            ballsArray.splice(index, 1);
                        }
                    }
                }
            } else {
                var direction = new box2d.b2Vec2(((this.standingPositionX + MOVE_SPRITE) - this.x), ((this.standingPositionY + MOVE_SPRITE) - this.y));
                if (direction.Length() > 0.5) {
                    direction.Normalize();
                }

                //console.log(collisionDetection.distanceBetween(standingPosition.x*SCALE, standingPosition.y*SCALE, this.x, this.y))
                //console.log(this.x + " " + this.y);
                //console.log(standingPosition.x*SCALE + " " + standingPosition.y*SCALE);
                //console.log(((standingPosition.x*SCALE + MOVE_SPRITE) - this.x) + " " + (standingPosition.y*SCALE - this.y));
                if (collisionDetection.distanceBetween(this.standingPositionX, this.standingPositionY, this.x, this.y) < 15) {
                    direction = new box2d.b2Vec2(0, 0);
                }
                direction.Multiply(BACK_TO_STANDING_POSITION_SPEED);

                this.body.SetLinearVelocity(direction);
            }
        }

        this.x = this.body.GetPosition().x * SCALE + MOVE_SPRITE;
        this.y = this.body.GetPosition().y * SCALE + MOVE_SPRITE;
        //this.rotation = this.body.GetAngle() * (180/Math.PI); // GetAngle is in radians, we convert to degrees (createjs uses degrees).
    }

    window.WhiteBloodCell = WhiteBloodCell;
})(window);