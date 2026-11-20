const pkg = require('../package.json');

const rules = {
  'boolean-prefix': require('./rules/boolean-prefix'),
  'handler-prefix': require('./rules/handler-prefix'),
  'no-arrow-handler': require('./rules/no-arrow-handler'),
  'no-generic-names': require('./rules/no-generic-names'),
  'use-show-component': require('./rules/use-show-component'),
  'no-inline-type-import': require('./rules/no-inline-type-import'),
  'no-module-level-in-component': require('./rules/no-module-level-in-component'),
};

const RECOMMENDED_RULE_NAMES = ['handler-prefix', 'no-arrow-handler', 'no-inline-type-import'];

function buildRules(ruleNames) {
  return Object.fromEntries(ruleNames.map((name) => [`code-conventions/${name}`, 'warn']));
}

const recommendedRules = buildRules(RECOMMENDED_RULE_NAMES);
const allRules = buildRules(Object.keys(rules));

const plugin = {
  meta: { name: pkg.name, version: pkg.version },
  rules,
  configs: {},
};

plugin.configs = {
  recommended: { plugins: ['code-conventions'], rules: recommendedRules },
  all: { plugins: ['code-conventions'], rules: allRules },
  'flat/recommended': { plugins: { 'code-conventions': plugin }, rules: recommendedRules },
  'flat/all': { plugins: { 'code-conventions': plugin }, rules: allRules },
};

module.exports = plugin;
