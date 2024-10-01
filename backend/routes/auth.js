const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { differenceInCalendarDays } = require('date-fns');

require('dotenv').config();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      name,
      email,
      password: hashedPassword
    });


    // Save user to database
    const savedUser = await user.save();
    console.log('User saved:', savedUser);

    // Create and return JWT token
    const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, user: { id: savedUser._id, name: savedUser.name, email: savedUser.email }, message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and return JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.put('/update-quizzes/:userId', async (req, res) => {
  const { userId } = req.params;
  const { topic } = req.body; // Pass the DSA topic name in the request body

  console.log('Updating quizzes for user:', userId, 'Topic:', topic);

  try {
    // Find the user by their ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User Data Earlier:', user);

    // Increase the number of quizzes taken for the specified topic
    if (user.dsaTopicsCovered[topic]) {
      user.dsaTopicsCovered[topic].quizzesTaken += 1;
      console.log(`Quizzes taken for topic ${topic}:`, user.dsaTopicsCovered[topic].quizzesTaken);
    } else {
      return res.status(400).json({ message: 'Invalid topic' });
    }

    // Get today's date (only the date part, without the time)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight for day comparison
    console.log('Today\'s date:', today);

    // Streak Logic: Check if last visit date was yesterday
    const lastVisit = user.streak?.lastVisit ? new Date(user.streak.lastVisit) : null;

    if (lastVisit) {
      lastVisit.setHours(0, 0, 0, 0); // Normalize last visit to midnight
      console.log('Last visit date:', lastVisit);

      // Calculate the difference in calendar days between today and the last visit
      const diffInDays = differenceInCalendarDays(today, lastVisit);
      console.log('Difference in days:', diffInDays);

      if (diffInDays === 1) {
        // Last visit was yesterday, increment streak
        user.streak.count += 1;
        console.log('Streak incremented:', user.streak.count);
      } else if (diffInDays > 1) {
        // Last visit was more than one day ago, reset streak
        user.streak.count = 1;
        console.log('Streak reset to 1:', user.streak.count);
      } else {
        // If diffInDays is 0, user logged in today
        console.log('User has already logged in today. Streak remains the same:', user.streak.count);
      }
    } else {
      // If there's no previous visit, initialize streak
      user.streak = { count: 1, lastVisit: today };
      console.log('No previous visit found. Streak initialized to 1:', user.streak.count);
    }

    // Update the last visit date to today
    user.streak.lastVisit = today;
    console.log('Last visit date updated to today:', user.streak.lastVisit);

    // Update loginDays: Check if today's date already exists
    const todayString = today.toISOString().split('T')[0]; // Get the date string in YYYY-MM-DD format
    const existingLogin = user.loginDays.find(day => day.date.toISOString().split('T')[0] === todayString);

    if (existingLogin) {
      // If today's date exists, increment the count
      existingLogin.count += 1;
      console.log('Incremented login count for today:', existingLogin.count);
    } else {
      // If today's date does not exist, add it to the loginDays array
      user.loginDays.push({ date: today, count: 1 });
      console.log('Added new login entry for today.');
    }

    // Save the updated user data
    await user.save();

    res.status(200).json({ message: 'Quiz count, login day, and streak updated successfully', user });
  } catch (error) {
    console.error('Error updating quizzes, login days, and streak:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});


//api to get user details

router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId, '-password -__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User details:', user);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
// router.get('/visit/:userId', async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // Normalize to midnight for day comparison
//     const lastVisit = user.streak.lastVisit;

//     // Handle streak updates
//     if (lastVisit) {
//       const diffInTime = today.getTime() - lastVisit.getTime();
//       const diffInDays = diffInTime / (1000 * 3600 * 24); // Convert milliseconds to days

//       if (diffInDays === 1) {
//         // If last visit was yesterday, increase streak
//         user.streak.count += 1;
//       } else if (diffInDays > 1) {
//         // If last visit was not consecutive, reset streak
//         user.streak.count = 1;
//       }
//       // If last visit was today, do nothing
//     } else {
//       // First login or first visit after a reset, set streak count to 1
//       user.streak.count = 1;
//     }

//     // Update the last visit date to today
//     user.streak.lastVisit = today;

//     // Save the updated user data
//     await user.save();

//     res.status(200).json({ message: 'Streak updated successfully!', streak: user.streak });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });



// // Get all login days for heatmap
// router.get('/heatmap/:userId', async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const user = await User.findById(userId, 'loginDays');
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.json({ loginDays: user.loginDays });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// router.get('/streak/:userId', async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const user = await User.findById(userId, 'streak');
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.json({ streak: user.streak });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// router.put('/streak/reset/:userId', async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     user.streak.count = 0;
//     user.streak.lastVisit = null; 

//     await user.save();

//     res.status(200).json({ message: 'Streak reset successfully', streak: user.streak });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });



module.exports = router;

