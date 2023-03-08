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
            handlers: "./src/handlers",
            constants: "./src/constants",
            components: "./src/components/index",
            screens: "./src/screens/index"
          },
        },
      ],
    ],
  };
};
