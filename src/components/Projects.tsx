import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  ExternalLink, 
  RefreshCw,
  Trash2,
  Edit2,
  Globe, 
  Clock, 
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

import { crawlSite } from '../services/api';
import { useFirebase } from '../contexts/FirebaseContext';
import { db, collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, doc, handleFirestoreError, OperationType, Timestamp } from '../firebase';
import { Project } from '../types';

export default function Projects() {
  const { user } = useFirebase();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlUrl, setCrawlUrl] = useState('');
  const [crawlResults, setCrawlResults] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // New Project Form State
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDomain, setNewProjectDomain] = useState('');
  const [newProjectFrequency, setNewProjectFrequency] = useState('daily');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'projects'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });

    return () => unsubscribe();
  }, [user]);

  const handleCrawl = async () => {
    if (!crawlUrl) return;
    setIsCrawling(true);
    try {
      const urls = await crawlSite(crawlUrl);
      setCrawlResults(urls);
      if (!newProjectDomain) setNewProjectDomain(crawlUrl);
    } catch (error) {
      alert('Crawling failed');
    } finally {
      setIsCrawling(false);
    }
  };

  const handleCreateProject = async () => {
    if (!user || !newProjectName || !newProjectDomain) return;

    try {
      await addDoc(collection(db, 'projects'), {
        name: newProjectName,
        domain: newProjectDomain,
        urls: crawlResults.length > 0 ? crawlResults : [newProjectDomain],
        checkFrequency: newProjectFrequency,
        createdAt: Timestamp.now(),
        userId: user.uid,
        lastChecked: null
      });
      setIsModalOpen(false);
      setNewProjectName('');
      setNewProjectDomain('');
      setCrawlUrl('');
      setCrawlResults([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'projects');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-text-secondary mt-1">Manage your monitored websites and tracking settings.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors shadow-lg shadow-white/10 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, i) => (
          <motion.div 
            key={project.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all group backdrop-blur-xl"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-border">
                  <Globe className="w-6 h-6 text-text-secondary" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-white/5 rounded-lg text-text-secondary"><Edit2 className="w-4 h-4" /></button>
                  <button 
                    onClick={() => project.id && handleDeleteProject(project.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-1 text-white">{project.name}</h3>
              <a 
                href={`https://${project.domain}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline flex items-center gap-1 mb-4"
              >
                {project.domain} <ExternalLink className="w-3 h-3" />
              </a>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-border mb-4">
                <div>
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Pages</p>
                  <p className="text-lg font-bold text-white">{project.urls.length}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Frequency</p>
                  <p className="text-lg font-bold capitalize text-white">{project.checkFrequency}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Clock className="w-3 h-3" />
                  <span>Last checked: {project.lastChecked ? new Date(project.lastChecked).toLocaleDateString() : 'Never'}</span>
                </div>
                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                  <RefreshCw className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-3 bg-white/5 border-t border-border flex items-center justify-between">
              <span className="text-xs font-medium text-ok flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Healthy
              </span>
              <Link to={`/projects/${project.id}`} className="text-xs font-bold text-white hover:text-accent transition-colors">View Details</Link>
            </div>
          </motion.div>
        ))}
        {projects.length === 0 && !loading && (
          <div className="col-span-full p-12 text-center bg-white/5 rounded-3xl border-2 border-dashed border-border backdrop-blur-xl">
            <Globe className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">No projects yet</h3>
            <p className="text-text-secondary mb-6">Start by adding your first website to monitor.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-white/90 transition-all"
            >
              Add Project
            </button>
          </div>
        )}
      </div>

      {/* Add Project Modal (Simplified) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-surface border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl"
            >
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-2 text-white">Add New Project</h2>
                <p className="text-text-secondary mb-6">Enter the website details to start monitoring.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-text-secondary">Project Name</label>
                    <input 
                      type="text" 
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="e.g. My E-commerce Site"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-text-secondary focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-text-secondary">Domain URL</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={crawlUrl}
                        onChange={(e) => setCrawlUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-text-secondary focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                      />
                      <button 
                        onClick={handleCrawl}
                        disabled={isCrawling}
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                      >
                        {isCrawling ? '...' : 'Crawl'}
                      </button>
                    </div>
                  </div>

                  {crawlResults.length > 0 && (
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 max-h-40 overflow-y-auto">
                      <p className="text-xs font-bold text-text-secondary uppercase mb-2">Found {crawlResults.length} URLs</p>
                      <div className="space-y-1">
                        {crawlResults.map((url) => (
                          <div key={url} className="flex items-center gap-2 text-xs truncate text-text-secondary">
                            <input type="checkbox" defaultChecked className="rounded border-white/10 bg-white/5" />
                            <span>{url}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1.5 text-text-secondary">Frequency</label>
                      <select 
                        value={newProjectFrequency}
                        onChange={(e) => setNewProjectFrequency(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-accent/20 outline-none transition-all appearance-none"
                      >
                        <option value="hourly" className="bg-[#09090b]">Hourly</option>
                        <option value="daily" className="bg-[#09090b]">Daily</option>
                        <option value="weekly" className="bg-[#09090b]">Weekly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5 text-text-secondary">Scan Mode</label>
                      <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-accent/20 outline-none transition-all appearance-none">
                        <option className="bg-[#09090b]">Manual URLs</option>
                        <option className="bg-[#09090b]">Auto Crawl</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateProject}
                    disabled={!newProjectName || (!newProjectDomain && crawlResults.length === 0)}
                    className="flex-1 px-4 py-3 bg-white text-black rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-lg shadow-white/10 disabled:opacity-50"
                  >
                    Create Project
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
