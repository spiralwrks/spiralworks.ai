import React from 'react';
import logoImage from '../assets/sprworks_black.png';

function Home() {
  return (
    <>
      
      <div className="pure-g text-container">
        <div className="pure-u-1 pure-u-md-1">
          <p className="content-1">
            <img src={logoImage} alt="logo" /> <b>Spiral Works</b> is an early stage <b>research and product lab</b> focused on ushering in a paradigm shift for AI via computational creativity and other understudied aspects of intelligence.
          </p>
          <p className="content-1">
            We believe computational creativity is the <b>ultimate frontier of AI</b>. Our long-term goal is to automate the entire intelligence pipeline, encompassing scientific, technological, and artistic discovery — which we believe represents the most significant applications of AI.
          </p>
        </div>
      </div>
      <hr className="divider" />
      <div className="pure-g text-container">
        <div className="pure-u-1 pure-u-md-1">
          <p className="content-1">
            We are a cross-disciplinary team with backgrounds in theoretical ML research, ML eng, swe, and philosophy.
            <br /><br />
            <a href="mailto:royce@spiralworks.ai">Get in touch</a>!
          </p>
        </div>
      </div>
    </>
  );
}

export default Home;