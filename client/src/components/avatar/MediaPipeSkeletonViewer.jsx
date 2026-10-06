import React, { useRef, useEffect } from 'react';

// MediaPipe hand color palette matching standard Sign.mt / Rylo Pose drawing
const FINGER_COLORS = {
  thumb: '#FF3B30',  // Red
  index: '#2563EB',  // Deep Blue
  middle: '#16A34A', // Green
  ring: '#06B6D4',   // Cyan
  pinky: '#F97316'   // Orange
};

// Pose definitions for key sign words (Joint X, Y relative positions)
const POSES_2D = {
  DEFAULT: {
    head: { x: 250, y: 110, rx: 45, ry: 60 },
    mouth: { x: 250, y: 140, w: 20, h: 10 },
    lShoulder: { x: 170, y: 220 },
    rShoulder: { x: 330, y: 220 },
    lElbow: { x: 130, y: 340 },
    rElbow: { x: 370, y: 340 },
    lWrist: { x: 140, y: 440 },
    rWrist: { x: 360, y: 440 },
    rHandRaised: false
  },
  HELLO: {
    head: { x: 250, y: 110, rx: 45, ry: 60 },
    mouth: { x: 250, y: 138, w: 26, h: 14 },
    lShoulder: { x: 170, y: 220 },
    rShoulder: { x: 330, y: 220 },
    lElbow: { x: 130, y: 340 },
    rElbow: { x: 360, y: 270 },
    lWrist: { x: 140, y: 440 },
    rWrist: { x: 330, y: 150 }, // Hand pointing up next to head (like in screenshot)
    rHandRaised: true
  },
  PHOTOSYNTHESIS: {
    head: { x: 250, y: 110, rx: 45, ry: 60 },
    mouth: { x: 250, y: 142, w: 24, h: 12 },
    lShoulder: { x: 170, y: 220 },
    rShoulder: { x: 330, y: 220 },
    lElbow: { x: 180, y: 290 },
    rElbow: { x: 320, y: 290 },
    lWrist: { x: 210, y: 200 },
    rWrist: { x: 290, y: 200 },
    rHandRaised: true
  },
  SUNLIGHT: {
    head: { x: 250, y: 105, rx: 45, ry: 60 },
    mouth: { x: 250, y: 136, w: 30, h: 16 },
    lShoulder: { x: 170, y: 220 },
    rShoulder: { x: 330, y: 220 },
    lElbow: { x: 140, y: 160 },
    rElbow: { x: 360, y: 160 },
    lWrist: { x: 170, y: 90 },
    rWrist: { x: 330, y: 90 },
    rHandRaised: true
  }
};

