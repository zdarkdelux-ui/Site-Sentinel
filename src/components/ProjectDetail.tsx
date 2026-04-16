import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Globe, 
  Settings, 
  RefreshCw, 
  Plus,
  Search,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { MOCK_PROJECTS, MOCK_CHANGES } from '../mockData';
import { motion } from 'motion/react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db, doc, onSnapshot, collection, query, where, orderBy, handleFirestoreError, OperationType } from '../firebase';
import { Project, ChangeEvent } from '../types';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useFirebase();
  const [project, setProject] = useState<Project | null>(null);
  const [changes, setChanges] = useState<ChangeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pages');

  useEffect(() => {
    if (!id || !user) return;

    const projectRef = doc(db, 'projects', id);
    const unsubscribeProject = onSnapshot(projectRef, (doc) => {
      if (doc.exists()) {
        setProject({ id: doc.id, ...doc.data() } as Project);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `projects/${id}`);
    });

    const changesQuery = query(
      collection(db, 'changes'),
      where('projectId', '==', id),
      orderBy('timestamp', 'desc')
    );

    const unsubscribeChanges = onSnapshot(changesQuery, (snapshot) => {
      const changesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChangeEvent));
      setChanges(changesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'changes');
    });

    return () => {
      unsubscribeProject();
      unsubscribeChanges();
    };
  }, [id, user]);

  if (loading) return <div className="p-12 text-center">Loading project...</div>;
  if (!project) return <div className="p-12 text-center">Project not found</div>;

  const projectChanges = changes;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/projects" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">{project.name}</h1>
            <span className="status-pill bg-ok/20 text-ok border border-ok/20">Healthy</span>
          </div>
          <p className="text-text-secondary flex items-center gap-1 mt-1">
            {project.domain} <ExternalLink className="w-3 h-3" />
          </p>
        </div>
        <div className="flex gap-3">
          <button className="p-2 bg-white/5 border border-border rounded-lg hover:bg-white/10 transition-colors">
            <Settings className="w-5 h-5 text-text-secondary" />
          </button>
          <button className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors flex items-center gap-2 shadow-lg shadow-white/5">
            <RefreshCw className="w-4 h-4" /> Run Scan
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {['Pages', 'History', 'Settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-sm font-bold transition-all relative ${
              activeTab === tab ? 'text-white' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
              />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'Pages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Monitored Pages</h2>
            <button className="text-sm font-bold text-accent flex items-center gap-1 hover:underline">
              <Plus className="w-4 h-4" /> Add Pages
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {project.urls.map((url) => (
              <div key={url} className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between group hover:border-white/20 transition-all backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-border">
                    <Globe className="w-5 h-5 text-text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{url}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-text-secondary flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Last check: 2h ago
                      </span>
                      <span className="text-xs text-ok font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> No changes
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-text-secondary uppercase">Status</p>
                    <p className="text-sm font-bold text-ok">200 OK</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-white transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'History' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Project History</h2>
          <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm backdrop-blur-xl">
            {projectChanges.length > 0 ? (
              projectChanges.map((change) => (
                <div key={change.id} className="p-4 border-b border-border last:border-0 flex items-center gap-4 hover:bg-white/5 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    change.criticality === 'Critical' ? 'bg-red-500/10 text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)]' : 'bg-blue-500/10 text-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.2)]'
                  }`}>
                    {change.criticality === 'Critical' ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{change.field} changed on {change.url}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{change.type} • {new Date(change.timestamp).toLocaleString()}</p>
                  </div>
                  <button className="text-xs font-bold text-accent hover:underline">View Diff</button>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-text-secondary">No history found for this project.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
