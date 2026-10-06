import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Pose dictionary for key Sign Language gestures (positions & rotations for joints)
const SIGN_POSES = {
  HELLO: {
    leftArm: { sRot: [-0.2, 0, -0.4], eRot: [0.2, 0, 0], hRot: [0, 0, 0] },
    rightArm: { sRot: [1.2, 0.3, 0.8], eRot: [0.8, 0.5, 0], hRot: [0.2, 0.4, 0.5] }, // Salute / wave hand near temple
    headRot: [0.05, 0.1, 0]
  },
  PHOTOSYNTHESIS: {
    leftArm: { sRot: [0.8, -0.4, -0.5], eRot: [1.0, -0.3, 0], hRot: [0.5, 0, 0] },
    rightArm: { sRot: [0.8, 0.4, 0.5], eRot: [1.0, 0.3, 0], hRot: [-0.5, 0, 0] }, // Palms facing together creating rays
    headRot: [0.1, 0, 0]
  },
  SUNLIGHT: {
    leftArm: { sRot: [1.4, -0.2, -0.6], eRot: [0.4, 0, 0], hRot: [0.8, 0, 0] }, // Hands overhead spreading light
    rightArm: { sRot: [1.4, 0.2, 0.6], eRot: [0.4, 0, 0], hRot: [0.8, 0, 0] },
    headRot: [-0.15, 0, 0]
  },
  WATER: {
    leftArm: { sRot: [0.1, 0, -0.3], eRot: [0.2, 0, 0], hRot: [0, 0, 0] },
    rightArm: { sRot: [1.1, 0.2, 0.3], eRot: [1.2, 0.4, 0], hRot: [0.3, 0.5, 0] }, // W-hand shape near chin
    headRot: [0.08, -0.05, 0]
  },
  ENERGY: {
    leftArm: { sRot: [0.9, -0.5, -0.7], eRot: [0.9, 0, 0], hRot: [0, 0, 0] },
    rightArm: { sRot: [0.9, 0.5, 0.7], eRot: [0.9, 0, 0], hRot: [0, 0, 0] }, // Flexing strong power pose
    headRot: [0.05, 0, 0]
  },
  DEFAULT: {
    leftArm: { sRot: [0.4, 0, -0.4], eRot: [0.5, 0, 0], hRot: [0, 0, 0] },
    rightArm: { sRot: [0.4, 0, 0.4], eRot: [0.5, 0, 0], hRot: [0, 0, 0] },
    headRot: [0, 0, 0]
  }
};

