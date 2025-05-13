import { React, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import logoBlack from '../assets/sprworks_black.png';
import logoWhite from '../assets/sprworks_white.png';
import WaitlistSignup from './WaitlistSignup';

function Home() {
  const { theme } = useContext(ThemeContext);
  const logoImage = theme === 'dark' ? logoWhite : logoBlack;

  return (
    <>
      
      <div className="pure-g text-container">
        <div className="pure-u-1 pure-u-md-1">
          <p className="content-1">
            <img src={logoImage} alt="logo" /> <b>Spiral Works</b> is building the first universal research OS for R&D, starting with the AI research space.
          </p>
          <p className="content-1">
            We build <b>rigorous, high trust systems</b> informed from a meld of our computational creativity, information theory, and neurosymbolic research.
          </p>

          <WaitlistSignup />
        </div>
      </div>
      <hr className="divider" />
      <div className="pure-g text-container">
        <div className="pure-u-1 pure-u-md-1">
          <p className="content-1">
            We are a cross-disciplinary team with backgrounds in theoretical ML research and engineering, computational creativity, and philosophy.
            <br /><br />
            <a href="mailto:royce@spiralworks.ai">Get in touch</a>!
          </p>
        </div>
      </div>
    </>
  );
}

export default Home;