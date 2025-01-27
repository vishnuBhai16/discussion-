const socket = io();

const discussionsDiv = document.getElementById('discussions');
const chatDiv = document.getElementById('chat');
const chatTopic = document.getElementById('chatTopic');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessage');
const createDiscussionBtn = document.getElementById('createDiscussion');
const searchInput = document.getElementById('search');

let currentTopic = null;

// Load discussions
socket.on('load discussions', (discussions) => {
  discussionsDiv.innerHTML = '';
  discussions.forEach(addDiscussionToDOM);
});

// Add a new discussion
socket.on('discussion created', addDiscussionToDOM);

function addDiscussionToDOM(discussion) {
  const div = document.createElement('div');
  div.className = 'discussion';
  div.textContent = discussion.topic;
  div.onclick = () => openDiscussion(discussion.topic);
  discussionsDiv.appendChild(div);
}

// Create a new discussion
createDiscussionBtn.addEventListener('click', () => {
  const topic = prompt('Enter discussion topic:');
  if (topic) {
    socket.emit('new discussion', topic);
  }
});

// Open a discussion
function openDiscussion(topic) {
  currentTopic = topic;
  chatTopic.textContent = topic;
  chatDiv.classList.remove('hidden');
  messagesDiv.innerHTML = '';

  const discussion = Array.from(discussionsDiv.children).find(d => d.textContent === topic);
  discussion && discussion.classList.add('active');
}

// Send a message
sendMessageBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const message = messageInput.value;
  if (message && currentTopic) {
    socket.emit('send message', { topic: currentTopic, message });
    messageInput.value = '';
  }
}

// Receive a message
socket.on('receive message', ({ topic, message }) => {
  if (topic === currentTopic) {
    const div = document.createElement('div');
    div.textContent = message;
    messagesDiv.appendChild(div);
  }
});

// Search discussions
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  Array.from(discussionsDiv.children).forEach(discussion => {
    const text = discussion.textContent.toLowerCase();
    discussion.style.display = text.includes(query) ? 'block' : 'none';
  });
});
