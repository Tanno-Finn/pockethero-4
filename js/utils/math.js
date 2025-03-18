/**
 * Math Utilities
 *
 * Common mathematical operations for game development.
 */
const MathUtils = (function() {
    /**
     * Generate a random integer between min and max (inclusive)
     *
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer between min and max
     */
    function randomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Generate a random float between min and max
     *
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random float between min and max
     */
    function randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Clamp a value between min and max
     *
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Calculate distance between two points
     *
     * @param {number} x1 - X coordinate of first point
     * @param {number} y1 - Y coordinate of first point
     * @param {number} x2 - X coordinate of second point
     * @param {number} y2 - Y coordinate of second point
     * @returns {number} Distance between points
     */
    function distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate Manhattan distance between two points (grid distance)
     *
     * @param {number} x1 - X coordinate of first point
     * @param {number} y1 - Y coordinate of first point
     * @param {number} x2 - X coordinate of second point
     * @param {number} y2 - Y coordinate of second point
     * @returns {number} Manhattan distance between points
     */
    function manhattanDistance(x1, y1, x2, y2) {
        return Math.abs(x2 - x1) + Math.abs(y2 - y1);
    }

    /**
     * Linear interpolation between two values
     *
     * @param {number} a - Start value
     * @param {number} b - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /**
     * Check if two rectangles intersect
     *
     * @param {Object} rect1 - First rectangle {x, y, width, height}
     * @param {Object} rect2 - Second rectangle {x, y, width, height}
     * @returns {boolean} True if rectangles intersect
     */
    function rectIntersect(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y;
    }

    /**
     * Convert radians to degrees
     *
     * @param {number} radians - Angle in radians
     * @returns {number} Angle in degrees
     */
    function toDegrees(radians) {
        return radians * 180 / Math.PI;
    }

    /**
     * Convert degrees to radians
     *
     * @param {number} degrees - Angle in degrees
     * @returns {number} Angle in radians
     */
    function toRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    /**
     * Get direction from one point to another
     *
     * @param {number} x1 - X coordinate of first point
     * @param {number} y1 - Y coordinate of first point
     * @param {number} x2 - X coordinate of second point
     * @param {number} y2 - Y coordinate of second point
     * @returns {Object} Direction vector {x, y} (normalized)
     */
    function getDirection(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length === 0) {
            return { x: 0, y: 0 };
        }

        return {
            x: dx / length,
            y: dy / length
        };
    }

    /**
     * Get cardinal direction (up, right, down, left) from one point to another
     *
     * @param {number} x1 - X coordinate of first point
     * @param {number} y1 - Y coordinate of first point
     * @param {number} x2 - X coordinate of second point
     * @param {number} y2 - Y coordinate of second point
     * @returns {string} Cardinal direction ('up', 'right', 'down', 'left')
     */
    function getCardinalDirection(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;

        // Determine the primary direction
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 'right' : 'left';
        } else {
            return dy > 0 ? 'down' : 'up';
        }
    }

    // Public API
    return {
        randomInt,
        randomFloat,
        clamp,
        distance,
        manhattanDistance,
        lerp,
        rectIntersect,
        toDegrees,
        toRadians,
        getDirection,
        getCardinalDirection
    };
})();