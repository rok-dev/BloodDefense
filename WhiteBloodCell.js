(function(window) {

    const BOX2D_CIRCLE_SIZE = 20;
    const HIT_RANGE = 100;
    const MOVE_SPRITE = -22;
    const BACK_TO_STANDING_POSITION_SPEED = 1;

    var huntsPanthogenType = {
        "neutrophil" : "bacteria",
        "eosinophil" : "parasite",
        "lymphocyte" : "virusInfectedCell"
    }

    function WhiteBloodCell() {}

    WhiteBloodCell.prototype.createCell = function(whiteBloodCellType) {
        this.view = new createjs.Bitmap(resourcesQueue.getResult(whiteBloodCellType));
        var bounds = this.view.getBounds();
        this.view.regX = bounds.x / 2;
        this.view.regY = bounds.y / 2;
        this.view.alpha = 0.9;

        //this.view.x = event.stageX + MOVE_SPRITE;
        //this.view.y = event.stageY + MOVE_SPRITE;

        isThereMovingObject = true;
        this.view.moving = false;
        this.view.isBeingDragged = true;
        this.view.absorbing = false;
        this.view.isPositioningDisabled = false;
        this.view.whiteBloodCellType = whiteBloodCellType;

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
        //stage.addChild(this.view);
    }

    function redFilterToogler(cellView, shouldApplyFilter) {
        if (!cellView.isPositioningDisabled && shouldApplyFilter) {
            var redFilter = new createjs.ColorFilter(1,0,0,0.5);
            cellView.filters = [redFilter];
            cellView.cache(0, 0, cellView.image.width, cellView.image.height);
            cellView.isPositioningDisabled = true;
        } else if (cellView.isPositioningDisabled && !shouldApplyFilter) {
            cellView.filters = [];
            cellView.uncache();

            cellView.isPositioningDisabled = false;
        }
    }

    function handleWhiteClick(event) {
        if (isThereMovingObject && !this.isPositioningDisabled) {
            this.isBeingDragged = false;
            isThereMovingObject = false;

            goOutOfPositioningMode();
        }
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

    function doesIntersectWithBloodVessel(cellView) {
        var newX = cellView.body.GetPosition().x * SCALE;
        var newY = cellView.body.GetPosition().y * SCALE;

        var intersectsWithBloodVessel = false;
        var bloodRectsArray = environment.getRectanglesArray();
        for (var i = 0; i < bloodRectsArray.length; i++) {
            var curRect = bloodRectsArray[i];
            if (collisionDetection.intersectsCircleRect(newX, newY, BOX2D_CIRCLE_SIZE, curRect)) {
                intersectsWithBloodVessel = true;
            }
        }
        return intersectsWithBloodVessel;
    }

    function doesIntersectWithOtherCells(cellView) {
        var intersectsWithOtherCells = false;
        for (var i = 0; i < whitesArray.length; i++) {
            var otherCell = whitesArray[i];
            if (otherCell.view == cellView) continue;

            if (collisionDetection.intersectsCircleCircle(cellView.x, cellView.y, BOX2D_CIRCLE_SIZE,
                                                         otherCell.view.standingPositionX, otherCell.view.standingPositionY, BOX2D_CIRCLE_SIZE)) {

                intersectsWithOtherCells = true;
                break;
            }
        }
        return intersectsWithOtherCells;
    }

    /**
     * Moves the cell around depending on mouse location.
     */
    function moveCellWithMouse(cellView) {
        var newX = stage.mouseX;
        var newY = stage.mouseY;
        cellView.body.SetPosition(new box2d.b2Vec2(newX / SCALE, newY / SCALE), 0);
        cellView.standingPositionX = newX + MOVE_SPRITE;
        cellView.standingPositionY = newY + MOVE_SPRITE;

        redFilterToogler(cellView, !canCellBePositionedHere(cellView));

        // TODO: Check collision between other white.
    }

    function canCellBePositionedHere(cellView) {
        return !doesIntersectWithBloodVessel(cellView) && !doesIntersectWithOtherCells(cellView);
    }

    function tick() {
        if (gameState != gameStateEnum.PLAYING) {
            return;
        }

        if (this.isBeingDragged) {
            moveCellWithMouse(this);
        } else {
            var whiteCenterX = this.x - MOVE_SPRITE;
            var whiteCenterY = this.y - MOVE_SPRITE;

            var panthsInRange = [];
            for (var i = 0; i < ballsArray.length; i++) {
                var panth = ballsArray[i];
                if (collisionDetection.intersectsCircleCircle(whiteCenterX, whiteCenterY, HIT_RANGE,
                                                                panth.view.x, panth.view.y, panth.getCircleSize())) {
                    // Skip panths which are not of the type this white blood cell hunts.
                    if (panth.view.panthogenType != huntsPanthogenType[this.whiteBloodCellType]) {
                        continue;
                    }

                    // Skip panths which are being absorbed and don't belong to you.
                    if (!this.absorbing && panth.view.isBeingAbsorbed) {
                        continue;
                    }

                    // Only panths inside of the stage are in range.
                    if (panth.view.x < 0 || panth.view.y < 0
                        || panth.view.x > STAGE_WIDTH || panth.view.y > STAGE_HEIGHT) {
                        continue;
                    }

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
                        closestPanth.view.isBeingAbsorbed = true;
                        this.absorbing = true;

                        //joint_def = new Box2D.Dynamics.Joints.b2DistanceJointDef();
                        var joint_def = new Box2D.Dynamics.Joints.b2DistanceJointDef();
                        joint_def.bodyA = this.body;
                        joint_def.bodyB = closestPanth.view.body;
                        joint_def.localAnchorA = new box2d.b2Vec2(0, 0);
                        joint_def.localAnchorB = new box2d.b2Vec2(0, 0);
                        //joint_def.dampingRatio = 50;
                        joint_def.length = closestDist / SCALE;
                        this.joint = world.CreateJoint(joint_def);
                    }
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

                            removePanthCompletly(closestPanth.view);

                            this.absorbing = false;
                        }
                    }
                }
            } else {
                var direction = new box2d.b2Vec2((this.standingPositionX - this.x), (this.standingPositionY - this.y));
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