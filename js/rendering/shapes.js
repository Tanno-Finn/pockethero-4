/**
 * Shapes Utility
 *
 * Utility functions for drawing shapes on a canvas.
 * Used by the renderer to draw game elements.
 */
const Shapes = (function() {
    /**
     * Draw a rectangle
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position (top-left)
     * @param {number} y - Y position (top-left)
     * @param {number} width - Width of rectangle
     * @param {number} height - Height of rectangle
     * @param {string} color - Fill color
     * @param {Object} options - Additional options
     */
    function rectangle(ctx, x, y, width, height, color, options = {}) {
        ctx.save();

        // Apply options
        if (options.rotation) {
            // Rotate around center
            const centerX = x + width / 2;
            const centerY = y + height / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(options.rotation);
            ctx.translate(-centerX, -centerY);
        }

        // Set fill style
        ctx.fillStyle = color;

        // Draw rectangle
        ctx.fillRect(x, y, width, height);

        // Draw stroke if specified
        if (options.stroke) {
            ctx.strokeStyle = options.stroke.color || 'black';
            ctx.lineWidth = options.stroke.width || 1;
            ctx.strokeRect(x, y, width, height);
        }

        ctx.restore();
    }

    /**
     * Draw a circle
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position (center)
     * @param {number} y - Y position (center)
     * @param {number} radius - Circle radius
     * @param {string} color - Fill color
     * @param {Object} options - Additional options
     */
    function circle(ctx, x, y, radius, color, options = {}) {
        ctx.save();

        // Begin path
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);

        // Fill circle
        ctx.fillStyle = color;
        ctx.fill();

        // Draw stroke if specified
        if (options.stroke) {
            ctx.strokeStyle = options.stroke.color || 'black';
            ctx.lineWidth = options.stroke.width || 1;
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Draw a line
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x1 - Start X position
     * @param {number} y1 - Start Y position
     * @param {number} x2 - End X position
     * @param {number} y2 - End Y position
     * @param {string} color - Line color
     * @param {number} width - Line width
     * @param {Object} options - Additional options
     */
    function line(ctx, x1, y1, x2, y2, color, width = 1, options = {}) {
        ctx.save();

        // Set line style
        ctx.strokeStyle = color;
        ctx.lineWidth = width;

        // Set dash pattern if specified
        if (options.dash) {
            ctx.setLineDash(options.dash);
        }

        // Draw line
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Draw a triangle
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x1 - First point X
     * @param {number} y1 - First point Y
     * @param {number} x2 - Second point X
     * @param {number} y2 - Second point Y
     * @param {number} x3 - Third point X
     * @param {number} y3 - Third point Y
     * @param {string} color - Fill color
     * @param {Object} options - Additional options
     */
    function triangle(ctx, x1, y1, x2, y2, x3, y3, color, options = {}) {
        ctx.save();

        // Begin path
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.closePath();

        // Fill triangle
        ctx.fillStyle = color;
        ctx.fill();

        // Draw stroke if specified
        if (options.stroke) {
            ctx.strokeStyle = options.stroke.color || 'black';
            ctx.lineWidth = options.stroke.width || 1;
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Draw text
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} text - Text to draw
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} options - Text options
     */
    function text(ctx, text, x, y, options = {}) {
        ctx.save();

        // Set text properties
        ctx.font = options.font || '16px Arial';
        ctx.fillStyle = options.color || 'black';
        ctx.textAlign = options.textAlign || 'left';
        ctx.textBaseline = options.textBaseline || 'top';

        // Draw text
        ctx.fillText(text, x, y);

        // Draw stroke if specified
        if (options.stroke) {
            ctx.strokeStyle = options.stroke.color || 'black';
            ctx.lineWidth = options.stroke.width || 1;
            ctx.strokeText(text, x, y);
        }

        ctx.restore();
    }

    /**
     * Draw a grid cell
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position (top-left)
     * @param {number} y - Y position (top-left)
     * @param {number} size - Cell size
     * @param {string} color - Fill color
     * @param {Object} options - Additional options
     */
    function gridCell(ctx, x, y, size, color, options = {}) {
        rectangle(ctx, x, y, size, size, color, options);

        // Draw grid lines if specified
        if (options.grid) {
            const gridColor = options.grid.color || 'rgba(0, 0, 0, 0.1)';
            const gridWidth = options.grid.width || 1;

            // Draw outer grid lines
            line(ctx, x, y, x + size, y, gridColor, gridWidth);
            line(ctx, x, y, x, y + size, gridColor, gridWidth);
            line(ctx, x + size, y, x + size, y + size, gridColor, gridWidth);
            line(ctx, x, y + size, x + size, y + size, gridColor, gridWidth);
        }
    }

    /**
     * Draw an arrow
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x1 - Start X position
     * @param {number} y1 - Start Y position
     * @param {number} x2 - End X position
     * @param {number} y2 - End Y position
     * @param {string} color - Arrow color
     * @param {Object} options - Additional options
     */
    function arrow(ctx, x1, y1, x2, y2, color, options = {}) {
        ctx.save();

        // Draw line
        const width = options.width || 2;
        line(ctx, x1, y1, x2, y2, color, width);

        // Calculate arrowhead size
        const headSize = options.headSize || 10;

        // Calculate angle
        const angle = Math.atan2(y2 - y1, x2 - x1);

        // Draw arrowhead
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(
            x2 - headSize * Math.cos(angle - Math.PI / 6),
            y2 - headSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            x2 - headSize * Math.cos(angle + Math.PI / 6),
            y2 - headSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();

        ctx.fillStyle = color;
        ctx.fill();

        ctx.restore();
    }

    // Public API
    return {
        rectangle,
        circle,
        line,
        triangle,
        text,
        gridCell,
        arrow
    };
})();