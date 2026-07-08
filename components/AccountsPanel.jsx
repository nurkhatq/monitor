'use client';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function AccountsPanel() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm]         = useState({ username: '', password: '' });
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState('');

  const load = async () => {
    try { setAccounts(await api.getAccounts()); } catch {}
  };
  useEffect(() => { load(); }, []);

  const addAccount = async () => {
    if (!form.username || !form.password) return;
    setLoading(true);
    try {
      await fetch('/api/proxy/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ username: '', password: '' });
      setMsg('Account saved');
      await load();
    } catch (e) { setMsg(e.message); }
    setLoading(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const forceLogin = async (username) => {
    setLoading(true);
    setMsg(`Logging in @${username}...`);
    try {
      const r = await fetch(`/api/proxy/accounts/${username}/login`, { method: 'POST' });
      const d = await r.json();
      if (d.ok) setMsg(`@${username} logged in!`);
      else setMsg(d.error);
      await load();
    } catch (e) { setMsg(e.message); }
    setLoading(false);
    setTimeout(() => setMsg(''), 4000);
  };

  const refreshAll = async () => {
    setLoading(true);
    setMsg('Refreshing stale cookies...');
    try {
      const r = await fetch('/api/proxy/accounts/refresh-all', { method: 'POST' });
      const d = await r.json();
      setMsg(`Refreshed: ${d.refreshed}`);
      await load();
    } catch (e) { setMsg(e.message); }
    setLoading(false);
    setTimeout(() => setMsg(''), 3000);
  };

  function fmtAge(ms) {
    if (!isFinite(ms)) return 'no cookies';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m ago` : `${m}m ago`;
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">Accounts</h3>
        <button onClick={refreshAll} disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition disabled:opacity-50">
          Refresh stale
        </button>
      </div>

      {accounts.map(acc => (
        <div key={acc.username} className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-200">@{acc.username}</p>
            <p className={`text-xs ${acc.cookieOk ? 'text-green-400' : 'text-red-400'}`}>
              {acc.cookieOk ? '● ' : '○ '}{fmtAge(acc.cookieAge)}
            </p>
          </div>
          <button onClick={() => forceLogin(acc.username)} disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 transition disabled:opacity-50">
            Re-login
          </button>
        </div>
      ))}

      {/* Add account form */}
      <div className="space-y-2 pt-2 border-t border-gray-800">
        <p className="text-xs text-gray-500 font-medium">Add account</p>
        <input
          placeholder="username"
          value={form.username}
          onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-200
                     placeholder-gray-600 focus:outline-none focus:border-purple-500"
        />
        <input
          placeholder="password"
          type="password"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-200
                     placeholder-gray-600 focus:outline-none focus:border-purple-500"
        />
        <button onClick={addAccount} disabled={loading || !form.username || !form.password}
          className="w-full py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs
                     disabled:opacity-40 transition">
          Add & login
        </button>
      </div>

      {msg && <p className="text-xs text-center text-yellow-400">{msg}</p>}
    </div>
  );
}
