/**
 * Input Manager
 *
 * Handles user input from keyboard and mouse.
 * Publishes events when input is detected.
 */
const InputManager = (function() {
    // Key states
    const _keys = {};

    // Mouse state
    const _mouse = {
        x: 0,
        y: 0,
        buttons: {}
    };

    // Key mapping
    const KEY_CODES = {
        W: 87,
        A: 65,
        S: 83,
        D: 68,
        E: 69,
        SPACE: 32,
        ENTER: 13,
        ESCAPE: 27,
        ARROW_UP: 38,
        ARROW_LEFT: 37,
        ARROW_DOWN: 40,
        ARROW_RIGHT: 39,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18
    };

    // Game actions
    const ACTIONS = {
        MOVE_UP: 'move_up',
        MOVE_LEFT: 'move_left',
        MOVE_DOWN: 'move_down',
        MOVE_RIGHT: 'move_right',
        INTERACT: 'interact',
        PAUSE: 'pause',
        CONFIRM: 'confirm',
        CANCEL: 'cancel'
    };

    // Mapping from keys to actions
    const _actionMap = {
        [KEY_CODES.W]: ACTIONS.MOVE_UP,
        [KEY_CODES.A]: ACTIONS.MOVE_LEFT,
        [KEY_CODES.S]: ACTIONS.MOVE_DOWN,
        [KEY_CODES.D]: ACTIONS.MOVE_RIGHT,
        [KEY_CODES.E]: ACTIONS.INTERACT,
        [KEY_CODES.ESCAPE]: ACTIONS.PAUSE,
        [KEY_CODES.ENTER]: ACTIONS.CONFIRM,
        [KEY_CODES.SPACE]: ACTIONS.CONFIRM,

        // Alternative controls using arrow keys
        [KEY_CODES.ARROW_UP]: ACTIONS.MOVE_UP,
        [KEY_CODES.ARROW_LEFT]: ACTIONS.MOVE_LEFT,
        [KEY_CODES.ARROW_DOWN]: ACTIONS.MOVE_DOWN,
        [KEY_CODES.ARROW_RIGHT]: ACTIONS.MOVE_RIGHT
    };

    /**
     * Initialize input manager
     */
    function init() {
        // Add event listeners
        window.addEventListener('keydown', _handleKeyDown);
        window.addEventListener('keyup', _handleKeyUp);
        window.addEventListener('mousemove', _handleMouseMove);
        window.addEventListener('mousedown', _handleMouseDown);
        window.addEventListener('mouseup', _handleMouseUp);

        console.log('Input Manager initialized');
    }

    /**
     * Clean up event listeners
     */
    function cleanup() {
        window.removeEventListener('keydown', _handleKeyDown);
        window.removeEventListener('keyup', _handleKeyUp);
        window.removeEventListener('mousemove', _handleMouseMove);
        window.removeEventListener('mousedown', _handleMouseDown);
        window.removeEventListener('mouseup', _handleMouseUp);

        console.log('Input Manager cleaned up');
    }

    /**
     * Handle key down events
     *
     * @param {KeyboardEvent} event - Keyboard event
     * @private
     */
    function _handleKeyDown(event) {
        const keyCode = event.keyCode;

        // Ignore repeated keydown events
        if (_keys[keyCode]) return;

        _keys[keyCode] = true;

        // Publish key down event
        Events.publish(Events.EVENTS.KEY_DOWN, {
            keyCode,
            action: _actionMap[keyCode]
        });
    }

    /**
     * Handle key up events
     *
     * @param {KeyboardEvent} event - Keyboard event
     * @private
     */
    function _handleKeyUp(event) {
        const keyCode = event.keyCode;

        _keys[keyCode] = false;

        // Publish key up event
        Events.publish(Events.EVENTS.KEY_UP, {
            keyCode,
            action: _actionMap[keyCode]
        });
    }

    /**
     * Handle mouse move events
     *
     * @param {MouseEvent} event - Mouse event
     * @private
     */
    function _handleMouseMove(event) {
        // Get mouse position relative to canvas
        const canvas = Renderer.getContext().canvas;
        const rect = canvas.getBoundingClientRect();

        _mouse.x = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
        _mouse.y = (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
    }

    /**
     * Handle mouse down events
     *
     * @param {MouseEvent} event - Mouse event
     * @private
     */
    function _handleMouseDown(event) {
        _mouse.buttons[event.button] = true;
    }

    /**
     * Handle mouse up events
     *
     * @param {MouseEvent} event - Mouse event
     * @private
     */
    function _handleMouseUp(event) {
        _mouse.buttons[event.button] = false;
    }

    /**
     * Check if a key is currently pressed
     *
     * @param {number} keyCode - Key code to check
     * @returns {boolean} True if key is pressed
     */
    function isKeyDown(keyCode) {
        return !!_keys[keyCode];
    }

    /**
     * Check if an action is currently active
     *
     * @param {string} action - Action to check
     * @returns {boolean} True if action is active
     */
    function isActionActive(action) {
        for (const keyCode in _actionMap) {
            if (_actionMap[keyCode] === action && _keys[keyCode]) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get current mouse position
     *
     * @returns {Object} Mouse position {x, y}
     */
    function getMousePosition() {
        return { x: _mouse.x, y: _mouse.y };
    }

    /**
     * Check if a mouse button is pressed
     *
     * @param {number} button - Button to check (0 = left, 1 = middle, 2 = right)
     * @returns {boolean} True if button is pressed
     */
    function isMouseButtonDown(button) {
        return !!_mouse.buttons[button];
    }

    /**
     * Map a key to an action
     *
     * @param {number} keyCode - Key code to map
     * @param {string} action - Action to map to
     */
    function mapKey(keyCode, action) {
        _actionMap[keyCode] = action;
    }

    /**
     * Reset all key mappings to defaults
     */
    function resetKeyMappings() {
        _actionMap[KEY_CODES.W] = ACTIONS.MOVE_UP;
        _actionMap[KEY_CODES.A] = ACTIONS.MOVE_LEFT;
        _actionMap[KEY_CODES.S] = ACTIONS.MOVE_DOWN;
        _actionMap[KEY_CODES.D] = ACTIONS.MOVE_RIGHT;
        _actionMap[KEY_CODES.E] = ACTIONS.INTERACT;
        _actionMap[KEY_CODES.ESCAPE] = ACTIONS.PAUSE;
        _actionMap[KEY_CODES.ENTER] = ACTIONS.CONFIRM;
        _actionMap[KEY_CODES.SPACE] = ACTIONS.CONFIRM;
        _actionMap[KEY_CODES.ARROW_UP] = ACTIONS.MOVE_UP;
        _actionMap[KEY_CODES.ARROW_LEFT] = ACTIONS.MOVE_LEFT;
        _actionMap[KEY_CODES.ARROW_DOWN] = ACTIONS.MOVE_DOWN;
        _actionMap[KEY_CODES.ARROW_RIGHT] = ACTIONS.MOVE_RIGHT;
    }

    // Public API
    return {
        // Constants
        KEYS: KEY_CODES,
        ACTIONS: ACTIONS,

        // Methods
        init,
        cleanup,
        isKeyDown,
        isActionActive,
        getMousePosition,
        isMouseButtonDown,
        mapKey,
        resetKeyMappings
    };
})();