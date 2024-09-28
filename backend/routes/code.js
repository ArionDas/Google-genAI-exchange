const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const runCode = {
  python: (filePath) => `python ${filePath}`,
  java: (filePath) => {
    const className = path.basename(filePath, '.java');
    const dir = path.dirname(filePath);
    return `javac ${filePath} && java -cp ${dir} ${className}`;
  },
  cpp: (filePath) => {
    const outputPath = filePath.replace('.cpp', '');
    return `g++ ${filePath} -o ${outputPath} && ${outputPath}`;
  },
};

// Asynchronous function to extract the public class name from Java code
async function extractClassName(code) {
  const match = code.match(/public\s+class\s+(\w+)/);
  return match ? match[1] : 'Main';
}

router.post('/run', async (req, res) => {
  const { code, language } = req.body;
  const fileExtension = {
    python: 'py',
    java: 'java',
    cpp: 'cpp',
  }[language] || 'txt';

  const tempDir = path.join(__dirname, '..', 'temp');
  let filePath;

  try {
    // Ensure the temp directory exists
    await fs.mkdir(tempDir, { recursive: true });

    if (language === 'java') {
      const className = await extractClassName(code);
      filePath = path.join(tempDir, `${className}.java`);
    } else {
      const fileName = `temp_${Date.now()}.${fileExtension}`;
      filePath = path.join(tempDir, fileName);
    }

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
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to execute code' });
  }
});

module.exports = router;