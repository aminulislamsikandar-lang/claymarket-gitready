import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Send, CheckCheck, MessageSquare, Sparkles, ExternalLink, Plus, Store } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MessagingDrawer: React.FC = () => {
  const {
    isMessagesOpen,
    setIsMessagesOpen,
    conversations,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    startChatWithShop,
    navigateTo,
    currentUser,
    products,
    shops,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [showNewSellerChat, setShowNewSellerChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const counterpartName = activeConv
    ? (activeConv.buyerId === currentUser.id ? (activeConv.sellerName || activeConv.shopName) : (activeConv.buyerName || activeConv.sellerName || activeConv.shopName))
    : '';
  const counterpartAvatar = activeConv
    ? (activeConv.buyerId === currentUser.id ? activeConv.shopAvatar : (activeConv.buyerAvatar || activeConv.shopAvatar))
    : '';

  const otherSellerShops = useMemo(
    () => shops.filter(shop => shop.ownerId && shop.ownerId !== currentUser.id),
    [shops, currentUser.id],
  );

  useEffect(() => {
    if (isMessagesOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isMessagesOpen, activeConv?.messages.length, activeConversationId]);

  if (!isMessagesOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = (textToSend ?? inputMessage).trim();
    if (!text || !activeConv) return;
    sendMessage(activeConv.id, text);
    setInputMessage('');
  };

  const quickInquiries = [
    'Is this item in stock today?',
    'Can I pick up at the stall directly?',
    'What sizes do you have available?',
    'What is your stall location in the market?',
  ];

  const attachedProduct = activeConv?.productAttachment || activeConv?.messages.find(m => m.productAttachment)?.productAttachment;

  const handleViewProduct = () => {
    if (!attachedProduct || !activeConv) return;
    setIsMessagesOpen(false);
    const realProduct = products.find(p => p.id === attachedProduct.id);
    const shop = shops.find(s => s.id === activeConv.shopId);
    if (realProduct) {
      navigateTo('product-detail', { product: realProduct, shop: shop || undefined });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-gray-100 animate-in slide-in-from-right duration-300">
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-[#FAF8FE]">
          <div className="flex items-center justify-between gap-3">
            {activeConv ? (
              <div className="flex items-center gap-3 min-w-0">
                <img loading="lazy" decoding="async" src={counterpartAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} alt={counterpartName} className="w-11 h-11 rounded-2xl object-cover ring-2 ring-[#DDD4FF] shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-[#20243A] truncate">{counterpartName || activeConv.shopName}</h3>
                  <p className="text-xs text-[#8067E8] font-medium truncate">
                    {currentUser.role === 'seller' && activeConv.sellerId !== currentUser.id && activeConv.buyerId !== currentUser.id
                      ? 'Direct message'
                      : activeConv.shopName}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-bold text-base text-[#20243A]">Direct Messages</h3>
                <p className="text-xs text-gray-500">Buyer ↔ Seller · Seller ↔ Seller</p>
              </div>
            )}
            <div className="flex items-center gap-1 shrink-0">
              {currentUser.role === 'seller' && (
                <button onClick={() => setShowNewSellerChat(v => !v)} className="p-2 rounded-full hover:bg-white text-[#8067E8] transition-colors" title="Message another seller">
                  <Plus className="w-5 h-5" />
                </button>
              )}
              <button onClick={() => setIsMessagesOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {currentUser.role === 'seller' && showNewSellerChat && (
            <div className="mt-3 p-3 bg-white border border-[#DDD4FF] rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Store className="w-4 h-4 text-[#8067E8]" />
                <p className="text-xs font-extrabold text-[#20243A]">Message another seller</p>
              </div>
              <div className="max-h-44 overflow-y-auto space-y-1.5">
                {otherSellerShops.length === 0 ? (
                  <p className="text-xs text-gray-500 py-2">No other seller shops are available yet.</p>
                ) : otherSellerShops.map(shop => (
                  <button
                    key={shop.id}
                    onClick={() => {
                      setShowNewSellerChat(false);
                      startChatWithShop(shop);
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#FAF8FE] text-left transition-colors"
                  >
                    <img loading="lazy" decoding="async" src={shop.avatar} alt={shop.name} className="w-9 h-9 rounded-xl object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-[#20243A] truncate">{shop.ownerName || shop.name}</span>
                      <span className="block text-[10px] text-gray-500 truncate">{shop.name}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {conversations.length > 1 && (
          <div className="px-4 py-2 bg-[#F7F5F3] border-b border-gray-200/70 flex items-center gap-2 overflow-x-auto">
            {conversations.map(c => {
              const name = c.buyerId === currentUser.id ? (c.sellerName || c.shopName) : (c.buyerName || c.sellerName || c.shopName);
              return (
                <button key={c.id} onClick={() => setActiveConversationId(c.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${c.id === activeConv?.id ? 'bg-[#8067E8] text-white' : 'bg-white text-[#20243A] border border-gray-200'}`}>
                  {name}
                  {c.unreadCount > 0 && c.id !== activeConv?.id && <span className="ml-1">({c.unreadCount})</span>}
                </button>
              );
            })}
          </div>
        )}

        {attachedProduct && (
          <div className="mx-4 mt-3 p-3 bg-[#FAF8FE] border border-[#DDD4FF] rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img loading="lazy" decoding="async" src={attachedProduct.image} alt={attachedProduct.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-[#8067E8]">Discussing Product</span>
                <p className="text-xs font-bold text-[#20243A] truncate">{attachedProduct.name}</p>
                {attachedProduct.price !== undefined && <p className="text-xs font-extrabold text-[#8067E8]">₹{attachedProduct.price}</p>}
              </div>
            </div>
            <button onClick={handleViewProduct} className="text-xs font-bold text-[#8067E8] bg-[#DDD4FF]/50 px-3 py-1.5 rounded-full flex items-center gap-1">
              View <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-[#FDFCFB]">
          {activeConv?.messages.length ? activeConv.messages.map(msg => {
            const isMe = String(msg.senderId || '') === String(currentUser.id);
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {msg.productAttachment && (
                  <div className="mb-1 p-2 rounded-xl flex items-center gap-2 bg-white border border-gray-200 max-w-[82%]">
                    <img loading="lazy" decoding="async" src={msg.productAttachment.image} alt={msg.productAttachment.name} className="w-8 h-8 rounded-lg object-cover" />
                    <div className="text-[11px] truncate"><p className="font-bold truncate">{msg.productAttachment.name}</p><p className="font-extrabold text-[#8067E8]">₹{msg.productAttachment.price}</p></div>
                  </div>
                )}
                <div className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-[#8067E8] text-white rounded-br-xs' : 'bg-white text-[#20243A] border border-gray-100 rounded-bl-xs'}`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 px-1">
                  <span>{msg.timestamp}</span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#8067E8]" />}
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-16 text-gray-400">
              <div className="w-14 h-14 rounded-full bg-[#FAF8FE] text-[#8067E8] flex items-center justify-center mx-auto mb-3"><MessageSquare className="w-7 h-7" /></div>
              <h4 className="font-bold text-sm text-[#20243A]">No messages yet</h4>
              <p className="text-xs text-gray-500 mt-1">Start the conversation below.</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {currentUser.role === 'buyer' && activeConv && (
          <div className="px-4 py-2.5 bg-white border-t border-gray-100">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Sparkles className="w-3 h-3 text-[#8067E8]" /> Quick Inquiries</p>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {quickInquiries.map(q => <button key={q} onClick={() => handleSend(q)} className="px-2.5 py-1 bg-[#FAF8FE] text-[#6C4DE6] text-xs font-semibold rounded-full border border-[#DDD4FF] whitespace-nowrap">{q}</button>)}
            </div>
          </div>
        )}

        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
            <input value={inputMessage} onChange={e => setInputMessage(e.target.value)} placeholder={activeConv ? `Message ${counterpartName || 'user'}...` : 'Select a conversation...'} disabled={!activeConv} className="flex-1 px-4 py-3 bg-[#F7F5F3] rounded-full text-sm font-medium text-[#20243A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8067E8]/40 border border-gray-200/80 disabled:opacity-60" />
            <button type="submit" disabled={!activeConv || !inputMessage.trim()} className="p-3 bg-[#8067E8] hover:bg-[#6E52E2] disabled:opacity-50 text-white rounded-full shadow-md"><Send className="w-4 h-4" /></button>
          </form>
        </div>
      </div>
    </div>
  );
};
