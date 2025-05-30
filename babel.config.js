module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "react-native-reanimated/plugin",
      // Add this if using styled-components or similar
      ["module:react-native-dotenv"],
    ],
  };
};
