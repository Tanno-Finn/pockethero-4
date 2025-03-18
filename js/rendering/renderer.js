/**
 * Renderer
 *
 * Handles rendering of game elements on the canvas.
 * Provides methods for drawing various game elements.
 */
const Renderer = (function() {
    // Private properties
    let _canvas = null;
    let _context = null;
    let _width = 0;
    let _height = 0;
    let _initialized = false;

    /**
     * Initialize the renderer
     *
     * @param {string} canvasId - ID of the canvas element
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    function init(canvasId, width, height) {
        // Get canvas and context
        _canvas = document.getElementById(canvasId);

        if (!_canvas) {
            console.error(`Canvas element with ID '${canvasId}' not found.`);
            return;
        }

        _context = _canvas.getContext('2d');

        // Set canvas dimensions
        _canvas.width = width;
        _canvas.height = height;
        _width = width;
        _height = height;

        _initialized = true;

        console.log(`Renderer initialized with canvas '${canvasId}' (${width}x${height})`);
    }

    /**
     * Clear the canvas
     */
    function clear() {
        if (!_initialized) return;

        _context.clearRect(0, 0, _width, _height);
    }

    /**
     * Get canvas width
     *
     * @returns {number} Canvas width
     */
    function getWidth() {
        return _width;
    }

    /**
     * Get canvas height
     *
     * @returns {number} Canvas height
     */
    function getHeight() {
        return _height;
    }

    /**
     * Get canvas context
     *
     * @returns {CanvasRenderingContext2D} Canvas context
     */
    function getContext() {
        return _context;
    }

    /**
     * Draw text
     *
     * @param {string} text - Text to draw
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} options - Text options
     */
    function drawText(text, x, y, options = {}) {
        if (!_initialized) return;

        Shapes.text(_context, text, x, y, options);
    }

    /**
     * Draw a rectangle
     *
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {string} color - Fill color
     * @param {Object} options - Additional options
     */
    function drawRectangle(x, y, width, height, color, options = {}) {
        if (!_initialized) return;

        Shapes.rectangle(_context, x, y, width, height, color, options);
    }

    /**
     * Draw a circle
     *
     * @param {number} x - X position (center)
     * @param {number} y - Y position (center)
     * @param {number} radius - Radius
     * @param {string} color - Fill color
     * @param {Object} options - Additional options
     */
    function drawCircle(x, y, radius, color, options = {}) {
        if (!_initialized) return;

        Shapes.circle(_context, x, y, radius, color, options);
    }

    /**
     * Draw a line
     *
     * @param {number} x1 - Start X position
     * @param {number} y1 - Start Y position
     * @param {number} x2 - End X position
     * @param {number} y2 - End Y position
     * @param {string} color - Line color
     * @param {number} width - Line width
     * @param {Object} options - Additional options
     */
    function drawLine(x1, y1, x2, y2, color, width = 1, options = {}) {
        if (!_initialized) return;

        Shapes.line(_context, x1, y1, x2, y2, color, width, options);
    }

    /**
     * Draw a triangle
     *
     * @param {number} x1 - First point X
     * @param {number} y1 - First point Y
     * @param {number} x2 - Second point X
     * @param {number} y2 - Second point Y
     * @param {number} x3 - Third point X
     * @param {number} y3 - Third point Y
     * @param {string} color - Fill color
     * @param {Object} options - Additional options
     */
    function drawTriangle(x1, y1, x2, y2, x3, y3, color, options = {}) {
        if (!_initialized) return;

        Shapes.triangle(_context, x1, y1, x2, y2, x3, y3, color, options);
    }

    /**
     * Draw a grid cell
     *
     * @param {number} x - X position (top-left)
     * @param {number} y - Y position (top-left)
     * @param {number} size - Cell size
     * @param {string} color - Fill color
     * @param {Object} options - Additional options
     */
    function drawGridCell(x, y, size, color, options = {}) {
        if (!_initialized) return;

        Shapes.gridCell(_context, x, y, size, color, options);
    }

    /**
     * Draw an arrow
     *
     * @param {number} x1 - Start X position
     * @param {number} y1 - Start Y position
     * @param {number} x2 - End X position
     * @param {number} y2 - End Y position
     * @param {string} color - Arrow color
     * @param {Object} options - Additional options
     */
    function drawArrow(x1, y1, x2, y2, color, options = {}) {
        if (!_initialized) return;

        Shapes.arrow(_context, x1, y1, x2, y2, color, options);
    }

    /**
     * Draw an image
     *
     * @param {HTMLImageElement} image - Image to draw
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {Object} options - Additional options
     */
    function drawImage(image, x, y, width, height, options = {}) {
        if (!_initialized) return;

        _context.save();

        // Apply options
        if (options.rotation) {
            // Rotate around center
            const centerX = x + width / 2;
            const centerY = y + height / 2;
            _context.translate(centerX, centerY);
            _context.rotate(options.rotation);
            _context.translate(-centerX, -centerY);
        }

        // Draw image
        _context.drawImage(image, x, y, width, height);

        _context.restore();
    }

    /**
     * Save the current drawing state
     */
    function save() {
        if (!_initialized) return;

        _context.save();
    }

    /**
     * Restore the previous drawing state
     */
    function restore() {
        if (!_initialized) return;

        _context.restore();
    }

    /**
     * Apply a translation transformation
     *
     * @param {number} x - X translation
     * @param {number} y - Y translation
     */
    function translate(x, y) {
        if (!_initialized) return;

        _context.translate(x, y);
    }

    /**
     * Apply a rotation transformation
     *
     * @param {number} angle - Rotation angle in radians
     */
    function rotate(angle) {
        if (!_initialized) return;

        _context.rotate(angle);
    }

    /**
     * Apply a scale transformation
     *
     * @param {number} x - X scale factor
     * @param {number} y - Y scale factor
     */
    function scale(x, y) {
        if (!_initialized) return;

        _context.scale(x, y);
    }

    /**
     * Set global alpha (transparency)
     *
     * @param {number} alpha - Alpha value (0-1)
     */
    function setAlpha(alpha) {
        if (!_initialized) return;

        _context.globalAlpha = alpha;
    }

    // Public API
    return {
        init,
        clear,
        getWidth,
        getHeight,
        getContext,
        drawText,
        drawRectangle,
        drawCircle,
        drawLine,
        drawTriangle,
        drawGridCell,
        drawArrow,
        drawImage,
        save,
        restore,
        translate,
        rotate,
        scale,
        setAlpha
    };
})();