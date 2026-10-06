const { io } = require('socket.io-client');
const student = io('http://localhost:3001');
const teacher = io('http://localhost:3001');

student.on('connect', () => {
    student.emit('join-classroom', { sessionId: '123', role: 'student' });
});

teacher.on('connect', () => {
    teacher.emit('join-classroom', { sessionId: '123', role: 'teacher' });
    setTimeout(() => {
        teacher.emit('caption-final', { sessionId: '123', line: 'TEST_LINE', translated: '' });
    }, 500);
});

let testPassed = false;
student.on('caption-update', (data) => {
    if (data.line === 'TEST_LINE') {
        testPassed = true;
        console.log('SUCCESS');
        process.exit(0);
    }
});

setTimeout(() => {
    if (!testPassed) {
        console.log('FAILED - timed out');
        process.exit(1);
    }
}, 3000);
