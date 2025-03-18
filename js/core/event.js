/**
 * Event System
 *
 * Implements a publish-subscribe pattern for communication between components.
 * Components can subscribe to events and publish events without direct coupling.
 */
const Events = (function() {
    // Private event handlers storage
    const _handlers = {};

    // Event name constants
    const EVENT_NAMES = {
        // Game lifecycle events
        GAME_INIT: 'game:init',
        GAME_START: 'game:start',
        GAME_PAUSE: 'game:pause',
        GAME_RESUME: 'game:resume',
        GAME_OVER: 'game:over',

        // Input events
        KEY_DOWN: 'input:keydown',
        KEY_UP: 'input:keyup',

        // Entity events
        ENTITY_MOVE: 'entity:move',
        ENTITY_INTERACT: 'entity:interact',
        ENTITY_SPAWN: 'entity:spawn',
        ENTITY_DESTROY: 'entity:destroy',

        // Grid events
        GRID_LOADED: 'grid:loaded',
        GRID_CHANGED: 'grid:changed',
        ZONE_CHANGE: 'zone:change',

        // UI events
        DIALOG_OPEN: 'ui:dialog:open',
        DIALOG_CLOSE: 'ui:dialog:close'
    };

    /**
     * Subscribe to an event
     *
     * @param {string} eventName - Name of the event to subscribe to
     * @param {Function} handler - Function to call when event is published
     * @returns {Function} Unsubscribe function
     */
    function subscribe(eventName, handler) {
        if (!_handlers[eventName]) {
            _handlers[eventName] = [];
        }

        _handlers[eventName].push(handler);

        // Return unsubscribe function
        return function unsubscribe() {
            _handlers[eventName] = _handlers[eventName].filter(h => h !== handler);
        };
    }

    /**
     * Publish an event
     *
     * @param {string} eventName - Name of the event to publish
     * @param {any} data - Data to pass to event handlers
     */
    function publish(eventName, data) {
        if (!_handlers[eventName]) {
            return;
        }

        _handlers[eventName].forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`Error in event handler for ${eventName}:`, error);
            }
        });
    }

    /**
     * Clear all event handlers
     */
    function clear() {
        for (const key in _handlers) {
            delete _handlers[key];
        }
    }

    /**
     * Get number of subscribers for an event
     *
     * @param {string} eventName - Name of the event
     * @returns {number} Number of subscribers
     */
    function getSubscriberCount(eventName) {
        return _handlers[eventName] ? _handlers[eventName].length : 0;
    }

    // Public API
    return {
        // Constants
        EVENTS: EVENT_NAMES,

        // Methods
        subscribe,
        publish,
        clear,
        getSubscriberCount
    };
})();