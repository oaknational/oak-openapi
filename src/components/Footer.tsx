import {
  OakBox,
  OakFlex,
  OakHeading,
  OakIcon,
  OakJauntyAngleLabel as _OakJauntyAngleLabel,
  OakLI,
  OakLink,
  OakMaxWidth,
  OakP,
  OakTextInput as _OakTextInput,
  OakPrimaryButton,
  OakHandDrawnHR,
  OakFieldError,
} from '@oaknational/oak-components';
import styled from 'styled-components';
import { footerSections } from '~/lib/footerSections';
import SocialButtons, { OAK_SOCIALS } from './SocialButtons';
import Logo from './Logo';
import { StrongLinkNoUnderline } from './StrongSecondaryLink';
import IconFeedback from './IconFeedback';
import { useState } from 'react';

export type HubspotPayload = {
  fields: {
    name: string;
    value: string | undefined;
  }[];
  context: {
    pageUri: string;
    pageName: string;
    hutk?: string | undefined;
  };
};

const TopOakHandDrawnHR = styled(OakHandDrawnHR)`
  position: relative;
  z-index: 10;
  height: 0.25rem;
`;

const FlexedBox = styled(OakBox)`
  flex: 1;
`;

// const LoopSvg = styled(Svg)`
//   position: absolute;
//   top: 0;
//   right: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   color: rgb(190, 242, 189);
//   transform: translate(25%, 15%) rotate(-10deg);
// `;

const OakLinkLogo = styled(OakLink)`
  margin: 0;
  padding: 0;

  span {
    color: black;
    display: flex;
  }
`;

const FooterOakLink = styled(OakLink)`
  color: inherit;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
    color: inherit;
  }

  &:visited {
    color: inherit;
    text-decoration: underline;
  }
`;

export default function Footer() {
  return (
    <footer>
      <TopOakHandDrawnHR $height="all-spacing-1" />
      <OakBox $background="mint30">
        <OakMaxWidth
          $flexDirection={['column', 'row']}
          $pv="inner-padding-xl5"
          $ph="inner-padding-m"
          $gap={['space-between-xl', 'space-between-m', 'space-between-xxxl']}
        >
          <ContactUs />
          <GiveFeedback />
          <GetUpdates />
        </OakMaxWidth>
      </OakBox>
      <OakBox
        $overflow={'hidden'}
        $background="white"
        $color="text-primary"
        $position={'relative'}
      >
        <OakMaxWidth
          as="nav"
          $justifyContent={'center'}
          $flexDirection={['column', 'column', 'row-reverse']}
          $gap="space-between-l"
          $pv={['space-between-xl', 'space-between-l', 'inner-padding-xl8']}
          $ph="space-between-s"
          $ma={'auto'}
          $position={'relative'}
          $width={'100%'}
        >
          <OakFlex
            $flexDirection={['column', 'row']}
            $gap={['space-between-l', 'space-between-s']}
          >
            <OakBox style={{ flex: '1' }} $minWidth="240px">
              <FooterSectionLinks
                {...(footerSections.pupils as FooterSectionLinksProps)}
              />
            </OakBox>
            <OakBox style={{ flex: '1' }} $minWidth="240px">
              <FooterSectionLinks
                {...(footerSections.oak as FooterSectionLinksProps)}
              />
            </OakBox>
            <OakBox style={{ flex: '1' }} $minWidth="240px">
              <FooterSectionLinks
                {...(footerSections.legal as FooterSectionLinksProps)}
              />
            </OakBox>
          </OakFlex>
          <OakFlex
            $mb="space-between-xl"
            $width={'100%'}
            $flexDirection={['column', 'row']}
            $pt={['inner-padding-s', 'inner-padding-none']}
          >
            <OakFlex $flexDirection="column" $gap="space-between-l">
              <OakLinkLogo href="https://www.thenational.academy/">
                <Logo name="logo-with-text" width="165" height="75" />
              </OakLinkLogo>

              <OakFlex $flexDirection={'column'} $gap="space-between-m">
                <SocialButtons
                  $display={['flex']}
                  for="Oak National Academy"
                  {...OAK_SOCIALS}
                />

                <OakBox>
                  <OakP $font={'body-3-bold'} $mb="space-between-s">
                    © Oak National Academy Limited, No 14174888
                  </OakP>
                  <OakP $font={['body-4']}>
                    1 Scott Place, 2 Hardman Street, Manchester, M3 3AA
                  </OakP>
                </OakBox>
              </OakFlex>
            </OakFlex>
          </OakFlex>
        </OakMaxWidth>
      </OakBox>
    </footer>
  );
}

type FooterLink = {
  text: string;
  href?: string;
  type?: 'page';
  icon?: 'external';
  ariaLabel?: string;
};

type FooterSectionLinksProps = {
  title: string;
  links: FooterLink[];
};

const FooterSectionLinks = ({ title, links }: FooterSectionLinksProps) => {
  // $mt={['space-between-m2', 'space-between-none']}
  // $mb="space-between-ssx"
  return (
    <OakFlex $flexDirection="column" $gap="space-between-m">
      <OakHeading $font="heading-7" $color="black" tag="h2">
        {title}
      </OakHeading>

      <OakFlex
        $color={'black'}
        $font={'body-2'}
        as="ul"
        role="list"
        $flexDirection="column"
        $gap="space-between-m"
      >
        {links.map((link) => (
          <OakLI key={link.text}>
            <FooterLink {...link} />
          </OakLI>
        ))}
      </OakFlex>
    </OakFlex>
  );
};

