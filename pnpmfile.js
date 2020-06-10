module.exports = {
  hooks: {
    readPackage,
  },
};

function readPackage(pkg) {
  if (pkg.dependencies && pkg.dependencies.graphql) {
    pkg.dependencies.graphql = '^14.6.0';
  }

  return pkg;
}
