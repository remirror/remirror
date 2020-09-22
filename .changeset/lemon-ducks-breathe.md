---
'@remirror/extension-annotation': minor
'@remirror/storybook': minor
---

Visualize the amount of overlapping annotations

The annotation-extension would allow to style individual annotations via a CSS class. This led to issues with overlapping annotations. For example, if an annotation with a red background and another with a green background were overlapping, the editor would show (more or less) randomly one of the two colors. Now, the annotation-extension allows users to style decorations based on all overlapping annotations within a given decoration. The default implementation visualizes overlapping annotations by showing a darker shade the more annotations are overlapping.
