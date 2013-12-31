(function(window) {

    const BOX2D_CIRCLE_SIZE = 20;
    const HIT_RANGE = 100;
    const MOVE_SPRITE = -22;

    var isBeingDragged = false;

    var standingPosition;

    //var joint_def;
    var joint;

    function WhiteBloodCell() {
    }

    WhiteBloodCell.prototype.createCell = function() {
        this.view = new createjs.Bitmap(resourcesQueue.getResult("neutrophil"));
        var bounds = this.view.getBounds();
        this.view.regX = bounds.x / 2;
        this.view.regY = bounds.y / 2;

        var moveSprite = -27;
        //this.view.x = event.stageX + MOVE_SPRITE;
        //this.view.y = event.stageY + MOVE_SPRITE;
        this.view.moving = false;

        isThereMovingObject = true;
        isBeingDragged = true;

        movingObject = this.view;
        movingObject.addEventListener("click", function(evt) {
            if (isThereMovingObject) {
                isBeingDragged = false;
                removeDarkStage();
            } else {
                isBeingDragged = true;
                darkenStage();
            }

            isThereMovingObject = !isThereMovingObject;
        });

        stage.addChild(this.view);

        var fixDef = new box2d.b2FixtureDef();
        fixDef.density = 5.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.8;
        var bodyDef = new box2d.b2BodyDef();
        bodyDef.allowSleep = false;
        bodyDef.type = box2d.b2Body.b2_kinematicBody;
        fixDef.shape = new box2d.b2CircleShape(BOX2D_CIRCLE_SIZE / SCALE);
        this.view.body = world.CreateBody(bodyDef);
        this.view.body.CreateFixture(fixDef);
        this.view.addEventListener("tick", tick.bind(this.view));
    }

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

        if (isBeingDragged) {
            var newX = stage.mouseX;
            var newY = stage.mouseY;
            this.body.SetPosition(new box2d.b2Vec2(newX / SCALE, newY / SCALE), 0);
            standingPosition = this.body.GetPosition();

            var bloodRectsArray = environment.getRectanglesArray();
            for (var i = 0; i < bloodRectsArray.length; i++) {
                var curRect = bloodRectsArray[i];
                if (collisionDetection.intersectsCircleRect(newX, newY, BOX2D_CIRCLE_SIZE, curRect)) {
                    console.log("Collision betweeen white blood cell & blood vessel");
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
                console.log("closest dist: " + closestDist);

                //var force = new box2d.b2Vec2(10, 0.5);
                var p = this.body.GetWorldPoint(new box2d.b2Vec2(0, 0));
                var direction = new box2d.b2Vec2((closestPanth.view.x - this.x) / SCALE, (closestPanth.view.y - this.y) / SCALE);
                console.log("direction: " + direction.x + " " + direction.y);

                this.body.SetLinearVelocity(direction);


                if (closestDist < 50) {

                    if (typeof joint == "undefined" || joint == null) {
                        //joint_def = new Box2D.Dynamics.Joints.b2DistanceJointDef();
                        var joint_def = new Box2D.Dynamics.Joints.b2DistanceJointDef();
                        joint_def.bodyA = this.body;
                        joint_def.bodyB = closestPanth.view.body;
                        joint_def.localAnchorA = new box2d.b2Vec2(0, 0);
                        joint_def.localAnchorB = new box2d.b2Vec2(0, 0);
                        //joint_def.dampingRatio = 50;
                        joint_def.length = closestDist / SCALE;
                        joint = world.CreateJoint(joint_def);
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

                if (!(typeof joint == "undefined" || joint == null)) {
                    if (joint.GetLength() > 5/SCALE) {
                        //joint_def.length -= 1/SCALE;
                        joint.SetLength(joint.GetLength() - 1/SCALE);
                        //world.CreateJoint(joint_def);
                        console.log("len: " + joint.GetLength());
                    } else {
                        this.body.SetLinearVelocity(new box2d.b2Vec2(0, 0));

                        closestPanth.view.alpha -= 0.02;

                        if (closestPanth.view.alpha < 0) {

                            joint = null;
                            destroyBodyList.push(closestPanth.view.body);
                            stage.removeChild(closestPanth.view);
                            var index = ballsArray.indexOf(closestPanth);
                            ballsArray.splice(index, 1);
                        }
                    }
                }
            } else {
                // TODO: Move towards starting position.
                this.body.SetLinearVelocity(new box2d.b2Vec2(0, 0));
            }
        }

        this.x = this.body.GetPosition().x * SCALE + MOVE_SPRITE;
        this.y = this.body.GetPosition().y * SCALE + MOVE_SPRITE;
        //this.rotation = this.body.GetAngle() * (180/Math.PI); // GetAngle is in radians, we convert to degrees (createjs uses degrees).
    }

    window.WhiteBloodCell = WhiteBloodCell;
})(window);