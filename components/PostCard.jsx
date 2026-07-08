'use client';

const STATUS_STYLES = {
  new:     'bg-blue-500/20 text-blue-300 border-blue-500/40',
  replied: 'bg-green-500/20 text-green-300 border-green-500/40',
  ignored: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
};

const CATEGORY_DOT = {
  brand:        'bg-purple-500',
  market:       'bg-blue-400',
  notification: 'bg-yellow-500',
};

function timeAgo(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60)   return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff/60)}m ago`;
  if (diff < 86400)return `${Math.round(diff/3600)}h ago`;
  return `${Math.round(diff/86400)}d ago`;
}

export default function PostCard({ post, onClick }) {
  const statusStyle = STATUS_STYLES[post.status] || STATUS_STYLES.new;
  const dot = CATEGORY_DOT[post.category] || 'bg-gray-500';

  return (
    <div
      onClick={() => onClick(post)}
      className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer
                 hover:border-purple-500/50 hover:bg-gray-800/80 transition-all group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${dot}`} />
          <span className="font-medium text-sm text-purple-300 truncate">@{post.author}</span>
          <span className="text-xs text-gray-500 truncate hidden sm:block">{post.keyword}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusStyle}`}>
            {post.status}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-200 line-clamp-3 mb-3 leading-relaxed">
        {post.text || <span className="text-gray-500 italic">no text</span>}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span>♥ {post.likes || 0}</span>
          <span>💬 {post.replies_count || 0}</span>
        </div>
        <span>{timeAgo(post.found_at)}</span>
      </div>

      {post.reply_text && (
        <div className="mt-2 pt-2 border-t border-gray-800 text-xs text-green-400">
          Replied: {post.reply_text.slice(0, 80)}
        </div>
      )}
    </div>
  );
}
