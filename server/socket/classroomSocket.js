const roomHistory = new Map();
const activeSessions = new Map();

export default function setupClassroomSocket(io) {
    io.on('connection', (socket) => {

        socket.on('join-classroom', ({ sessionId, role }) => {
            if (!sessionId) return;
            socket.join(sessionId);

            if (!roomHistory.has(sessionId)) {
                roomHistory.set(sessionId, []);
            }

            if (role === 'student') {
                const history = roomHistory.get(sessionId);
                socket.emit('caption-history', history);
                socket.to(sessionId).emit('student-joined', { studentId: socket.id });
            }

            if (role === 'teacher') {
                activeSessions.set(sessionId, { active: true, teacherId: socket.id });
            }
        });

        socket.on('caption-final', ({ sessionId, line, translated }) => {
            if (!sessionId) return;
            const payload = { line, translated, timestamp: Date.now() };

            if (!roomHistory.has(sessionId)) roomHistory.set(sessionId, []);
            roomHistory.get(sessionId).push(payload);

            socket.to(sessionId).emit('caption-update', payload);
        });

        socket.on('caption-interim', ({ sessionId, text }) => {
            if (!sessionId) return;
            socket.to(sessionId).emit('caption-interim-update', { text });
        });

        socket.on('disconnect', () => {
            // Cleanup logic if needed
        });
    });
}
