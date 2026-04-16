export type Criticality = 'Critical' | 'High' | 'Medium' | 'Low';

export interface PageMetadata {
  url: string;
  status: number;
  title: string;
  description: string;
  h1: string;
  canonical: string;
  robots: string;
  h2s: string[];
  textLength: number;
  linksCount: number;
  imagesCount: number;
  formsCount: number;
  timestamp: string;
  htmlHash: string;
}

export interface Project {
  id: string;
  name: string;
  domain: string;
  urls: string[];
  checkFrequency: 'hourly' | 'daily' | 'weekly';
  lastChecked?: string;
  createdAt: string;
  userId: string;
}

export interface PageSnapshot {
  id: string;
  projectId: string;
  url: string;
  metadata: PageMetadata;
  isBaseline: boolean;
  createdAt: string;
}

export interface ChangeEvent {
  id: string;
  projectId: string;
  url: string;
  type: 'SEO' | 'Content' | 'Structure' | 'Links' | 'Images' | 'Status';
  field: string;
  oldValue: any;
  newValue: any;
  criticality: Criticality;
  timestamp: string;
  isViewed: boolean;
}
