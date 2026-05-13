'use client';

import { ApiReferenceReact } from '@scalar/api-reference-react';
// @ts-expect-error CSS import
import '@scalar/api-reference-react/style.css';

export default function Playground(): React.ReactElement {
  return (
    <ApiReferenceReact
      configuration={{
        url: '/api/v0/swagger.json',
        showDeveloperTools: 'never',
        telemetry: false,

        // disables MCP button/generation
        mcp: {
          disabled: true,
        },

        agent: {
          disabled: true,
        },

        hideClientButton: true,
        defaultOpenAllTags: true,
        hideModels: true,
      }}
    />
  );
}
