'use client';

import React, { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import isPropValid from '@emotion/is-prop-valid';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

/**
 * styled-components v6 forwards every prop to whatever it renders. Several Oak
 * components spread their own props straight through to the DOM node -- OakLink,
 * for instance, reads `variant` for its colour config but still passes it down to
 * the underlying anchor -- which makes React log "unknown prop" warnings.
 *
 * Filter props only when the target is a real DOM element; custom React
 * components must keep receiving everything, or `variant` would never reach
 * OakLink and its secondary styling would silently revert to primary.
 */
const shouldForwardProp = (
  propName: string,
  elementToBeCreated: string | React.ComponentType<unknown>,
): boolean =>
  typeof elementToBeCreated === 'string' ? isPropValid(propName) : true;

export default function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  // Only create stylesheet once with lazy initial state
  // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  // The sheet is server-only, but shouldForwardProp has to apply on both sides
  // or the prop filtering would be missing in the browser, where React warns.
  if (typeof window !== 'undefined') {
    return (
      <StyleSheetManager shouldForwardProp={shouldForwardProp}>
        {children}
      </StyleSheetManager>
    );
  }

  return (
    <StyleSheetManager
      sheet={styledComponentsStyleSheet.instance}
      shouldForwardProp={shouldForwardProp}
    >
      {children}
    </StyleSheetManager>
  );
}
