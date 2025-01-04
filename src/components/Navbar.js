// src/components/Navbar.js
import React from 'react';
import '../styles/Navbar.css';
import '../styles/Navbar_naxatw.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


function Navbar() {
  return (
    <nav className="header">
      <div className="details-header-breadcrumb naxatw-w-fit">
        <div className="header-back-btn">
          <ArrowBackIcon />
          <div className='naxatw-w-fit naxatw-h-[3.75rem]'>
            <div className="draw-icons-wrapper naxatw-flex naxatw-flex-row naxatw-mt-3 naxatw-mb-2 naxatw-gap-2.5 ">
              <div class="darwing-icons " tooltip="Select&nbsp;&nbsp;&nbsp;&nbsp;V" flow="down" id="select-wrapper">
                <img id="pan-image" src="https://data.geonadir.com/assets/Icons-e3443da7.svg" alt="icons"></img>
              </div>
              <div class="darwing-icons " tooltip="Select&nbsp;&nbsp;&nbsp;&nbsp;V" flow="down" id="select-wrapper">
                <img id="select-image" src="https://data.geonadir.com/assets/Icons1-de5dad24.svg" alt="icons"></img>
              </div>
              <div class="darwing-icons " tooltip="Select&nbsp;&nbsp;&nbsp;&nbsp;V" flow="down" id="select-wrapper">
                <img id="select-image" src="https://data.geonadir.com/assets/Icons4-49204475.svg" alt="icons"></img>
              </div>
              <div class="darwing-icons " tooltip="Select&nbsp;&nbsp;&nbsp;&nbsp;V" flow="down" id="select-wrapper">
                <img id="select-image" src="https://data.geonadir.com/assets/Icons10-a4a64d90.svg" alt="icons"></img>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="details-header-breadcrumb naxatw-mx-8 naxatw-w-full naxatw-flex naxatw-justify-center">
        <div class="header-back-btn naxatw-w-fit naxatw-mx-auto naxatw-justify-center">
          <div class="naxatw-flex naxatw-justify-start">
            <div class="naxatw-flex naxatw-gap-[0.62rem]"></div>
            <div class="ellipsis">Proyecto Prueba</div>
            <i class="material-icons naxatw-text-[#747B84]" type="button" id="radix-:rg:" aria-haspopup="menu" aria-expanded="false" data-state="closed"></i>
          </div>
        </div>
      </div>

      <div className="new-layer-warpper naxatw-gap-2.5">
          
          <div class="naxatw-flex naxatw-items-center naxatw-justify-center">
            <button tooltip="ryali93 (you)" className="user-btn">R</button>
          </div>
        
      </div>
      
      
      
      {/* <div className="navbar-left">
        <h1>GeoApp</h1>
      </div> */}
      {/* <div className="navbar-center">
        <div class="darwing-icons" tooltip="Select&nbsp;&nbsp;&nbsp;&nbsp;V" flow="down" id="select-wrapper">
          <img id="select-image" src="https://data.geonadir.com/assets/Icons1-de5dad24.svg" alt="icons"></img>
        </div>
        <button className="tool-btn">Pan</button>
        <button className="tool-btn">Draw</button>
        <button className="tool-btn">Edit</button>
      </div> */}
      {/* <div className="navbar-right">
        <button className="user-btn">R</button>
      </div> */}
    </nav>
  );
}

export default Navbar;
