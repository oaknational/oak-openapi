'use client';
import { OakBox, OakFlex, OakHeading, OakP } from '@oaknational/oak-components';
import styled from 'styled-components';
import React from 'react';
import { Table, type TableInterface } from '../Table';
import { Roboto_Mono } from 'next/font/google';
import { capitalize } from 'lodash';
import type { DocumentationContentPageBlock } from '@/cms/schemaTypes';
import { Code } from '../Code';

const robotoMono = Roboto_Mono({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  display: 'swap',
  weight: ['400'],
});

export interface InputOutputTableRow {
  name: string;
  type: string;
  description?: string;
  example?: string;
  required?: boolean;
}

export type InputOutputTable = InputOutputTableRow[];

export interface EndpointInfo {
  order: number;
  title: string;
  requestType: string;
  description?: string;
  path: string;
  params?: InputOutputTable;
  paramTypes: string[] | [];
  output: InputOutputTable;
  sampleResponse?: string;
  slug: string;
}

export interface EndpointDocsProps {
  title: string;
  slug: string;
  endpoints: EndpointInfo[];
  docs: DocumentationContentPageBlock[];
}

// RS note - I've reduced this heading down to allow for long URLs to fit better
// but it needs Helen's sign off (TODO - remove this comment when done)
const EndpointHeading = styled(OakHeading)`
  color: var(--Tokens-Text-text-primary, #222);
  font-family: 'Roboto Mono';
  font-size: 1rem;
  font-style: normal;
  font-weight: 800;
  line-height: 1rem;
  word-break: break-all;
`;

const generateTableRows = (data: InputOutputTable): TableInterface => {
  const header = data[0]
    ? Object.keys(data[0]).map((key) => capitalize(key))
    : [];
  const headerRow = {
    cells: header,
    _key: 'th',
  };
  const rows = data.map((row, i) => {
    return {
      cells: [...Object.values(row).map((property) => `${property}`)],
      _key: `tr${i}${data.length}`,
    };
  });
  return { rows: [headerRow, ...rows] };
};

const TableSection = ({
  title,
  tableData,
}: {
  title: string;
  tableData: InputOutputTable | undefined;
}): React.ReactElement => {
  return (
    <OakBox>
      <OakHeading tag="h3" $font="heading-5">
        {title}
      </OakHeading>
      <OakBox>
        {tableData && tableData.length > 0 ? (
          <Table value={generateTableRows(tableData)} />
        ) : (
          'N/A'
        )}
      </OakBox>
    </OakBox>
  );
};

export default function EndpointBlock(props: {
  endpoint: EndpointInfo;
}): React.ReactElement {
  const {
    title,
    description,
    params,
    output,
    sampleResponse,
    path,
    requestType,
    paramTypes,
    slug,
  } = props.endpoint;
  return (
    <OakFlex $gap="spacing-32" $flexDirection="column">
      <OakHeading tag="h2" $font="heading-4" $mt="spacing-72" id={slug}>
        {title}
      </OakHeading>
      <EndpointHeading
        className={robotoMono.className}
        tag="h2"
        $font="heading-5"
      >
        {requestType.toUpperCase()} {path}
      </EndpointHeading>
      {description && <OakP>{description}</OakP>}
      <TableSection
        title={`Inputs ${paramTypes.length ? `(${paramTypes.join(', ')})` : ''}`}
        tableData={params}
      />
      <TableSection title="Output (response)" tableData={output} />
      {sampleResponse && (
        <OakBox>
          <OakHeading tag="h3" $font="heading-5">
            Sample response
          </OakHeading>
          <Code value={{ code: sampleResponse, language: 'json' }} />
        </OakBox>
      )}
    </OakFlex>
  );
}
