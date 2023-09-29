module.exports = {
    "roots": ["."],
    "transform": { "^.+\\.tsx?$": "ts-jest" },
    transformIgnorePatterns: [
        '<rootDir>/node_modules/'
    ],
    "moduleFileExtensions" : ['ts', 'js', 'mjs', 'cjs', 'jsx', 'tsx', 'json', 'node'],
    "verbose" : true,
}