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
  streak: {
    count: { type: Number, default: 0 },    // Current streak count
    lastVisit: { type: Date }, // Last login date on which problem solved
  },

  // Login history for heatmap
  loginDays: [{
    date: { type: Date, required: true },   // Date of login
    count: { type: Number, default: 1 },    // Number of solution submission on this day (useful for heatmap)
  }],

  // Badges
  badges: [{
    name: { type: String },  // Name of the badge
    imageUrl: { type: String },  // URL to the badge image
  }],

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update the updatedAt field on each document update
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
