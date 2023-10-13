module.exports = {
    "roots": ["<rootDir>","."],
    "transform": { "^.+\\.tsx?$": "ts-jest" },
    transformIgnorePatterns: [
        '<rootDir>/node_modules/'
    ],
    "moduleFileExtensions": ['ts', 'js', 'mjs', 'cjs', 'jsx', 'tsx', 'json', 'node'],
    "verbose": true,
    "collectCoverage": false,
    "collectCoverageFrom": ['**/*.{ts,jsx}'],
}
