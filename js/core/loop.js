/**
 * Game Loop
 *
 * Manages the game timing and update/render cycle.
 * Uses a fixed time step for updates to ensure consistent gameplay.
 */
const GameLoop = (function() {
    // Private variables
    let _animationFrameId = null;
    let _lastFrameTime = 0;
    let _deltaTime = 0;
    let _isPaused = false;
    let _updateFn = null;
    let _renderFn = null;

    // Configuration
    const _config = {
        fps: 60,
        maxDeltaTime: 0.1, // Maximum delta time to prevent large time jumps
        fixedUpdateTime: 1 / 60 // Fixed time step for updates
    };

    /**
     * Animation frame handler
     *
     * @param {number} timestamp - Current timestamp
     */
    function _loop(timestamp) {
        // First frame, initialize lastFrameTime
        if (_lastFrameTime === 0) {
            _lastFrameTime = timestamp;
            _animationFrameId = requestAnimationFrame(_loop);
            return;
        }

        // Calculate delta time in seconds
        _deltaTime = (timestamp - _lastFrameTime) / 1000;

        // Clamp delta time to prevent huge jumps
        if (_deltaTime > _config.maxDeltaTime) {
            _deltaTime = _config.maxDeltaTime;
        }

        _lastFrameTime = timestamp;

        // Skip updates if paused, but still render
        if (!_isPaused && _updateFn) {
            // Use fixed time step for updates
            let accumulatedTime = _deltaTime;
            while (accumulatedTime >= _config.fixedUpdateTime) {
                _updateFn(_config.fixedUpdateTime);
                accumulatedTime -= _config.fixedUpdateTime;
            }
        }

        // Always render with actual delta time
        if (_renderFn) {
            _renderFn(_deltaTime);
        }

        // Continue the loop
        _animationFrameId = requestAnimationFrame(_loop);
    }

    /**
     * Start the game loop
     *
     * @param {Function} updateFn - Function to call for updates
     * @param {Function} renderFn - Function to call for rendering
     * @param {Object} config - Optional configuration
     */
    function start(updateFn, renderFn, config = {}) {
        // Update configuration if provided
        Object.assign(_config, config);

        // Store update and render functions
        _updateFn = updateFn;
        _renderFn = renderFn;

        // Reset state
        _lastFrameTime = 0;
        _deltaTime = 0;
        _isPaused = false;

        // Start the loop
        if (_animationFrameId === null) {
            _animationFrameId = requestAnimationFrame(_loop);
        }
    }

    /**
     * Stop the game loop
     */
    function stop() {
        if (_animationFrameId !== null) {
            cancelAnimationFrame(_animationFrameId);
            _animationFrameId = null;
        }
    }

    /**
     * Pause the game loop (stops updates but continues rendering)
     */
    function pause() {
        _isPaused = true;
    }

    /**
     * Resume the game loop
     */
    function resume() {
        _isPaused = false;
    }

    /**
     * Check if the game loop is paused
     *
     * @returns {boolean} True if paused, false otherwise
     */
    function isPaused() {
        return _isPaused;
    }

    /**
     * Get the current delta time
     *
     * @returns {number} Delta time in seconds
     */
    function getDeltaTime() {
        return _deltaTime;
    }

    /**
     * Set the target FPS
     *
     * @param {number} fps - Target frames per second
     */
    function setFPS(fps) {
        _config.fps = fps;
        _config.fixedUpdateTime = 1 / fps;
    }

    // Public API
    return {
        start,
        stop,
        pause,
        resume,
        isPaused,
        getDeltaTime,
        setFPS
    };
})();