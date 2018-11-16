module.exports = {
    "extends": "airbnb-base",
    "env": {
        "browser": true,
    },
    "rules": {
        "indent": ["error", 4],
        "comma-dangle": 0,
        "no-plusplus": 0,
        "no-underscore-dangle": 0,
        "no-bitwise": ["error", { "allow": ["~"] }],
        "no-void": 0,
        "no-restricted-syntax": 0
    }
};