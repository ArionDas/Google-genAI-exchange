import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}


export const topics = [
  "Stacks",
  "Queue",
  "LinkedList",
  "Array",
  "HashTable",
  "Tree",
  "Graph",
  "Heap",
  "SortingAlgorithms",
  "SearchingAlgorithms",
  "DynamicProgramming",
  "GreedyAlgorithms",
  "Backtracking",
  "BitManipulation",
  "SegmentTree",
  "Trie",
  "UnionFind",
  "TopologicalSort",
  "KMPAlgorithm"
];