'use client';

export default function StatCard({ label, value, sub, color = 'purple' }) {
  const colors = {
    purple: 'from-purple-600/20 to-purple-800/10 border-purple-500/30 text-purple-300',
    green:  'from-green-600/20 to-green-800/10 border-green-500/30 text-green-300',
    yellow: 'from-yellow-600/20 to-yellow-800/10 border-yellow-500/30 text-yellow-300',
    blue:   'from-blue-600/20 to-blue-800/10 border-blue-500/30 text-blue-300',
    red:    'from-red-600/20 to-red-800/10 border-red-500/30 text-red-300',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4`}>
      <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-white">{value ?? '—'}</p>
      {sub && <p className="text-xs mt-1 opacity-70">{sub}</p>}
    </div>
  );
}
