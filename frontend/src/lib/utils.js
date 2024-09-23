import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}


export const topics = [
  "Arrays",
  "Strings",
  "Linked Lists",
  "Stacks",
  "Queues",
  "Hash Tables",
  "Trees",
  "Heaps",
  "Graphs",
  "Dynamic Programming",
  "Backtracking",
  "Greedy Algorithms",
  "Sorting Algorithms",
  "Searching Algorithms",
  "Bit Manipulation"
];