// 1. Procedural 3D Humanoid Avatar Component
function HologramAvatar({ isSigning, speed = 1, currentWord = '', poseMode = '3d' }) {
  const headRef = useRef();
  const torsoRef = useRef();
  const leftShoulderRef = useRef();
  const rightShoulderRef = useRef();
  const leftElbowRef = useRef();
  const rightElbowRef = useRef();
  const leftHandRef = useRef();
  const rightHandRef = useRef();

  const [blinkTimer, setBlinkTimer] = useState(0);

  // Determine active pose key based on current word
  const getActivePose = () => {
    if (!isSigning) return SIGN_POSES.DEFAULT;
    const w = (currentWord || '').toUpperCase();
    if (w.includes('SUN') || w.includes('LIGHT')) return SIGN_POSES.SUNLIGHT;
    if (w.includes('WATER') || w.includes('LIQUID')) return SIGN_POSES.WATER;
    if (w.includes('ENERGY') || w.includes('POWER')) return SIGN_POSES.ENERGY;
    if (w.includes('PHOTO') || w.includes('PLANT')) return SIGN_POSES.PHOTOSYNTHESIS;
    if (w.includes('HELLO') || w.includes('GOOD') || w.includes('MORNING')) return SIGN_POSES.HELLO;
    return SIGN_POSES.DEFAULT;
  };

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const pose = getActivePose();
    const lerpSpeed = isSigning ? 0.12 * speed : 0.08;

    // Idle breathing Y motion
    const breathe = Math.sin(time * 2) * 0.03;
    if (torsoRef.current) torsoRef.current.position.y = breathe - 0.2;
    if (headRef.current) headRef.current.position.y = 0.55 + breathe * 0.5;

    // Smooth head rotations
    if (headRef.current) {
      const dynamicTilt = isSigning ? Math.sin(time * 6 * speed) * 0.05 : Math.sin(time * 0.5) * 0.04;
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, pose.headRot[0] + dynamicTilt, lerpSpeed);
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, pose.headRot[1], lerpSpeed);
      headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, pose.headRot[2], lerpSpeed);
    }

    // Smooth Arm Joint Interpolation
    const animateJoint = (ref, targetRot, dynamicAmplitude = 0.1) => {
      if (!ref.current) return;
      const wave = isSigning ? Math.sin(time * 8 * speed) * dynamicAmplitude : 0;
      ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, targetRot[0] + wave, lerpSpeed);
      ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetRot[1] + wave * 0.5, lerpSpeed);
      ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, targetRot[2], lerpSpeed);
    };

    animateJoint(leftShoulderRef, pose.leftArm.sRot, 0.12);
    animateJoint(leftElbowRef, pose.leftArm.eRot, 0.15);
    animateJoint(leftHandRef, pose.leftArm.hRot, 0.2);

    animateJoint(rightShoulderRef, pose.rightArm.sRot, 0.12);
    animateJoint(rightElbowRef, pose.rightArm.eRot, 0.15);
    animateJoint(rightHandRef, pose.rightArm.hRot, 0.2);
  });

  return (
    <group position={[0, -0.5, 0]}>
      {/* Torso */}
      <mesh ref={torsoRef} castShadow>
        <cylinderGeometry args={[0.26, 0.16, 0.8, 32]} />
        <meshStandardMaterial
          color={isSigning ? '#0F62FE' : '#0F172A'}
          roughness={0.3}
          metalness={0.8}
          emissive={isSigning ? '#0043CE' : '#1E293B'}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} castShadow>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial
          color={isSigning ? '#4589FF' : '#1D4ED8'}
          roughness={0.2}
          metalness={0.7}
          emissive={isSigning ? '#0F62FE' : '#1E3A8A'}
          emissiveIntensity={0.6}
        />

        {/* Visor / Eye Display */}
        <mesh position={[0, 0.04, 0.18]}>
          <boxGeometry args={[0.24, 0.08, 0.08]} />
          <meshBasicMaterial color={isSigning ? '#FF4D4D' : '#60A5FA'} />
        </mesh>
      </mesh>

      {/* Left Shoulder Joint */}
      <group ref={leftShoulderRef} position={[-0.35, 0.3, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#4589FF" emissive="#0F62FE" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0, -0.25, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 16]} />
          <meshStandardMaterial color="#82B1FF" emissive="#4589FF" emissiveIntensity={0.9} />
        </mesh>

        {/* Left Elbow Joint */}
        <group ref={leftElbowRef} position={[0, -0.5, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color="#4589FF" emissive="#0F62FE" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[0, -0.22, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.025, 0.45, 16]} />
            <meshStandardMaterial color="#DBEAFE" emissive="#82B1FF" emissiveIntensity={1} />
          </mesh>

          {/* Left Hand & Fingers */}
          <group ref={leftHandRef} position={[0, -0.45, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.08, 0.1, 0.04]} />
              <meshStandardMaterial color="#FF4D4D" emissive="#FF4D4D" emissiveIntensity={0.8} />
            </mesh>
            {/* Articulated fingers */}
            {[-0.03, -0.01, 0.01, 0.03].map((xOffset, idx) => (
              <mesh key={idx} position={[xOffset, -0.08, 0]}>
                <boxGeometry args={[0.015, 0.06, 0.015]} />
                <meshBasicMaterial color="#FFE0E0" />
              </mesh>
            ))}
          </group>
        </group>
      </group>

      {/* Right Shoulder Joint */}
      <group ref={rightShoulderRef} position={[0.35, 0.3, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#4589FF" emissive="#0F62FE" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0, -0.25, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 16]} />
          <meshStandardMaterial color="#82B1FF" emissive="#4589FF" emissiveIntensity={0.9} />
        </mesh>

        {/* Right Elbow Joint */}
        <group ref={rightElbowRef} position={[0, -0.5, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color="#4589FF" emissive="#0F62FE" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[0, -0.22, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.025, 0.45, 16]} />
            <meshStandardMaterial color="#DBEAFE" emissive="#82B1FF" emissiveIntensity={1} />
          </mesh>

          {/* Right Hand & Fingers */}
          <group ref={rightHandRef} position={[0, -0.45, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.08, 0.1, 0.04]} />
              <meshStandardMaterial color="#FF4D4D" emissive="#FF4D4D" emissiveIntensity={0.8} />
            </mesh>
            {/* Articulated fingers */}
            {[-0.03, -0.01, 0.01, 0.03].map((xOffset, idx) => (
              <mesh key={idx} position={[xOffset, -0.08, 0]}>
                <boxGeometry args={[0.015, 0.06, 0.015]} />
                <meshBasicMaterial color="#FFE0E0" />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}

// 2. MediaPipe / OpenPose Style 3D Skeleton Wireframe Overlay
function PoseSkeletonOverlay({ isSigning, speed = 1 }) {
  const groupRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current && isSigning) {
      groupRef.current.position.y = Math.sin(time * 4) * 0.02;
    }
  });

  // Define 3D Skeleton Keypoints (Head, Neck, Shoulders, Elbows, Wrists, Hand Joints)
  const joints = [
    { name: 'Nose', pos: [0, 0.5, 0.1] },
    { name: 'Neck', pos: [0, 0.3, 0] },
    { name: 'R_Shoulder', pos: [0.35, 0.3, 0] },
    { name: 'R_Elbow', pos: [0.45, -0.1, 0.1] },
    { name: 'R_Wrist', pos: [0.3, -0.4, 0.25] },
    { name: 'L_Shoulder', pos: [-0.35, 0.3, 0] },
    { name: 'L_Elbow', pos: [-0.45, -0.1, 0.1] },
    { name: 'L_Wrist', pos: [-0.3, -0.4, 0.25] },
  ];

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Joint Glowing Nodes */}
      {joints.map((j, i) => (
        <mesh key={i} position={j.pos}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshBasicMaterial color="#00F0FF" />
        </mesh>
      ))}

      {/* Connecting Bones Lines */}
      {/* Torso line */}
      <line>
        <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0.5, 0.1),
          new THREE.Vector3(0, 0.3, 0),
          new THREE.Vector3(0, -0.4, 0)
        ])} />
        <lineBasicMaterial color="#00F0FF" linewidth={2} />
      </line>
      {/* Right Arm Line */}
      <line>
        <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0.3, 0),
          new THREE.Vector3(0.35, 0.3, 0),
          new THREE.Vector3(0.45, -0.1, 0.1),
          new THREE.Vector3(0.3, -0.4, 0.25)
        ])} />
        <lineBasicMaterial color="#00FF66" linewidth={3} />
      </line>
      {/* Left Arm Line */}
      <line>
        <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0.3, 0),
          new THREE.Vector3(-0.35, 0.3, 0),
          new THREE.Vector3(-0.45, -0.1, 0.1),
          new THREE.Vector3(-0.3, -0.4, 0.25)
        ])} />
        <lineBasicMaterial color="#00FF66" linewidth={3} />
      </line>
    </group>
  );
}

