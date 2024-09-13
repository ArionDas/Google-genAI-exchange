import React from 'react';
import CodeEditor from './CodeEditor';

function CodeEditorPage() {
  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-6">Code Editor</h1>
      <CodeEditor />
    </div>
  );
}

export default CodeEditorPage;