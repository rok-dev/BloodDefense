/**
 * Created by Rok on 28.12.2013.
 */

(function(window) {

    var stage;

    function Environment(stage) {
        this.stage = stage;
    }

    /**
     *
     * Ich habe dieses Tutorial als Basis verwendet:
     * http://www.emanueleferonato.com/2011/07/14/create-a-terrain-like-the-one-in-tiny-wings-with-flash-and-box2d/
     * @param numberOfHills
     * @param pixelStep
     */
    function drawHills(numberOfHills, pixelStep) {
        var hillStartY = 140 + Math.random() * 200;
        //spawnPointY = hillStartY;
        var hillWidth = canvas.width / numberOfHills;
        var hillSliceWidth = hillWidth / pixelStep;

        var upBloodWall = new createjs.Shape();
        upBloodWall.graphics.beginStroke("#800000").setStrokeStyle(8);

        var downBloodWall = new createjs.Shape();
        downBloodWall.graphics.beginStroke("#800000").setStrokeStyle(8);

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

                var rect = new createjs.Shape();
                rect.graphics.beginFill("#FF5C33").drawRect(upPoint.x, upPoint.y, pixelStep+1, BLOOD_VESSEL_THICKNESS);
                stage.addChild(rect);

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
})(window);