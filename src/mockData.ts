import { Project, ChangeEvent } from './types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Main Website',
    domain: 'example.com',
    urls: ['https://example.com', 'https://example.com/about'],
    checkFrequency: 'hourly',
    lastChecked: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    userId: 'user1',
  },
  {
    id: '2',
    name: 'Client Blog',
    domain: 'blog.client.com',
    urls: ['https://blog.client.com'],
    checkFrequency: 'daily',
    lastChecked: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    userId: 'user1',
  }
];

export const MOCK_CHANGES: ChangeEvent[] = [
  {
    id: 'c1',
    projectId: '1',
    url: 'https://example.com',
    type: 'SEO',
    field: 'Title',
    oldValue: 'Welcome to Example',
    newValue: 'Example - Home',
    criticality: 'High',
    timestamp: new Date().toISOString(),
    isViewed: false,
  },
  {
    id: 'c2',
    projectId: '1',
    url: 'https://example.com',
    type: 'Status',
    field: 'HTTP Status',
    oldValue: 200,
    newValue: 404,
    criticality: 'Critical',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isViewed: false,
  }
];
