/**
 * Data Loader
 *
 * Loads game data from JSON files.
 * Validates and caches data for efficient access.
 */
const DataLoader = (function() {
    // Data cache
    const _cache = {};

    // Base path for data files
    let _basePath = 'data/';

    /**
     * Initialize the data loader
     *
     * @param {Object} config - Configuration
     * @param {string} config.basePath - Base path for data files
     */
    function init(config = {}) {
        if (config.basePath) {
            _basePath = config.basePath;
        }

        console.log('Data Loader initialized with base path:', _basePath);
    }

    /**
     * Load data from a JSON file
     *
     * @param {string} path - Path to JSON file (relative to base path)
     * @param {boolean} validate - Whether to validate the data
     * @param {string} schemaType - Schema type for validation
     * @returns {Promise<Object>} Loaded data
     */
    async function loadJSON(path, validate = false, schemaType = null) {
        // Check cache
        const cacheKey = path;
        if (_cache[cacheKey]) {
            return _cache[cacheKey];
        }

        try {
            // Load JSON file
            const response = await fetch(_basePath + path);

            if (!response.ok) {
                throw new Error(`Failed to load data from ${path}: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Validate if requested
            if (validate && schemaType) {
                const isValid = Validator.validate(data, schemaType);

                if (!isValid) {
                    const errors = Validator.getErrors();
                    throw new Error(`Invalid data in ${path}: ${errors.join(', ')}`);
                }
            }

            // Cache data
            _cache[cacheKey] = data;

            return data;
        } catch (error) {
            console.error(`Error loading data from ${path}:`, error);
            throw error;
        }
    }

    /**
     * Load multiple JSON files
     *
     * @param {Array<Object>} specs - Array of load specifications {path, validate, schemaType}
     * @returns {Promise<Object>} Object with loaded data, keyed by path
     */
    async function loadMultipleJSON(specs) {
        const result = {};

        try {
            // Load all files in parallel
            const promises = specs.map(spec => {
                return loadJSON(spec.path, spec.validate, spec.schemaType)
                    .then(data => {
                        result[spec.path] = data;
                    });
            });

            await Promise.all(promises);

            return result;
        } catch (error) {
            console.error('Error loading multiple JSON files:', error);
            throw error;
        }
    }

    /**
     * Load all data of a specific type
     *
     * @param {string} type - Data type (folder name)
     * @param {boolean} validate - Whether to validate the data
     * @param {string} schemaType - Schema type for validation
     * @returns {Promise<Object>} Object with loaded data, keyed by ID
     */
    async function loadAllOfType(type, validate = false, schemaType = null) {
        try {
            // Load index file
            const indexPath = `${type}/index.json`;
            const index = await loadJSON(indexPath);

            if (!Array.isArray(index.files)) {
                throw new Error(`Invalid index file for ${type}: missing 'files' array`);
            }

            // Load all files
            const result = {};
            const specs = index.files.map(file => ({
                path: `${type}/${file}`,
                validate,
                schemaType
            }));

            const loadedData = await loadMultipleJSON(specs);

            // Organize by ID
            for (const path in loadedData) {
                const data = loadedData[path];

                if (Array.isArray(data)) {
                    // Handle array of objects
                    for (const item of data) {
                        if (item.id) {
                            result[item.id] = item;
                        }
                    }
                } else if (data.id) {
                    // Handle single object
                    result[data.id] = data;
                }
            }

            return result;
        } catch (error) {
            console.error(`Error loading all ${type}:`, error);
            throw error;
        }
    }

    /**
     * Get data from cache
     *
     * @param {string} cacheKey - Cache key (usually the path)
     * @returns {Object} Cached data or null
     */
    function getCache(cacheKey) {
        return _cache[cacheKey] || null;
    }

    /**
     * Clear data cache
     *
     * @param {string} cacheKey - Optional specific cache key to clear
     */
    function clearCache(cacheKey = null) {
        if (cacheKey) {
            delete _cache[cacheKey];
        } else {
            for (const key in _cache) {
                delete _cache[key];
            }
        }
    }

    /**
     * Set base path for data files
     *
     * @param {string} path - Base path
     */
    function setBasePath(path) {
        _basePath = path;
    }

    // Public API
    return {
        init,
        loadJSON,
        loadMultipleJSON,
        loadAllOfType,
        getCache,
        clearCache,
        setBasePath
    };
})();