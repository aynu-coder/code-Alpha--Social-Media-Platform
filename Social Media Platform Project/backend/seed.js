require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

// Random user data
const firstNames = ['John', 'Jane', 'Alex', 'Sarah', 'Mike', 'Emily', 'Chris', 'Lisa', 'Tom', 'Anna', 'David', 'Sophie', 'James', 'Mia', 'Robert', 'Olivia'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'White'];
const bios = [
  'Coffee lover ☕',
  'Tech enthusiast 💻',
  'Traveler ✈️',
  'Foodie 🍕',
  'Gamer 🎮',
  'Artist 🎨',
  'Reader 📚',
  'Fitness 🏋️',
  'Photographer 📷',
  'Music lover 🎵'
];

const postContents = [
  'Just had an amazing day! 🌟',
  'Working on some cool new projects! 💻',
  'The sunset today was breathtaking 🌅',
  'Coffee time! ☕',
  'Anyone else love this weather? ☀️',
  'Just finished reading an incredible book 📚',
  'New adventures coming soon! ✨',
  'Grateful for all the little things 💕',
  'Coding late into the night 🌙',
  'Exploring the city today! 🗺️',
  'This song is on repeat! 🎵',
  'Perfect day for hiking! 🏔️',
  'Made some delicious food today 🍳',
  'Learning something new every day 📖',
  'Weekend vibes! 🎉'
];

// Generate random profile picture using DiceBear API
function getRandomAvatar(seed) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}

// Generate random post image using Picsum
function getRandomPostImage(width = 600, height = 400) {
  const randomId = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/${width}/${height}?random=${randomId}`;
}

// Random date generator
function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = [];
    for (let i = 0; i < 15; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${firstName} ${lastName}`;
      const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`;
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const user = new User({
        fullName,
        username,
        email: `${username}@example.com`,
        password: hashedPassword,
        profileImage: getRandomAvatar(username),
        bio: bios[Math.floor(Math.random() * bios.length)],
        followers: [],
        following: [],
        createdAt: getRandomDate(new Date(2024, 0, 1), new Date())
      });
      
      users.push(user);
    }
    
    await User.insertMany(users);
    console.log(`Created ${users.length} users`);

    // Assign followers/following
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const numFollowing = Math.floor(Math.random() * (users.length / 2));
      
      for (let j = 0; j < numFollowing; j++) {
        const randomIndex = Math.floor(Math.random() * users.length);
        if (randomIndex !== i && !user.following.includes(users[randomIndex]._id)) {
          user.following.push(users[randomIndex]._id);
          users[randomIndex].followers.push(user._id);
        }
      }
    }
    
    // Save followers/following updates
    for (const user of users) {
      await User.findByIdAndUpdate(user._id, { 
        following: user.following, 
        followers: user.followers 
      });
    }
    console.log('Assigned followers/following');

    // Create posts
    const posts = [];
    for (const user of users) {
      const numPosts = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 0; i < numPosts; i++) {
        const hasImage = Math.random() > 0.4;
        const post = new Post({
          userId: user._id,
          content: postContents[Math.floor(Math.random() * postContents.length)],
          image: hasImage ? getRandomPostImage() : null,
          likes: [],
          createdAt: getRandomDate(new Date(2024, 0, 1), new Date())
        });
        
        // Add random likes
        const numLikes = Math.floor(Math.random() * users.length);
        for (let j = 0; j < numLikes; j++) {
          const randomUser = users[Math.floor(Math.random() * users.length)];
          if (!post.likes.includes(randomUser._id)) {
            post.likes.push(randomUser._id);
          }
        }
        
        posts.push(post);
      }
    }
    
    await Post.insertMany(posts);
    console.log(`Created ${posts.length} posts`);

    // Create comments
    const comments = [];
    for (const post of posts) {
      const numComments = Math.floor(Math.random() * 4);
      
      for (let i = 0; i < numComments; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const commentText = [
          'Great post! 👍',
          'Love this! ❤️',
          'So true!',
          'Awesome!',
          'Wow!',
          'Nice! 😊',
          'Agreed!',
          'Cool!'
        ][Math.floor(Math.random() * 8)];
        
        comments.push(new Comment({
          postId: post._id,
          userId: randomUser._id,
          comment: commentText,
          createdAt: getRandomDate(post.createdAt, new Date())
        }));
      }
    }
    
    await Comment.insertMany(comments);
    console.log(`Created ${comments.length} comments`);

    console.log('✅ Database seeded successfully!');
    console.log('\nYou can log in with any of these users:');
    console.log('Email: [username]@example.com');
    console.log('Password: password123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
