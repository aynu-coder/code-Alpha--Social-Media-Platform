let currentUser = null;
let currentPage = 'feed';
let currentPostId = null;

// Sanitize function to prevent XSS
function sanitize(str) {
  const temp = document.createElement('div');
  temp.textContent = str || '';
  return temp.innerHTML;
}

async function init() {
  try {
    const res = await fetch('/api/auth/me', {
      credentials: 'include'
    });
    if (res.ok) {
      currentUser = await res.json();
      renderApp();
    } else {
      renderLoginPage();
    }
  } catch (err) {
    renderLoginPage();
  }
}

function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <nav class="navbar">
      <div class="container">
        <a href="#" class="logo" onclick="navigate('feed')">SocialApp</a>
        <ul class="nav-links">
          <li><a href="#" onclick="navigate('feed')">Home</a></li>
          <li><a href="#" onclick="navigate('search')">Search</a></li>
          <li><a href="#" onclick="navigate('profile')">${currentUser.username}</a></li>
          <li><a href="#" onclick="logout()">Logout</a></li>
        </ul>
      </div>
    </nav>
    <div class="container" id="main-container"></div>
  `;
  renderPage();
}

function navigate(page) {
  currentPage = page;
  renderPage();
}

function renderPage() {
  switch (currentPage) {
    case 'feed':
      renderFeed();
      break;
    case 'search':
      renderSearch();
      break;
    case 'profile':
      renderProfile(currentUser._id);
      break;
    case 'post':
      renderSinglePost(currentPostId);
      break;
    default:
      renderFeed();
  }
}

async function renderSinglePost(postId) {
  try {
    const res = await fetch(`/api/posts/${postId}`, {
      credentials: 'include'
    });
    const post = await res.json();
    
    const container = document.getElementById('main-container');
    container.innerHTML = `
      <div class="main-content">
        <div style="flex: 1;">
          <button class="btn btn-secondary" style="margin-bottom: 20px;" onclick="navigate('feed')">
            ← Back to Home
          </button>
          ${renderPost(post)}
        </div>
      </div>
    `;
    
    // Load comments automatically
    await loadComments(postId);
    document.getElementById(`comments-${postId}`).style.display = 'block';
  } catch (err) {
    console.error('Error loading post');
  }
}

async function login(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;
      renderApp();
    } else {
      const data = await res.json();
      alert(data.message);
    }
  } catch (err) {
    alert('Error logging in');
  }
}

async function register(event) {
  event.preventDefault();
  const fullName = document.getElementById('fullName').value;
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ fullName, username, email, password })
    });

    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;
      renderApp();
    } else {
      const data = await res.json();
      alert(data.message);
    }
  } catch (err) {
    alert('Error registering');
  }
}

async function logout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    currentUser = null;
    renderLoginPage();
  } catch (err) {
    alert('Error logging out');
  }
}

function renderLoginPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container">
      <div class="auth-container">
        <h1>Login</h1>
        <form onsubmit="login(event)">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required>
          </div>
          <button type="submit" class="btn btn-primary">Login</button>
        </form>
        <div class="auth-link">
          Don't have an account? <a href="#" onclick="renderRegisterPage()">Register</a>
        </div>
      </div>
    </div>
  `;
}

function renderRegisterPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container">
      <div class="auth-container">
        <h1>Register</h1>
        <form onsubmit="register(event)">
          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input type="text" id="fullName" required>
          </div>
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required>
          </div>
          <button type="submit" class="btn btn-primary">Register</button>
        </form>
        <div class="auth-link">
          Already have an account? <a href="#" onclick="renderLoginPage()">Login</a>
        </div>
      </div>
    </div>
  `;
}

async function renderFeed() {
  const container = document.getElementById('main-container');
  container.innerHTML = `
    <div class="main-content">
      <div class="sidebar">
        <h3>Welcome, ${currentUser.fullName}</h3>
      </div>
      <div class="feed">
        <div class="create-post">
          <form onsubmit="createPost(event)">
            <textarea id="post-content" placeholder="What's on your mind?" required></textarea>
            <div class="post-actions">
              <input type="file" id="post-image" accept="image/*">
              <button type="submit" class="btn btn-primary">Post</button>
            </div>
          </form>
        </div>
        <div id="posts-container"></div>
      </div>
      <div class="right-sidebar" id="suggestions-sidebar">
        <div class="widget">
          <h3>Suggested Users</h3>
          <div id="suggested-users"></div>
        </div>
      </div>
    </div>
  `;
  await Promise.all([loadPosts(), loadSuggestedUsers()]);
}

async function loadSuggestedUsers() {
  try {
    const res = await fetch('/api/users/search?q=', {
      credentials: 'include'
    });
    let users = await res.json();
    
    // Filter out current user and users already followed
    users = users.filter(user => 
      String(user._id) !== String(currentUser._id) && 
      !currentUser.following.some(id => String(id) === String(user._id))
    );
    
    // Shuffle and take up to 5 users
    users = users.sort(() => Math.random() - 0.5).slice(0, 5);
    
    const suggestionsContainer = document.getElementById('suggested-users');
    if (users.length === 0) {
      suggestionsContainer.innerHTML = '<p>No suggestions available</p>';
      return;
    }
    
    suggestionsContainer.innerHTML = users.map(user => `
      <div class="suggested-user">
        <img src="${sanitize(user.profileImage || '/uploads/default-profile.jpg')}" alt="Avatar" class="suggested-avatar">
        <div style="flex: 1;">
          <strong>${sanitize(user.fullName)}</strong>
          <p style="color: #657786; font-size: 14px;">@${sanitize(user.username)}</p>
        </div>
        <button class="btn btn-primary" style="padding: 6px 12px; font-size: 14px;" onclick="followUser('${user._id}')">Follow</button>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading suggested users');
  }
}

async function loadPosts() {
  try {
    const res = await fetch('/api/posts', {
      credentials: 'include'
    });
    const posts = await res.json();
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = posts.map(post => renderPost(post)).join('');
  } catch (err) {
    console.error('Error loading posts');
  }
}

function navigateToPost(postId) {
  currentPage = 'post';
  currentPostId = postId;
  renderPage();
}

function renderPost(post) {
  const isLiked = post.likes.some(id => String(id) === String(currentUser._id));
  const isOwner = String(post.userId._id) === String(currentUser._id);
  return `
    <div class="post" id="post-${post._id}">
      <div class="post-header">
        <img src="${sanitize(post.userId.profileImage || '/uploads/default-profile.jpg')}" alt="Avatar" class="post-avatar" onclick="event.stopPropagation(); renderProfile('${post.userId._id}')" style="cursor: pointer;">
        <div class="post-info">
          <span class="post-author" onclick="event.stopPropagation(); renderProfile('${post.userId._id}')" style="cursor: pointer;">${sanitize(post.userId.fullName)}</span>
          <span class="post-username">@${sanitize(post.userId.username)}</span>
          <span class="post-date">${new Date(post.createdAt).toLocaleDateString()}</span>
          ${isOwner ? `<button class="btn btn-danger" style="margin-left: 10px;" onclick="event.stopPropagation(); deletePost('${post._id}')">Delete</button>` : ''}
        </div>
      </div>
      <div class="post-content" onclick="navigateToPost('${post._id}')" style="cursor: pointer;">${sanitize(post.content)}</div>
      ${post.image ? `<img src="${sanitize(post.image)}" alt="Post image" class="post-image" onclick="navigateToPost('${post._id}')" style="cursor: pointer;">` : ''}
      <div class="post-stats">
        <div class="post-stat ${isLiked ? 'liked' : ''}" onclick="event.stopPropagation(); likePost('${post._id}')">
          ❤️ ${post.likes.length}
        </div>
        <div class="post-stat" onclick="event.stopPropagation(); toggleComments('${post._id}')">
          💬 ${post.commentsCount}
        </div>
      </div>
      <div class="comments-section" id="comments-${post._id}" style="display: none;"></div>
    </div>
  `;
}

