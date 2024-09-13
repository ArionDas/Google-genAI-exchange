import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Button } from "./ui/button";
import { useNavigate } from 'react-router-dom';

export const sortingAlgorithms = [
  {
    name: "Bubble Sort",
    description: "A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
    timeComplexity: "O(n^2)",
    spaceComplexity: "O(1)",
    pseudocode: "for i = 1 to n-1\n  for j = 0 to n-i-1\n    if A[j] > A[j+1]\n      swap A[j] and A[j+1]",
    testCases: "[5, 1, 4, 2, 8] → [1, 2, 4, 5, 8]"
  },
  {
    name: "Selection Sort",
    description: "An in-place comparison sorting algorithm that divides the input list into two parts: a sorted portion at the left end and an unsorted portion at the right end.",
    timeComplexity: "O(n^2)",
    spaceComplexity: "O(1)",
    pseudocode: "for i = 0 to n-1\n  find the minimum element in the unsorted portion\n  swap it with the first element of the unsorted portion",
    testCases: "[5, 1, 4, 2, 8] → [1, 2, 4, 5, 8]"
  },
  {
    name: "Insertion Sort",
    description: "Builds the final sorted array one item at a time. It is much less efficient on large lists than more advanced algorithms such as quicksort, heapsort, or merge sort.",
    timeComplexity: "O(n^2)",
    spaceComplexity: "O(1)",
    pseudocode: "for i = 1 to n-1\n  for j = i-1 to 0\n    if A[j] > A[i]\n      shift A[j] to the right\n    else\n      break",
    testCases: "[5, 1, 4, 2, 8] → [1, 2, 4, 5, 8]"
  },
  {
    name: "Merge Sort",
    description: "An efficient, stable, divide-and-conquer algorithm. Most implementations produce a stable sort, meaning that the order of equal elements is the same in the input and output.",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    pseudocode: "merge sort(A)\n  if |A| <= 1\n    return A\n  mid = |A|/2\n  left = merge sort(A[0..mid])\n  right = merge sort(A[mid+1..|A|])\n  return merge(left, right)",
    testCases: "[5, 1, 4, 2, 8] → [1, 2, 4, 5, 8]"
  },
  {
    name: "Quick Sort",
    description: "An efficient, in-place sorting algorithm. Developed by British computer scientist Tony Hoare in 1959 and published in 1961, it is still a commonly used algorithm for sorting.",
    timeComplexity: "O(n log n) average, O(n^2) worst case",
    spaceComplexity: "O(log n)",
    pseudocode: "quick sort(A)\n  if |A| <= 1\n    return A\n  pivot = select pivot(A)\n  left = elements less than pivot\n  right = elements greater than pivot\n  return quick sort(left) + [pivot] + quick sort(right)",
    testCases: "[5, 1, 4, 2, 8] → [1, 2, 4, 5, 8]"
  },
  // ... Add other algorithms here
];

function AlgorithmList() {
  const navigate = useNavigate();

  const handleCodeEditorClick = (algoName) => {
    navigate(`/algorithm/${algoName.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-6">Sorting Algorithms</h1>
      <Accordion type="single" collapsible className="w-full">
        {sortingAlgorithms.map((algo, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{algo.name}</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">{algo.description}</p>
              <p><strong>Time Complexity:</strong> {algo.timeComplexity}</p>
              <p><strong>Space Complexity:</strong> {algo.spaceComplexity}</p>
              <div className="mt-4">
                <h3 className="font-semibold">Pseudocode:</h3>
                <pre className="bg-gray-100 p-2 rounded mt-2">{algo.pseudocode}</pre>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold">Sample Test Case:</h3>
                <p className="mt-2">{algo.testCases}</p>
              </div>
              <Button 
                className="mt-4" 
                onClick={() => handleCodeEditorClick(algo.name)}
              >
                Open in Code Editor
              </Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default AlgorithmList;