/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'This dependency is part of a circular relationship. You might want to revise ' +
        'your solution (i.e. use dependency inversion, make sure the modules have a single responsibility) ',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'no-orphans',
      comment:
        "This is an orphan module - it's likely not used (anymore?). Either use it or " +
        "remove it. If it's logical this module is an orphan (i.e. it's a config file), " +
        "add an exception for it in your dependency-cruiser configuration. By default " +
        "this rule does not scrutinize dot-files (e.g. .eslintrc.js), TypeScript declaration " +
        "files (.d.ts), tsconfig.json and some of the babel and webpack configs.",
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: [
          '(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$', // dot files
          '\\.d\\.ts$', // TypeScript declaration files
          '(^|/)tsconfig\\.json$', // tsconfig
          '(^|/)(babel|webpack)\\.config\\.(js|cjs|mjs|ts|json)$', // babel/webpack configs
          '^apps/[^/]+/build\\.js$', // app build scripts
          '^apps/[^/]+/test\\.js$', // app test scripts
          '^apps/[^/]+/src/index\\.(js|ts)$', // app entry points
          '^commitlint\\.config\\.cjs$', // commitlint config
          '^scripts/', // utility scripts
          '^infra/', // infrastructure files
        ],
      },
      to: {},
    },
    {
      name: 'no-deprecated-core',
      comment:
        'A module depends on a node core module that has been deprecated. Find an alternative - these are ' +
        "bound to exist - node doesn't deprecate lightly.",
      severity: 'warn',
      from: {},
      to: {
        dependencyTypes: ['core'],
        path: [
          '^(v8/tools/codemap)$',
          '^(v8/tools/consarray)$',
          '^(v8/tools/csvparser)$',
          '^(v8/tools/logreader)$',
          '^(v8/tools/profile_view)$',
          '^(v8/tools/profile)$',
          '^(v8/tools/SourceMap)$',
          '^(v8/tools/splaytree)$',
          '^(v8/tools/tickprocessor-driver)$',
          '^(v8/tools/tickprocessor)$',
          '^(node-inspect/lib/_inspect)$',
          '^(node-inspect/lib/internal/inspect_client)$',
          '^(node-inspect/lib/internal/inspect_repl)$',
          '^(async_hooks)$',
          '^(punycode)$',
          '^(domain)$',
          '^(constants)$',
          '^(sys)$',
          '^(_linklist)$',
          '^(_stream_wrap)$',
        ],
      },
    },
    {
      name: 'not-to-deprecated',
      comment:
        'This module uses a (version of an) npm module that has been deprecated. Either upgrade to a later ' +
        'version of that module, or find an alternative. Deprecated modules are a security risk.',
      severity: 'warn',
      from: {},
      to: {
        dependencyTypes: ['deprecated'],
      },
    },
    {
      name: 'no-non-package-json',
      severity: 'error',
      comment:
        "This module depends on an npm package that isn't in the 'dependencies' section of your package.json. " +
        "That's problematic as the package either (1) won't be available on live (2 - worse) will be " +
        'available on live with an non-guaranteed version. Fix it by adding the package to the dependencies ' +
        'in your package.json.',
      from: {},
      to: {
        dependencyTypes: ['npm-no-pkg', 'npm-unknown'],
      },
    },
    {
      name: 'not-to-unresolvable',
      comment:
        "This module depends on a module that cannot be found ('resolved to disk'). If it's an npm " +
        'module: add it to your package.json. In all other cases you likely already know what to do.',
      severity: 'error',
      from: {},
      to: {
        couldNotResolve: true,
      },
    },
    {
      name: 'no-duplicate-dep-types',
      comment:
        "Likely this module depends on an external ('npm') package that occurs more than once " +
        'in your package.json i.e. both as a devDependencies and in dependencies. This will cause ' +
        'maintenance problems later on.',
      severity: 'warn',
      from: {},
      to: {
        moreThanOneDependencyType: true,
        // as it's pretty common to have a type import be a type only import
        // _and_ (e.g.) a devDependency - don't consider type-only dependency
        // types for this rule
        dependencyTypesNot: ['type-only'],
      },
    },

    /* rules specific to this monorepo */
    {
      name: 'no-cross-app-dependencies',
      severity: 'error',
      comment:
        'Apps should be independent and not depend on each other. ' +
        'If you need shared code, create a package in the packages/ directory.',
      from: {
        path: '^apps/([^/]+)/',
      },
      to: {
        path: '^apps/([^/]+)/',
        pathNot: '^apps/$1/', // allow dependencies within the same app
      },
    },
    {
      name: 'apps-only-from-src',
      severity: 'error',
      comment:
        'App source code should be in the src/ directory. ' +
        'Build scripts, tests, and configs can be at the app root.',
      from: {
        path: '^apps/[^/]+/(?!src/|build\\.js|test\\.js|Dockerfile|package\\.json)',
      },
      to: {},
    },
    {
      name: 'no-packages-to-apps',
      severity: 'error',
      comment:
        'Packages (shared code) should not depend on apps. ' +
        'Packages should be reusable and app-agnostic.',
      from: {
        path: '^packages/',
      },
      to: {
        path: '^apps/',
      },
    },
    {
      name: 'no-test-imports-in-production',
      severity: 'error',
      comment:
        'Production code should not import from test files. ' +
        'Keep test utilities separate from production code.',
      from: {
        pathNot: '\\.(test|spec)\\.(js|ts|jsx|tsx)$',
      },
      to: {
        path: '\\.(test|spec)\\.(js|ts|jsx|tsx)$',
      },
    },
  ],
  options: {
    /* conditions to resolve imports with */
    combinedDependencies: false,
    doNotFollow: {
      path: 'node_modules',
      dependencyTypes: [
        'npm',
        'npm-dev',
        'npm-optional',
        'npm-peer',
        'npm-bundled',
        'npm-no-pkg',
      ],
    },
    includeOnly: [
      '^apps/',
      '^packages/',
    ],
    tsPreCompilationDeps: false,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
      },
      archi: {
        collapsePattern: '^(node_modules|packages|apps)/[^/]+',
      },
      text: {
        highlightFocused: true,
      },
    },
  },
};
