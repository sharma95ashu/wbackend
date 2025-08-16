module.exports = {
  root: true, // To ensure ESLint looks only at this configuration file
  env: {
    node: true, // Enable Node.js globals (like console)
    es2021: true, // Enable ES2021 features
  },
  parserOptions: {
    ecmaVersion: "latest", // Use the latest ECMAScript version
    sourceType: "module", // Use modules (import/export)
  },
  rules: {
    "no-undef": "error", // Catch undefined variables (like console)
    "no-unused-vars": "warn", // Warn if vars are declared but not used
    eqeqeq: "error", // Enforce === over ==
    "no-console": "off", // Allow console logs
    semi: ["error", "always"], // Enforce semicolons
    quotes: ["error", "double"], // Enforce double quotes
    indent: ["error", 2], // 2-space indentation
    "no-var": "error", // Enforce let/const over var
    "prefer-const": "error", // Prefer const if variable is never reassigned
  },
};
