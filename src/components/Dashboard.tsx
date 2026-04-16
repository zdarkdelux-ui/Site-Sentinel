import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  TrendingUp,
  Globe,
  Activity,
  Plus
} from 'lucide-react';
import { MOCK_PROJECTS, MOCK_CHANGES } from '../mockData';
import { motion } from 'motion/react';

import { fetchMetadata } from '../services/api';
import { useFirebase } from '../contexts/FirebaseContext';
import { db, collection, query, where, orderBy, limit, onSnapshot, handleFirestoreError, OperationType } from '../firebase';
import { Project, ChangeEvent } from '../types';

export default function Dashboard() {
  const { user } = useFirebase();
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanResult, setScanResult] = React.useState<any>(null);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [changes, setChanges] = React.useState<ChangeEvent[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    const projectsQuery = query(
      collection(db, 'projects'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });

    const changesQuery = query(
      collection(db, 'changes'),
      where('userId', '==', user.uid),
      where('isViewed', '==', false),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    // Note: This query might need a composite index if we filter by projectId too.
    // For now, we'll just get the latest unviewed changes.
    const unsubscribeChanges = onSnapshot(changesQuery, (snapshot) => {
      const changesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChangeEvent));
      setChanges(changesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'changes');
    });

    return () => {
      unsubscribeProjects();
      unsubscribeChanges();
    };
  }, [user]);

  const handleQuickScan = async () => {
    const url = prompt('Enter URL to scan:');
    if (!url) return;
    
    setIsScanning(true);
    try {
      const data = await fetchMetadata(url);
      setScanResult(data);
    } catch (error) {
      alert('Failed to scan URL');
    } finally {
      setIsScanning(false);
    }
  };

  const criticalChanges = changes.filter(c => c.criticality === 'Critical');
  
  const stats = [
    { label: 'Active Projects', value: projects.length, icon: Globe, color: 'text-blue-600' },
    { label: 'URLs Monitored', value: projects.reduce((acc, p) => acc + p.urls.length, 0), icon: Activity, color: 'text-purple-600' },
    { label: 'Unread Changes', value: changes.length, icon: TrendingUp, color: 'text-orange-600' },
    { label: 'Critical Issues', value: criticalChanges.length, icon: AlertTriangle, color: 'text-red-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-text-secondary mt-1">Overview of your monitored sites and recent changes.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors text-white">
            Export Report
          </button>
          <button 
            onClick={handleQuickScan}
            disabled={isScanning}
            className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors shadow-lg shadow-white/10 disabled:opacity-50"
          >
            {isScanning ? 'Scanning...' : 'Quick Scan'}
          </button>
        </div>
      </div>

      {/* Scan Result */}
      {scanResult && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4">
            <button onClick={() => setScanResult(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Plus className="w-6 h-6 rotate-45" />
            </button>
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-ok" /> Scan Result: {scanResult.url}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Title</p>
                <p className="text-sm font-medium truncate">{scanResult.title}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Status</p>
                <p className="text-sm font-medium">{scanResult.status}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Links</p>
                <p className="text-sm font-medium">{scanResult.linksCount}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Images</p>
                <p className="text-sm font-medium">{scanResult.imagesCount}</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface p-6 rounded-2xl border border-border shadow-sm backdrop-blur-xl"
          >
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-ok flex items-center gap-1">
                +12% <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1 text-white">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Changes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Changes</h2>
            <button className="text-sm font-medium text-accent hover:underline">View all</button>
          </div>
          <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm backdrop-blur-xl">
            {changes.length > 0 ? (
              changes.map((change, i) => (
                <div key={change.id} className="data-row p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    change.criticality === 'Critical' ? 'bg-red-500/10 text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)]' : 
                    change.criticality === 'High' ? 'bg-orange-500/10 text-orange-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]' : 'bg-blue-500/10 text-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.2)]'
                  }`}>
                    {change.criticality === 'Critical' ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate text-white">{change.url}</span>
                      <span className={`status-pill ${
                        change.criticality === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 
                        change.criticality === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                      }`}>
                        {change.criticality}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mt-0.5">
                      {change.type}: <span className="font-medium text-white">{change.field}</span> changed
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-text-secondary">
                      {new Date(change.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <button className="text-xs font-semibold text-accent mt-1 hover:underline">Details</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-text-secondary">No recent changes detected.</div>
            )}
          </div>
        </div>

        {/* Projects Summary */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Projects</h2>
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="bg-surface p-4 rounded-2xl border border-border shadow-sm hover:border-white/20 transition-all cursor-pointer group backdrop-blur-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-white group-hover:text-accent transition-colors">{project.name}</h3>
                  <CheckCircle2 className="w-4 h-4 text-ok" />
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>{project.urls.length} Pages</span>
                  <span>Checked {project.lastChecked ? new Date(project.lastChecked).toLocaleDateString() : 'Never'}</span>
                </div>
                <div className="mt-3 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-ok h-full w-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
