module.exports = {
  hooks: {
    readPackage,
  },
};

function readPackage(pkg, context) {
  if (pkg.dependencies && pkg.dependencies.graphql) {
    pkg.dependencies.graphql = '^14';
  }

  // if (pkg.dependencies && pkg.dependencies.graphql) {
  //   pkg.dependencies.graphql = '^14';
  // }

  return pkg;
}
