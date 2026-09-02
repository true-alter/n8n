/**
 * ESLint config for an n8n community node package.
 *
 * Follows the standard n8n community-node lint shape: a TypeScript-aware
 * base config, plus the `eslint-plugin-n8n-nodes-base` overrides n8n's own
 * verified-community-node review expects on `package.json`, `credentials/`
 * and `nodes/`.
 *
 * https://docs.n8n.io/integrations/creating-nodes/build/reference/linter-config/
 */
module.exports = {
	root: true,
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: ['./tsconfig.json'],
		sourceType: 'module',
		extraFileExtensions: ['.json'],
	},
	ignorePatterns: ['.eslintrc.js', '**/*.js', '**/node_modules/**', '**/dist/**'],
	overrides: [
		{
			files: ['package.json'],
			plugins: ['n8n-nodes-base'],
			extends: ['plugin:n8n-nodes-base/community'],
			rules: {
				// ALTER's Apache-2.0 license is a deliberate legal choice matching
				// this repo's own LICENSE file, not an oversight. This rule wants
				// the n8n-verified-community-node default of MIT.
				'n8n-nodes-base/community-package-json-license-not-default': 'off',
			},
		},
		{
			files: ['./credentials/**/*.ts'],
			plugins: ['n8n-nodes-base'],
			extends: ['plugin:n8n-nodes-base/credentials'],
			rules: {
				// Both rules assume every credential's docs live under n8n's own
				// docs.n8n.io domain. The rule's own description says as much:
				// "Only applicable to nodes in the main repository." Applying its
				// autofix to a third-party GitHub URL mangles it (verified:
				// mangled 'https://github.com/true-alter/n8n-nodes-alter#credentials'
				// into 'httpsGithubComTrueAlterN8nNodesAlterCredentials'), so both
				// halves of the pair are disabled for this community package.
				'n8n-nodes-base/cred-class-field-documentation-url-miscased': 'off',
				'n8n-nodes-base/cred-class-field-documentation-url-not-http-url': 'off',
			},
		},
		{
			files: ['./nodes/**/*.ts'],
			plugins: ['n8n-nodes-base'],
			extends: ['plugin:n8n-nodes-base/nodes'],
		},
	],
};
