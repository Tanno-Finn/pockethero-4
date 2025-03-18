/**
 * Helper Utilities
 *
 * General utility functions for various purposes.
 */
const Helpers = (function() {
    // Counter for generating IDs
    let _idCounter = 0;

    /**
     * Generate a unique ID
     *
     * @param {string} prefix - Optional prefix for the ID
     * @returns {string} Unique ID
     */
    function generateId(prefix = '') {
        _idCounter++;
        return `${prefix}${_idCounter}`;
    }

    /**
     * Debounce a function
     *
     * @param {Function} func - Function to debounce
     * @param {number} wait - Milliseconds to wait
     * @returns {Function} Debounced function
     */
    function debounce(func, wait) {
        let timeout;

        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };

            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle a function
     *
     * @param {Function} func - Function to throttle
     * @param {number} limit - Milliseconds to limit
     * @returns {Function} Throttled function
     */
    function throttle(func, limit) {
        let inThrottle;

        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    /**
     * Deep clone an object
     *
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    function deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }

        if (obj instanceof Array) {
            return obj.map(item => deepClone(item));
        }

        if (obj instanceof Object) {
            const copy = {};
            Object.keys(obj).forEach(key => {
                copy[key] = deepClone(obj[key]);
            });
            return copy;
        }
    }

    /**
     * Check if two objects are equal (deep comparison)
     *
     * @param {Object} obj1 - First object
     * @param {Object} obj2 - Second object
     * @returns {boolean} True if objects are equal
     */
    function deepEqual(obj1, obj2) {
        if (obj1 === obj2) return true;

        if (typeof obj1 !== 'object' || obj1 === null ||
            typeof obj2 !== 'object' || obj2 === null) {
            return false;
        }

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) return false;

        for (const key of keys1) {
            if (!keys2.includes(key)) return false;

            if (!deepEqual(obj1[key], obj2[key])) return false;
        }

        return true;
    }

    /**
     * Format a number with leading zeros
     *
     * @param {number} num - Number to format
     * @param {number} size - Desired string length
     * @returns {string} Formatted number
     */
    function pad(num, size) {
        let s = num.toString();
        while (s.length < size) s = '0' + s;
        return s;
    }

    /**
     * Check if a value is a plain object
     *
     * @param {*} value - Value to check
     * @returns {boolean} True if value is a plain object
     */
    function isPlainObject(value) {
        return value !== null &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            Object.prototype.toString.call(value) === '[object Object]';
    }

    /**
     * Convert color string to RGB object
     *
     * @param {string} color - CSS color string
     * @returns {Object} RGB object {r, g, b}
     */
    function colorToRGB(color) {
        // For hex colors
        if (color.startsWith('#')) {
            let r, g, b;

            if (color.length === 4) {
                r = parseInt(color[1] + color[1], 16);
                g = parseInt(color[2] + color[2], 16);
                b = parseInt(color[3] + color[3], 16);
            } else {
                r = parseInt(color.substr(1, 2), 16);
                g = parseInt(color.substr(3, 2), 16);
                b = parseInt(color.substr(5, 2), 16);
            }

            return { r, g, b };
        }

        // For RGB colors
        if (color.startsWith('rgb')) {
            const match = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
            if (match) {
                return {
                    r: parseInt(match[1], 10),
                    g: parseInt(match[2], 10),
                    b: parseInt(match[3], 10)
                };
            }
        }

        // Default fallback
        return { r: 0, g: 0, b: 0 };
    }

    /**
     * Wait for a specified time
     *
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise} Promise that resolves after the wait
     */
    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public API
    return {
        generateId,
        debounce,
        throttle,
        deepClone,
        deepEqual,
        pad,
        isPlainObject,
        colorToRGB,
        wait
    };
})();