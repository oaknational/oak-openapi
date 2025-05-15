import { OakFlex, OakHeading, OakLink } from '@oaknational/oak-components';
import styled from 'styled-components';
import Logo from '~/components/Logo';
import Footer from '~/components/Footer';
import Head from 'next/head';
import { OakAPINavigationLink } from '~/components/OakAPINavigationLink';

const OakLinkLogo = styled(OakLink)`
  margin: 0;
  padding: 0;

  span {
    color: black;
    display: flex;
  }
`;

export default function Page() {
  return (
    <>
      <Head>
        <title>Oak Curriculum API - Oak National Academy</title>
      </Head>
      <Banner />
      <Footer />
    </>
  );
}

function Banner() {
  return (
    <OakFlex
      as="header"
      $alignItems={'center'}
      $gap={'all-spacing-10'}
      $pv="inner-padding-s"
      $ph="inner-padding-m"
      $bb={'border-solid-m'}
      $color="text-primary"
      $justifyContent="space-around"
    >
      <OakFlex role="list" $gap="space-between-l" $alignItems="center">
        <OakFlex $alignItems="center" $gap="space-between-s">
          <OakLinkLogo
            aria-label="Oak National Academy"
            href="https://www.thenational.academy/"
          >
            <Logo width="31" height="42" />
          </OakLinkLogo>
          <OakHeading ariaHidden tag="h1" $font="heading-6">
            Oak Curriculum API
          </OakHeading>
        </OakFlex>
        <OakAPINavigationLink role="listitem" href="#" className="selected">
          Home
        </OakAPINavigationLink>
        <OakAPINavigationLink role="listitem" href="/docs">
          Documentation
        </OakAPINavigationLink>
      </OakFlex>
      <OakFlex role="list" $gap="space-between-m">
        <OakAPINavigationLink
          role="listitem"
          href="mailto:xxx@yyy.com"
          isTrailingIcon
          iconName="send"
        >
          Request an API key
        </OakAPINavigationLink>

        <OakAPINavigationLink
          role="listitem"
          href="/playground"
          isTrailingIcon
          iconName="external"
          target="_blank"
        >
          API playground
        </OakAPINavigationLink>

        <OakAPINavigationLink
          role="listitem"
          href="/bulk-downloads"
          isTrailingIcon
          iconName="external"
          target="_blank"
        >
          Bulk downloads
        </OakAPINavigationLink>
      </OakFlex>
    </OakFlex>
  );
}
