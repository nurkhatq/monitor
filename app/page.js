'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import StatCard     from '../components/StatCard';
import PostCard     from '../components/PostCard';
import PostModal    from '../components/PostModal';
import MonitorPanel from '../components/MonitorPanel';

const STATUSES = ['', 'new', 'replied', 'ignored'];

export default function Dashboard() {
  const [stats,    setStats]    = useState(null);
  const [posts,    setPosts]    = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [filters,  setFilters]  = useState({ status: '', keyword: '', category: '', q: '' });
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(false);

  const loadStats = useCallback(async () => {
    try { setStats(await api.getStats()); } catch {}
  }, []);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getPosts({ ...filters, page, limit: 24 });
      setPosts(data.posts || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  }, [filters, page]);

  useEffect(() => { loadStats(); loadPosts(); }, [loadStats, loadPosts]);

  const handleFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }));
    setPage(1);
  };

  const handleNewData = () => { loadStats(); loadPosts(); };

  const statusCounts = {};
  stats?.byStatus?.forEach(s => { statusCounts[s.status] = s.c; });

  const keywords = stats?.keywords || [];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">N</div>
            <div>
              <h1 className="font-bold text-white leading-none">NOVAMANYA</h1>
              <p className="text-xs text-gray-500">Threads Monitor</p>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            {total} posts total
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total posts"   value={stats?.total}      color="purple" />
          <StatCard label="Today"         value={stats?.todayCount} color="blue" />
          <StatCard label="New"           value={statusCounts['new']}     color="yellow" />
          <StatCard label="Replied"       value={statusCounts['replied']} color="green" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <MonitorPanel onNewData={handleNewData} />

            {/* Keyword filter */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Keywords</h3>
              <div className="space-y-1">
                <button
                  onClick={() => handleFilter('keyword', '')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition
                    ${!filters.keyword ? 'bg-purple-600/20 text-purple-300' : 'text-gray-400 hover:bg-gray-800'}`}>
                  All keywords
                </button>
                {(stats?.byKeyword || []).map(kw => (
                  <button
                    key={kw.keyword}
                    onClick={() => handleFilter('keyword', kw.keyword)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex justify-between items-center
                      ${filters.keyword === kw.keyword ? 'bg-purple-600/20 text-purple-300' : 'text-gray-400 hover:bg-gray-800'}`}>
                    <span className="truncate">{kw.keyword}</span>
                    <span className="text-xs ml-2 opacity-60 flex-shrink-0">{kw.c}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Status filter */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Status</h3>
              <div className="space-y-1">
                {STATUSES.map(s => (
                  <button
                    key={s || 'all'}
                    onClick={() => handleFilter('status', s)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition capitalize flex justify-between
                      ${filters.status === s ? 'bg-purple-600/20 text-purple-300' : 'text-gray-400 hover:bg-gray-800'}`}>
                    <span>{s || 'All'}</span>
                    <span className="text-xs opacity-60">{s ? (statusCounts[s] || 0) : stats?.total}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search bar */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by text or author..."
                value={filters.q}
                onChange={e => handleFilter('q', e.target.value)}
                className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm
                           text-gray-100 placeholder-gray-600 focus:outline-none focus:border-purple-500 transition"
              />
              <select
                value={filters.category}
                onChange={e => handleFilter('category', e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-gray-300
                           focus:outline-none focus:border-purple-500 transition">
                <option value="">All types</option>
                <option value="brand">Brand</option>
                <option value="market">Market</option>
                <option value="notification">Notification</option>
              </select>
            </div>

            {/* Posts grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse h-32" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <p className="text-4xl mb-3">📭</p>
                <p>No posts found</p>
                <p className="text-sm mt-1">Try running the monitor or adjusting filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {posts.map(post => (
                  <PostCard key={post.id} post={post} onClick={setSelected} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {total > 24 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-sm disabled:opacity-40 hover:bg-gray-700 transition">
                  ← Prev
                </button>
                <span className="text-sm text-gray-500">
                  Page {page} of {Math.ceil(total / 24)}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * 24 >= total}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-sm disabled:opacity-40 hover:bg-gray-700 transition">
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post modal */}
      {selected && (
        <PostModal
          post={selected}
          onClose={() => setSelected(null)}
          onUpdate={() => { loadPosts(); setSelected(null); }}
        />
      )}
    </div>
  );
}
