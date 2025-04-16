import { createGlobalStyle } from 'styled-components';

const PlaygroundStyle = createGlobalStyle`
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
  font-weight: 400;
}

/* HEADER */

/* Top level title */
.swagger-ui .info .title {
  font-family: 'Lexend', sans-serif;
  font-size: 56px;
  font-weight: bold;
  color: #222222;
}

/* Header links */
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

/* Servers dropdown component */
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
  background-color: #ffffff;
  max-width: 100%;
  min-width: 130px;
  width: 100%;
}

/* Authorize button */
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

.swagger-ui .auth-btn-wrapper .btn-done {
  margin-left: 12px;
}

/* Version tags */

.swagger-ui .info .title small pre {
  font-family: 'Lexend', sans-serif;
  font-size: 16px;
  color: black;
  border-radius: 4px;
  font-weight: 600;
  background-color: #f5e9f2;
  border-width: 2px;
  padding: 4px;
  border-width: 2px;
  border-color: #a0b6f2;
}

.swagger-ui .info .title small.version-stamp pre {
  background-color: #e3e9fb;
  border-color: #deb7d5;
}

.swagger-ui .info .title small {
  padding: 0px;
}

/* DOCS */

/* Section headers */
.swagger-ui .opblock-tag {
  font-family: 'Lexend', sans-serif;
  font-size: 32px;
  font-weight: bold;
  color: #222222;
}

/* Accordion */
.swagger-ui .opblock.opblock-get .opblock-summary {
  color: #222222;
  background:  #EBFBEB;
  border-color:  #93E892;
  border-radius: 2px;
  box-shadow: none;
}

.swagger-ui .opblock .opblock-summary-path,
.swagger-ui .opblock .opblock-summary-method {
  font-family: 'Lexend', sans-serif;
  font-size: 20px;
  font-weight: bold;
  color: #222222;
}

/* GET tag */
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

/* Auth & copy icons */
.swagger-ui .opblock .opblock-summary .view-line-link.copy-to-clipboard svg,
.swagger-ui .authorization__btn .unlocked {
  fill: black;
  opacity: 1;
}

.swagger-ui .copy-to-clipboard {
  background: black;
  color: #93e892;
}

/* ACCORDION */

/* Section headers */
.swagger-ui section.models h4 {
  font-family: 'Lexend', sans-serif;
  font-size: 32px;
  font-weight: bold;
  color: #222222;
}

.swagger-ui .model-title {
  font-family: 'Lexend', sans-serif;
  font-size: 16px;
  font-weight: bold;
  color: #222222;
}

.swagger-ui .model {
  font-size: 14px;
  line-height: 1.3;
}

/* Accordion spacing */
.swagger-ui section.models .model-container {
  background-color: #f2f2f2;
  border-radius: 4px;
  margin-bottom: 12px;
}

/* OPEN ACCORDION */

.swagger-ui .opblock.opblock-get {
  border-width: 2px;
  border-radius: 2px;
}

.swagger-ui .opblock-body {
  background-color: #f9f9f9;
}

/* Parameter section  */
.swagger-ui .parameters-col_description input {
  font-family: 'Lexend', sans-serif;
  border-color: 808080;
  color: 808080;
  border-radius: 4px;
  border-width: 2px;
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

/* Annoyingly we have to override the font-family a lot because, Swagger */

/* Section titles */
.swagger-ui .parameter__name,
.swagger-ui .opblock-description-wrapper p,
/* Sub-header for responses */
.swagger-ui .response-control-media-type__title,
/* Tab title */
.swagger-ui .tab li button.tablinks,
/* open accordion - responses */
.swagger-ui .responses-inner h4,
.swagger-ui .opblock .opblock-section-header h4,
.swagger-ui .responses-inner h4,
.swagger-ui .responses-inner h5 {
  font-family: 'Lexend', sans-serif;
}

/* Docs section */
.swagger-ui .parameters-col_description,
.swagger-ui table thead tr td,
.swagger-ui .response-col_links,
.swagger-ui .response-col_status {
  font-family: 'Lexend', sans-serif;
  font-size: 16px;
}

/* Default section - select styling */
.swagger-ui select {
  font-family: 'Lexend', sans-serif;
  font-weight: 400;
}

.swagger-ui .response-control-media-type--accept-controller select {
  color: #222222;
  border-color: #222222;
  border-radius: 4px;
  border-width: 2px;
  padding: 12px 16px 12px;
}

/* Cancel button */
.swagger-ui .btn.cancel {
  font-family: 'Lexend', sans-serif;
  box-shadow: none;
}

/* Spacing between main divs */

.swagger-ui .no-margin {
  margin-bottom: 48px;
}

/* Authorisation modal */

.swagger-ui .dialog-ux .modal-ux-content h4,
.swagger-ui .dialog-ux .modal-ux-header h3,
.swagger-ui .auth-container input[type='text'] {
  font-family: 'Lexend', sans-serif;
}

.swagger-ui
  .scheme-container
  .schemes
  .auth-wrapper
  .auth-btn-wrapper
  .authorize {
  font-weight: 400;
}

`;

export default PlaygroundStyle;
