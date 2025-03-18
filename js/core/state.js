/**
 * State Management System
 *
 * Provides a central state store with controlled access.
 * Components can access and modify state through defined methods.
 */
const StateManager = (function() {
    // Private state
    let _state = {};
    const _subscribers = {};

    /**
     * Initialize state with initial data
     *
     * @param {Object} initialState - Initial state data
     */
    function init(initialState = {}) {
        _state = { ...initialState };

        // Default game states if not provided
        if (!_state.gameState) {
            _state.gameState = 'loading';
        }
    }

    /**
     * Get value from state at path
     *
     * @param {string} path - Dot notation path (e.g. 'player.position.x')
     * @param {*} defaultValue - Default value if path doesn't exist
     * @returns {*} Value at path or default value
     */
    function get(path, defaultValue = null) {
        const parts = path.split('.');
        let current = _state;

        for (const part of parts) {
            if (current === undefined || current === null) {
                return defaultValue;
            }
            current = current[part];
        }

        return current !== undefined ? current : defaultValue;
    }

    /**
     * Set value in state at path
     *
     * @param {string} path - Dot notation path (e.g. 'player.position.x')
     * @param {*} value - Value to set
     */
    function set(path, value) {
        const parts = path.split('.');
        const lastPart = parts.pop();

        let current = _state;

        // Navigate to the correct object
        for (const part of parts) {
            if (current[part] === undefined || current[part] === null) {
                current[part] = {};
            }
            current = current[part];
        }

        // Only update if value has changed
        if (current[lastPart] !== value) {
            const oldValue = current[lastPart];
            current[lastPart] = value;

            // Notify subscribers for this path
            notifySubscribers(path, value, oldValue);
        }
    }

    /**
     * Subscribe to changes at a specific path
     *
     * @param {string} path - Path to subscribe to
     * @param {Function} callback - Function to call when value changes
     * @returns {Function} Unsubscribe function
     */
    function subscribe(path, callback) {
        if (!_subscribers[path]) {
            _subscribers[path] = [];
        }

        _subscribers[path].push(callback);

        // Return unsubscribe function
        return function unsubscribe() {
            _subscribers[path] = _subscribers[path].filter(cb => cb !== callback);
        };
    }

    /**
     * Notify subscribers of a state change
     *
     * @param {string} path - Path that changed
     * @param {*} newValue - New value
     * @param {*} oldValue - Old value
     */
    function notifySubscribers(path, newValue, oldValue) {
        // Notify subscribers for this exact path
        if (_subscribers[path]) {
            _subscribers[path].forEach(callback => {
                try {
                    callback(newValue, oldValue, path);
                } catch (error) {
                    console.error(`Error in state subscriber for ${path}:`, error);
                }
            });
        }

        // Notify subscribers for parent paths
        const parts = path.split('.');
        while (parts.length > 1) {
            parts.pop();
            const parentPath = parts.join('.');

            if (_subscribers[parentPath]) {
                const parentValue = get(parentPath);
                _subscribers[parentPath].forEach(callback => {
                    try {
                        callback(parentValue, parentValue, parentPath);
                    } catch (error) {
                        console.error(`Error in state subscriber for ${parentPath}:`, error);
                    }
                });
            }
        }
    }

    /**
     * Get a copy of the entire state
     *
     * @returns {Object} Copy of the state
     */
    function getState() {
        return { ..._state };
    }

    /**
     * Reset state to empty or provided initial state
     *
     * @param {Object} initialState - Optional initial state
     */
    function reset(initialState = {}) {
        _state = { ...initialState };
    }

    // Public API
    return {
        init,
        get,
        set,
        subscribe,
        getState,
        reset
    };
})();