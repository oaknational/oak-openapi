'use client';
import {
  OakBox,
  OakFlex,
  OakGrid,
  OakGridArea as _OakGridArea,
  OakHeading,
  OakLI,
  OakLink,
  OakP,
} from '@oaknational/oak-components';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import styled from 'styled-components';
import { Table } from '../Table';
import { Roboto_Mono } from 'next/font/google';

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

type EndpointDocsProps = {
  title: string;
  slug: string;
  endpoints: EndpointInfo[];
};

const OakGridArea = styled(_OakGridArea)`
  ${({ $gridArea }) => 'grid-area: ' + $gridArea};
`;

const EndpointHeading = styled(OakHeading)`
  color: var(--Tokens-Text-text-primary, #222);
    font-family: "Roboto Mono";
    font-size: 32px;
    font-style: normal;
    font-weight: 400;
    line-height: 40px; /* 125% */
`;
export default function EndpointDocsContent({
  endpoints,
  title,
}: EndpointDocsProps) {
  const contents = endpoints.map(({ title, slug }) => ({
    title,
    anchor: slug,
  }));

  if (!endpoints || endpoints.length === 0) {
    return (
      <OakBox $color="black" $pv="inner-padding-xl3">
        <OakHeading tag="h1" $font="heading-3">
          No documentation available
        </OakHeading>
      </OakBox>
    );
  }

  const templateMobile =
    contents.length > 0 ? `"HEADER" "SIDENAV" "CONTENT"` : `"HEADER" "CONTENT"`;
  const templateDesktop =
    contents.length > 0
      ? `"HEADER SIDENAV" "CONTENT SIDENAV"`
      : `"HEADER" "CONTENT"`;

  return (
    <OakBox
      $color="black"
      $bl={['', 'border-solid-s']}
      $borderColor={['grey40', 'grey40']}
    >
      <OakGrid
        $gridTemplateColumns={[`1fr`, '1fr', `1fr 200px`]}
        $gridTemplateAreas={[templateMobile, templateMobile, templateDesktop]}
        $cg={['', 'space-between-s']}
        $rg="space-between-l"
        $pa={['all-spacing-4', 'all-spacing-8']}
        $pr={['', 'all-spacing-0']}
      >
        <OakGridArea $gridArea="HEADER">
          <OakHeading tag="p" $font="heading-light-6">
            API endpoints
          </OakHeading>
          <OakHeading ariaHidden tag="h1" $font="heading-3">
            {title}
          </OakHeading>
        </OakGridArea>
        <OakGridArea $gridArea="CONTENT">
          {endpoints.map((endpoint) => (
            <EndpointBlock endpoint={endpoint} key={endpoint.path} />
          ))}
        </OakGridArea>
        <OakGridArea
          $gridArea="SIDENAV"
          $display={contents.length > 0 ? 'block' : 'none'}
        >
          <OakFlex $flexDirection="column" $gap="all-spacing-3">
            <OakHeading tag="h2" $font="heading-7">
              <OakBox $width="200px">Contents</OakBox>
            </OakHeading>
            <OakFlex
              as="ul"
              $pa="0"
              $gap="all-spacing-3"
              $ma="0"
              $flexDirection="column"
            >
              {contents.map((content, i) => (
                <OakLI key={`${content.anchor}-${i}`}>
                  <OakLink href={`#${content.anchor}`}>{content.title}</OakLink>
                </OakLI>
              ))}
            </OakFlex>
          </OakFlex>
        </OakGridArea>
      </OakGrid>
    </OakBox>
  );
}
const generateTableRows = (data: InputOutputTable) => {
  const headerRow = {
    cells: ['Name', 'Type', 'Description', 'Example'],
    // _key: `th${data[0].name}`,
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

function EndpointBlock(props: { endpoint: EndpointInfo }) {
  const {
    title,
    description,
    params,
    output,
    sampleResponse,
    path,
    requestType,
    paramTypes,
  } = props.endpoint;
  return (
    <OakFlex
      $pa="0"
      $gap="all-spacing-3"
      $ma="0"
      $flexDirection="column"
      $mb="space-between-l"
    >
      <OakHeading tag="h4" $font="heading-4">
        {title}
      </OakHeading>
      <EndpointHeading
        className={robotoMono.className}
        tag="h5"
        $font="heading-5"
      >
        {requestType.toUpperCase()} {path}
      </EndpointHeading>
      {description && <OakP>{description}</OakP>}
      <OakHeading tag="h5" $font="heading-5">
        Inputs {paramTypes.length ? `(${paramTypes.join(', ')})` : ''}
      </OakHeading>
      <OakBox>
        {params && params.length > 1 ? (
          <Table value={generateTableRows(params)} />
        ) : (
          'N/ A'
        )}
      </OakBox>
      <OakHeading tag="h5" $font="heading-5">
        Output (response)
        {output && output[0] ? (
          <Table value={generateTableRows(output)} />
        ) : (
          <OakBox>N/ A</OakBox>
        )}
      </OakHeading>
      {sampleResponse && (
        <OakBox>
          <OakHeading tag="h5" $font="heading-5">
            Sample response
          </OakHeading>
          <SyntaxHighlighter
            lineProps={{
              style: { wordBreak: 'break-word', whiteSpace: 'pre-wrap' },
            }}
            wrapLines={true}
            language="JSON"
          >
            {sampleResponse}
          </SyntaxHighlighter>
        </OakBox>
      )}
    </OakFlex>
  );
}
