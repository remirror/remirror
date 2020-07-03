# Root Config Files

All files in this folder will be symlinked to the root of the repository in the npm `preinstall`
hook. This is to remove clutter when browsing the code on GitHub or other online tools.

This readme file is ignored though.

Personally I find it intimidating when I browse through a new project and blinding by the number of
files in the root directory. I think this is an elegant solution way of avoiding that problem while
retaining the functionality that a lot of these config files include.
