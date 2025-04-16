import dynamic from 'next/dynamic';
import Head from 'next/head';
import { SwaggerUIProps } from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic<SwaggerUIProps>(() => import('swagger-ui-react'), {
  ssr: false,
});

export default function Page() {
  return (
    <>
      <Head>
        <title>Oak API Playground</title>
      </Head>

      <style global jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap');
        // servers component
        .swagger-ui .servers-title {
          font-family: 'Lexend', sans-serif;
          font-size: 16px;
          font-weight: bold;
          color: #222222;
        }
        .swagger-ui select {
          background-color:  #FFFFFF;
          border-color:  #222222;
          border-width: 2px;
          border-radius: 4px;
          box-shadow: none;
          padding: 12px 16px 12px;
        }

        .swagger-ui .servers > label select {
          font-family: 'Lexend', sans-serif;
          font-size: 16px;
          font-weight: lighter;
          color: #222222;
          padding: 12px 16px 12px;
          background-colour: #ffffff;
        }

        //authorize button
        .swagger-ui .scheme-container .schemes .auth-wrapper .authorize {
          font-family: 'Lexend', sans-serif;
          font-size: 16px;
          font-weight: bold;
          color: white;
          background-color: black;
          padding: 12px 16px 12px;
          border-color: black;
        }

        .swagger-ui .btn.authorize svg {
          fill: white;
        }

        // pre tag

        .swagger-ui .info .title small pre {
          font-family: 'Lexend', sans-serif;
          font-size: 16px;
          color: black;
          border-radius: 4px;
          font-weight: light;
          background-color: #f5e9f2;
          border-width: 2px;
          padding: 4px;
        }

        .swagger-ui .info .title small.version-stamp pre {
          background-color: #e3e9fb;
        }

        .swagger-ui .info .title small {
          padding: 0px;
        }

        // section headers
        .swagger-ui .opblock-tag {
          font-family: 'Lexend', sans-serif;
          font-size: 32px;
          font-weight: bold;
          color: #222222;
        }

        // accordion
        .swagger-ui .opblock.opblock-get .opblock-summary {
          color: #222222;
          background:  #EBFBEB;
          border-color:  #93E892;
          border-radius: 2px;
          box-shadow: none;
        }

        .swagger-ui .opblock .opblock-summary-path {
          font-family: 'Lexend', sans-serif;
          font-size: 20px;
          font-weight: bold;
        }

        .swagger-ui .opblock .opblock-summary-method {
          font-family: 'Lexend', sans-serif;
          font-size: 20px;
          font-weight: bold;
          color: #222222;
        }

        .swagger-ui .opblock.opblock-get {
          background: #ebfbeb;
          border-color: #93e892;
          border-radius: 2px;
          box-shadow: none;
          margin-bottom: 12px;
        }

        .swagger-ui .opblock.opblock-get .opblock-summary-method {
          background: #93e892;
        }

        .swagger-ui .authorization__btn .unlocked {
          fill: black;
          opacity: 1;
        }
        
        .swagger-ui .copy-to-clipboard {
          background: black;
          color: #93e892;
        }

        .swagger-ui .opblock .opblock-summary .view-line-link.copy-to-clipboard svg{
          fill: black
          opacity: 1; 
        }

        // h1 title
        .swagger-ui .info .title {
          font-family: 'Lexend', sans-serif;
          font-size: 56px;
          font-weight: bold;
          color: #222222;
        }

        // h4
        .swagger-ui section.models h4 {
          font-family: 'Lexend', sans-serif;
          font-size: 32px;
          font-weight: bold;
          color: #222222;
        }

        // schema accordian
        .swagger-ui section.models .model-container {
          background-color: #f2f2f2;
          border-radius: 4px;
          margin:bottom: 12px;
        }

        //header
        .swagger-ui .model-title {
          font-family: 'Lexend', sans-serif;
          font-size: 16px;
          font-weight: bold;
          color: #222222;
        }

        // links in header
        .swagger-ui .info hgroup.main a {
          font-family: 'Lexend', sans-serif;
          font-size: 16px;
          font-weight: light;
          color: #0d24c4;
        }

        .swagger-ui .info a {
          font-family: 'Lexend', sans-serif;
          font-size: 16px;
          font-weight: light;
          color: #0d24c4;
        }

        // open accordion
        .swagger-ui .opblock.opblock-get {
          border-width: 2px;
          border-radius: 2px;
        }
        .swagger-ui .opblock-body {
          background-color: #F9F9F9;
        }
        .swagger-ui .opblock-description-wrapper p {
          font-family: 'Lexend', sans-serif;
        }

        // parameter table 
        .swagger-ui .parameters-col_description input {
          font-family: 'Lexend', sans-serif;
          border-color: 808080;
          color: 808080;
          border-radius: 4px;
          border-width: 2px;
        }
        .swagger-ui .parameter__name {
          font-family: 'Lexend', sans-serif;
        }

        .swagger-ui .parameter__name.required span,
        .swagger-ui .parameter__name.required:after {
            font-family: 'Lexend', sans-serif;
            color: black;
            font-weight: 400;
        }

        .swagger-ui .opblock.opblock-get .tab-header .tab-item.active h4 span:after {
          background: black;
        }

        // open accordion - responses
        .swagger-ui .responses-inner h4,
        .swagger-ui .opblock .opblock-section-header h4,
        .swagger-ui .responses-inner h4, .swagger-ui .responses-inner h5  {
          font-family: 'Lexend', sans-serif;
        }
        
        // docs table
        .swagger-ui .parameters-col_description,
        .swagger-ui table thead tr td,
        .swagger-ui .response-col_links,
        .swagger-ui .response-col_status {
          font-family: 'Lexend', sans-serif;
          font-size: 16px;
        }
        

        // default
        .swagger-ui select {
          font-family: 'Lexend', sans-serif;
          font-weight: 400;

        }

        .swagger-ui .response-control-media-type--accept-controller select {
          font-color: #222222;
          border-color: #222222;
          border-radius: 4px;
          border-width: 2px;
          padding: 12px 16px 12px;
        }

        // docs table - description
        .swagger-ui .response-control-media-type__title,
        .swagger-ui .tab li button.tablinks
        {
          font-family: 'Lexend', sans-serif;
        }

        //cancel button
        .swagger-ui .btn.cancel {
          font-family: 'Lexend', sans-serif;
          box-shadow: none;
        }




        //generics

        div.swagger-ui,
        .swagger-ui label {
          font-family: 'Lexend', sans-serif;
        }

        .swagger-ui .btn {
          font-family: 'Lexend', sans-serif;
          background-color: black;
          border-color: black;
          color: white;
          box-shadow: none;
          font-size: 16px;
          font-weight:400;
        }

        // spacing

        .swagger-ui .no-margin {
          margin-bottom: 48px;
        }


        //auth modal

        .swagger-ui .dialog-ux .modal-ux-content h4,
        .swagger-ui .dialog-ux .modal-ux-header h3,
        .swagger-ui .auth-container input[type=text] {
            font-family: 'Lexend', sans-serif;
        }

        .swagger-ui .scheme-container .schemes .auth-wrapper .auth-btn-wrapper .authorize {
          font-weight: 400;
        }


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
