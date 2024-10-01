const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { llmModelImage, llmModelVideo, textToSpeech } = require('./multimodelHelper');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'temp_' + file.fieldname + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Image + Text + Voice Query Endpoint
router.post('/image-query', upload.single('image'), async (req, res) => {
  try {
    const queryText = req.body.query_text;
    const imagePath = req.file.path;

    console.log(`Received image query: ${queryText}`);
    console.log(`Image path: ${imagePath}`);

    // Use the helper function to process the image + text query
    const response = await llmModelImage(queryText, imagePath);
    console.log(`Response: ${response}`);

    // Convert response to speech
    await textToSpeech(response);

    res.status(200).json({ text_response: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    // Clean up: remove the temporary image file
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting temporary file:', err);
      });
    }
  }
});

// Video + Text + Voice Query Endpoint
router.post('/video-query', upload.single('video'), async (req, res) => {
  try {
    const queryText = req.body.query_text;
    const videoPath = req.file.path;

    // Use the helper function to process the video + text query
    const response = await llmModelVideo(queryText, videoPath);

    // Convert response to speech
    await textToSpeech(response);

    res.status(200).json({ text_response: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    // Clean up: remove the temporary video file
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting temporary file:', err);
      });
    }
  }
});

// Endpoint to download the generated speech file
router.get('/download-audio', (req, res) => {
  const audioFilePath = path.join(__dirname, '..', 'speech.mp3');
  if (fs.existsSync(audioFilePath)) {
    res.download(audioFilePath, 'speech.mp3', (err) => {
      if (err) {
        console.error('Error downloading audio file:', err);
      } else {
        // Delete the audio file after sending
        fs.unlink(audioFilePath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting audio file:', unlinkErr);
        });
      }
    });
  } else {
    res.status(404).json({ error: 'Audio file not found' });
  }
});

module.exports = router;
