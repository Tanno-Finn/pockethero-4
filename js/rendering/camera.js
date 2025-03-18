/**
 * Camera System
 *
 * Manages the viewport and handles camera movement.
 * Provides functions to convert between world and screen coordinates.
 */
const Camera = (function() {
    // Camera position and settings
    let _position = { x: 0, y: 0 };
    let _width = 0;
    let _height = 0;
    let _zoom = 1;
    let _target = null;
    let _bounds = null;
    let _followSpeed = 0.1;

    /**
     * Initialize the camera
     *
     * @param {Object} config - Camera configuration
     * @param {number} config.width - Viewport width
     * @param {number} config.height - Viewport height
     * @param {Object} config.initialPosition - Initial camera position {x, y}
     * @param {number} config.zoom - Initial zoom level
     * @param {Object} config.bounds - Camera boundaries {minX, minY, maxX, maxY}
     */
    function init(config = {}) {
        _width = config.width || Renderer.getWidth();
        _height = config.height || Renderer.getHeight();
        _position = config.initialPosition || { x: 0, y: 0 };
        _zoom = config.zoom || 1;
        _bounds = config.bounds || null;
        _followSpeed = config.followSpeed || 0.1;

        console.log('Camera initialized', {
            position: _position,
            size: { width: _width, height: _height },
            zoom: _zoom
        });
    }

    /**
     * Set camera position
     *
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    function setPosition(x, y) {
        _position.x = x;
        _position.y = y;

        // Apply bounds if set
        _applyBounds();
    }

    /**
     * Get camera position
     *
     * @returns {Object} Camera position {x, y}
     */
    function getPosition() {
        return { ..._position };
    }

    /**
     * Set camera target to follow
     *
     * @param {Object} target - Target object with position {x, y}
     */
    function setTarget(target) {
        _target = target;
    }

    /**
     * Set camera follow speed
     *
     * @param {number} speed - Follow speed (0-1)
     */
    function setFollowSpeed(speed) {
        _followSpeed = MathUtils.clamp(speed, 0, 1);
    }

    /**
     * Set camera boundaries
     *
     * @param {Object} bounds - Camera boundaries {minX, minY, maxX, maxY}
     */
    function setBounds(bounds) {
        _bounds = bounds;

        // Apply bounds immediately
        _applyBounds();
    }

    /**
     * Apply camera boundaries
     *
     * @private
     */
    function _applyBounds() {
        if (!_bounds) return;

        // Calculate camera edges
        const halfWidth = _width / 2 / _zoom;
        const halfHeight = _height / 2 / _zoom;

        // Restrict camera position within bounds
        if (_bounds.minX !== undefined) {
            _position.x = Math.max(_bounds.minX + halfWidth, _position.x);
        }

        if (_bounds.maxX !== undefined) {
            _position.x = Math.min(_bounds.maxX - halfWidth, _position.x);
        }

        if (_bounds.minY !== undefined) {
            _position.y = Math.max(_bounds.minY + halfHeight, _position.y);
        }

        if (_bounds.maxY !== undefined) {
            _position.y = Math.min(_bounds.maxY - halfHeight, _position.y);
        }
    }

    /**
     * Set camera zoom level
     *
     * @param {number} zoom - Zoom level
     */
    function setZoom(zoom) {
        _zoom = Math.max(0.1, zoom);
    }

    /**
     * Get camera zoom level
     *
     * @returns {number} Zoom level
     */
    function getZoom() {
        return _zoom;
    }

    /**
     * Convert world coordinates to screen coordinates
     *
     * @param {number} worldX - World X coordinate
     * @param {number} worldY - World Y coordinate
     * @returns {Object} Screen coordinates {x, y}
     */
    function worldToScreen(worldX, worldY) {
        return {
            x: (worldX - _position.x) * _zoom + _width / 2,
            y: (worldY - _position.y) * _zoom + _height / 2
        };
    }

    /**
     * Convert screen coordinates to world coordinates
     *
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     * @returns {Object} World coordinates {x, y}
     */
    function screenToWorld(screenX, screenY) {
        return {
            x: (screenX - _width / 2) / _zoom + _position.x,
            y: (screenY - _height / 2) / _zoom + _position.y
        };
    }

    /**
     * Update camera position based on target
     *
     * @param {number} deltaTime - Time since last update in seconds
     */
    function update(deltaTime) {
        if (!_target) return;

        // Get target position
        const targetPos = _target.position || _target;

        // Smoothly move camera towards target
        _position.x += (targetPos.x - _position.x) * _followSpeed;
        _position.y += (targetPos.y - _position.y) * _followSpeed;

        // Apply bounds
        _applyBounds();
    }

    /**
     * Apply camera transformations to renderer
     */
    function apply() {
        Renderer.save();

        // Translate to center of viewport
        Renderer.translate(_width / 2, _height / 2);

        // Apply zoom
        Renderer.scale(_zoom, _zoom);

        // Translate to negative camera position
        Renderer.translate(-_position.x, -_position.y);
    }

    /**
     * Revert camera transformations
     */
    function revert() {
        Renderer.restore();
    }

    /**
     * Check if a point is within the camera viewport
     *
     * @param {number} worldX - World X coordinate
     * @param {number} worldY - World Y coordinate
     * @returns {boolean} True if point is visible
     */
    function isPointVisible(worldX, worldY) {
        // Calculate viewport boundaries in world coordinates
        const halfWidth = _width / 2 / _zoom;
        const halfHeight = _height / 2 / _zoom;

        return worldX >= _position.x - halfWidth &&
            worldX <= _position.x + halfWidth &&
            worldY >= _position.y - halfHeight &&
            worldY <= _position.y + halfHeight;
    }

    /**
     * Check if a rectangle is visible in the camera viewport
     *
     * @param {number} worldX - World X coordinate of rectangle
     * @param {number} worldY - World Y coordinate of rectangle
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @returns {boolean} True if rectangle is at least partially visible
     */
    function isRectVisible(worldX, worldY, width, height) {
        // Calculate viewport boundaries in world coordinates
        const halfWidth = _width / 2 / _zoom;
        const halfHeight = _height / 2 / _zoom;

        return worldX + width >= _position.x - halfWidth &&
            worldX <= _position.x + halfWidth &&
            worldY + height >= _position.y - halfHeight &&
            worldY <= _position.y + halfHeight;
    }

    // Public API
    return {
        init,
        setPosition,
        getPosition,
        setTarget,
        setFollowSpeed,
        setBounds,
        setZoom,
        getZoom,
        worldToScreen,
        screenToWorld,
        update,
        apply,
        revert,
        isPointVisible,
        isRectVisible
    };
})();