// Glowing pulsing base under the avatar
function GlowBase({ isSigning }) {
  const ringRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.5;
      const scaleVal = 1 + Math.sin(time * 3) * (isSigning ? 0.08 : 0.03);
      ringRef.current.scale.set(scaleVal, scaleVal, 1);
    }
  });

  return (
    <group position={[0, -1.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Outer Neon Ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.7, 0.75, 64]} />
        <meshBasicMaterial color={isSigning ? '#0F62FE' : '#FF4D4D'} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner grid projection */}
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[0.68, 32]} />
        <meshBasicMaterial
          color={isSigning ? '#4589FF' : '#FF4D4D'}
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>
    </group>
  );
}

export default function AvatarScene({ isSigning, speed = 1, currentWord = '', viewMode = '3d' }) {
  return (
    <div className="w-full h-full relative">
      {/* Glowing Soft Backdrop */}
      <div
        className={`absolute inset-0 transition-all duration-1000 rounded-2xl pointer-events-none opacity-30 ${
          isSigning
            ? 'bg-gradient-to-t from-blue-600/10 via-indigo-600/5 to-transparent'
            : 'bg-gradient-to-t from-red-600/10 via-amber-600/5 to-transparent'
        }`}
      />

      <Canvas
        shadows
        camera={{ position: [0, 0, 2.6], fov: 50 }}
        className="w-full h-full"
      >
        <color attach="background" args={['#070709']} />

        {/* Background stars/particles */}
        <Stars radius={100} depth={50} count={1200} factor={4} saturation={0.5} fade speed={2} />

        {/* Ambient environment light */}
        <ambientLight intensity={1.5} />

        {/* Spotlights */}
        <spotLight
          position={[2, 4, 3]}
          angle={0.5}
          penumbra={1}
          intensity={4}
          castShadow
          color={isSigning ? '#4589FF' : '#FF4D4D'}
        />
        <spotLight
          position={[-2, 1, 3]}
          angle={0.6}
          penumbra={0.5}
          intensity={3}
          color={isSigning ? '#82B1FF' : '#FFA8A8'}
        />

        <pointLight position={[0, 1, -2]} intensity={2.5} color={isSigning ? '#0F62FE' : '#FF4D4D'} />

        {/* Conditional Rendering based on Rylo View Mode */}
        {viewMode === 'skeleton' ? (
          <PoseSkeletonOverlay isSigning={isSigning} speed={speed} />
        ) : (
          <HologramAvatar isSigning={isSigning} speed={speed} currentWord={currentWord} />
        )}

        {/* Holographic floor ring */}
        <GlowBase isSigning={isSigning} />

        {/* Camera controls */}
        <OrbitControls
          enableZoom={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  );
}
