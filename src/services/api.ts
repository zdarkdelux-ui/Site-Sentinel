import axios from 'axios';
import { PageMetadata } from '../types';

const API_BASE = '/api';

export const fetchMetadata = async (url: string): Promise<PageMetadata> => {
  const response = await axios.post(`${API_BASE}/fetch-metadata`, { url });
  return response.data;
};

export const crawlSite = async (url: string, depth = 1, maxPages = 10): Promise<string[]> => {
  const response = await axios.post(`${API_BASE}/crawl`, { url, depth, maxPages });
  return response.data.urls;
};
