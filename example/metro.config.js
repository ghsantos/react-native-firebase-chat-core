const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path')

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
// const moduleRoot = path.resolve(__dirname, '..')

const config = {
  // watchFolders: [moduleRoot],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
