import React from 'react';
import { ArrowLeft, ShieldCheck, FileText, HelpCircle, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

const PageShell: React.FC<{title:string; icon:React.ReactNode; children:React.ReactNode}> = ({title,icon,children}) => {
  const { goBack } = useApp();
  return <div className="max-w-4xl mx-auto py-8 pb-20">
    <button onClick={goBack} className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold shadow-sm border border-gray-200/70 hover:shadow-md transition-all" aria-label="Go back"><ArrowLeft className="w-4 h-4"/> Back</button>
    <article className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-white/90" style={{boxShadow:'0 16px 36px -10px rgba(32,36,58,.08), inset 0 2px 4px rgba(255,255,255,.95)'}}>
      <div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 rounded-2xl bg-[#DDD4FF] text-[#8067E8] flex items-center justify-center">{icon}</div><h1 className="text-3xl font-extrabold text-[#20243A]">{title}</h1></div>
      <div className="prose prose-slate max-w-none text-[#505767] leading-7">{children}</div>
    </article>
  </div>;
};

export const PrivacyPolicyPage: React.FC = () => <PageShell title="Privacy Policy" icon={<ShieldCheck/>}>
  <p>Claymarket respects your privacy. This policy explains what information may be collected when you use our marketplace and how it is used.</p>
  <h2>Information we collect</h2><p>Depending on the features you use, this may include your name, email, phone number, account role, shop information, product information, messages, orders and preferences.</p>
  <h2>How we use information</h2><p>We use information to provide marketplace services, authenticate accounts, connect buyers and sellers, process marketplace activity, improve reliability and communicate important service updates.</p>
  <h2>Seller content</h2><p>Sellers may provide shop details, product photos, descriptions and other listing information. Sellers should only upload content they have the right to publish.</p>
  <h2>Cookies and local storage</h2><p>Claymarket may use essential browser storage for preferences and application functionality. Optional analytics are only loaded after consent where analytics configuration is enabled.</p>
  <h2>Data choices</h2><p>You may request correction or deletion of account information subject to applicable legal and operational requirements. Contact the marketplace operator using the contact method provided on the site.</p>
  <h2>Updates</h2><p>This policy may be updated as Claymarket evolves. The latest version will always be published on this page.</p>
</PageShell>;

export const TermsPage: React.FC = () => <PageShell title="Terms & Conditions" icon={<FileText/>}>
  <p>By using Claymarket, you agree to use the service lawfully and respectfully.</p>
  <h2>Marketplace use</h2><p>Claymarket helps people discover local markets, shops and products. Product availability, pricing and seller-provided information may change.</p>
  <h2>Buyer responsibilities</h2><p>Buyers should review product information and communicate with sellers when clarification is needed. Do not misuse messaging, accounts or marketplace features.</p>
  <h2>Seller responsibilities</h2><p>Sellers are responsible for the accuracy of their shop and product information, their uploaded photos, prices, stock information and compliance with applicable laws.</p>
  <h2>Content and conduct</h2><p>Do not upload illegal, fraudulent, infringing, abusive or misleading content. Claymarket may restrict content or accounts that violate these terms.</p>
  <h2>Availability</h2><p>We aim to keep the service reliable, but no online service can guarantee uninterrupted availability.</p>
  <h2>Changes</h2><p>Terms may be updated when features or legal requirements change. Continued use after an update means you accept the revised terms.</p>
</PageShell>;

const faqs = [
  ['What is Claymarket?', 'Claymarket is a local marketplace where people can discover markets, shops and products and connect with local sellers.'],
  ['Can I browse without an account?', 'Yes. Guests can browse markets, categories, shops and products. Account features such as messaging or saving items may require sign-in.'],
  ['Can a seller upload product photos?', 'Yes. Sellers can add product photos from their gallery and, on supported devices, use the camera capture option.'],
  ['Do sellers have to fill every product field?', 'No. Product name and at least one photo are the minimum listing information. Price, description, size, color and other details can be added later.'],
  ['Can I contact a seller?', 'Yes. Buyers can use the existing Message Seller or Ask Seller actions from supported shop and product views.'],
  ['How do I become a seller?', 'Use the Sell on Claymarket or Become a Seller action in your account menu and complete the seller onboarding flow.'],
];

export const FAQPage: React.FC = () => {
  const { goBack } = useApp();
  const [open, setOpen] = React.useState<number | null>(null);
  return <PageShell title="Frequently Asked Questions" icon={<HelpCircle/>}>
    <p className="mb-6">Quick answers about browsing markets, buying, selling and connecting with local shops.</p>
    <div className="space-y-3 not-prose">
      {faqs.map(([q,a],i)=><div key={q} className="rounded-2xl border border-gray-200/70 bg-[#FAF8FE] overflow-hidden">
        <button className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-[#20243A]" aria-expanded={open===i} onClick={()=>setOpen(open===i?null:i)}>{q}<ChevronDown className={`w-5 h-5 transition-transform ${open===i?'rotate-180':''}`}/></button>
        {open===i && <div className="px-5 pb-5 text-sm leading-6 text-[#737B89]">{a}</div>}
      </div>)}
    </div>
  </PageShell>;
};

export const NotFoundPage: React.FC = () => {
  const { navigateTo } = useApp();
  return <div className="min-h-[60vh] flex items-center justify-center py-16"><div className="text-center max-w-lg"><div className="text-7xl font-black text-[#8067E8] mb-4">404</div><h1 className="text-3xl font-extrabold text-[#20243A]">Page not found</h1><p className="mt-3 text-[#737B89]">The page you requested does not exist or may have moved.</p><button onClick={()=>navigateTo('markets')} className="mt-7 rounded-full bg-[#8067E8] text-white px-6 py-3 font-bold shadow-md hover:bg-[#6E52E2] transition-all">Explore Markets</button></div></div>;
};