export default function MediaPipeSkeletonViewer({ isSigning, currentWord = '', speed = 1 }) {
  const canvasRef = useRef(null);
  const poseStateRef = useRef({ ...POSES_2D.DEFAULT });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Helper: Interpolate 2D points smoothly
    const lerp = (start, end, amt) => start + (end - start) * amt;

    const render = (time) => {
      // Set target pose based on current word
      const w = (currentWord || '').toUpperCase();
      let targetPose = POSES_2D.DEFAULT;
      if (isSigning) {
        if (w.includes('HELLO') || w.includes('GOOD') || w.includes('MORNING')) targetPose = POSES_2D.HELLO;
        else if (w.includes('SUN') || w.includes('LIGHT')) targetPose = POSES_2D.SUNLIGHT;
        else if (w.includes('PHOTO') || w.includes('PLANT')) targetPose = POSES_2D.PHOTOSYNTHESIS;
        else targetPose = POSES_2D.HELLO;
      }

      // Dynamic wave effect for signing action
      const wave = isSigning ? Math.sin(time * 0.008 * speed) * 12 : 0;
      const lerpSpeed = 0.1 * speed;

      // Smooth joint lerping
      const cur = poseStateRef.current;
      cur.rWrist.x = lerp(cur.rWrist.x, targetPose.rWrist.x + wave, lerpSpeed);
      cur.rWrist.y = lerp(cur.rWrist.y, targetPose.rWrist.y + wave * 0.5, lerpSpeed);
      cur.rElbow.x = lerp(cur.rElbow.x, targetPose.rElbow.x + wave * 0.3, lerpSpeed);
      cur.rElbow.y = lerp(cur.rElbow.y, targetPose.rElbow.y, lerpSpeed);

      cur.lWrist.x = lerp(cur.lWrist.x, targetPose.lWrist.x - wave * 0.5, lerpSpeed);
      cur.lWrist.y = lerp(cur.lWrist.y, targetPose.lWrist.y, lerpSpeed);
      cur.lElbow.x = lerp(cur.lElbow.x, targetPose.lElbow.x, lerpSpeed);
      cur.lElbow.y = lerp(cur.lElbow.y, targetPose.lElbow.y, lerpSpeed);

      // Clear Canvas (White background matching reference screenshot)
      ctx.fillStyle = '#FAF8F5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Head & Face Contours (Dark Red/Brown stroke like screenshot)
      ctx.strokeStyle = '#600000';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Head Oval
      ctx.beginPath();
      ctx.ellipse(cur.head.x, cur.head.y, cur.head.rx, cur.head.ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Eyebrows
      ctx.fillStyle = '#600000';
      // Left Eyebrow
      ctx.beginPath();
      ctx.ellipse(225, 80, 14, 4, -0.1, 0, Math.PI * 2);
      ctx.fill();
      // Right Eyebrow
      ctx.beginPath();
      ctx.ellipse(275, 80, 14, 4, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.beginPath();
      ctx.ellipse(225, 95, 8, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(275, 95, 8, 4, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Mouth
      ctx.beginPath();
      ctx.ellipse(cur.head.x, targetPose.mouth.y, targetPose.mouth.w / 2, targetPose.mouth.h / 2, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Draw Torso & Arms Framework (Red lines `#FF2A2A` matching screenshot)
      ctx.strokeStyle = '#FF2A2A';
      ctx.lineWidth = 4;

      // Shoulder Line
      ctx.beginPath();
      ctx.moveTo(cur.lShoulder.x, cur.lShoulder.y);
      ctx.lineTo(cur.rShoulder.x, cur.rShoulder.y);
      ctx.stroke();

      // Torso Box Sides
      ctx.beginPath();
      ctx.moveTo(cur.lShoulder.x, cur.lShoulder.y);
      ctx.lineTo(200, 480);
      ctx.lineTo(300, 480);
      ctx.lineTo(cur.rShoulder.x, cur.rShoulder.y);
      ctx.stroke();

      // Left Arm Lines
      ctx.beginPath();
      ctx.moveTo(cur.lShoulder.x, cur.lShoulder.y);
      ctx.lineTo(cur.lElbow.x, cur.lElbow.y);
      ctx.lineTo(cur.lWrist.x, cur.lWrist.y);
      ctx.stroke();

      // Right Arm Lines
      ctx.beginPath();
      ctx.moveTo(cur.rShoulder.x, cur.rShoulder.y);
      ctx.lineTo(cur.rElbow.x, cur.rElbow.y);
      ctx.lineTo(cur.rWrist.x, cur.rWrist.y);
      ctx.stroke();

      // 3. Draw MediaPipe Articulated Hand & Fingers (Right Hand matching screenshot)
      drawMediaPipeHand(ctx, cur.rWrist.x, cur.rWrist.y, true, wave);
      drawMediaPipeHand(ctx, cur.lWrist.x, cur.lWrist.y, false, 0);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isSigning, currentWord, speed]);

  // Helper function to draw 21 MediaPipe Hand Keypoints with individual finger colors
  const drawMediaPipeHand = (ctx, wx, wy, isRaised, wave) => {
    ctx.save();
    ctx.translate(wx, wy);
    
    if (isRaised) {
      ctx.rotate(-Math.PI / 6);
    }

    ctx.lineWidth = 3;

    // Palm base & MCP knuckles
    const palm = { x: 0, y: -10 };

    // 5 Fingers keypoints (PIP, DIP, TIP)
    const fingers = [
      { name: 'thumb', color: FINGER_COLORS.thumb, joints: [{ x: -12, y: -15 }, { x: -22, y: -30 }, { x: -28, y: -45 }] },
      { name: 'index', color: FINGER_COLORS.index, joints: [{ x: -8, y: -25 }, { x: -10, y: -50 }, { x: -10, y: -75 }] },
      { name: 'middle', color: FINGER_COLORS.middle, joints: [{ x: 2, y: -25 }, { x: 5, y: -45 }, { x: 8, y: -65 }] },
      { name: 'ring', color: FINGER_COLORS.ring, joints: [{ x: 12, y: -22 }, { x: 18, y: -40 }, { x: 22, y: -58 }] },
      { name: 'pinky', color: FINGER_COLORS.pinky, joints: [{ x: 20, y: -18 }, { x: 28, y: -32 }, { x: 34, y: -48 }] }
    ];

    // Draw Palm Lines
    ctx.strokeStyle = '#E57373';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(palm.x, palm.y);
    ctx.stroke();

    // Draw Each Colored Finger Segment
    fingers.forEach(f => {
      ctx.strokeStyle = f.color;
      ctx.beginPath();
      ctx.moveTo(palm.x, palm.y);
      f.joints.forEach(j => {
        ctx.lineTo(j.x, j.y);
      });
      ctx.stroke();

      // Draw Keypoint Joint Dots
      f.joints.forEach(j => {
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(j.x, j.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    ctx.restore();
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#FAF8F5] rounded-xl overflow-hidden shadow-inner">
      <canvas
        ref={canvasRef}
        width={500}
        height={520}
        className="w-full h-full object-contain max-h-[500px]"
      />
    </div>
  );
}
