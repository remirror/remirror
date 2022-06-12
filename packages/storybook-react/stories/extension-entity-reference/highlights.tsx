import 'remirror/styles/all.css';
import './styles.css';

import { cx, uniqueId } from 'remirror';
import {
  EntityReferenceExtension,
  EntityReferenceMetaData,
  findMinMaxRange,
} from 'remirror/extensions';
import { Decoration } from '@remirror/pm/view';
import { Remirror, ThemeProvider, useCommands, useHelpers, useRemirror } from '@remirror/react';

type HighlightTypes = 'important' | 'interesting';
const ALL_HIGHLIGHT_TYPES: HighlightTypes[] = ['important', 'interesting'];

const allHighlights = new Map<string, HighlightTypes>();

export const decorateHighlights = (highlights: EntityReferenceMetaData[][]): Decoration[] => {
  const decorations = highlights.map((overlappingHighlights) => {
    const types = new Set(overlappingHighlights.map((h) => allHighlights.get(h.id)));
    // Mix colors to allow for overlapping highlights
    const notRed = types.has('important') ? 64 : 0;
    const notBlue = types.has('interesting') ? 64 : 0;
    const red = 255 - notBlue;
    const green = 255 - notBlue - notRed;
    const blue = 255 - notRed;
    const style = `background: rgb(${red}, ${green}, ${blue});padding: 6px 0;`;
    const [from, to] = findMinMaxRange(overlappingHighlights);

    // Add decoration to all inline nodes in the given range.
    return Decoration.inline(from, to, { style });
  });

  return [...decorations];
};

const extensions = () => [
  new EntityReferenceExtension({
    getStyle: decorateHighlights,
  }),
];

const Buttons = () => {
  const { getEntityReferencesAt } = useHelpers<EntityReferenceExtension>(true);
  const commands = useCommands<EntityReferenceExtension>();
  const highlightsAt = getEntityReferencesAt();
  return (
    <>
      {ALL_HIGHLIGHT_TYPES.map((type) => {
        const highlightsOfType = highlightsAt.filter((h) => {
          const highlightType = allHighlights.get(h.id);
          return highlightType === type;
        });
        // Provide visual feedback if there is a highlight of this type at the user's cursor
        const active = highlightsOfType.length > 0;
        const onClick = () => {
          if (!active) {
            // Add highlight
            const id = uniqueId();
            commands.addEntityReference(id);
            allHighlights.set(id, type);
          } else {
            // Remove highlight
            highlightsOfType.forEach((highlight) => {
              commands.removeEntityReference(highlight.id);
            });
          }
        };
        return (
          <button
            key={type}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClick}
            className={cx(active && 'active')}
          >
            {type}
          </button>
        );
      })}
    </>
  );
};

const Highlights = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Highlight important and interesting text</p>',
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror
        manager={manager}
        autoFocus
        onChange={onChange}
        initialContent={state}
        autoRender='end'
      >
        <Buttons />
      </Remirror>
    </ThemeProvider>
  );
};

export default Highlights;
