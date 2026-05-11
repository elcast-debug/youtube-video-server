

amiable-communication

production



Agent






















Node.js Video Downloader for VRChat with Docker


Agent is now billable.
Usage counts toward your workspace spend. Learn more →

i need app in node js for get video in 1080p with audio, you will use domain/ytvideoid and this will serve you video file for stream in AVPro in vrchat, i need this for railway.com, maybe use docker and permanent volume for store videos.

I'll help you build a Node.js app that downloads YouTube videos in 1080p with audio and serves them for streaming in VRChat via AVPro. Let me set this up on Railway with Docker and persistent storage.

Staged service: youtube-video-server

Create "youtube-video-server"
Deployed
Great! Now I'll create the Node.js application code. This will use yt-dlp (via Docker) to download videos and Express to serve them:

Staged function: youtube-video-server

Create "youtube-video-server"
Staged

Actually, let me create a proper Docker-based service instead, since you need yt-dlp installed. Let me update with a custom Dockerfile approach:

Discarded changes
Let me create a proper Node.js service with Docker that includes yt-dlp. I'll set up a GitHub repo approach or use a pre-built image. For now, here's the complete setup:

Staged service: youtube-video-server

Create "youtube-video-server"
Deployed
Perfect. Now you need to push code to a GitHub repo. Here's what you need:

Create a GitHub repo with these files:

package.json:

{
  "name": "youtube-video-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
server.js:

import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, createReadStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const VIDEOS_DIR = process.env.VIDEOS_DIR || '/app/videos';
const PORT = process.env.PORT || 3000;

if (!existsSync(VIDEOS_DIR)) {
  mkdirSync(VIDEOS_DIR, { recursive: true });
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/:videoId', async (req, res) => {
  const videoId = req.params.videoId;

  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return res.status(400).json({ error: 'Invalid video ID' });
  }

  const videoPath = path.join(VIDEOS_DIR, `${videoId}.mp4`);

  try {
    if (!existsSync(videoPath)) {
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      console.log(`Downloading: ${youtubeUrl}`);

      await execAsync(
        `yt-dlp -f "bestvideo[height<=1080]+bestaudio/best" -o "${videoPath}" "${youtubeUrl}"`,
        { timeout: 600000 }
      );
    }

    const stat = await import('fs').then(m => m.promises.stat(videoPath));
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
        'Content-Disposition': `inline; filename="${videoId}.mp4"`
      });
    } else {
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': 'video/mp4',
        'Content-Disposition': `inline; filename="${videoId}.mp4"`
      });
    }

    createReadStream(videoPath).pipe(res);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to process video' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
Dockerfile:

FROM node:20-alpine

RUN apk add --no-cache python3 ffmpeg curl && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod +x /usr/local/bin/yt-dlp

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
Usage:

Push to GitHub
Connect repo to Railway service
Access via: https://your-railway-domain.up.railway.app/dQw4w9WgXcQ (replace with actual YouTube video ID)
Videos cache in persistent volume for instant replay
The service will: ✅ Download 1080p + audio via yt-dlp
✅ Stream to AVPro in VRChat
✅ Support HTTP range requests (for seeking)
✅ Cache videos permanently
✅ Auto-serve from cache on repeat requests

Ready to deploy?

build failed

I need to check what went wrong. Let me look at the build logs.

Checked environment status

Hide result
4 of 10 services with issues
•
6 recent failures
youtube-video-server-jxWf
1
Offline
youtube-video-server
1
Offline
youtube-video-server-1Djs
1
Offline
peerflix-server
3
Offline
Let me check the build logs for the failed deployments:

Searched build logs: @level:error × 2

Hide result
No logs found

Hide result
No logs found
Let me get the full deployment info to see what the actual error is:

Diagnosed deployment × 2
I see the issues. The services I created don't have source code connected. Let me clean up and create a proper setup. You need to push code to GitHub first, then connect it to Railway.

Let me remove these broken services and give you the correct approach:

Staged service removal × 3

Remove service
Deployed

Remove service
Deployed

Remove service
Deployed
Now, here's what you need to do:

Step 1: Create a GitHub repo with these files
Create a new GitHub repository and add these files:

Dockerfile:

FROM node:20-alpine

RUN apk add --no-cache python3 ffmpeg curl && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod +x /usr/local/bin/yt-dlp

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
package.json:

{
  "name": "youtube-video-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
server.js:

import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, createReadStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const VIDEOS_DIR = process.env.VIDEOS_DIR || '/app/videos';
const PORT = process.env.PORT || 3000;

if (!existsSync(VIDEOS_DIR)) {
  mkdirSync(VIDEOS_DIR, { recursive: true });
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/:videoId', async (req, res) => {
  const videoId = req.params.videoId;

  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return res.status(400).json({ error: 'Invalid video ID' });
  }

  const videoPath = path.join(VIDEOS_DIR, `${videoId}.mp4`);

  try {
    if (!existsSync(videoPath)) {
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      console.log(`Downloading: ${youtubeUrl}`);

      await execAsync(
        `yt-dlp -f "bestvideo[height<=1080]+bestaudio/best" -o "${videoPath}" "${youtubeUrl}"`,
        { timeout: 600000 }
      );
    }

    const stat = await import('fs').then(m => m.promises.stat(videoPath));
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
        'Content-Disposition': `inline; filename="${videoId}.mp4"`
      });
    } else {
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': 'video/mp4',
        'Content-Disposition': `inline; filename="${videoId}.mp4"`
      });
    }

    createReadStream(videoPath).pipe(res);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to process video' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
Step 2: Push to GitHub
git init
git add .
git commit -m "Initial commit: YouTube video server"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/youtube-video-server.git
git push -u origin main
Step 3: Connect to Railway
Once pushed, tell me your GitHub repo URL and I'll connect it to Railway with the persistent volume.

Can you make repo on github?

I can't create a GitHub repository directly, but I can create the code and guide you through it quickly.

Fastest way (2 minutes):

Go to https://github.com/new
Name it: youtube-video-server
Click "Create repository"
Copy the files below into your repo
Or use this one-liner (if you have Git + GitHub CLI installed):

gh repo create youtube-video-server --public --source=. --remote=origin --push
Here are the 3 files to add:

File 1: Dockerfile

FROM node:20-alpine

RUN apk add --no-cache python3 ffmpeg curl && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod +x /usr/local/bin/yt-dlp

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
File 2: package.json

{
  "name": "youtube-video-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
File 3: server.js

import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, createReadStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const VIDEOS_DIR = process.env.VIDEOS_DIR || '/app/videos';
const PORT = process.env.PORT || 3000;

if (!existsSync(VIDEOS_DIR)) {
  mkdirSync(VIDEOS_DIR, { recursive: true });
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/:videoId', async (req, res) => {
  const videoId = req.params.videoId;

  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return res.status(400).json({ error: 'Invalid video ID' });
  }

  const videoPath = path.join(VIDEOS_DIR, `${videoId}.mp4`);

  try {
    if (!existsSync(videoPath)) {
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      console.log(`Downloading: ${youtubeUrl}`);

      await execAsync(
        `yt-dlp -f "bestvideo[height<=1080]+bestaudio/best" -o "${videoPath}" "${youtubeUrl}"`,
        { timeout: 600000 }
      );
    }

    const stat = await import('fs').then(m => m.promises.stat(videoPath));
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
        'Content-Disposition': `inline; filename="${videoId}.mp4"`
      });
    } else {
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': 'video/mp4',
        'Content-Disposition': `inline; filename="${videoId}.mp4"`
      });
    }

    createReadStream(videoPath).pipe(res);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to process video' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
