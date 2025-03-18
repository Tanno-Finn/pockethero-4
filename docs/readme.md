# Grid World Game

## Overview
A top-down 2D game with grid-based movement and interaction. Entities move in discrete steps on various tile types, each with their own properties. Players can interact with the environment and NPCs through a direction-based interaction system.

## Key Features
- Grid-based top-down world with discrete movement
- Different tile types (grass, forest, river, stone) with varying properties
- Multi-layer entities (NPCs, items, furniture)
- WASD movement and E interaction (direction-dependent)
- Tag-based property system
- Canvas rendering using shapes and colors
- JSON-based data configuration
- Camera system that follows the player
- Teleporters between multiple zones

## Architecture
```
[Grid World Game]
├── index.html              # Entry point
├── css/                    # Stylesheets
│   └── main.css            # Main stylesheet
├── js/                     # JavaScript source files
│   ├── core/               # Core engine components
│   │   ├── game.js         # Main game controller
│   │   ├── state.js        # State management
│   │   ├── grid.js         # Grid system
│   │   ├── entity.js       # Entity system
│   │   ├── event.js        # Event system
│   │   └── loop.js         # Game loop
│   ├── components/         # Entity components
│   │   ├── player.js       # Player component
│   │   ├── tile.js         # Tile component
│   │   └── interactable.js # Interactable component
│   ├── utils/              # Utility functions
│   │   ├── math.js         # Math utilities
│   │   └── helpers.js      # Helper functions
│   ├── rendering/          # Rendering-related code
│   │   ├── renderer.js     # Main rendering engine
│   │   ├── camera.js       # Camera system
│   │   └── shapes.js       # Shape drawing utilities
│   ├── input/              # Input handling
│   │   └── input-manager.js # Input manager
│   ├── interactions/       # Interaction system
│   │   └── interaction-manager.js # Interaction manager
│   └── data/               # Data management
│       ├── loader.js       # Data loading utilities
│       └── validator.js    # JSON validation
├── data/                   # Game data (JSON files)
│   ├── worlds/             # World definitions
│   ├── tiles/              # Tile type definitions
│   ├── entities/           # Entity definitions
│   └── interactions/       # Interaction definitions
├── tests/                  # Test files
└── docs/                   # Documentation files
    ├── README.md           # Project overview
    ├── DESIGN.md           # Design decisions
    ├── CODING_GUIDELINES.md # Coding standards
    ├── CHANGELOG.md        # Change log
    ├── TODO.md             # Task tracking
    └── API_REFERENCE.md    # API documentation
```

## File Catalog

### Core Files
- **index.html**: Main entry point that loads the game
- **js/core/game.js**: Core game controller that initializes and coordinates all systems
- **js/core/grid.js**: Manages the game's grid system and entity positions
- **js/core/entity.js**: Base entity system for all game objects
- **js/core/event.js**: Event system for communication between components
- **js/rendering/renderer.js**: Handles all rendering operations
- **js/input/input-manager.js**: Captures and processes user input

## Setup and Usage
1. Clone the repository
2. Open index.html in a modern browser
3. No additional dependencies required

## Game Controls
- **W**: Move up
- **A**: Move left
- **S**: Move down
- **D**: Move right
- **E**: Interact with objects/NPCs

## Development
See [DESIGN.md](docs/DESIGN.md) for architecture details and [CODING_GUIDELINES.md](docs/CODING_GUIDELINES.md) for development standards.