async function createPost(event) {
  event.preventDefault();
  const content = document.getElementById('post-content').value;
  const imageInput = document.getElementById('post-image');
  
  const formData = new FormData();
  formData.append('content', content);
  if (imageInput.files[0]) {
    formData.append('image', imageInput.files[0]);
  }

  try {
    await fetch('/api/posts', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    document.getElementById('post-content').value = '';
    document.getElementById('post-image').value = '';
    loadPosts();
  } catch (err) {
    alert('Error creating post');
  }
}

async function deletePost(postId) {
  if (!confirm('Are you sure you want to delete this post?')) return;
  try {
    await fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    loadPosts();
  } catch (err) {
    alert('Error deleting post');
  }
}

async function likePost(postId) {
  try {
    const res = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      credentials: 'include'
    });
    const updatedPost = await res.json();
    const postElement = document.getElementById(`post-${postId}`);
    postElement.outerHTML = renderPost(updatedPost);
  } catch (err) {
    alert('Error liking post');
  }
}

async function toggleComments(postId) {
  const commentsSection = document.getElementById(`comments-${postId}`);
  if (commentsSection.style.display === 'none') {
    await loadComments(postId);
    commentsSection.style.display = 'block';
  } else {
    commentsSection.style.display = 'none';
  }
}

async function loadComments(postId) {
  try {
    const res = await fetch(`/api/comments/${postId}`, {
      credentials: 'include'
    });
    const comments = await res.json();
    const commentsSection = document.getElementById(`comments-${postId}`);
    commentsSection.innerHTML = `
      <div class="comment-form">
        <input type="text" id="comment-input-${postId}" placeholder="Write a comment..." onkeypress="if(event.key==='Enter') addComment('${postId}')">
        <button class="btn btn-primary" onclick="addComment('${postId}')">Comment</button>
      </div>
      ${comments.map(comment => renderComment(comment)).join('')}
    `;
  } catch (err) {
    alert('Error loading comments');
  }
}

function renderComment(comment) {
  const isOwner = String(comment.userId._id) === String(currentUser._id);
  return `
    <div class="comment">
      <img src="${sanitize(comment.userId.profileImage || '/uploads/default-profile.jpg')}" alt="Avatar" class="comment-avatar">
      <div class="comment-content">
        <strong>${sanitize(comment.userId.fullName)}</strong>
        <p>${sanitize(comment.comment)}</p>
        ${isOwner ? `<button class="btn btn-danger" style="font-size: 12px; padding: 4px 8px;" onclick="deleteComment('${comment._id}')">Delete</button>` : ''}
      </div>
    </div>
  `;
}

async function addComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  const comment = input.value;
  if (!comment) return;

  try {
    await fetch(`/api/comments/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ comment })
    });
    loadComments(postId);
    loadPosts();
  } catch (err) {
    alert('Error adding comment');
  }
}

async function deleteComment(commentId) {
  try {
    await fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    loadPosts();
  } catch (err) {
    alert('Error deleting comment');
  }
}

function renderSearch() {
  const container = document.getElementById('main-container');
  container.innerHTML = `
    <div class="search-container">
      <input type="text" id="search-input" placeholder="Search users..." oninput="searchUsers()">
    </div>
    <div id="search-results"></div>
  `;
}

async function searchUsers() {
  const query = document.getElementById('search-input').value;
  if (!query) {
    document.getElementById('search-results').innerHTML = '';
    return;
  }

  try {
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
      credentials: 'include'
    });
    const users = await res.json();
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = users.map(user => `
      <div class="user-card">
        <img src="${sanitize(user.profileImage || '/uploads/default-profile.jpg')}" alt="Avatar" class="user-avatar" onclick="renderProfile('${user._id}')" style="cursor: pointer;">
        <div class="user-info" onclick="renderProfile('${user._id}')" style="cursor: pointer;">
          <h3>${sanitize(user.fullName)}</h3>
          <p>@${sanitize(user.username)}</p>
        </div>
        <button class="btn btn-primary" onclick="followUser('${user._id}')">Follow</button>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error searching users');
  }
}

