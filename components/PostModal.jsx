'use client';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

function timeAgo(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString('ru-RU');
}

export default function PostModal({ post, onClose, onUpdate }) {
  const [replyText, setReplyText]   = useState('');
  const [sending, setSending]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [comments, setComments]     = useState(null);
  const [note, setNote]             = useState(post.note || '');
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const fetchComments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.fetchComments(post.id);
      setComments(data.comments || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    setError('');
    try {
      await api.replyPost(post.id, replyText.trim());
      setSuccess('Reply sent!');
      setReplyText('');
      onUpdate?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status) => {
    await api.updatePost(post.id, { status }).catch(() => {});
    onUpdate?.();
  };

  const saveNote = async () => {
    await api.updatePost(post.id, { note }).catch(() => {});
    setSuccess('Note saved');
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <div>
            <span className="font-semibold text-purple-300">@{post.author}</span>
            <span className="text-gray-500 text-sm ml-2">· {timeAgo(post.found_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            {post.url && (
              <a href={post.url} target="_blank" rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition">
                Open post ↗
              </a>
            )}
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 text-gray-400 transition">
              ✕
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Post text */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
              <span className="px-2 py-0.5 rounded bg-gray-700">{post.keyword}</span>
              <span className="px-2 py-0.5 rounded bg-gray-700">{post.category}</span>
              <span>♥ {post.likes}</span>
              <span>💬 {post.replies_count}</span>
            </div>
            <p className="text-gray-100 text-sm leading-relaxed whitespace-pre-wrap">
              {post.text || <em className="text-gray-500">No text</em>}
            </p>
          </div>

          {/* Status buttons */}
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => updateStatus('new')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
                ${post.status === 'new' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              New
            </button>
            <button onClick={() => updateStatus('ignored')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
                ${post.status === 'ignored' ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              Ignore
            </button>
          </div>

          {/* Comments section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300">Comments</h3>
              <button
                onClick={fetchComments}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition disabled:opacity-50">
                {loading ? 'Loading...' : 'Fetch comments'}
              </button>
            </div>

            {comments === null && !loading && (
              <p className="text-gray-600 text-xs text-center py-4">Click "Fetch comments" to load</p>
            )}
            {comments?.length === 0 && (
              <p className="text-gray-600 text-xs text-center py-4">No comments yet</p>
            )}
            {comments?.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {comments.map((c, i) => (
                  <div key={i} className="bg-gray-800/60 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-purple-300">@{c.author}</span>
                      <span className="text-xs text-gray-600">♥ {c.likes}</span>
                    </div>
                    <p className="text-xs text-gray-300">{c.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Previous reply */}
          {post.reply_text && (
            <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-4">
              <p className="text-xs text-green-400 mb-1 font-medium">Your reply (sent)</p>
              <p className="text-sm text-gray-200">{post.reply_text}</p>
            </div>
          )}

          {/* Reply form */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Write a reply</h3>
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write your comment..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm
                         text-gray-100 placeholder-gray-600 focus:outline-none focus:border-purple-500
                         resize-none transition"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{replyText.length} chars</span>
              <button
                onClick={sendReply}
                disabled={sending || !replyText.trim()}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50
                           text-white text-sm font-medium rounded-xl transition">
                {sending ? 'Sending...' : 'Send reply'}
              </button>
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300">Note</h3>
            <div className="flex gap-2">
              <input
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Private note..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm
                           text-gray-100 placeholder-gray-600 focus:outline-none focus:border-purple-500"
              />
              <button onClick={saveNote}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-xl transition">
                Save
              </button>
            </div>
          </div>

          {error   && <p className="text-red-400 text-sm bg-red-900/20 rounded-lg p-3">{error}</p>}
          {success && <p className="text-green-400 text-sm bg-green-900/20 rounded-lg p-3">{success}</p>}
        </div>
      </div>
    </div>
  );
}
