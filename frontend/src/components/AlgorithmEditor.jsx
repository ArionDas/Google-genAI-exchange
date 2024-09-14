import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from "./ui/button";
import { sortingAlgorithms } from './AlgorithmList';
import Editor from "@monaco-editor/react";
import axios from 'axios';

const AlgorithmEditor = () => {
  const { algoName } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [algorithm, setAlgorithm] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const algo = sortingAlgorithms.find(a => a.name.toLowerCase().replace(/\s+/g, '-') === algoName);
    if (algo) {
      setAlgorithm(algo);
      setCode(getInitialCode(algo.name, language));
    } else {
      navigate('/algorithms');
    }
  }, [algoName, navigate, language]);

  const getInitialCode = (algoName, lang) => {
    const functionName = algoName.replace(/\s+/g, '');
    switch (lang) {
      case 'javascript':
        return `function ${functionName}(arr) {\n  // Implement your ${algoName} algorithm here\n  \n  return arr;\n}`;
      case 'python':
        return `def ${functionName.toLowerCase()}(arr):\n    # Implement your ${algoName} algorithm here\n    \n    return arr`;
      case 'java':
        return `public class ${functionName} {\n    public static int[] sort(int[] arr) {\n        // Implement your ${algoName} algorithm here\n        \n        return arr;\n    }\n}`;
      case 'cpp':
        return `#include <bits/stdc++.h>
using namespace std;

void ${functionName}(vector<int>& arr, int n)
{
    // Implement your ${algoName} algorithm here
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for(int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    
    ${functionName}(arr, n);
    
    for(int i = 0; i < n; i++) {
        cout << arr[i] << " ";
    }
    cout << endl;
    return 0;
}`;
      default:
        return '';
    }
  };

  const handleCodeChange = (newValue) => {
    setCode(newValue);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setTestResult(null);
    try {
      const response = await axios.post('http://localhost:5000/api/code/test', {
        code,
        language,
        algorithmName: algorithm.name
      });
      setTestResult(response.data);
    } catch (error) {
      setTestResult({ category: 'RED', evaluation: 'Error: ' + (error.response?.data?.error || error.message) });
    } finally {
      setIsLoading(false);
    }
  };

  const editorOptions = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line',
    automaticLayout: true,
  };

  if (!algorithm) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-6">{algorithm.name} - Code Editor</h1>
      
      <div className="mb-4 flex space-x-4">
        <Link to={`/visualizer/${algoName}`} className="text-blue-600 hover:underline">
          Go to Sorting Visualizer
        </Link>
        <Link to="/interactive-lessons" className="text-blue-600 hover:underline">
          Interactive Lessons
        </Link>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Pseudocode:</h2>
        <pre className="bg-gray-100 p-4 rounded">{algorithm.pseudocode}</pre>
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Sample Test Case:</h2>
        <p>{algorithm.testCases}</p>
      </div>
      <div className="mb-4">
        <label htmlFor="language-select" className="block text-sm font-medium text-gray-700">
          Select Language:
        </label>
        <select
          id="language-select"
          value={language}
          onChange={handleLanguageChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Your Code:</h2>
        <Editor
          height="400px"
          language={language === 'cpp' ? 'cpp' : language}
          theme="vs-dark"
          value={code}
          onChange={handleCodeChange}
          options={{
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
            automaticLayout: true,
          }}
        />
      </div>
      <Button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Evaluating Code...' : 'Submit and Evaluate'}
      </Button>
      {testResult && (
        <div className={`mt-4 p-4 rounded ${
          testResult.category === 'GREEN' ? 'bg-green-100' : 
          testResult.category === 'YELLOW' ? 'bg-yellow-100' : 'bg-red-100'
        }`}>
          <h3 className="font-bold">{testResult.category} Evaluation</h3>
          <p className="mt-2 font-semibold">Evaluation:</p>
          <p>{testResult.evaluation}</p>
          <p className="mt-2 font-semibold">Suggestions:</p>
          <p>{testResult.suggestions}</p>
        </div>
      )}
    </div>
  );
};

export default AlgorithmEditor;