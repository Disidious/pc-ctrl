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
            helpers: "./src/helpers",
            components: "./src/components/index",
            constants: "./src/constants"
          },
        },
      ],
    ],
  };
};
