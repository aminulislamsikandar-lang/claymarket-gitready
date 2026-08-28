import type React from 'react';
import { useEffect } from 'react';

export const Analytics: React.FC = () => {
  useEffect(() => {
    const load = () => {
      const id = import.meta.env.VITE_GA_ID as string | undefined;
      if (!id || localStorage.getItem('claymarket_cookie_consent') !== 'accepted') return;
      if (document.getElementById('claymarket-gtag')) return;
      const script=document.createElement('script');
      script.id='claymarket-gtag'; script.async=true;
      script.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
      document.head.appendChild(script);
      const inline=document.createElement('script'); inline.id='claymarket-gtag-config';
      inline.textContent=`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}',{anonymize_ip:true});`;
      document.head.appendChild(inline);
    };
    load();
    const onConsent=()=>load();
    window.addEventListener('claymarket:consent', onConsent);
    return ()=>window.removeEventListener('claymarket:consent', onConsent);
  }, []);
  return null;
};
