(function(window) {

    const BLOOD_VESSEL_COLOR    = "#FF5C33";
    const BLOOD_WALL_COLOR      = "#800000";
    const BLOOD_WALL_THICKNESS  = 8;

    var rectanglesArray;

    function Environment() {
        rectanglesArray = [];
    }

    Environment.prototype.getRectanglesArray = function() {
        return rectanglesArray;
    }

    /**
     * This tutorial was used as a basis for this function:
     * http://www.emanueleferonato.com/2011/07/14/create-a-terrain-like-the-one-in-tiny-wings-with-flash-and-box2d/
     */
    Environment.prototype.drawHills = function(numberOfHills, pixelStep) {
        var hillStartY = 140 + Math.random() * 200;
        //spawnPointY = hillStartY;
        var hillWidth = canvas.width / numberOfHills;
        var hillSliceWidth = hillWidth / pixelStep;

        var upBloodWall = new createjs.Shape();
        upBloodWall.graphics.beginStroke(BLOOD_WALL_COLOR).setStrokeStyle(BLOOD_WALL_THICKNESS);

        var downBloodWall = new createjs.Shape();
        downBloodWall.graphics.beginStroke(BLOOD_WALL_COLOR).setStrokeStyle(BLOOD_WALL_THICKNESS);

        for (var i = 0; i < numberOfHills; i++) {
            var randomHeight = Math.random() * 100;
            if (i != 0) hillStartY -= randomHeight;
            //for (var j = 0; j <= hillSliceWidth; j++) {
            for (var j = 0; j < hillSliceWidth; j++) {

                var upPoint = new createjs.Point(j*pixelStep+hillWidth*i,hillStartY+randomHeight*Math.cos(2*Math.PI/hillSliceWidth*j));
                var downPoint = new createjs.Point(j*pixelStep+hillWidth*i, BLOOD_VESSEL_THICKNESS +hillStartY+randomHeight*Math.cos(2*Math.PI/hillSliceWidth*j));
                var upPointNext = new createjs.Point((j+1)*pixelStep+hillWidth*i,hillStartY+randomHeight*Math.cos(2*Math.PI/hillSliceWidth*(j+1)));
                var downPointNext = new createjs.Point((j+1)*pixelStep+hillWidth*i, BLOOD_VESSEL_THICKNESS +hillStartY+randomHeight*Math.cos(2*Math.PI/hillSliceWidth*(j+1)));

                if (i == 0 && j == 0) {
                    spawnPointY = (upPoint.y + downPoint.y) / 2;
                }

                upBloodWall.graphics.lineTo(upPoint.x, upPoint.y);
                upBloodWall.graphics.lineTo(upPoint.x, stage.height);
                upBloodWall.graphics.moveTo(upPoint.x, upPoint.y);

                downBloodWall.graphics.lineTo(downPoint.x, downPoint.y);
                downBloodWall.graphics.lineTo(downPoint.x, stage.height);
                downBloodWall.graphics.moveTo(downPoint.x, downPoint.y);

                // Draw rect shape which is the background of the blood vessel.
                var rect = new createjs.Rectangle(upPoint.x, upPoint.y, pixelStep+1, BLOOD_VESSEL_THICKNESS);
                var rectShape = new createjs.Shape();
                rectShape.graphics.beginFill(BLOOD_VESSEL_COLOR).drawRect(rect.x, rect.y, rect.width, rect.height);
                stage.addChild(rectShape);

                // Store the rect for purposes of collision detection.
                rectanglesArray.push(rect);

                var lower1 = new box2d.b2Vec2(downPoint.x / SCALE, STAGE_HEIGHT / SCALE);
                var lower2 = new box2d.b2Vec2(downPoint.x / SCALE, downPoint.y / SCALE);
                var lower3 = new box2d.b2Vec2(downPointNext.x / SCALE, downPointNext.y / SCALE);
                var lower4 = new box2d.b2Vec2(downPointNext.x / SCALE, STAGE_HEIGHT / SCALE);

                createPhysicsPolygon(lower1, lower2, lower3, lower4);

                var upper1 = new box2d.b2Vec2(upPoint.x / SCALE, upPoint.y / SCALE);
                var upper2 = new box2d.b2Vec2(upPoint.x / SCALE, 0 / SCALE);
                var upper3 = new box2d.b2Vec2(upPointNext.x / SCALE, 0 / SCALE);
                var upper4 = new box2d.b2Vec2(upPointNext.x / SCALE, upPointNext.y / SCALE);

                createPhysicsPolygon(upper1, upper2, upper3, upper4)
            }
            hillStartY = hillStartY + randomHeight;
        }

        stage.addChild(upBloodWall);
        stage.addChild(downBloodWall);
        stage.update();
    }

    function createPhysicsPolygon(p1, p2, p3, p4) {
        var hillVector = [];
        hillVector.push(p1);
        hillVector.push(p2);
        hillVector.push(p3);
        hillVector.push(p4);

        var sliceBody = new box2d.b2BodyDef();
        var centre = findCentroid(hillVector, hillVector.length);
        sliceBody.position.Set(centre.x, centre.y);
        for (var z = 0; z < hillVector.length; z++) {
            hillVector[z].Subtract(centre);
        }
        var slicePoly = new box2d.b2PolygonShape();
        slicePoly.SetAsVector(hillVector, 4);
        var sliceFixture = new box2d.b2FixtureDef();
        sliceFixture.shape = slicePoly;
        var worldSlice = world.CreateBody(sliceBody);
        worldSlice.CreateFixture(sliceFixture);
    }

    function findCentroid(vs, count) {
        var c = new box2d.b2Vec2();
        var area=0.0;
        var p1X=0.0;
        var p1Y=0.0;
        var inv3=1.0/3.0;
        for (var i = 0; i < count; ++i) {
            var p2=vs[i];
            var p3 = i+1 <count ? vs[i+1] : vs[0];
            var e1X =p2.x-p1X;
            var e1Y =p2.y-p1Y;
            var e2X =p3.x-p1X;
            var e2Y =p3.y-p1Y;
            var D  = (e1X * e2Y - e1Y * e2X);
            var triangleArea =0.5*D;
            area+=triangleArea;
            c.x += triangleArea * inv3 * (p1X + p2.x + p3.x);
            c.y += triangleArea * inv3 * (p1Y + p2.y + p3.y);
        }
        c.x*=1.0/area;
        c.y*=1.0/area;
        return c;
    }

    window.Environment = Environment;
})(window);