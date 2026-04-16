import React from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Mail, 
  Smartphone,
  ChevronRight
} from 'lucide-react';

export default function Settings() {
  const sections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile Information', description: 'Update your name, email and avatar' },
        { icon: Shield, label: 'Security', description: 'Manage your password and 2FA' },
      ]
    },
    {
      title: 'Notifications',
      items: [
        { icon: Mail, label: 'Email Notifications', description: 'Choose which events trigger an email' },
        { icon: Smartphone, label: 'Telegram Integration', description: 'Connect your Telegram account for instant alerts' },
      ]
    },
    {
      title: 'Billing',
      items: [
        { icon: CreditCard, label: 'Subscription Plan', description: 'You are currently on the Pro plan' },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your account preferences and notification settings.</p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider px-2">{section.title}</h2>
            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm backdrop-blur-xl">
              {section.items.map((item, i) => (
                <button 
                  key={item.label}
                  className={`w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors ${
                    i !== section.items.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white/5 rounded-xl border border-border text-text-secondary group-hover:text-white">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{item.label}</p>
                      <p className="text-sm text-text-secondary">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-secondary" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/20 flex items-center justify-between backdrop-blur-xl">
        <div>
          <h3 className="font-bold text-red-500">Danger Zone</h3>
          <p className="text-sm text-red-400">Permanently delete your account and all associated data.</p>
        </div>
        <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
          Delete Account
        </button>
      </div>
    </div>
  );
}
