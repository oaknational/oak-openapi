import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import React from 'react';

interface Code {
  code: string | string[];
  language?: string;
}

export const Code = ({ value }: { value: Code }): React.ReactElement => {
  return (
    <SyntaxHighlighter
      lineProps={{
        style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' },
      }}
      wrapLines={true}
      language={value.language || 'plaintext'}
    >
      {value.code}
    </SyntaxHighlighter>
  );
};
