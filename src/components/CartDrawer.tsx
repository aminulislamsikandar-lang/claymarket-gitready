import React, { useEffect, useState } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Store, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, cart, updateCartQuantity, removeFromCart, createOrder, navigateTo } = useApp();
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [addressInput] = useState('Stall Pickup / Main Gate, Kachumara Market');
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (!isCartOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsCartOpen(false); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;
  const subtotal = cart.reduce((sum, item) => sum + ((item.product.price ?? 0) * item.quantity), 0);
  const deliveryFee = deliveryMethod === 'delivery' ? 40 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    if (cart.length === 0 || placingOrder) return;
    setPlacingOrder(true);
    try {
      const order = await createOrder(deliveryMethod, addressInput);
      if (!order) return;
      setIsCartOpen(false);
      navigateTo('orders');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsCartOpen(false); }}>
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 border-l border-gray-100" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#FAF8FE]">
          <div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-xl bg-[#8067E8] text-white flex items-center justify-center"><ShoppingBag className="w-4 h-4" aria-hidden="true" /></div><div><h3 id="cart-drawer-title" className="font-bold text-base text-[#20243A]">Your Shopping Cart</h3><p className="text-xs text-[#737B89]">{cart.length} unique local item(s)</p></div></div>
          <button type="button" aria-label="Close shopping cart" onClick={() => setIsCartOpen(false)} className="p-2 rounded-full hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8067E8] text-gray-500 transition-colors"><X className="w-5 h-5" aria-hidden="true" /></button>
        </div>
        <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-[#FDFCFB]">
          {cart.length === 0 ? <div className="text-center py-20 text-gray-400 space-y-3"><div className="w-16 h-16 rounded-3xl bg-[#F0ECFC] text-[#8067E8] flex items-center justify-center mx-auto"><ShoppingBag className="w-8 h-8" aria-hidden="true" /></div><h4 className="font-bold text-base text-[#20243A]">Your Cart is Empty</h4><p className="text-xs text-[#737B89] max-w-xs mx-auto">Explore local markets and add footwear, clothing or daily essentials to your bag.</p><button type="button" onClick={() => { setIsCartOpen(false); navigateTo('markets'); }} className="mt-2 px-5 py-2.5 bg-[#8067E8] text-white rounded-full font-bold text-xs shadow-sm hover:bg-[#6E52E2] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8067E8]">Browse Markets</button></div> : cart.map((item) => <div key={item.id} className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3.5"><img loading="lazy" decoding="async" src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 rounded-xl object-cover ring-1 ring-gray-100 shrink-0" /><div className="flex-1 min-w-0"><h4 className="font-bold text-xs sm:text-sm text-[#20243A] truncate">{item.product.name}</h4><p className="text-[11px] text-[#8067E8] font-semibold truncate">{item.product.shopName}</p><div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">{item.selectedSize && <span>Size: <strong>{item.selectedSize}</strong></span>}{item.selectedColor && <span>• {item.selectedColor}</span>}</div><div className="flex items-center justify-between mt-2"><span className="font-extrabold text-sm text-[#20243A]">{item.product.price !== undefined && item.product.price !== null ? `₹${item.product.price * item.quantity}` : 'Price on request'}</span><div className="flex items-center bg-gray-100 rounded-full p-0.5 border border-gray-200"><button type="button" aria-label={`Decrease quantity of ${item.product.name}`} disabled={item.quantity <= 1} onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-gray-700 shadow-xs disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8067E8]"><Minus className="w-3 h-3" aria-hidden="true" /></button><span aria-label={`Quantity ${item.quantity}`} className="w-6 text-center text-xs font-bold text-[#20243A]">{item.quantity}</span><button type="button" aria-label={`Increase quantity of ${item.product.name}`} onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-gray-700 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8067E8]"><Plus className="w-3 h-3" aria-hidden="true" /></button></div></div></div><button type="button" aria-label={`Remove ${item.product.name} from cart`} onClick={() => removeFromCart(item.id)} className="p-2 text-gray-400 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded-full"><Trash2 className="w-4 h-4" aria-hidden="true" /></button></div>)}
        </div>
        {cart.length > 0 && <div className="p-5 bg-white border-t border-gray-100 space-y-4"><div className="space-y-2"><span className="text-xs font-bold text-[#20243A]">Fulfillment Method:</span><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setDeliveryMethod('pickup')} aria-pressed={deliveryMethod === 'pickup'} className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 ${deliveryMethod === 'pickup' ? 'bg-[#F1EDFD] border-[#8067E8] text-[#8067E8]' : 'border-gray-200 text-gray-600'}`}><Store className="w-3.5 h-3.5" aria-hidden="true" />Stall Pickup (Free)</button><button type="button" onClick={() => setDeliveryMethod('delivery')} aria-pressed={deliveryMethod === 'delivery'} className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 ${deliveryMethod === 'delivery' ? 'bg-[#F1EDFD] border-[#8067E8] text-[#8067E8]' : 'border-gray-200 text-gray-600'}`}><MapPin className="w-3.5 h-3.5" aria-hidden="true" />Local Delivery (₹40)</button></div></div><div className="space-y-1.5 text-xs text-[#737B89]"><div className="flex justify-between"><span>Items Subtotal</span><span className="font-bold text-[#20243A]">₹{subtotal}</span></div><div className="flex justify-between"><span>Fulfillment Fee</span><span className="font-bold text-[#20243A]">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div><div className="flex justify-between text-sm font-extrabold text-[#20243A] pt-2 border-t border-gray-100"><span>Total Amount</span><span className="text-base text-[#8067E8]">₹{total}</span></div></div><button id="cart-complete-order-btn" type="button" disabled={placingOrder} aria-busy={placingOrder} onClick={handleCheckout} className="w-full py-3.5 px-6 rounded-full bg-[#8067E8] hover:bg-[#6E52E2] disabled:opacity-70 disabled:cursor-wait active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8067E8]">{placingOrder ? <><span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />Placing Order…</> : <>Place Order with Shop (Cash / UPI)<ArrowRight className="w-4 h-4" aria-hidden="true" /></>}</button></div>}
      </div>
    </div>
  );
};
