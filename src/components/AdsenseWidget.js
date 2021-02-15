import React from 'react';
import AdSense from 'react-adsense';

export default class AdsenseWidget extends React.Component {
 componentDidMount() {
        const installGoogleAds = () => {
          const elem = document.createElement("script");
          elem.setAttribute("data-ad-client", "ca-pub-9227562150155157");
          elem.async = true;
          elem.src =
          "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
          document.head.appendChild(elem);
        };
        installGoogleAds();
    }


render () {
    return ( 
        <AdSense.Google
          client='ca-pub-9227562150155157'
          slot='9227562150155157'
          style={{ display: 'block' }}
          format='auto'
          responsive='true'
        />
    );
  }
}