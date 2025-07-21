import { createGlobalStyle } from 'styled-components';
// ensure all fonts are Chillax
const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Chillax Variable', 'Chillax', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .font-light {
    font-weight: 300;
  }

  .font-regular {
    font-weight: 400;
  }

  .font-medium {
    font-weight: 500;
  }

  .font-bold {
    font-weight: 700;
  }
`;

export default GlobalStyle;