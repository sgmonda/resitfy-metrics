module.exports = {
	'env': {
		'node': true,
		'es6': true,
	},
	'extends': 'eslint:recommended',
	'rules': {
		'array-callback-return': 'error',
		'arrow-spacing': 'error',
		'callback-return': 'error',
		'complexity': ['error', 40],
		'comma-dangle': ['error', 'always-multiline'],
		'comma-spacing': ['error', {before: false, after: true}],
		'dot-notation': 'error',
		'generator-star-spacing': ['error', {'before': false, 'after': true}],
		'handle-callback-err': 'error',
		'sort-vars': 'error',
		'indent': ['error', 'tab', {'SwitchCase': 1}],
		'linebreak-style': ['error', 'unix'],
		'max-lines': ['error', {max: 1000}], // @TODO Reduce this to 500
		'max-depth': ['error', {max: 5}],
		'no-unused-vars': 'error',
		'no-console': 'off',
		'no-duplicate-imports': 'error',
		'no-lone-blocks':'error',
		'no-multi-spaces': 'error',
		'no-multiple-empty-lines': ['error', {'max': 1}],
		'no-unused-expressions': 'error',
		'no-eq-null': 'error',
		'no-trailing-spaces': 'error',
		'object-curly-spacing': ['error', 'never'],
		'quotes': ['error', 'single', {'avoidEscape': true, 'allowTemplateLiterals': true}],
		'semi': ['error', 'always'],
		'yield-star-spacing': ['error', 'after'],
	},
};
