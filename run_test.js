const { io } = require("socket.io-client");
const teacher = io("http://localhost:3001");
const student1 = io("http://localhost:3001");
const student2 = io("http://localhost:3001");

teacher.emit('join-classroom', { sessionId: 'test-123', role: 'teacher' });
student1.emit('join-classroom', { sessionId: 'test-123', role: 'student' });
student2.emit('join-classroom', { sessionId: 'test-123', role: 'student' });

setTimeout(() => {
  teacher.emit('caption-final', { sessionId: 'test-123', line: 'Hello World', translated: 'Hola Mundo' });
}, 1000);

student1.on('caption-update', (data) => console.log('Student 1 received:', data.line));
student2.on('caption-update', (data) => {
  console.log('Student 2 received:', data.line);
  process.exit(0);
});
