import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { sortingAlgorithms } from './AlgorithmList';

const SortingVisualizer = ({ initialAlgorithm }) => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(initialAlgorithm?.name || sortingAlgorithms[0]?.name);
  const [arraySize, setArraySize] = useState(10);
  const [speed, setSpeed] = useState(40);
  const [array, setArray] = useState([]);
  const [sorting, setSorting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [comparedIndices, setComparedIndices] = useState([]);
  const [swappedIndices, setSwappedIndices] = useState([]);
  const [description, setDescription] = useState('');

  useEffect(() => {
    generateRandomArray();
  }, [arraySize]);

  const generateRandomArray = () => {
    const newArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 1);
    setArray(newArray);
    resetVisualization();
  };

  const resetVisualization = () => {
    setCurrentStep(0);
    setTotalSteps(0);
    setComparedIndices([]);
    setSwappedIndices([]);
    setDescription('');
  };

  const handleAlgorithmChange = (value) => {
    setSelectedAlgorithm(value);
    resetVisualization();
  };

  const handleArraySizeChange = (value) => {
    setArraySize(value[0]);
  };

  const handleSpeedChange = (value) => {
    setSpeed(value[0]);
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const updateVisualization = async (arr, compared, swapped, desc) => {
    setArray([...arr]);
    setComparedIndices(compared);
    setSwappedIndices(swapped);
    setDescription(desc);
    setCurrentStep(prev => prev + 1);
    await sleep(500 - speed * 4);
  };

  const bubbleSort = async () => {
    let arr = [...array];
    let n = arr.length;
    setSorting(true);

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        await updateVisualization(arr, [j, j + 1], [], `Comparing elements at indices ${j} and ${j + 1}`);

        if (arr[j] > arr[j + 1]) {
          await updateVisualization(arr, [], [j, j + 1], `Swapping elements at indices ${j} and ${j + 1}`);
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }

    finishSorting(arr);
  };

  const quickSort = async () => {
    let arr = [...array];
    setSorting(true);

    const partition = async (low, high) => {
      let pivot = arr[high];
      let i = low - 1;

      for (let j = low; j < high; j++) {
        await updateVisualization(arr, [j, high], [], `Comparing element at index ${j} with pivot ${pivot}`);

        if (arr[j] < pivot) {
          i++;
          await updateVisualization(arr, [], [i, j], `Swapping elements at indices ${i} and ${j}`);
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }

      await updateVisualization(arr, [], [i + 1, high], `Swapping pivot to its correct position`);
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      return i + 1;
    };

    const quickSortRecursive = async (low, high) => {
      if (low < high) {
        let pi = await partition(low, high);
        await quickSortRecursive(low, pi - 1);
        await quickSortRecursive(pi + 1, high);
      }
    };

    await quickSortRecursive(0, arr.length - 1);
    finishSorting(arr);
  };

  const mergeSort = async () => {
    let arr = [...array];
    setSorting(true);

    const merge = async (left, middle, right) => {
      let n1 = middle - left + 1;
      let n2 = right - middle;
      let L = arr.slice(left, middle + 1);
      let R = arr.slice(middle + 1, right + 1);

      let i = 0, j = 0, k = left;
      while (i < n1 && j < n2) {
        await updateVisualization(arr, [left + i, middle + 1 + j], [], `Comparing elements from left and right subarrays`);
        if (L[i] <= R[j]) {
          arr[k] = L[i];
          i++;
        } else {
          arr[k] = R[j];
          j++;
        }
        await updateVisualization(arr, [], [k], `Placing element in sorted position ${k}`);
        k++;
      }

      while (i < n1) {
        arr[k] = L[i];
        await updateVisualization(arr, [], [k], `Placing remaining element from left subarray`);
        i++;
        k++;
      }

      while (j < n2) {
        arr[k] = R[j];
        await updateVisualization(arr, [], [k], `Placing remaining element from right subarray`);
        j++;
        k++;
      }
    };

    const mergeSortRecursive = async (left, right) => {
      if (left < right) {
        let middle = Math.floor((left + right) / 2);
        await updateVisualization(arr, [], [], `Dividing array into two halves`);
        await mergeSortRecursive(left, middle);
        await mergeSortRecursive(middle + 1, right);
        await merge(left, middle, right);
      }
    };

    await mergeSortRecursive(0, arr.length - 1);
    finishSorting(arr);
  };

  const insertionSort = async () => {
    let arr = [...array];
    setSorting(true);

    for (let i = 1; i < arr.length; i++) {
      let key = arr[i];
      let j = i - 1;

      await updateVisualization(arr, [i], [], `Selecting element ${key} at index ${i} as key`);

      while (j >= 0 && arr[j] > key) {
        await updateVisualization(arr, [j, j + 1], [], `Comparing ${arr[j]} with key ${key}`);
        arr[j + 1] = arr[j];
        await updateVisualization(arr, [], [j, j + 1], `Moving ${arr[j]} to the right`);
        j = j - 1;
      }
      arr[j + 1] = key;
      await updateVisualization(arr, [], [j + 1], `Inserting key ${key} at index ${j + 1}`);
    }

    finishSorting(arr);
  };

  const selectionSort = async () => {
    let arr = [...array];
    setSorting(true);

    for (let i = 0; i < arr.length - 1; i++) {
      let minIdx = i;
      await updateVisualization(arr, [i], [], `Selecting ${arr[i]} as initial minimum`);

      for (let j = i + 1; j < arr.length; j++) {
        await updateVisualization(arr, [minIdx, j], [], `Comparing ${arr[j]} with current minimum ${arr[minIdx]}`);
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          await updateVisualization(arr, [minIdx], [], `Found new minimum ${arr[minIdx]} at index ${minIdx}`);
        }
      }

      if (minIdx !== i) {
        await updateVisualization(arr, [], [i, minIdx], `Swapping ${arr[i]} with ${arr[minIdx]}`);
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      }
    }

    finishSorting(arr);
  };

  const finishSorting = (sortedArray) => {
    setArray(sortedArray);
    setComparedIndices([]);
    setSwappedIndices([]);
    setDescription('Sorting completed!');
    setSorting(false);
    setTotalSteps(currentStep);
  };

  const startVisualization = () => {
    resetVisualization();
    switch (selectedAlgorithm) {
      case "Bubble Sort":
        bubbleSort();
        break;
      case "Quick Sort":
        quickSort();
        break;
      case "Merge Sort":
        mergeSort();
        break;
      case "Insertion Sort":
        insertionSort();
        break;
      case "Selection Sort":
        selectionSort();
        break;
      default:
        console.log(`Visualizing ${selectedAlgorithm} is not implemented yet.`);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Sorting Algorithm Visualizer</h2>
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Algorithm</label>
          <Select onValueChange={handleAlgorithmChange} defaultValue={selectedAlgorithm}>
            <SelectTrigger>
              <SelectValue>{selectedAlgorithm}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {sortingAlgorithms.map((algo) => (
                <SelectItem key={algo.name} value={algo.name}>
                  {algo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Array Size: {arraySize}</label>
          <Slider
            min={5}
            max={50}
            step={1}
            value={[arraySize]}
            onValueChange={handleArraySizeChange}
            disabled={sorting}
          />
        </div>
        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Speed: {speed}</label>
          <Slider
            min={1}
            max={100}
            step={1}
            value={[speed]}
            onValueChange = {handleSpeedChange}
          />
        </div>
      </div>
      <div className="flex gap-4 mb-4">
        <Button onClick={generateRandomArray} disabled={sorting}>Generate New Array</Button>
        <Button onClick={startVisualization} disabled={sorting}>
          {sorting ? 'Sorting...' : 'Start Visualization'}
        </Button>
      </div>
      <div className="mb-4">
        <p className="text-lg font-semibold">Step: {currentStep} / {totalSteps}</p>
        <p className="text-md">{description}</p>
      </div>
      <div className="mt-4 h-64 bg-gray-100 flex items-end justify-between border border-gray-300 w-full">
        {array.map((value, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center justify-end h-full"
            style={{ width: `${100 / arraySize}%` }}
          >
            <div
              style={{
                height: `${(value / Math.max(...array)) * 100}%`,
                width: '100%',
                backgroundColor: comparedIndices.includes(index) ? 'yellow' : 
                                 swappedIndices.includes(index) ? 'red' : 'blue',
                transition: 'all 0.1s ease-in-out',
              }}
            ></div>
            <span className="text-xs mt-1 whitespace-nowrap overflow-hidden text-ellipsis" style={{maxWidth: '100%'}}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SortingVisualizer;