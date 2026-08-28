import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Send, ArrowLeft, CheckCheck, 
  MessageSquare, Sparkles, ExternalLink, User as UserIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MessagingDrawer: React.FC = () => {
  const { 
    isMessagesOpen, setIsMessagesOpen, conversations, 
    activeConversationId, setActiveConversationId, sendMessage,
    navigateTo, currentUser, products, shops
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];

  // Auto scroll to bottom
  useEffect(() => {
    if (isMessagesOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isMessagesOpen, activeConv?.messages.length, activeConversationId]);

  if (!isMessagesOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || !activeConv) return;
    sendMessage(activeConv.id, text.trim());
    setInputMessage('');
  };

  const quickInquiries = [
    'Is this item in stock today?',
    'Can I pick up at the stall directly?',
    'What sizes do you have available?',
    'What is your stall location in the market?'
  ];

  // Determine attached product for current conversation (either in conv or in message)
  const attachedProduct = activeConv?.productAttachment || 
    activeConv?.messages.find(m => m.productAttachment)?.productAttachment;

  const handleViewProduct = () => {
    if (!attachedProduct) return;
    setIsMessagesOpen(false);

    // Try finding the real product from products list, otherwise build complete fallback object
    const realProd = products.find(p => p.id === attachedProduct.id);
    const shop = shops.find(s => s.id === activeConv.shopId) || {
      id: activeConv.shopId,
      name: activeConv.shopName,
      marketId: 'mkt_kachumara',
      marketName: activeConv.marketName,
      categoryId: 'cat_slippers',
      categoryName: 'Slippers',
      avatar: activeConv.shopAvatar,
      banner: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1000&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewsCount: 128,
      verified: true,
      followersCount: 420,
      about: 'Serving market for over 12 years with genuine products.',
      phone: '+91 94350 87654',
      address: 'Market Stall, Footwear Alley',
      ownerId: activeConv.sellerId || 'user_aminul',
      ownerName: activeConv.sellerName || 'Aminul Islam',
    };

    const targetProduct = realProd || {
      id: attachedProduct.id,
      name: attachedProduct.name,
      price: attachedProduct.price,
      originalPrice: attachedProduct.price !== undefined ? Math.round(attachedProduct.price * 1.3) : undefined,
      shopId: activeConv.shopId,
      shopName: activeConv.shopName,
      marketId: 'mkt_kachumara',
      marketName: activeConv.marketName,
      categoryId: 'cat_slippers',
      categoryName: 'Slippers',
      images: [attachedProduct.image],
      description: 'Local authentic handcrafted footwear with durable sole and genuine quality guarantee.',
      stockCount: 20,
      rating: 4.8,
      reviewsCount: 45,
      sizes: ['7', '8', '9', '10'],
      colors: [{ name: 'Black', hex: '#20243A' }, { name: 'Brown', hex: '#8B4513' }],
    };

    navigateTo('product-detail', { 
      product: targetProduct,
      shop
    });
  };

  const isCurrentUserSeller = currentUser.role === 'seller';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 border-l border-gray-100"
      >
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-[#FAF8FE]">
          {activeConv ? (
            <div className="flex items-center gap-3 min-w-0">
              <img loading="lazy" decoding="async" 
                src={activeConv.shopAvatar} 
                alt={activeConv.shopName} 
                className="w-11 h-11 rounded-2xl object-cover ring-2 ring-[#DDD4FF] shrink-0" 
              />
              <div className="min-w-0">
                <h3 className="font-bold text-sm sm:text-base text-[#20243A] leading-tight truncate">
                  {activeConv.shopName}
                </h3>
                <p className="text-xs text-[#8067E8] font-medium flex items-center gap-1.5 truncate mt-0.5">
                  <span className="truncate">Seller: {activeConv.sellerName || activeConv.shopName}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 inline-block" />
                  <span className="text-gray-400 shrink-0">Online</span>
                </p>
              </div>
            </div>
          ) : (
            <h3 className="font-bold text-base text-[#20243A]">Direct Seller Messages</h3>
          )}

          <button
            id="close-messages-drawer-btn"
            onClick={() => setIsMessagesOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation List Selector Tabs if multiple */}
        {conversations.length > 1 && (
          <div className="px-4 py-2 bg-[#F7F5F3] border-b border-gray-200/70 flex items-center gap-2 overflow-x-auto">
            {conversations.map((c) => {
              const isSelected = c.id === activeConv?.id;
              return (
                <button
                  key={c.id}
                  id={`conv-tab-${c.id}`}
                  onClick={() => setActiveConversationId(c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected 
                      ? 'bg-[#8067E8] text-white shadow-xs' 
                      : 'bg-white text-[#20243A] border border-gray-200/80 hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate max-w-[120px]">{c.shopName.split(' ')[0]}</span>
                  {c.unreadCount > 0 && !isSelected && (
                    <span className="w-4 h-4 rounded-full bg-[#FF6B6B] text-white text-[9px] font-bold flex items-center justify-center">
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Product Attachment Preview Card (If Attached) */}
        {attachedProduct && (
          <div className="mx-4 mt-3 p-3 bg-[#FAF8FE] border border-[#DDD4FF] rounded-2xl flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <img loading="lazy" decoding="async" 
                src={attachedProduct.image} 
                alt={attachedProduct.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#DDD4FF]" 
              />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-[#8067E8] block tracking-wider">Discussing Product</span>
                <p className="text-xs font-bold text-[#20243A] truncate">{attachedProduct.name}</p>
                <p className="text-xs font-extrabold text-[#8067E8]">₹{attachedProduct.price}</p>
              </div>
            </div>
            <button
              id="msg-view-product-btn"
              onClick={handleViewProduct}
              className="text-xs font-bold text-[#8067E8] hover:text-[#6C4DE6] bg-[#DDD4FF]/50 hover:bg-[#DDD4FF] px-3 py-1.5 rounded-full transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <span>View</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Message Thread Scroll Area */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-[#FDFCFB]">
          {activeConv && activeConv.messages.length > 0 ? (
            activeConv.messages.map((msg) => {
              // Message is from "me" if senderRole matches currentUser role, or if buyer in buyer mode
              const isMe = isCurrentUserSeller 
                ? msg.senderRole === 'seller' || msg.sender === 'seller'
                : msg.senderRole === 'buyer' || msg.sender === 'buyer';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  {/* Inline attached product inside message if present */}
                  {msg.productAttachment && (
                    <div 
                      onClick={handleViewProduct}
                      className={`mb-1 p-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all max-w-[82%] ${
                        isMe 
                          ? 'bg-[#DDD4FF]/50 border border-[#DDD4FF] text-[#20243A]' 
                          : 'bg-white border border-gray-200 text-[#20243A]'
                      }`}
                    >
                      <img loading="lazy" decoding="async" 
                        src={msg.productAttachment.image} 
                        alt={msg.productAttachment.name} 
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div className="text-[11px] truncate">
                        <p className="font-bold truncate">{msg.productAttachment.name}</p>
                        <p className="font-extrabold text-[#8067E8]">₹{msg.productAttachment.price}</p>
                      </div>
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-[#8067E8] text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-[#20243A] border border-gray-100 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 px-1">
                    <span>{msg.timestamp}</span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#8067E8]" />}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 text-gray-400">
              <div className="w-14 h-14 rounded-full bg-[#FAF8FE] text-[#8067E8] flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-sm text-[#20243A]">No messages yet</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Ask about sizes, colors, market stall hours, or same-day local collection!
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Inquiry Chips (for buyers) */}
        {!isCurrentUserSeller && (
          <div className="px-4 py-2.5 bg-white border-t border-gray-100">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#8067E8]" />
              <span>Quick Inquiries</span>
            </p>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {quickInquiries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="px-2.5 py-1 bg-[#FAF8FE] hover:bg-[#F1EDFD] text-[#6C4DE6] text-xs font-semibold rounded-full border border-[#DDD4FF] whitespace-nowrap transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Input Field */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              id="message-input-field"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isCurrentUserSeller ? 'Reply as seller...' : `Message ${activeConv ? (activeConv.sellerName || activeConv.shopName) : 'seller'}...`}
              className="flex-1 px-4 py-3 bg-[#F7F5F3] rounded-full text-sm font-medium text-[#20243A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8067E8]/40 transition-all border border-gray-200/80"
            />
            <button
              id="send-message-btn"
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-3 bg-[#8067E8] hover:bg-[#6E52E2] disabled:opacity-50 text-white rounded-full transition-all shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
