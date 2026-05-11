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

      try {
        const { stdout, stderr } = await execAsync(
          `yt-dlp -f "bestvideo[height<=1080]+bestaudio/best" -o "${videoPath}" "${youtubeUrl}"`,
          { timeout: 600000, maxBuffer: 10 * 1024 * 1024 }
        );
        if (stderr) console.log(`yt-dlp stderr: ${stderr}`);
        if (stdout) console.log(`yt-dlp stdout: ${stdout}`);
      } catch (execError) {
        console.error(`yt-dlp execution failed:`, execError.message);
        if (execError.stderr) console.error(`stderr: ${execError.stderr}`);
        if (execError.stdout) console.error(`stdout: ${execError.stdout}`);
        throw new Error(`Failed to download video: ${execError.message}`);
      }
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
    console.error(`Error processing video ${videoId}:`, error.message);
    res.status(500).json({ error: 'Failed to process video', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
