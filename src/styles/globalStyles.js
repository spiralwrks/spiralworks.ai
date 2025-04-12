import { createGlobalStyle } from 'styled-components';
// ensure all fonts are Montserrat
const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Montserrat', sans-serif;
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