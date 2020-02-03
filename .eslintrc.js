const path = require('path');

module.exports = {
    "extends": ["airbnb-base", "plugin:@typescript-eslint/recommended"],
    "env": {
        "browser": true,
    },
    "parser": "@typescript-eslint/parser",
    "plugins": ['@typescript-eslint'],
    "rules": {
        "indent": ["error", 4],
        "comma-dangle": 0,
        "no-plusplus": 0,
        "no-underscore-dangle": 0,
        "no-bitwise": ["error", { "allow": ["~"] }],
        "no-void": 0,
        "no-restricted-syntax": 0,
        "object-curly-spacing": 0,
        "import/extensions": [
            "error",
            "ignorePackages",
            {
                "js": "never",
                "jsx": "never",
                "ts": "never",
                "tsx": "never"
            }
        ],
        "max-len": ["error", { "code": 120 }],
        "import/no-unresolved": 0,
        "@typescript-eslint/no-explicit-any": 0,
        "no-await-in-loop": 0
    },
    "settings": {
        "import/resolver": {
            "node": {
                "extensions": [".ts", ".js"]
            }
        }
    }
};