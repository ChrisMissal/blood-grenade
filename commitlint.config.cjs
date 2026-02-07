module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow more flexible subject casing
    'subject-case': [0], // Disabled - allow any case
  }
};
