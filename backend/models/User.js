const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // DSA Progress Tracking
  dsaTopicsCovered: {
    Stacks: { quizzesTaken: { type: Number, default: 0 } },
    Queue: { quizzesTaken: { type: Number, default: 0 } },
    LinkedList: { quizzesTaken: { type: Number, default: 0 } },
    Array: { quizzesTaken: { type: Number, default: 0 } },
    HashTable: { quizzesTaken: { type: Number, default: 0 } },
    Tree: { quizzesTaken: { type: Number, default: 0 } },
    Graph: { quizzesTaken: { type: Number, default: 0 } },
    Heap: { quizzesTaken: { type: Number, default: 0 } },
    SortingAlgorithms: { quizzesTaken: { type: Number, default: 0 } },
    SearchingAlgorithms: { quizzesTaken: { type: Number, default: 0 } },
    DynamicProgramming: { quizzesTaken: { type: Number, default: 0 } },
    GreedyAlgorithms: { quizzesTaken: { type: Number, default: 0 } },
    Backtracking: { quizzesTaken: { type: Number, default: 0 } },
    BitManipulation: { quizzesTaken: { type: Number, default: 0 } },
    SegmentTree: { quizzesTaken: { type: Number, default: 0 } },
    Trie: { quizzesTaken: { type: Number, default: 0 } },
    UnionFind: { quizzesTaken: { type: Number, default: 0 } },
    TopologicalSort: { quizzesTaken: { type: Number, default: 0 } },
    KMPAlgorithm: { quizzesTaken: { type: Number, default: 0 } },
  },

  // Streak tracking
  streakDays: { type: Number, default: 0 },  // Number of consecutive active days
  
  // Badges
  badges: [{
    name: { type: String },  // Name of the badge
    imageUrl: { type: String },  // URL to the badge image
  }],

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
