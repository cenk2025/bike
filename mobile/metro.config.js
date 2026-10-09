// Learn more https://docs.expo.dev/guides/customizing-metro
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Share pure TypeScript modules with the web app (dictionaries, bike helpers)
// via the "@shared/*" path alias, which points at ../src.
config.watchFolders = [path.resolve(__dirname, "../src")];

module.exports = config;