async function renderProfile(userId) {
  try {
    const res = await fetch(`/api/users/${userId}`, {
      credentials: 'include'
    });
    const { user, posts } = await res.json();
    const isOwnProfile = String(userId) === String(currentUser._id);
    const isFollowing = currentUser.following.some(id => String(id) === String(userId));
    
    const container = document.getElementById('main-container');
    container.innerHTML = `
      <div class="profile-header">
        <div class="profile-cover"></div>
        <div class="profile-info">
          <img src="${sanitize(user.profileImage || '/uploads/default-profile.jpg')}" alt="Avatar" class="profile-avatar">
          <div class="profile-details">
            <h2>${sanitize(user.fullName)}</h2>
            <p>@${sanitize(user.username)}</p>
            <p>${sanitize(user.bio || '')}</p>
            <div class="profile-stats">
              <div class="profile-stat"><strong>${posts.length}</strong> Posts</div>
              <div class="profile-stat"><strong>${user.followers.length}</strong> Followers</div>
              <div class="profile-stat"><strong>${user.following.length}</strong> Following</div>
            </div>
            ${isOwnProfile ? `
              <button class="btn btn-secondary" style="margin-top: 10px;" onclick="editProfile()">Edit Profile</button>
            ` : `
              <button class="btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}" style="margin-top: 10px;" onclick="followUser('${userId}')">
                ${isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            `}
          </div>
        </div>
      </div>
      <div class="feed">
        ${posts.map(post => renderPost({ ...post, userId: user })).join('')}
      </div>
    `;
  } catch (err) {
    console.error('Error loading profile');
  }
}

async function followUser(userId) {
  try {
    await fetch(`/api/follows/${userId}`, {
      method: 'POST',
      credentials: 'include'
    });
    
    const res = await fetch('/api/auth/me', {
      credentials: 'include'
    });
    currentUser = await res.json();
    
    if (currentPage === 'profile') {
      renderProfile(userId);
    } else if (currentPage === 'search') {
      searchUsers();
    } else if (currentPage === 'feed') {
      loadSuggestedUsers();
    }
  } catch (err) {
    alert('Error following user');
  }
}

function editProfile() {
  const container = document.getElementById('main-container');
  container.innerHTML = `
    <div class="auth-container">
      <h1>Edit Profile</h1>
      <form onsubmit="updateProfile(event)">
        <div class="form-group">
          <label for="edit-fullName">Full Name</label>
          <input type="text" id="edit-fullName" value="${currentUser.fullName}">
        </div>
        <div class="form-group">
          <label for="edit-bio">Bio</label>
          <textarea id="edit-bio">${currentUser.bio || ''}</textarea>
        </div>
        <div class="form-group">
          <label for="edit-profileImage">Profile Image</label>
          <input type="file" id="edit-profileImage" accept="image/*">
        </div>
        <button type="submit" class="btn btn-primary">Save</button>
        <button type="button" class="btn btn-secondary" onclick="renderProfile('${currentUser._id}')">Cancel</button>
      </form>
    </div>
  `;
}

async function updateProfile(event) {
  event.preventDefault();
  const fullName = document.getElementById('edit-fullName').value;
  const bio = document.getElementById('edit-bio').value;
  const profileImageInput = document.getElementById('edit-profileImage');
  
  const formData = new FormData();
  formData.append('fullName', fullName);
  formData.append('bio', bio);
  if (profileImageInput.files[0]) {
    formData.append('profileImage', profileImageInput.files[0]);
  }

  try {
    const res = await fetch('/api/users', {
      method: 'PUT',
      credentials: 'include',
      body: formData
    });
    currentUser = await res.json();
    renderProfile(currentUser._id);
  } catch (err) {
    alert('Error updating profile');
  }
}

init();
