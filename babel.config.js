// react-native-builder-bob/babel-preset (used to transpile *this package's* source for
// publishing) bundles its own, older hermes-parser -- it can't parse newer Flow syntax inside
// react-native's own source (e.g. Libraries/vendor/emitter/EventEmitter.js), which Jest needs
// to transform when a test transitively imports it. `env` presets are merged with, not
// substituted for, top-level `presets`, so both presets active together would double up on
// hermes-parser and fail with "More than one plugin attempted to override parsing" -- the bob
// preset is scoped to non-test envs here instead of being top-level, so exactly one is ever
// active. Jest sets BABEL_ENV/NODE_ENV to "test"; babel defaults to "development" otherwise
// (bob build's normal invocation), which is what a plain `yarn prepare` runs under.
module.exports = {
  env: {
    test: {
      presets: ['module:@react-native/babel-preset'],
    },
    development: {
      presets: ['module:react-native-builder-bob/babel-preset'],
    },
    production: {
      presets: ['module:react-native-builder-bob/babel-preset'],
    },
  },
};
