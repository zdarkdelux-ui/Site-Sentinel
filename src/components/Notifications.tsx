import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { motion } from 'motion/react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db, collection, query, where, orderBy, limit, onSnapshot, updateDoc, doc, handleFirestoreError, OperationType } from '../firebase';
import { ChangeEvent } from '../types';

export default function Notifications() {
  const { user } = useFirebase();
  const [notifications, setNotifications] = useState<ChangeEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'changes'),
      where('userId', '==', user.uid),
      where('isViewed', '==', false),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const changesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChangeEvent));
      setNotifications(changesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'changes');
    });

    return () => unsubscribe();
  }, [user]);

  const markAllAsRead = async () => {
    try {
      const promises = notifications.map(notif => 
        updateDoc(doc(db, 'changes', notif.id!), { isViewed: true })
      );
      await Promise.all(promises);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'changes');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-text-secondary mt-1">Stay updated with the latest changes and alerts.</p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="text-sm font-semibold text-accent hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((notif, i) => (
          <motion.div 
            key={notif.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 rounded-2xl border transition-all hover:shadow-md cursor-pointer group bg-surface border-border shadow-sm backdrop-blur-xl`}
          >
            <div className="flex gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                notif.criticality === 'Critical' ? 'bg-red-500/10 text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)]' :
                notif.criticality === 'High' ? 'bg-orange-500/10 text-orange-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]' :
                'bg-blue-500/10 text-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.2)]'
              }`}>
                {notif.criticality === 'Critical' ? <AlertTriangle className="w-6 h-6" /> :
                 notif.criticality === 'High' ? <Info className="w-6 h-6" /> :
                 <Clock className="w-6 h-6" />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className={`font-bold text-white`}>
                    {notif.field} changed on {notif.url}
                  </h3>
                  <button className="p-1 hover:bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4 text-text-secondary" />
                  </button>
                </div>
                <p className="text-text-secondary text-sm mt-1">{notif.type} change detected. Old value: {JSON.stringify(notif.oldValue)}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-text-secondary">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(notif.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="w-2.5 h-2.5 bg-accent rounded-full mt-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            </div>
          </motion.div>
        ))}
        {notifications.length === 0 && (
          <div className="p-12 text-center text-text-secondary bg-surface rounded-3xl border border-border backdrop-blur-xl">
            No new notifications.
          </div>
        )}
      </div>
    </div>
  );
}
