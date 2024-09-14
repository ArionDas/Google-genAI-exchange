import React from 'react';
import { useParams, Link } from 'react-router-dom';
import SortingVisualizer from '../components/SortingVisualizer';
import { sortingAlgorithms } from '../components/AlgorithmList';

const SortingVisualizerPage = () => {
  const { algoName } = useParams();
  const algorithm = sortingAlgorithms.find(a => a.name.toLowerCase().replace(/\s+/g, '-') === algoName);

  if (!algorithm) {
    return <div>Algorithm not found</div>;
  }

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-6">{algorithm.name} - Sorting Visualizer</h1>
      
      <div className="mb-4">
        <Link to={`/algorithm/${algoName}`} className="text-blue-600 hover:underline">
          Back to Code Editor
        </Link>
      </div>

      <SortingVisualizer initialAlgorithm={algorithm} />
    </div>
  );
};

export default SortingVisualizerPage;