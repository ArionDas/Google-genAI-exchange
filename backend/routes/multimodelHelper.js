const axios = require('axios');
const fs = require('fs').promises;
const FormData = require('form-data');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const sharp = require('sharp');
const path = require('path');
const os = require('os');
const gTTS = require('gtts');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

dotenv.config();

// Set FFmpeg and FFprobe paths
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

async function llmModelAudio(userText) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const prompt = `
    You are a helpful assistant named 'ShauryaNova' developed by Ayush Shaurya Jha. 
    You are supposed to answer accurately and precisely to the user's question. 
    Now, the user query begins:
    ${userText}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().replace(/\*/g, '');
}

async function llmModelImage(userText, imagePath) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const prompt = `
    You are a helpful assistant named 'ShauryaNova' developed by Ayush Shaurya Jha. 
    You are supposed to answer accurately and precisely to the user's question 
    and image. Now, the user query begins:
    ${userText}
  `;

  const imageData = await sharp(imagePath).toBuffer();
  const imageParts = [
    {
      inlineData: {
        data: imageData.toString('base64'),
        mimeType: 'image/jpeg',
      },
    },
  ];

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;
  return response.text();
}

async function llmModelVideo(userText, videoPath) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const prompt = `
    You are a helpful assistant named 'ShauryaNova' developed by Ayush Shaurya Jha.
    You are supposed to answer accurately and precisely to the user's question 
    and video. Now, the user query begins:
    ${userText}
  `;

  if (!videoPath) {
    throw new Error("Video path cannot be None");
  }

  console.log(`Processing video: ${videoPath}`);

  // Extract frames from the video
  const frameCount = 5; // Number of frames to extract
  const frames = await extractFrames(videoPath, frameCount);

  // Process frames and create image parts for the model
  const imageParts = await Promise.all(frames.map(async (framePath) => {
    const imageData = await sharp(framePath).resize(512, 512).toBuffer();
    return {
      inlineData: {
        data: imageData.toString('base64'),
        mimeType: 'image/jpeg',
      },
    };
  }));

  // Generate content using the model
  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;

  // Clean up temporary frame files
  await Promise.all(frames.map(framePath => fs.unlink(framePath)));

  return response.text();
}

// Helper function to extract frames from a video
function extractFrames(videoPath, frameCount) {
  return new Promise((resolve, reject) => {
    const tempDir = os.tmpdir();
    const frames = [];

    ffmpeg(videoPath)
      .on('filenames', function(filenames) {
        frames.push(...filenames.map(filename => path.join(tempDir, filename)));
      })
      .on('end', function() {
        resolve(frames);
      })
      .on('error', function(err) {
        console.error('Error:', err);
        reject(err);
      })
      .screenshots({
        count: frameCount,
        folder: tempDir,
        filename: 'frame-%i.png'
      });
  });
}

async function textToSpeech(text) {
  return new Promise((resolve, reject) => {
    try {
      console.log("textToSpeech function called", text);
      
      const outputFile = path.join(__dirname, '..', 'speech.mp3');
      const gtts = new gTTS(text, 'en');
      
      gtts.save(outputFile, (err) => {
        if (err) {
          console.log("Error in textToSpeech function", err);
          reject(err);
        } else {
          console.log('Audio content written to file:', outputFile);
          resolve();
        }
      });
    } catch (error) {
      console.log("Error in textToSpeech function", error);
      reject(error);
    }
  });
}

module.exports = {
  llmModelAudio,
  llmModelImage,
  llmModelVideo,
  textToSpeech
};
