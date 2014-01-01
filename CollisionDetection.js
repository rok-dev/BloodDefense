(function(window) {

    function CollisionDetection() {
    }

    /**
     * Checks intersection between a circle and a rectangle.
     *
         * Source: http://stackoverflow.com/a/402010/365837
     */
    CollisionDetection.prototype.intersectsCircleRect = function(circlePositionX, circlePositionY, circleRadius, rect) {
        var rectCenterX = rect.x + rect.width / 2;
        var rectCenterY = rect.y + rect.height / 2;

        var circleDistanceX = Math.abs(circlePositionX - rectCenterX);
        var circleDistanceY = Math.abs(circlePositionY - rectCenterY);

        if (circleDistanceX > (rect.width/2 + circleRadius)) { return false; }
        if (circleDistanceY > (rect.height/2 + circleRadius)) { return false; }

        if (circleDistanceX <= (rect.width/2)) { return true; }
        if (circleDistanceY <= (rect.height/2)) { return true; }

        var cornerDistance_sq = (circleDistanceX - rect.width/2)^2 +
            (circleDistanceY - rect.height/2)^2;

        return (cornerDistance_sq <= (circle.r^2));
    }

    /**
     * Optimized circle to circle collision detection.
     *
     * Source: http://cgp.wikidot.com/circle-to-circle-collision-detection
     */
    CollisionDetection.prototype.intersectsCircleCircle = function(circle1PosX, circle1PosY, circle1Radius,
                                                                   circle2PosX, circle2PosY, circle2Radius) {
        var dx = circle2PosX - circle1PosX;
        var dy = circle2PosY - circle1PosY;
        var radii = circle1Radius + circle2Radius;
        return ( ( dx * dx )  + ( dy * dy ) < radii * radii );
    }

    CollisionDetection.prototype.distanceBetween = function(x1, y1, x2, y2) {
        return Math.sqrt( ( x2-x1 ) * ( x2-x1 )  + ( y2-y1 ) * ( y2-y1) );
    }

    window.CollisionDetection = CollisionDetection;
})(window);