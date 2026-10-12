import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import {
  Rotate3d,
  Layers,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Crosshair,
} from 'lucide-react';

// Salesforce Domain Config
const DOMAIN_CONFIG = {
  security: {
    name: 'Security & Sharing',
    color: '#0284c7', // Deep Azure
    emissive: '#e0f2fe',
    roughness: 0.2,
    metalness: 0.3,
  },
  governors: {
    name: 'Apex & Governors',
    color: '#059669', // Emerald Forest
    emissive: '#d1fae5',
    roughness: 0.2,
    metalness: 0.3,
  },
  async: {
    name: 'Async & Events',
    color: '#4f46e5', // Deep Indigo
    emissive: '#e0e7ff',
    roughness: 0.25,
    metalness: 0.3,
  },
  lwc: {
    name: 'LWC & Lightning',
    color: '#9333ea', // Royal Purple
    emissive: '#f3e8ff',
    roughness: 0.2,
    metalness: 0.3,
  },
  cpq: {
    name: 'CPQ & Data',
    color: '#d97706', // Rich Amber / Copper
    emissive: '#fef3c7',
    roughness: 0.2,
    metalness: 0.3,
  },
  devops: {
    name: 'DevOps & Metadata',
    color: '#e11d48', // Vibrant Rose / Terracotta
    emissive: '#ffe4e6',
    roughness: 0.25,
    metalness: 0.3,
  },
};

// 18 Layers of 100% Salesforce Architectural Subsystems (54 blocks total)
const SF_ARCHITECTURE_BLOCKS = [
  // Layer 0: Core Foundation
  { layer: 0, pos: 0, label: 'Salesforce Multi-Tenant DB', domain: 'governors' },
  { layer: 0, pos: 1, label: 'Universal SObject Schema', domain: 'cpq' },
  { layer: 0, pos: 2, label: 'Standard Platform Kernel', domain: 'governors' },

  // Layer 1: Apex Governors (Targeted in Stage 1 SOQL Loop)
  { layer: 1, pos: 0, label: 'SOQL Governor (101)', domain: 'governors' },
  { layer: 1, pos: 1, label: 'Bulkified Trigger Map', domain: 'governors' },
  { layer: 1, pos: 2, label: 'DML Limit (10k Rows)', domain: 'governors' },

  // Layer 2: Security & Sharing (Targeted in Stage 2 FLS / Without Sharing)
  { layer: 2, pos: 0, label: 'With Sharing Mode', domain: 'security' },
  { layer: 2, pos: 1, label: 'StripInaccessible FLS', domain: 'security' },
  { layer: 2, pos: 2, label: 'WITH USER_MODE Parser', domain: 'security' },

  // Layer 3: Mixed DML Concurrency (Targeted in Stage 3 Mixed DML)
  { layer: 3, pos: 0, label: 'Setup Object Lock Guard', domain: 'governors' },
  { layer: 3, pos: 1, label: 'Queueable Job Finalizer', domain: 'async' },
  { layer: 3, pos: 2, label: 'System.runAs() Isolation', domain: 'security' },

  // Layer 4: LWC & Shadow DOM (Targeted in Stage 4 LWC)
  { layer: 4, pos: 0, label: 'LWC Shadow DOM Boundary', domain: 'lwc' },
  { layer: 4, pos: 1, label: 'Lightning Data Service', domain: 'lwc' },
  { layer: 4, pos: 2, label: '@salesforce/schema Import', domain: 'lwc' },

  // Layer 5: Async Apex Limits (Targeted in Stage 5 Queueable Storm)
  { layer: 5, pos: 0, label: '250k Daily Async Cap', domain: 'async' },
  { layer: 5, pos: 1, label: 'Database.Batchable Scope', domain: 'async' },
  { layer: 5, pos: 2, label: 'High-Volume Platform Events', domain: 'async' },

  // Layer 6: Dynamic Schema & Metadata (Targeted in Stage 6 Hardcoded IDs)
  { layer: 6, pos: 0, label: 'Custom Metadata CMDT', domain: 'cpq' },
  { layer: 6, pos: 1, label: 'Describe SObject Cache', domain: 'cpq' },
  { layer: 6, pos: 2, label: 'RecordType DeveloperName', domain: 'cpq' },

  // Layer 7: DevOps & Quick Deploy (Targeted in Stage 7 Deployment)
  { layer: 7, pos: 0, label: 'RunLocalTests Coverage 85%', domain: 'devops' },
  { layer: 7, pos: 1, label: 'Quick Deploy Staging ID', domain: 'devops' },
  { layer: 7, pos: 2, label: 'Validation Check-Only Gate', domain: 'devops' },

  // Layer 8: Enterprise Security Architecture
  { layer: 8, pos: 0, label: 'Shield Platform Encryption', domain: 'security' },
  { layer: 8, pos: 1, label: 'OAuth Connected App Policy', domain: 'security' },
  { layer: 8, pos: 2, label: 'Salesforce Code Analyzer', domain: 'devops' },

  // Layer 9: Apex Runtime Governors
  { layer: 9, pos: 0, label: 'CPU Timeout (10s)', domain: 'governors' },
  { layer: 9, pos: 1, label: 'Heap Size Limit (12MB)', domain: 'governors' },
  { layer: 9, pos: 2, label: 'Apex Callout Limit (100)', domain: 'governors' },

  // Layer 10: Lightning Web Security & Locker
  { layer: 10, pos: 0, label: 'Lightning Web Security (LWS)', domain: 'lwc' },
  { layer: 10, pos: 1, label: 'SLDS Design Tokens', domain: 'lwc' },
  { layer: 10, pos: 2, label: 'NavigationMixin Router', domain: 'lwc' },

  // Layer 11: CPQ & Revenue Engine
  { layer: 11, pos: 0, label: 'QCP Quote Calculator', domain: 'cpq' },
  { layer: 11, pos: 1, label: 'Subscription Billing Engine', domain: 'cpq' },
  { layer: 11, pos: 2, label: 'Idempotent Order Activation', domain: 'cpq' },

  // Layer 12: Event-Driven Bus
  { layer: 12, pos: 0, label: 'Change Data Capture (CDC)', domain: 'async' },
  { layer: 12, pos: 1, label: 'CometD Streaming Client', domain: 'async' },
  { layer: 12, pos: 2, label: 'EventBus.publish() Buffer', domain: 'async' },

  // Layer 13: Architecture Framework (fflib)
  { layer: 13, pos: 0, label: 'fflib Domain Layer', domain: 'governors' },
  { layer: 13, pos: 1, label: 'fflib Selector Layer', domain: 'governors' },
  { layer: 13, pos: 2, label: 'fflib Service Layer', domain: 'governors' },

  // Layer 14: Data Cloud & External Services
  { layer: 14, pos: 0, label: 'Named Credentials Vault', domain: 'security' },
  { layer: 14, pos: 1, label: 'External Services OpenAPI', domain: 'devops' },
  { layer: 14, pos: 2, label: 'MuleSoft AnyPoint Proxy', domain: 'async' },

  // Layer 15: Package & AppExchange Governance
  { layer: 15, pos: 0, label: 'Managed Package Namespace', domain: 'devops' },
  { layer: 15, pos: 1, label: '2GP Second-Gen Packaging', domain: 'devops' },
  { layer: 15, pos: 2, label: 'AppExchange Security Review', domain: 'security' },

  // Layer 16: Org Health & Concurrency
  { layer: 16, pos: 0, label: 'Transaction Finalizer Guard', domain: 'governors' },
  { layer: 16, pos: 1, label: 'Skinny Table Optimizer', domain: 'cpq' },
  { layer: 16, pos: 2, label: 'Custom Index Selector', domain: 'governors' },

  // Layer 17: Release Gate & Production Sign-off
  { layer: 17, pos: 0, label: 'Production Freeze Window', domain: 'devops' },
  { layer: 17, pos: 1, label: 'Apex Test Assertions Gate', domain: 'devops' },
  { layer: 17, pos: 2, label: 'Technical Debt Ceiling', domain: 'governors' },
];

