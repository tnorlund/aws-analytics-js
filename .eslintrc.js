module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 12
    },
    "rules": {
        indent: [`error`, 2, { SwitchCase: 1 }],
        quotes: [`error`, `backtick`, { avoidEscape: true }],
        'max-len': [`error`, { 'comments': 80 }],
        'space-in-parens': [`error`, `always`],
    },
    "overrides": [ {
        "files": [`**/*.test.js`],
        "rules": { 'no-undef': [`ignore`] }
    } ]
        
};
