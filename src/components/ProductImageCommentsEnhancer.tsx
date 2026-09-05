import React, { useEffect, useState } from 'react';
import { MessageSquare, Send, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiRequest } from '../utils/api';

type ImageComment = {
  _id?: string;
  id?: string;
  productId: string;
  imageIndex: number;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
};

const commentId = (comment: ImageComment) => String(comment._id || comment.id || '');

/** Adds comments to every product image without changing the existing gallery implementation. */
export const ProductImageCommentsEnhancer: React.FC = () => {
  const { selectedProduct, currentUser, setIsAuthModalOpen, showToast } = useApp();
  const [open, setOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [comments, setComments] = useState<ImageComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState('');

  const product = selectedProduct;

  useEffect(() => {
    if (!product) return;

    const buttonByImage = new WeakMap<HTMLImageElement, HTMLButtonElement>();
    const buttons = new Set<HTMLButtonElement>();

    const updatePositions = () => {
      document.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
        const alt = image.getAttribute('alt') || '';
        let imageIndex = -1;
        const thumbnailMatch = alt.match(/thumbnail (\d+)$/i);
        if (thumbnailMatch) {
          imageIndex = Number(thumbnailMatch[1]) - 1;
        } else if (alt === product.name) {
          const src = image.currentSrc || image.src;
          imageIndex = product.images.findIndex((item) => item === src);
          if (imageIndex < 0) imageIndex = 0;
        }
        if (imageIndex < 0 || imageIndex >= product.images.length) return;

        let button = buttonByImage.get(image);
        if (!button) {
          button = document.createElement('button');
          button.type = 'button';
          button.setAttribute('data-claymarket-image-comment', 'true');
          button.setAttribute('aria-label', `Comments for product image ${imageIndex + 1}`);
          button.textContent = '💬';
          button.style.cssText = [
            'position:fixed', 'z-index:80', 'width:38px', 'height:38px',
            'border-radius:9999px', 'border:1px solid rgba(255,255,255,.8)',
            'background:rgba(32,36,58,.82)', 'color:white', 'font-size:17px',
            'display:flex', 'align-items:center', 'justify-content:center',
            'box-shadow:0 6px 18px rgba(0,0,0,.22)', 'backdrop-filter:blur(8px)',
            'cursor:pointer', 'padding:0', 'line-height:1',
          ].join(';');
          button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const index = Number(button?.dataset.imageIndex || 0);
            setActiveImageIndex(index);
            setOpen(true);
          });
          document.body.appendChild(button);
          buttonByImage.set(image, button);
          buttons.add(button);
        }

        button.dataset.imageIndex = String(imageIndex);
        button.setAttribute('aria-label', `Comments for product image ${imageIndex + 1}`);
        const rect = image.getBoundingClientRect();
        button.style.left = `${Math.max(6, Math.min(window.innerWidth - 44, rect.right - 44))}px`;
        button.style.top = `${Math.max(6, Math.min(window.innerHeight - 44, rect.bottom - 44))}px`;
        button.style.display = rect.width > 0 && rect.height > 0 ? 'flex' : 'none';
      });
    };

    const observer = new MutationObserver(updatePositions);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions, true);
    const interval = window.setInterval(updatePositions, 700);
    updatePositions();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions, true);
      window.clearInterval(interval);
      buttons.forEach((button) => button.remove());
    };
  }, [product]);

  useEffect(() => {
    if (!open || !product) return;
    let cancelled = false;
    setLoading(true);
    setComments([]);
    apiRequest<ImageComment[]>(`/image-comments/products/${encodeURIComponent(product.id)}?imageIndex=${activeImageIndex}`)
      .then((data) => { if (!cancelled) setComments(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) showToast('Could not load image comments.', 'error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, activeImageIndex, product, showToast]);

  if (!product || !open) return null;

  const postComment = async () => {
    const text = draft.trim();
    if (!text) return;
    setSubmitting(true);
    try {
      const saved = await apiRequest<ImageComment>('/image-comments', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, imageIndex: activeImageIndex, comment: text }),
      });
      setComments((current) => [saved, ...current]);
      setDraft('');
      showToast('Comment posted.', 'success');
    } catch (error: any) {
      if (error?.status === 401) setIsAuthModalOpen(true);
      else showToast(error?.message || 'Could not post comment.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const removeComment = async (id: string) => {
    try {
      await apiRequest(`/image-comments/${id}`, { method: 'DELETE' });
      setComments((current) => current.filter((item) => commentId(item) !== id));
      showToast('Comment deleted.', 'success');
    } catch (error: any) {
      showToast(error?.message || 'Could not delete comment.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-label={`Comments for ${product.name} image ${activeImageIndex + 1}`} onClick={() => setOpen(false)}>
      <div className="w-full sm:max-w-lg max-h-[88vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <img src={product.images[activeImageIndex] || product.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-100" />
          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-[#20243A]">Image comments</h3>
            <p className="text-xs text-gray-500 truncate">{product.name} • Image {activeImageIndex + 1}</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close comments"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-500">Loading comments…</p>
          ) : comments.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">No comments on this image yet.</p>
              <p className="text-xs mt-1">Be the first to share what you notice.</p>
            </div>
          ) : (
            comments.map((comment) => {
              const id = commentId(comment);
              const mine = String(comment.userId) === String(currentUser?.id);
              return (
                <div key={id} className="rounded-2xl bg-[#F7F5F3] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-[#20243A]">{comment.userName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString('en-IN')}</span>
                      {mine && id && <button type="button" onClick={() => removeComment(id)} className="p-1.5 text-gray-400 hover:text-red-600" aria-label="Delete comment"><Trash2 className="w-3.5 h-3.5" /></button>}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap break-words">{comment.comment}</p>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="flex items-end gap-2">
            <textarea value={draft} onChange={(event) => setDraft(event.target.value.slice(0, 500))} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') postComment(); }} rows={2} maxLength={500} placeholder="Comment on this image…" className="flex-1 resize-none rounded-2xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#8067E8]" />
            <button type="button" onClick={postComment} disabled={submitting || !draft.trim()} className="w-11 h-11 rounded-full bg-[#8067E8] text-white flex items-center justify-center disabled:opacity-40" aria-label="Post comment"><Send className="w-4 h-4" /></button>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 text-right">{draft.length}/500</p>
        </div>
      </div>
    </div>
  );
};
