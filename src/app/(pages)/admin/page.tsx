"use client";
import {
  OakBox,
  OakFlex,
  OakGrid,
  OakGridArea,
  OakHeading,
  OakLabel,
  OakTextInput,
  OakPrimaryButton,
  OakP,
  OakSecondaryButton,
  OakFieldError,
} from '@oaknational/oak-components';

import { useState } from "react";
import { MaxWidth } from "@/components/MaxWidth";

export default function AdminPage() {
  return (
    <>
      <OakBox $width="100%" $background="white" $color="text-primary">
        <MaxWidth
          $ph="spacing-16"
          $flexDirection={"row"}
          $pv={["spacing-32", "spacing-64"]}
        >
          <OakGrid $cg="spacing-24" $rg="spacing-24">
            <OakGridArea
              $colSpan={[12, 3]}
              $alignSelf={"start"}
              $position={["static", "sticky", "sticky"]}
              $top={"spacing-56"}
              $display={["none", "block", "block"]}
            ></OakGridArea>
            <OakGridArea
              $colSpan={[12]}
              $position={["static", "static", "sticky"]}
              $display={["block", "none", "none"]}
              $pt="spacing-16"
              $pb="spacing-16"
            ></OakGridArea>

            <OakGridArea
              $width={"100%"}
              $colSpan={[12, 7]}
              $gap={"spacing-48"}
            >
              <CreateAPIKey />
            </OakGridArea>
          </OakGrid>
        </MaxWidth>
      </OakBox>
    </>
  );
}

function CreateAPIKey() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [key, setKey] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await fetch("/api/admin/create-api-key", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, company, email }),
    });
    const data = await response.json();
    if (data.error) {
      setError(data.error);
    } else {
      setKey(data.apiKey);
    }
  };

  return (
    <>
      <OakHeading tag="h2">Create an API key</OakHeading>
      <OakFlex
        as="form"
        $flexDirection="column"
        $gap="spacing-40"
        onSubmit={handleSubmit}
      >
        <div>
          <OakLabel htmlFor="name">Individual&apos;s name</OakLabel>
          <OakTextInput
            name="name"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <OakLabel htmlFor="company">Company</OakLabel>
          <OakTextInput
            name="company"
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div>
          <OakLabel htmlFor="email">Email address</OakLabel>
          <OakTextInput
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <OakFlex $gap="spacing-16">
          <OakPrimaryButton disabled={!!(error || key)} type="submit">
            Generate API Key
          </OakPrimaryButton>

          <OakSecondaryButton onClick={() => window.location.reload()}>
            Clear
          </OakSecondaryButton>
        </OakFlex>
        {error && <OakFieldError>{error}</OakFieldError>}
        {key && (
          <OakP $font="body-1-bold" $color="success">
            <strong>API Key:</strong> {key}
          </OakP>
        )}
      </OakFlex>
    </>
  );
}