// Ordered sequence of blocks removed matching the 11 Salesforce stages
const REMOVAL_SEQUENCE = [
  3, 4,
  6, 7,
  9, 10,
  12, 14,
  15, 17,
  20, 18,
  21, 22,
  48, 50,
  27, 28,
  36, 38,
  42, 44,
  // Extra stress blocks
  24, 30, 33, 39, 45, 51, 0, 1, 2, 5, 8, 11, 13, 16, 19, 23, 25, 26, 29, 31, 32, 34, 35, 37, 40, 41, 43, 46, 47, 49, 52, 53
];

function createBlockTexture(label, domain, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Warm light alabaster / ivory gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 128);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.5, '#fbf8f2');
  grad.addColorStop(1, '#f3ece0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 128);

  // Subtle warm stone border
  ctx.strokeStyle = '#ded5c5';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 506, 122);

  // Vibrant domain stripe on left
  ctx.fillStyle = color;
  ctx.fillRect(3, 3, 26, 122);

  // Architectural fine grid pattern
  ctx.strokeStyle = 'rgba(120, 100, 80, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 40; x < 512; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 5);
    ctx.lineTo(x, 123);
    ctx.stroke();
  }

  // Domain badge text in JetBrains Mono
  ctx.fillStyle = color;
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.fillText(domain.toUpperCase(), 46, 42);

  // Block Label in Outfit (crisp dark charcoal #1c1917)
  ctx.fillStyle = '#1c1917';
  ctx.font = '800 34px "Outfit", sans-serif';
  ctx.fillText(label, 46, 92);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

