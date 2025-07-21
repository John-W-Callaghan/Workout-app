module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './', // This tells the app that '@/' means the root directory
          },
        },
      ],
      'react-native-reanimated/plugin', // Make sure this line is here for reanimated
    ],
  };
};