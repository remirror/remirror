# Dependencies

Yarn workspaces automatically hoists up shared dependencies. All dependencies installed within these sub folders are hence available at the top level.

This pattern means that only yarn (and package managers supporting hoisting) can be used for this repository. It also provides the ability to categorise the different dependencies of our project.
