import React, { useEffect, useState } from 'react';
import { Cookie, X } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  useEffect(()=>{ setVisible(localStorage.getItem('claymarket_cookie_consent') !== 'accepted' && localStorage.getItem('claymarket_cookie_consent') !== 'rejected'); },[]);
  const save=(value:'accepted'|'rejected')=>{ localStorage.setItem('claymarket_cookie_consent',value); setVisible(false); window.dispatchEvent(new CustomEvent('claymarket:consent',{detail:value})); };
  if(!visible) return null;
  return <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[70] bg-white rounded-3xl p-5 shadow-2xl border border-gray-200/80" role="dialog" aria-label="Cookie preferences">
    <div className="flex gap-3"><div className="w-10 h-10 rounded-2xl bg-[#DDD4FF] text-[#8067E8] flex items-center justify-center shrink-0"><Cookie className="w-5 h-5"/></div><div className="min-w-0"><div className="flex items-center justify-between gap-2"><h2 className="font-extrabold text-[#20243A]">Privacy choices</h2><button onClick={()=>save('rejected')} aria-label="Close cookie notice" className="p-1 rounded-full hover:bg-gray-100"><X className="w-4 h-4"/></button></div><p className="text-xs leading-5 text-[#737B89] mt-1">We use essential storage for site functionality. Optional analytics are only enabled after you allow them.</p><div className="flex gap-2 mt-4"><button onClick={()=>save('rejected')} className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-xs font-bold text-[#20243A] hover:bg-gray-200">Reject optional</button><button onClick={()=>save('accepted')} className="flex-1 rounded-full bg-[#8067E8] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#6E52E2]">Accept analytics</button></div></div></div>
  </div>;
};
