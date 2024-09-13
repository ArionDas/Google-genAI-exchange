const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const runCode = {
  javascript: (filePath) => `node ${filePath}`,
  python: (filePath) => `python ${filePath}`,
  java: (filePath) => `javac ${filePath} && java ${path.basename(filePath, '.java')}`,
  cpp: (filePath) => {
    const outputPath = filePath.replace('.cpp', '');
    return `g++ ${filePath} -o ${outputPath} && ${outputPath}`;
  },
};

router.post('/run', async (req, res) => {
  const { code, language } = req.body;
  const fileExtension = {
    javascript: 'js',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
  }[language] || 'txt';

  const fileName = `temp_${Date.now()}.${fileExtension}`;
  const filePath = path.join(__dirname, '..', 'temp', fileName);

  try {
    // Write the code to a temporary file
    await fs.writeFile(filePath, code);

    // Execute the code
    exec(runCode[language](filePath), async (error, stdout, stderr) => {
      // Delete the temporary file
      await fs.unlink(filePath);

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      if (stderr) {
        res.status(400).json({ error: stderr });
        return;
      }
      res.json({ output: stdout });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute code' });
  }
});

module.exports = router;