const Virtual3DTower = forwardRef(function Virtual3DTower(
  {
    totalPulls = 0,
    instabilityPct = 0,
    isGameOver = false,
    onBlockSlide,
    onBlockLand,
    onTriggerStressCollapse,
    onExtractionComplete,
  },
  ref
) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const towerGroupRef = useRef(null);
  const DEFAULT_CAMERA_DISTANCE = 39.0;
  const DEFAULT_LOOK_AT_Y = 15.0;

  const blocksMeshMapRef = useRef(new Map());
  const animatingBlocksRef = useRef(new Set());
  const activeAnimFrameRef = useRef(null);
  const extractionSpotlightRef = useRef(null);
  const collapseBlocksRef = useRef([]);
  const isCollapsingRef = useRef(false);

  // Stable callback refs to ensure scene never re-mounts on render
  const onBlockSlideRef = useRef(onBlockSlide);
  const onBlockLandRef = useRef(onBlockLand);
  const onExtractionCompleteRef = useRef(onExtractionComplete);

  useEffect(() => {
    onBlockSlideRef.current = onBlockSlide;
  }, [onBlockSlide]);

  useEffect(() => {
    onBlockLandRef.current = onBlockLand;
  }, [onBlockLand]);

  useEffect(() => {
    onExtractionCompleteRef.current = onExtractionComplete;
  }, [onExtractionComplete]);

  // Camera & Mouse drag rotation
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.12, y: 0.5 });
  const currentRotationRef = useRef({ x: 0.12, y: 0.5 });
  const cameraDistanceRef = useRef(DEFAULT_CAMERA_DISTANCE);
  const targetLookAtYRef = useRef(DEFAULT_LOOK_AT_Y);
  const currentLookAtYRef = useRef(DEFAULT_LOOK_AT_Y);

  // Extraction tracking state
  const pulledIndicesRef = useRef(new Set());
  const [activeExtractionInfo, setActiveExtractionInfo] = useState(null);
  const [extractedHistory, setExtractedHistory] = useState([]);



  // Initialize Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 450;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f4efe6');
    sceneRef.current = scene;

    // 2. Camera - Framed to comfortably fit all 18 layers + cyber pedestal
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
    camera.position.set(0, DEFAULT_LOOK_AT_Y, DEFAULT_CAMERA_DISTANCE);
    camera.lookAt(0, DEFAULT_LOOK_AT_Y, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Lighting - Warm Natural Sunlit Gallery
    const ambientLight = new THREE.AmbientLight(0xfefcf9, 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.6);
    keyLight.position.set(22, 42, 28);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xe0f2fe, 1.5);
    rimLight.position.set(-25, 35, -20);
    scene.add(rimLight);

    const warmGround = new THREE.PointLight(0xd97706, 2.2, 45);
    warmGround.position.set(0, 2, 0);
    scene.add(warmGround);

    // Focused Extraction Laser Spotlight for lock-on tracking
    const extractionSpotlight = new THREE.SpotLight(0xe11d48, 0, 50, Math.PI / 4, 0.35, 1.2);
    extractionSpotlight.position.set(0, 15.5, 20);
    scene.add(extractionSpotlight);
    scene.add(extractionSpotlight.target);
    extractionSpotlightRef.current = extractionSpotlight;

    // 5. Light Travertine / Sandstone Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(13.5, 15.5, 1.8, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xe8e2d4,
      roughness: 0.35,
      metalness: 0.15,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.9;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    const ringGeo1 = new THREE.RingGeometry(13.8, 14.4, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xd97706, // Bronze/Amber accent
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = -Math.PI / 2;
    ring1.position.y = 0.05;
    scene.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(9.0, 9.4, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x0284c7, // Azure accent
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 2;
    ring2.position.y = 0.06;
    scene.add(ring2);

    const grid = new THREE.GridHelper(28, 18, 0xd4cbb9, 0xe5dfd2);
    grid.position.y = 0.07;
    scene.add(grid);

    // 6. Tower Group
    const towerGroup = new THREE.Group();
    towerGroup.position.y = 0;
    scene.add(towerGroup);
    towerGroupRef.current = towerGroup;

    // Block dimensions
    const blockLength = 9.4;
    const blockWidth = 2.95;
    const blockHeight = 1.65;
    const spacing = 0.08;
    const blockGeo = new THREE.BoxGeometry(blockLength, blockHeight, blockWidth);

    // Build the 18 layers (54 blocks)
    SF_ARCHITECTURE_BLOCKS.forEach((item, index) => {
      const { layer, pos, label, domain } = item;
      const isEvenLayer = layer % 2 === 0;

      const domainInfo = DOMAIN_CONFIG[domain] || DOMAIN_CONFIG.governors;
      const texture = createBlockTexture(label, domain, domainInfo.color);

      // Body material: Warm architectural alabaster / light maple for block top, bottom, and back
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xf6f0e6,
        roughness: 0.35,
        metalness: 0.05,
      });

      // Accent material for the side ends of the block
      const accentEndMat = new THREE.MeshStandardMaterial({
        color: domainInfo.color,
        roughness: 0.25,
        metalness: 0.1,
      });

      const frontFaceMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.2,
        metalness: 0.05,
      });

      const materials = [
        accentEndMat,
        accentEndMat,
        bodyMat,
        bodyMat,
        frontFaceMat,
        bodyMat,
      ];

      const mesh = new THREE.Mesh(blockGeo, materials);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const y = layer * (blockHeight + spacing) + blockHeight / 2;
      const offsetPos = (pos - 1) * (blockWidth + spacing);

      if (isEvenLayer) {
        mesh.position.set(0, y, offsetPos);
        mesh.rotation.y = 0;
      } else {
        mesh.position.set(offsetPos, y, 0);
        mesh.rotation.y = Math.PI / 2;
      }

      mesh.userData = {
        index,
        layer,
        pos,
        label,
        domain,
        initialPos: mesh.position.clone(),
        initialRot: mesh.rotation.clone(),
        isEvenLayer,
        isExtracted: false,
        slideDirection: isEvenLayer
          ? new THREE.Vector3(pos % 2 === 0 ? 1 : -1, 0, 0)
          : new THREE.Vector3(0, 0, pos % 2 === 0 ? 1 : -1),
        animTime: 0,
        hasPlayedSlideSound: false,
        hasPlayedLandSound: false,
      };

      towerGroup.add(mesh);
      blocksMeshMapRef.current.set(index, mesh);
    });

    // Mouse Drag Rotation
    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      targetRotationRef.current.y += deltaX * 0.008;
      targetRotationRef.current.x = Math.max(
        -0.35,
        Math.min(0.55, targetRotationRef.current.x + deltaY * 0.006)
      );

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Mobile & Tablet Touch Support
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

      targetRotationRef.current.y += deltaX * 0.008;
      targetRotationRef.current.x = Math.max(
        -0.35,
        Math.min(0.55, targetRotationRef.current.x + deltaY * 0.006)
      );

      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      cameraDistanceRef.current = Math.max(
        14,
        Math.min(42, cameraDistanceRef.current + e.deltaY * 0.035)
      );
      camera.position.z = cameraDistanceRef.current;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // Dynamic resize handling with ResizeObserver for instant adaptation
    const updateSize = (w, h) => {
      if (!w || !h || !renderer || !camera) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const handleResize = () => {
      if (!container) return;
      updateSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          updateSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      activeAnimFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth idle rotation if idle
      if (!isDraggingRef.current && animatingBlocksRef.current.size === 0) {
        targetRotationRef.current.y += 0.0018;
      }

      currentRotationRef.current.y +=
        (targetRotationRef.current.y - currentRotationRef.current.y) * 0.08;
      currentRotationRef.current.x +=
        (targetRotationRef.current.x - currentRotationRef.current.x) * 0.08;

      if (towerGroupRef.current) {
        towerGroupRef.current.rotation.y = currentRotationRef.current.y;
        towerGroupRef.current.rotation.x = currentRotationRef.current.x;
      }

      // Smooth camera distance, height & lookAt height interpolation for close-up block tracking!
      camera.position.z += (cameraDistanceRef.current - camera.position.z) * 0.08;
      currentLookAtYRef.current += (targetLookAtYRef.current - currentLookAtYRef.current) * 0.08;
      camera.position.y += (currentLookAtYRef.current - camera.position.y) * 0.08;
      camera.lookAt(0, currentLookAtYRef.current, 0);

      // Dynamically lock spotlight on targeted extraction height
      if (extractionSpotlightRef.current) {
        if (animatingBlocksRef.current.size > 0) {
          extractionSpotlightRef.current.intensity = 18.0;
          extractionSpotlightRef.current.position.set(0, currentLookAtYRef.current + 3.0, camera.position.z - 2.0);
          extractionSpotlightRef.current.target.position.set(0, currentLookAtYRef.current, 0);
          extractionSpotlightRef.current.target.updateMatrixWorld();
        } else {
          extractionSpotlightRef.current.intensity = 0;
        }
      }

      // 4-Phase Block Removal Animation:
      animatingBlocksRef.current.forEach((mesh) => {
        if (!mesh) return;

        mesh.userData.animTime += delta;
        const t = mesh.userData.animTime;

        // Phase 1: High-Voltage Pulse & Spotlight Lock (0 to 0.7s)
        if (t < 0.7) {
          const flash = Math.sin(t * 24) * 0.5 + 0.5;
          if (mesh.material) {
            mesh.material.forEach((m) => {
              if (m && m.emissive) {
                m.emissive.setHex(flash > 0.5 ? 0xff0044 : 0x00f0ff);
                m.emissiveIntensity = 2.4;
              }
            });
          }
        }
        // Phase 2: Slide Out of Tower (0.7 to 2.2s)
        else if (t >= 0.7 && t < 2.2) {
          if (!mesh.userData.hasPlayedSlideSound) {
            mesh.userData.hasPlayedSlideSound = true;
            onBlockSlideRef.current?.();
          }

          if (mesh.material) {
            mesh.material.forEach((m) => {
              if (m && m.emissive) {
                m.emissive.setHex(0xff0044);
                m.emissiveIntensity = 1.8;
              }
            });
          }

          const slideP = (t - 0.7) / 1.5;
          const easeSlide = slideP * slideP * (3 - 2 * slideP);

          const slideDist = 12.0 * easeSlide;
          const pos = mesh.userData.initialPos.clone();
          pos.addScaledVector(mesh.userData.slideDirection, slideDist);
          mesh.position.copy(pos);

          if (towerGroupRef.current) {
            towerGroupRef.current.position.x = (Math.random() - 0.5) * 0.18;
          }
        }
        // Phase 3: Free Fall under Gravity (2.2 to 3.2s)
        else if (t >= 2.2 && t < 3.2) {
          const fallP = (t - 2.2) / 1.0;

          const targetY = 0.8 + mesh.userData.pos * 0.5;
          const initialY = mesh.userData.initialPos.y;
          const currentY = initialY - Math.pow(fallP, 2.2) * (initialY - targetY);

          mesh.position.y = Math.max(targetY, currentY);

          mesh.rotation.z += 0.06 * (mesh.userData.pos % 2 === 0 ? 1 : -1);
          mesh.rotation.x += 0.04;

          const drift = 12.0 + fallP * 3.0;
          mesh.position.x =
            mesh.userData.initialPos.x + mesh.userData.slideDirection.x * drift;
          mesh.position.z =
            mesh.userData.initialPos.z + mesh.userData.slideDirection.z * drift;
        }
        // Phase 4: Settle on Floor (>3.2s)
        else {
          if (!mesh.userData.hasPlayedLandSound) {
            mesh.userData.hasPlayedLandSound = true;
            onBlockLandRef.current?.();
          }
          const targetY = 0.8 + (mesh.userData.pos % 2) * 0.4;
          mesh.position.y = targetY;

          // Settle emissive back down
          if (mesh.material) {
            mesh.material.forEach((m) => {
              if (m && m.emissive) {
                m.emissive.setHex(0x1a050b);
                m.emissiveIntensity = 0.5;
              }
            });
          }

          animatingBlocksRef.current.delete(mesh);
          if (animatingBlocksRef.current.size === 0) {
            // Restore full tower overview camera after block settles
            targetLookAtYRef.current = DEFAULT_LOOK_AT_Y;
            cameraDistanceRef.current = DEFAULT_CAMERA_DISTANCE;
            onExtractionCompleteRef.current?.();
          }
        }
      });

      // 5. Catastrophic Physics Collapse Simulation (All 54 Blocks Tumble)
      if (isCollapsingRef.current && collapseBlocksRef.current.length > 0) {
        const gravity = -34.0;

        collapseBlocksRef.current.forEach((item) => {
          const { mesh } = item;
          if (!mesh) return;

          if (!item.isGrounded) {
            item.vy += gravity * delta;
            mesh.position.x += item.vx * delta;
            mesh.position.y += item.vy * delta;
            mesh.position.z += item.vz * delta;

            mesh.rotation.x += item.rotVx;
            mesh.rotation.y += item.rotVy;
            mesh.rotation.z += item.rotVz;

            // Bounce on cyber platform floor
            if (mesh.position.y <= item.floorY) {
              mesh.position.y = item.floorY;
              item.vy = -item.vy * 0.32;
              item.vx *= 0.62;
              item.vz *= 0.62;
              item.rotVx *= 0.5;
              item.rotVy *= 0.5;
              item.rotVz *= 0.5;

              if (Math.abs(item.vy) < 1.2) {
                item.isGrounded = true;
                item.vy = 0;
              }
            }
          }
        });

        if (towerGroupRef.current) {
          towerGroupRef.current.position.x = (Math.random() - 0.5) * 0.45;
          towerGroupRef.current.position.z = (Math.random() - 0.5) * 0.45;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(activeAnimFrameRef.current);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('wheel', handleWheel);
      renderer.dispose();
    };
  }, []);

  // Method to trigger block removal with CLOSE-UP CAMERA SPOTLIGHT FOCUS
  const triggerExtractionSequence = useCallback(
    (pullsCount) => {
      if (pullsCount <= 0) return;
      const currentlyPulled = pulledIndicesRef.current.size;
      const targetIndices = REMOVAL_SEQUENCE.slice(currentlyPulled, currentlyPulled + pullsCount);
      const staggerDelay = 2200;

      targetIndices.forEach((blockIdx, delayIndex) => {
        setTimeout(() => {
          const mesh = blocksMeshMapRef.current.get(blockIdx);
          if (!mesh || mesh.userData.isExtracted) return;

          mesh.userData.isExtracted = true;
          mesh.userData.animTime = 0;
          mesh.userData.hasPlayedSlideSound = false;
          mesh.userData.hasPlayedLandSound = false;
          animatingBlocksRef.current.add(mesh);
          pulledIndicesRef.current.add(blockIdx);

          // 1. PINPOINT CAMERA FOCUS SPECIFICALLY ON THIS TARGET BLOCK!
          const blockWorldY = mesh.userData.initialPos.y;
          targetLookAtYRef.current = blockWorldY;
          // Zoom close in to read block label and watch it slide out
          cameraDistanceRef.current = 13.5;

          // 2. Rotate tower to face the block removal angle directly
          if (mesh.userData.isEvenLayer) {
            targetRotationRef.current.y =
              mesh.userData.slideDirection.x > 0 ? -Math.PI / 2 : Math.PI / 2;
          } else {
            targetRotationRef.current.y =
              mesh.userData.slideDirection.z > 0 ? 0 : Math.PI;
          }

          setActiveExtractionInfo({
            label: mesh.userData.label,
            domain: mesh.userData.domain,
            layer: mesh.userData.layer,
          });

          setExtractedHistory((prev) => [
            {
              label: mesh.userData.label,
              domain: mesh.userData.domain,
              layer: mesh.userData.layer,
            },
            ...prev,
          ]);
        }, delayIndex * staggerDelay);
      });

      // After all extracted blocks settle, smoothly restore full overview camera
      const totalSequenceTime = targetIndices.length * staggerDelay + 2600;
      setTimeout(() => {
        setActiveExtractionInfo(null);
        targetLookAtYRef.current = DEFAULT_LOOK_AT_Y;
        cameraDistanceRef.current = DEFAULT_CAMERA_DISTANCE;
      }, totalSequenceTime);
    },
    [DEFAULT_LOOK_AT_Y, DEFAULT_CAMERA_DISTANCE]
  );

  // Catastrophic 3D physics collapse simulation (All 54 Blocks Tumble into Ruin)
  const triggerCatastrophicCollapse = useCallback(() => {
    isCollapsingRef.current = true;
    animatingBlocksRef.current.clear();
    const list = [];

    // Frame wide overview of the collapsing structure
    cameraDistanceRef.current = 42.0;
    targetLookAtYRef.current = 10.0;

    blocksMeshMapRef.current.forEach((mesh) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 5.0 + Math.random() * 12.0;
      const layerWeight = (mesh.userData.layer + 1) / 18.0;

      list.push({
        mesh,
        vx: Math.cos(angle) * speed * (0.8 + layerWeight),
        vy: 3.0 + Math.random() * 6.0 + layerWeight * 5.0,
        vz: Math.sin(angle) * speed * (0.8 + layerWeight),
        rotVx: (Math.random() - 0.5) * 0.35,
        rotVy: (Math.random() - 0.5) * 0.35,
        rotVz: (Math.random() - 0.5) * 0.35,
        floorY: 0.8 + Math.random() * 0.6,
        isGrounded: false,
      });

      if (mesh.material) {
        mesh.material.forEach((m) => {
          if (m && m.emissive) {
            m.emissive.setHex(0xff0033);
            m.emissiveIntensity = 2.4;
          }
        });
      }
    });

    collapseBlocksRef.current = list;
  }, []);

  useImperativeHandle(ref, () => ({
    triggerExtractionSequence,
    triggerCatastrophicCollapse,
    resetCamera: () => {
      targetRotationRef.current = { x: 0.12, y: 0.5 };
      targetLookAtYRef.current = DEFAULT_LOOK_AT_Y;
      cameraDistanceRef.current = DEFAULT_CAMERA_DISTANCE;
    },
  }));

  const handleReplayLastExtraction = () => {
    if (pulledIndicesRef.current.size === 0) return;
    const lastIdx = Array.from(pulledIndicesRef.current).pop();
    const mesh = blocksMeshMapRef.current.get(lastIdx);
    if (mesh) {
      mesh.position.copy(mesh.userData.initialPos);
      mesh.rotation.copy(mesh.userData.initialRot);
      mesh.userData.animTime = 0;
      mesh.userData.hasPlayedSlideSound = false;
      mesh.userData.hasPlayedLandSound = false;
      animatingBlocksRef.current.add(mesh);

      // Focus camera on the replayed block
      targetLookAtYRef.current = mesh.userData.initialPos.y;
      cameraDistanceRef.current = 13.5;
      setActiveExtractionInfo({
        label: mesh.userData.label,
        domain: mesh.userData.domain,
        layer: mesh.userData.layer,
      });

      setTimeout(() => {
        setActiveExtractionInfo(null);
        targetLookAtYRef.current = DEFAULT_LOOK_AT_Y;
        cameraDistanceRef.current = DEFAULT_CAMERA_DISTANCE;
      }, 3800);
    }
  };

  // Synchronize extracted missing blocks in tower with totalPulls
  useEffect(() => {
    if (!blocksMeshMapRef.current || blocksMeshMapRef.current.size === 0) return;

    if (totalPulls <= 0) {
      // If reset to 0, restore all blocks to their intact slots in the tower
      isCollapsingRef.current = false;
      collapseBlocksRef.current = [];
      if (towerGroupRef.current) {
        towerGroupRef.current.position.set(0, 0, 0);
      }
      if (pulledIndicesRef.current.size > 0) {
        pulledIndicesRef.current.clear();
        setExtractedHistory([]);
        blocksMeshMapRef.current.forEach((mesh) => {
          mesh.position.copy(mesh.userData.initialPos);
          mesh.rotation.copy(mesh.userData.initialRot);
          mesh.userData.isExtracted = false;
          mesh.userData.animTime = 0;
          mesh.userData.hasPlayedSlideSound = false;
          mesh.userData.hasPlayedLandSound = false;
          if (mesh.material) {
            mesh.material.forEach((m) => {
              if (m && m.emissive) {
                m.emissive.setHex(0x050a14);
                m.emissiveIntensity = 0.5;
              }
            });
          }
        });
      }
      return;
    }

    // Ensure all blocks up to totalPulls are extracted and shown missing from tower
    const shouldBePulled = REMOVAL_SEQUENCE.slice(0, totalPulls);
    shouldBePulled.forEach((blockIdx, i) => {
      const mesh = blocksMeshMapRef.current.get(blockIdx);
      if (!mesh) return;

      if (!pulledIndicesRef.current.has(blockIdx)) {
        pulledIndicesRef.current.add(blockIdx);
        mesh.userData.isExtracted = true;

        // Position resting on pedestal floor away from tower structure
        const targetY = 0.8 + (mesh.userData.pos % 2) * 0.4;
        const drift = 12.0 + (i % 3) * 1.6;
        mesh.position.x = mesh.userData.initialPos.x + mesh.userData.slideDirection.x * drift;
        mesh.position.z = mesh.userData.initialPos.z + mesh.userData.slideDirection.z * drift;
        mesh.position.y = targetY;
        mesh.rotation.z = 0.25 * (mesh.userData.pos % 2 === 0 ? 1 : -1);
        mesh.rotation.x = 0.15;

        if (mesh.material) {
          mesh.material.forEach((m) => {
            if (m && m.emissive) {
              m.emissive.setHex(0x1a050b);
              m.emissiveIntensity = 0.4;
            }
          });
        }
      }
    });

    const historyItems = shouldBePulled.map((idx) => {
      const b = SF_ARCHITECTURE_BLOCKS[idx];
      return { label: b.label, domain: b.domain, layer: b.layer };
    });
    setExtractedHistory(historyItems.reverse());
  }, [totalPulls]);

  useEffect(() => {
    if (!towerGroupRef.current) return;
    if (instabilityPct >= 70) {
      towerGroupRef.current.position.x = (Math.random() - 0.5) * 0.6;
      towerGroupRef.current.position.z = (Math.random() - 0.5) * 0.6;
    } else if (instabilityPct >= 40) {
      towerGroupRef.current.position.x = (Math.random() - 0.5) * 0.25;
      towerGroupRef.current.position.z = (Math.random() - 0.5) * 0.25;
    } else {
      towerGroupRef.current.position.x = 0;
      towerGroupRef.current.position.z = 0;
    }
  }, [instabilityPct]);

  // Trigger catastrophic 3D tumble physics when game over occurs
  useEffect(() => {
    if (isGameOver) {
      triggerCatastrophicCollapse();
    }
  }, [isGameOver, triggerCatastrophicCollapse]);

  const handleZoom = (inOut) => {
    cameraDistanceRef.current = Math.max(
      14,
      Math.min(60, cameraDistanceRef.current + inOut * 5)
    );
  };

  const handleResetCamera = () => {
    targetRotationRef.current = { x: 0.12, y: 0.5 };
    targetLookAtYRef.current = DEFAULT_LOOK_AT_Y;
    cameraDistanceRef.current = DEFAULT_CAMERA_DISTANCE;
  };

  const tensionBadgeColor =
    instabilityPct >= 75
      ? 'text-rose-700 border-rose-300 bg-rose-50'
      : instabilityPct >= 40
      ? 'text-amber-800 border-amber-300 bg-amber-50'
      : 'text-emerald-800 border-emerald-300 bg-emerald-50';

  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between h-full relative overflow-hidden select-none border border-[#e5dec9] shadow-md">
      {/* Background ambient lighting */}
      <div
        className={`absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none transition-colors duration-700 ${
          instabilityPct >= 70 ? 'bg-rose-400' : instabilityPct >= 40 ? 'bg-amber-400' : 'bg-emerald-400'
        }`}
      />

      {/* Header */}
      <div className="shrink-0 mb-2">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">☁️</span>
            <div>
              <h3 className="font-extrabold text-stone-900 text-base tracking-tight flex items-center gap-2 font-display">
                <span>Salesforce Architecture Tower</span>
                <span className="text-[10px] font-mono font-bold bg-[#ede6d8] text-stone-800 border border-[#dfd6c5] px-2 py-0.5 rounded-full shadow-sm">
                  Apex & LWC
                </span>
              </h3>
            </div>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full border font-mono font-bold ${tensionBadgeColor}`}>
            {instabilityPct}% Instability
          </span>
        </div>

        {/* Instability progress bar */}
        <div className="w-full bg-[#ede6d8] rounded-full h-1.5 overflow-hidden border border-[#ded5c5] mb-2">
          <div
            className={`h-full transition-all duration-700 rounded-full ${
              instabilityPct >= 75
                ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                : instabilityPct >= 40
                ? 'bg-gradient-to-r from-sky-500 to-amber-500'
                : 'bg-gradient-to-r from-emerald-500 to-sky-500'
            }`}
            style={{ width: `${Math.max(4, instabilityPct)}%` }}
          />
        </div>

        {/* Subsystem Domain Badges */}
        <div className="flex flex-wrap gap-1 text-[10px] font-mono">
          {Object.entries(DOMAIN_CONFIG).map(([key, dom]) => (
            <span
              key={key}
              className="px-2 py-0.5 rounded-md border border-[#ded5c5] bg-[#fdfbf7] flex items-center gap-1.5 text-stone-700"
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dom.color }} />
              <span className="font-medium">{dom.name}</span>
            </span>
          ))}
        </div>
      </div>

      {/* 3D WebGL Canvas with Close-up Focus & Crosshair */}
      <div className="relative w-full flex-1 min-h-[280px] sm:min-h-[320px] bg-gradient-to-b from-[#f5f0e6] to-[#eae3d5] rounded-xl border border-[#ded5c5] overflow-hidden group select-none shadow-inner">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Full-view Target Reticle & Lock-on Banner */}
        {activeExtractionInfo && (
          <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 select-none">
            {/* Top Targeting Lock-on Banner */}
            <div className="bg-[#fff5f5]/95 border-2 border-rose-500 text-stone-900 rounded-2xl p-3 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-400 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">
                  <Crosshair className="w-6 h-6 text-rose-600 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                      TARGET ACQUIRED
                    </span>
                    <span className="text-[10px] font-mono text-amber-800 font-bold">
                      REMOVING FROM TOWER
                    </span>
                  </div>
                  <p className="text-sm font-black text-stone-900 font-mono mt-0.5 truncate">
                    Layer {activeExtractionInfo.layer}: [{activeExtractionInfo.label}]
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block shrink-0">
                <span className="text-[9px] font-mono text-stone-500 uppercase block">Domain</span>
                <span className="text-xs font-mono font-black text-rose-700 uppercase">
                  {DOMAIN_CONFIG[activeExtractionInfo.domain]?.name || activeExtractionInfo.domain}
                </span>
              </div>
            </div>

            {/* Center Crosshair Ring */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
              <div className="w-28 h-28 border border-rose-500/40 rounded-full animate-ping" style={{ animationDuration: '2.5s' }} />
              <div className="absolute w-20 h-20 border-2 border-dashed border-amber-600/80 rounded-full animate-spin" style={{ animationDuration: '6s' }} />
              <div className="absolute w-2.5 h-2.5 bg-rose-500 rounded-full shadow-lg shadow-rose-500" />
            </div>

            {/* Bottom Live Extraction Status Ticker */}
            <div className="self-center bg-rose-50/95 border border-rose-400 text-rose-800 px-4 py-1.5 rounded-full text-[11px] font-mono flex items-center gap-2 backdrop-blur-md shadow-xl">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              <span className="font-bold">SLIDING COMPONENT OUT • ARCHITECTURE DESTABILIZING</span>
            </div>
          </div>
        )}

        {/* 3D Camera Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          <button
            onClick={() => handleZoom(-1)}
            title="Zoom In"
            className="p-2 rounded-xl bg-white/90 border border-[#ded5c5] text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-colors cursor-pointer shadow-md backdrop-blur-md"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(1)}
            title="Zoom Out"
            className="p-2 rounded-xl bg-white/90 border border-[#ded5c5] text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-colors cursor-pointer shadow-md backdrop-blur-md"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetCamera}
            title="Reset View"
            className="p-2 rounded-xl bg-white/90 border border-[#ded5c5] text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-colors cursor-pointer shadow-md backdrop-blur-md"
          >
            <Rotate3d className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Drag Hint */}
        <div className="absolute bottom-2 left-3 text-[10px] font-mono text-stone-700 pointer-events-none flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-full border border-[#ded5c5] backdrop-blur-sm shadow-sm">
          <Rotate3d className="w-3 h-3 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Click & Drag to Rotate 360° • Camera Zooms In on Removed Blocks</span>
        </div>
      </div>

      {/* Extracted Subsystems List & Replay Control */}
      <div className="shrink-0 mt-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-stone-600 mb-1">
          <span>Fallen Salesforce Subsystems ({totalPulls} blocks extracted):</span>
          {totalPulls > 0 && (
            <button
              onClick={handleReplayLastExtraction}
              className="text-[11px] text-amber-700 hover:text-amber-800 flex items-center gap-1 underline cursor-pointer font-bold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Replay Close-up</span>
            </button>
          )}
        </div>

        {extractedHistory.length === 0 ? (
          <div className="p-2 rounded-lg bg-[#f8f5ee] border border-[#ded5c5] text-[11px] text-stone-500 font-mono text-center">
            All 54 Salesforce components intact and governor-compliant.
          </div>
        ) : (
          <div className="space-y-1 max-h-16 overflow-y-auto pr-1">
            {extractedHistory.slice(0, 4).map((item, idx) => {
              const dom = DOMAIN_CONFIG[item.domain] || DOMAIN_CONFIG.governors;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between text-[11px] font-mono bg-white border border-[#ded5c5] px-2.5 py-0.5 rounded-lg shadow-xs"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dom.color }} />
                    <span className="text-stone-800 font-bold truncate">
                      Layer {item.layer}: {item.label}
                    </span>
                  </div>
                  <span className="text-rose-600 text-[10px] shrink-0 font-bold">
                    Extracted & Fallen
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick stress test link */}
      <div className="shrink-0 pt-1 text-center">
        <button
          onClick={onTriggerStressCollapse}
          className="text-[10px] text-stone-500 hover:text-rose-600 transition-colors underline cursor-pointer font-mono"
        >
          Simulate Catastrophic Structural Collapse (3D Tumble Demo)
        </button>
      </div>
    </div>
  );
});

export default Virtual3DTower;
