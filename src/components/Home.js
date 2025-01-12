import { React, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import logoBlack from '../assets/sprworks_black.png';
import logoWhite from '../assets/sprworks_white.png';

function Home() {
  const { theme } = useContext(ThemeContext);
  const logoImage = theme === 'dark' ? logoWhite : logoBlack;

  return (
    <>
      
      <div className="pure-g text-container">
        <div className="pure-u-1 pure-u-md-1">
          <p className="content-1">
            <img src={logoImage} alt="logo" /> <b>Spiral Works</b> is an early stage <b>moonshot research lab</b> focused on ushering in a paradigm shift for AI via <b>computational creativity</b> and other understudied aspects of intelligence.
          </p>
          <p className="content-1">
            We believe computational creativity is the <b>ultimate frontier of AI</b>. Our long-term aim is to automate and commoditize <b>scientific discovery</b>.
          </p>
        </div>
      </div>
      <hr className="divider" />
      <div className="pure-g text-container">
        <div className="pure-u-1 pure-u-md-1">
          <p className="content-1">
            We are a cross-disciplinary team with backgrounds in theoretical ML research and engineering, computational neuroscience, and philosophy.
            <br /><br />
            <a href="mailto:royce@spiralworks.ai">Get in touch</a>!
          </p>
        </div>
      </div>
    </>
  );
}

export default Home;