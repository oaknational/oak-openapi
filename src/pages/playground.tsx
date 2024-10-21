import dynamic from "next/dynamic";
import { SwaggerUIProps } from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic<SwaggerUIProps>(() => import("swagger-ui-react"), {
  ssr: false,
});

export default function Page() {
  return (
    <>
      <style global jsx>{`
        .swagger-ui .model {
          font-size: 14px;
          line-height: 1.3;
        }
        .swagger-ui .auth-btn-wrapper .btn-done {
          margin-left: 12px;
        }
      `}</style>
      <SwaggerUI url="/api/v0/swagger.json" />
    </>
  );
}