const FooterLink = ({ text, href, ariaLabel, icon }: FooterLink) => {
  return (
    <OakFlex
      $gap={'all-spacing-2'}
      $display={'inline-flex'}
      $alignItems="center"
    >
      <FooterOakLink
        target={icon ? '_blank' : null}
        href={href}
        {...{ 'aria-label': ariaLabel ?? undefined }}
      >
        {text}
      </FooterOakLink>
      {icon && <OakIcon $height="all-spacing-6" iconName={icon} />}
    </OakFlex>
  );
};

function ContactUs() {
  return (
    <FlexedBox $color="black">
      <OakFlex as="h2" $font="heading-5" $gap="all-spacing-2">
        <OakIcon iconName="send" />
        Contact Us
      </OakFlex>
      <OakP $mt="space-between-ssx">
        If you need help with using the API, get in touch.
      </OakP>
      <OakBox $mt="space-between-m">
        <StrongLinkNoUnderline
          iconName="arrow-right"
          href="/"
          isTrailingIcon={true}
        >
          Send us an email
        </StrongLinkNoUnderline>
      </OakBox>
    </FlexedBox>
  );
}

function GiveFeedback() {
  return (
    <FlexedBox $color="black">
      <OakFlex as="h2" $font="heading-5" $gap="all-spacing-2">
        <IconFeedback />
        Give Feedback
      </OakFlex>
      <OakP $mt="space-between-ssx">
        Our API is new, we&apos;d love to hear your feedback to help us improve.
      </OakP>
      <OakBox $mt="space-between-m">
        <StrongLinkNoUnderline iconName="arrow-right" href="/" isTrailingIcon>
          Give feedback
        </StrongLinkNoUnderline>
      </OakBox>
    </FlexedBox>
  );
}

const OakJauntyAngleLabel = styled(_OakJauntyAngleLabel)`
  width: fit-content;
  background: #ffe555;
  border-radius: 0;
  z-index: 10;
  cursor: pointer;
  position: absolute;
  padding: 4px 8px;
  transform: rotate(-1.5deg) translateY(-15px) translateX(8px);

  strong {
    font-weight: 600;
  }

  &:has(+ div input:not(:placeholder-shown):invalid) {
    background: #dd0035;
    color: white;
  }
`;

const OakTextInput = styled(_OakTextInput)`
  padding: 16px 0;
  height: fit-content;
`;

function GetUpdates() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const formId = 'ecd7b5fb-fceb-4342-8d60-a1938e3b5894';
  const portalId = '19961797';
  const hubspotUrl =
    'https://hubspot-forms.thenational.academy/submissions/v3/integration/submit';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent default form submission
    e.preventDefault();

    // Check if the form is valid
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      console.log('>>>>');
      setMessage('Enter a valid email to continue');
      // form.reportValidity();
      return;
    }

    // Handle successful submission logic here
    const url = `${hubspotUrl}/${portalId}/${formId}`;

    let res: Response;

    try {
      const body: HubspotPayload = {
        fields: [
          {
            name: 'email',
            value: email,
          },
        ],
        context: {
          pageUri: window.location.href,
          pageName: document.title,
        },
      };

      res = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',

        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      console.log({ res });
    } catch (error) {
      console.error('Error submitting form:', error);
      return;
    }

    const { inlineMessage } = await res.json();
    if (inlineMessage) {
      // If the submission was successful, show a success message
      setMessage(inlineMessage);
      setEmail(''); // Clear the email input
      return;
    }

    setMessage('');
    setSuccess(true);
  };

  return (
    <FlexedBox
      as="form"
      $action="/"
      $color="black"
      noValidate
      onSubmit={handleSubmit}
    >
      <OakBox $ma="0" $pa="0" as="fieldset" $ba="border-solid-none">
        <OakFlex as="h2" $font="heading-5" $gap="all-spacing-2">
          <OakIcon iconName="bell" />
          Receive updates
        </OakFlex>
        <OakP $mt="space-between-ssx" $mb="all-spacing-7">
          Sign up to our mailing list to receive important updates about the
          API.
        </OakP>
        <OakBox $mt="space-between-m">
          {success && (
            <OakFlex $flexDirection="row" $gap="space-between-xs">
              <OakIcon iconName="success" />{' '}
              <strong>Thank you, your request has been received.</strong>
            </OakFlex>
          )}
          {message && (
            <OakBox $mb="space-between-m">
              <OakFieldError>{message}</OakFieldError>
            </OakBox>
          )}
          {!success && (
            <>
              <OakJauntyAngleLabel
                $background="lemon"
                htmlFor="email"
                as="label"
              >
                <strong>Email address</strong>{' '}
                <span style={{ fontWeight: 400 }}>(required)</span>
              </OakJauntyAngleLabel>
              <OakTextInput
                autoComplete="email"
                id="email"
                type="email"
                $pa="inner-padding-m"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </>
          )}
        </OakBox>
        {!success && (
          <OakBox $mt="space-between-m">
            <OakPrimaryButton>Sign up for updates</OakPrimaryButton>
          </OakBox>
        )}
      </OakBox>
    </FlexedBox>
  );
}
