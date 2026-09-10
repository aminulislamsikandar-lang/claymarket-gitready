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

interface ImageCommentsModalProps {
  productId: string;
  productName: string;
  imageUrl: string;
  imageIndex: number;
  onClose: () => void;
}

/**
 * Comment thread for a single product image. This is a controlled modal —
 * the caller decides exactly which product/image it applies to and when it
 * is open. It only ever renders inside the image-viewing interface (the
 * lightbox / zoom view) that appears after the user taps an image, never as
 * a floating button layered on top of thumbnails elsewhere on the page.
 */
export const ImageCommentsModal: React.FC<ImageCommentsModalProps> = ({
  productId,
  productName,
  imageUrl,
  imageIndex,
  onClose,
}) => {
  const { currentUser, setIsAuthModalOpen, showToast } = useApp();
  const [comments, setComments] = useState<ImageComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setComments([]);
    apiRequest<ImageComment[]>(`/image-comments/products/${encodeURIComponent(productId)}?imageIndex=${imageIndex}`)
      .then((data) => { if (!cancelled) setComments(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) showToast('Could not load image comments.', 'error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [productId, imageIndex, showToast]);

  const postComment = async () => {
    const text = draft.trim();
    if (!text) return;
    setSubmitting(true);
    try {
      const saved = await apiRequest<ImageComment>('/image-comments', {
        method: 'POST',
        body: JSON.stringify({ productId, imageIndex, comment: text }),
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
    <div
      className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Comments for ${productName} image ${imageIndex + 1}`}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[88vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <img src={imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-100" />
          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-[#20243A]">Image comments</h3>
            <p className="text-xs text-gray-500 truncate">{productName} • Image {imageIndex + 1}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close comments"><X className="w-5 h-5" /></button>
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
