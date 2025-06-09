'use client';
import {
  OakBox,
  OakFlex,
  OakGrid,
  OakGridArea,
  OakHeading,
  OakImage,
  OakLink,
  OakMaxWidth,
  OakP,
  OakPrimaryButton,
  OakSecondaryButton,
  OakTagFunctional,
} from '@oaknational/oak-components';

import styled from 'styled-components';

export default function Hero() {
  return (
    <OakBox $background="mint" $color="text-primary">
      <OakMaxWidth
        $ph={'inner-padding-m'}
        $flexDirection={'row'}
        $pv="inner-padding-xl6"
        // FIXME: styles are being overwritten somewhere so having
        // to declare this.
        $mh={'auto'}
        $maxWidth={['all-spacing-21', 'all-spacing-24']}
      >
        <OakGrid $cg="space-between-m" $rg="space-between-m">
          <OakGridArea $colSpan={[12, 7]} $flexDirection={'column'}>
            <OakTagFunctional
              label="Beta"
              $width="fit-content"
              $background="mint110"
              $borderRadius="border-radius-xl"
              $pv="inner-padding-xs"
              $ph="inner-padding-s"
              $font={'body-3-bold'}
            />

            <OakHeading $mv={'space-between-m'} $font="heading-3" tag="h2">
              Access high-quality education content with Oak OpenAPI
            </OakHeading>

            <OakP $mb={'space-between-l'} $color="black" $font="body-2">
              We’re offering a free API to share our high-quality educational
              content with the broader education community, all under the{' '}
              <OakLink
                href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
                target="_blank"
              >
                Open Government Licence
              </OakLink>
              .
            </OakP>
            <OakFlex $gap={'all-spacing-4'}>
              <AlignFixButton
                element="a"
                href="https://share.hsforms.com/1gQQFsrHDRf-eZUDajj6NzQbvumd"
              >
                Request an API key
              </AlignFixButton>

              <OakPrimaryButton
                element="a"
                href="/playground"
                isTrailingIcon={true}
              >
                Visit OpenAPI playground
              </OakPrimaryButton>
            </OakFlex>
          </OakGridArea>
          <OakGridArea $display={['none', 'block']} $colSpan={[12, 5]}>
            <OakFlex>
              <OakImage
                sizes="width: 2228px, height: 1472px"
                priority={true}
                src={{
                  src: '/images/workers.png',
                  width: 2228,
                  height: 1472,
                }}
                alt=""
                $height="all-spacing-20"
              />
            </OakFlex>
          </OakGridArea>
        </OakGrid>
      </OakMaxWidth>
    </OakBox>
  );
}

const AlignFixButton = styled(OakSecondaryButton)`
  a {
    display: inline-flex;

    align-items: center;
    font-size: 2rem;
  }
`;
