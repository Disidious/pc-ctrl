module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        "module-resolver",
        {
          root: ['.'],
          alias: {
            assets: "./assets",
            helpers: "./src/helpers",
            constants: "./src/constants",
            components: "./src/components/index",
            screens: "./src/screens/index"
          },
        },
      ],
    ],
  };
};
