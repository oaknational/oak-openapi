'use client';
import { OakBox, OakFlex, OakHeading, OakP } from '@oaknational/oak-components';
import styled from 'styled-components';
import { Table } from '../Table';
import { Roboto_Mono } from 'next/font/google';
import { capitalize } from 'lodash';
import { DocumentationContentPageBlock } from '@/cms/schemaTypes';
import { Code } from '../Code';

const robotoMono = Roboto_Mono({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  display: 'swap',
  weight: ['400'],
});

export type InputOutputTableRow = {
  name: string;
  type: string;
  description?: string;
  example?: string;
  required?: boolean;
};

export type InputOutputTable = InputOutputTableRow[];

export type EndpointInfo = {
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
};

export type EndpointDocsProps = {
  title: string;
  slug: string;
  endpoints: EndpointInfo[];
  docs: DocumentationContentPageBlock[];
};

// RS note - I've reduced this heading down to allow for long URLs to fit better
// but it needs Helen's sign off (TODO - remove this comment when done)
const EndpointHeading = styled(OakHeading)`
  color: var(--Tokens-Text-text-primary, #222);
  font-family: 'Roboto Mono';
  font-size: 16px;
  font-style: normal;
  font-weight: 800;
  line-height: 40px; /* 125% */
  word-break: break-all;
`;
const generateTableRows = (data: InputOutputTable) => {
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

export default function EndpointBlock(props: { endpoint: EndpointInfo }) {
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
    <OakFlex $gap="all-spacing-3" $flexDirection="column" $mb="space-between-l">
      <OakHeading tag="h2" $font="heading-4" id={slug}>
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
      <OakHeading tag="h3" $font="heading-5">
        Inputs {paramTypes.length ? `(${paramTypes.join(', ')})` : ''}
      </OakHeading>
      <OakBox>
        {params && params.length > 1 ? (
          <Table value={generateTableRows(params)} />
        ) : (
          'N/ A'
        )}
      </OakBox>
      <OakHeading tag="h3" $font="heading-5">
        Output (response)
        {output && output[0] ? (
          <Table value={generateTableRows(output)} />
        ) : (
          <OakP>N/ A</OakP>
        )}
      </OakHeading>
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
