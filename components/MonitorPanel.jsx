'use client';
import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';

export default function MonitorPanel({ onNewData }) {
  const [runs, setRuns]       = useState([]);
  const [log, setLog]         = useState([]);
  const [running, setRunning] = useState(false);
  const [error, setError]     = useState('');
  const logRef                = useRef(null);

  const fetchStatus = async () => {
    try {
      const data = await api.getRuns();
      setRuns(data.runs || []);
      setRunning(data.running);
      setLog(data.log || []);
    } catch {}
  };

  useEffect(() => {
    fetchStatus();
    const iv = setInterval(() => {
      fetchStatus();
      if (running) onNewData?.();
    }, 5000);
    return () => clearInterval(iv);
  }, [running]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const triggerRun = async () => {
    setError('');
    try {
      await api.triggerRun();
      setRunning(true);
    } catch (e) {
      setError(e.message);
    }
  };

  const lastRun = runs[0];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-200">Monitor</h2>
        <button
          onClick={triggerRun}
          disabled={running}
          className="px-4 py-2 text-sm font-medium rounded-xl transition
                     bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white">
          {running ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Running...
            </span>
          ) : 'Run now'}
        </button>
      </div>

      {lastRun && (
        <div className="text-xs text-gray-500 space-y-0.5">
          <p>Last run: <span className="text-gray-300">
            {new Date(lastRun.started_at).toLocaleString('ru-RU')}
          </span></p>
          <p>Status: <span className={lastRun.status === 'done' ? 'text-green-400' : 'text-yellow-400'}>
            {lastRun.status}
          </span> · New: <span className="text-purple-300">{lastRun.new_count}</span>
          · Checked: {lastRun.total_checked}</p>
        </div>
      )}

      {(running || log.length > 0) && (
        <div
          ref={logRef}
          className="bg-gray-950 rounded-lg p-3 h-32 overflow-y-auto font-mono text-xs text-gray-400 space-y-0.5">
          {log.map((l, i) => (
            <p key={i} className={l.msg.includes('ERROR') || l.msg.includes('FATAL') ? 'text-red-400' :
              l.msg.includes('NEW') ? 'text-green-400' : ''}>
              {l.msg}
            </p>
          ))}
          {running && <p className="text-purple-400 animate-pulse">...</p>}
        </div>
      )}

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {runs.length > 1 && (
        <div className="text-xs text-gray-600">
          <p className="mb-1 font-medium text-gray-500">Recent runs</p>
          {runs.slice(0, 5).map(r => (
            <div key={r.id} className="flex justify-between py-0.5">
              <span>{new Date(r.started_at).toLocaleString('ru-RU', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
              <span className={r.status === 'done' ? 'text-green-500' : r.status === 'error' ? 'text-red-500' : 'text-yellow-500'}>
                {r.status} +{r.new_count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
