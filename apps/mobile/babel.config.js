module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'react' }],
    ],
    plugins: [
      'react-native-reanimated/plugin',
      'expo-router/babel',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@gansuni/shared': '../../packages/shared/src',
          },
          extensions: ['.ios.js', '.android.js', '.native.js', '.js', '.ts', '.tsx', '.json'],
        },
      ],
    ],
  }
}
