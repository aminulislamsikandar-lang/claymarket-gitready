import type React from 'react';
import { useEffect } from 'react';
import { AppView } from '../types';

const meta: Record<string,{title:string;description:string}> = {
  markets:{title:'Markets | Claymarket',description:'Explore local markets and discover neighborhood shops and products on Claymarket.'},
  shops:{title:'Shops | Claymarket',description:'Discover local shops and connect with sellers on Claymarket.'},
  categories:{title:'Categories | Claymarket',description:'Browse slippers, clothes, electronics, home and grocery categories on Claymarket.'},
  about:{title:'About Claymarket',description:'Learn how Claymarket connects buyers with local markets, shops and sellers.'},
  'market-detail':{title:'Market | Claymarket',description:'Explore categories, shops and products in this local market on Claymarket.'},
  'category-detail':{title:'Category | Claymarket',description:'Discover local shops and products in this Claymarket category.'},
  'shop-detail':{title:'Shop | Claymarket',description:'Explore products and connect with this local shop on Claymarket.'},
  'product-detail':{title:'Product | Claymarket',description:'View product details and connect with the seller on Claymarket.'},
  orders:{title:'My Orders | Claymarket',description:'View your Claymarket orders.'},
  wishlist:{title:'Wishlist | Claymarket',description:'View your saved Claymarket products.'},
  profile:{title:'My Profile | Claymarket',description:'Manage your Claymarket profile.'},
  faq:{title:'FAQ | Claymarket',description:'Frequently asked questions about Claymarket.'},
  privacy:{title:'Privacy Policy | Claymarket',description:'Read the Claymarket privacy policy.'},
  terms:{title:'Terms & Conditions | Claymarket',description:'Read the Claymarket terms and conditions.'},
};

export const SEO: React.FC<{view: AppView}> = ({view}) => {
  useEffect(()=>{
    const info=meta[view] || {title:'Claymarket — Your Local Marketplace',description:'Discover local markets, shops and products with Claymarket.'};
    document.title=info.title;
    const set=(name:string,content:string)=>{let el=document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement|null;if(!el){el=document.createElement('meta');el.name=name;document.head.appendChild(el);}el.content=content;};
    set('description',info.description);
    const canonicalUrl=(import.meta.env.VITE_SITE_URL || window.location.origin) + (window.location.pathname === '/' ? '/' : window.location.pathname);
    let link=document.querySelector('link[rel="canonical"]') as HTMLLinkElement|null;if(!link){link=document.createElement('link');link.rel='canonical';document.head.appendChild(link);}link.href=canonicalUrl;
    const og=(property:string,content:string)=>{let el=document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement|null;if(!el){el=document.createElement('meta');el.setAttribute('property',property);document.head.appendChild(el);}el.content=content;};
    og('og:title',info.title); og('og:description',info.description); og('og:type','website'); og('og:url',canonicalUrl); og('og:site_name','Claymarket'); og('og:image',`${import.meta.env.VITE_SITE_URL || window.location.origin}/og-default.svg`);
    const tw=(name:string,content:string)=>{let el=document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement|null;if(!el){el=document.createElement('meta');el.name=name;document.head.appendChild(el);}el.content=content;}; tw('twitter:card','summary_large_image');tw('twitter:title',info.title);tw('twitter:description',info.description);tw('twitter:image',`${import.meta.env.VITE_SITE_URL || window.location.origin}/og-default.svg`);
  },[view]);
  return null;
};
