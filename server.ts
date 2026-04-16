import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.post('/api/fetch-metadata', async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      const metadata = {
        url,
        status: response.status,
        title: $('title').text() || '',
        description: $('meta[name="description"]').attr('content') || '',
        h1: $('h1').first().text() || '',
        canonical: $('link[rel="canonical"]').attr('href') || '',
        robots: $('meta[name="robots"]').attr('content') || '',
        h2s: $('h2').map((i, el) => $(el).text()).get(),
        textLength: $('body').text().replace(/\s+/g, ' ').length,
        linksCount: $('a').length,
        imagesCount: $('img').length,
        formsCount: $('form').length,
        timestamp: new Date().toISOString(),
        htmlHash: Buffer.from(response.data).toString('base64').substring(0, 100) // Simple hash for demo
      };

      res.json(metadata);
    } catch (error: any) {
      console.error('Error fetching URL:', error.message);
      res.status(500).json({ error: 'Failed to fetch URL', details: error.message });
    }
  });

  app.post('/api/crawl', async (req, res) => {
    const { url, depth = 1, maxPages = 10 } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      const baseUrl = new URL(url);
      const visited = new Set<string>();
      const queue = [{ url, currentDepth: 0 }];
      const results: string[] = [];

      while (queue.length > 0 && results.length < maxPages) {
        const { url: currentUrl, currentDepth } = queue.shift()!;
        
        if (visited.has(currentUrl)) continue;
        visited.add(currentUrl);
        results.push(currentUrl);

        if (currentDepth < depth) {
          try {
            const response = await axios.get(currentUrl, { timeout: 5000 });
            const $ = cheerio.load(response.data);
            
            $('a').each((i, el) => {
              const href = $(el).attr('href');
              if (href) {
                try {
                  const absoluteUrl = new URL(href, currentUrl).href;
                  const parsedAbsolute = new URL(absoluteUrl);
                  
                  if (parsedAbsolute.hostname === baseUrl.hostname && !visited.has(absoluteUrl)) {
                    queue.push({ url: absoluteUrl, currentDepth: currentDepth + 1 });
                  }
                } catch (e) {
                  // Ignore invalid URLs
                }
              }
            });
          } catch (e) {
            console.error(`Failed to crawl ${currentUrl}`);
          }
        }
      }

      res.json({ urls: results });
    } catch (error: any) {
      res.status(500).json({ error: 'Crawling failed', details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
