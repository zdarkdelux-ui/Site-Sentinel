import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Search, 
  ArrowRight, 
  AlertCircle,
  Clock,
  ChevronRight,
  Eye
} from 'lucide-react';
import { MOCK_CHANGES } from '../mockData';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { useFirebase } from '../contexts/FirebaseContext';
import { db, collection, query, where, orderBy, onSnapshot, handleFirestoreError, OperationType } from '../firebase';
import { ChangeEvent } from '../types';

export default function History() {
  const { user } = useFirebase();
  const [changes, setChanges] = useState<ChangeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'changes'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const changesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChangeEvent));
      setChanges(changesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'changes');
    });

    return () => unsubscribe();
  }, [user]);

  const filteredChanges = filter === 'All' 
    ? changes 
    : changes.filter(c => c.criticality === filter);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Change History</h1>
          <p className="text-text-secondary mt-1">A complete log of all detected changes across your projects.</p>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden backdrop-blur-xl">
        {/* Filters Bar */}
        <div className="p-4 border-b border-border bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-secondary" />
            <div className="flex gap-1">
              {['All', 'Critical', 'High', 'Medium', 'Low'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                    filter === f 
                      ? 'bg-white text-black border-white' 
                      : 'bg-white/5 border-white/10 text-text-secondary hover:border-white/20'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Filter by URL or field..." 
              className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:ring-2 focus:ring-accent/20 outline-none text-white placeholder:text-text-secondary"
            />
          </div>
        </div>

        {/* Changes Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-xs font-bold text-text-secondary uppercase tracking-wider">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Page / Field</th>
                <th className="px-6 py-4">Change</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredChanges.map((change, i) => (
                <motion.tr 
                  key={change.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className={`status-pill ${
                      change.criticality === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 
                      change.criticality === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                    }`}>
                      {change.criticality}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-white">{change.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm font-bold truncate text-white">{change.url}</p>
                      <p className="text-xs text-text-secondary">{change.field}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-text-secondary line-through truncate max-w-[100px]">{String(change.oldValue)}</span>
                      <ArrowRight className="w-3 h-3 text-text-secondary shrink-0" />
                      <span className="font-medium text-white truncate max-w-[100px]">{String(change.newValue)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{format(new Date(change.timestamp), 'MMM dd, yyyy')}</span>
                      <span className="text-xs text-text-secondary">{format(new Date(change.timestamp), 'HH:mm')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white hover:text-black rounded-lg transition-all text-text-secondary">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredChanges.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-text-secondary" />
            </div>
            <h3 className="text-lg font-bold text-white">No changes found</h3>
            <p className="text-text-secondary">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
