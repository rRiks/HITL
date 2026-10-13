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

// Minecraft Voxel Architecture Block Config
const DOMAIN_CONFIG = {
  governors: {
    name: 'Redstone Circuit',
    type: 'redstone',
    color: '#ff3b30',
    emissive: '#ff2200',
    roughness: 0.35,
    metalness: 0.1,
  },
  security: {
    name: 'Obsidian Shield',
    type: 'obsidian',
    color: '#a855f7',
    emissive: '#7e22ce',
    roughness: 0.25,
    metalness: 0.2,
  },
  async: {
    name: 'Diamond Tech',
    type: 'diamond',
    color: '#38bdf8',
    emissive: '#0284c7',
    roughness: 0.25,
    metalness: 0.2,
  },
  lwc: {
    name: 'Emerald UI',
    type: 'emerald',
    color: '#22c55e',
    emissive: '#15803d',
    roughness: 0.3,
    metalness: 0.1,
  },
  cpq: {
    name: 'Enchanted Bookshelf',
    type: 'bookshelf',
    color: '#f59e0b',
    emissive: '#b45309',
    roughness: 0.45,
    metalness: 0.05,
  },
  devops: {
    name: 'TNT Pipeline',
    type: 'tnt',
    color: '#ef4444',
    emissive: '#b91c1c',
    roughness: 0.35,
    metalness: 0.1,
  },
};

// 18 Layers of 100% Salesforce Architectural Subsystems (54 blocks total)
// Base Foundation at Layer 0; Top application stages at Layer 17
const SF_ARCHITECTURE_BLOCKS = [
  // Layer 0: Core Bedrock Foundation
  { layer: 0, pos: 0, label: 'Salesforce Multi-Tenant DB', domain: 'governors' },
  { layer: 0, pos: 1, label: 'Universal SObject Schema', domain: 'cpq' },
  { layer: 0, pos: 2, label: 'Standard Platform Kernel', domain: 'governors' },

  // Layer 1: Org Health & Concurrency
  { layer: 1, pos: 0, label: 'Transaction Finalizer Guard', domain: 'governors' },
  { layer: 1, pos: 1, label: 'Skinny Table Optimizer', domain: 'cpq' },
  { layer: 1, pos: 2, label: 'Custom Index Selector', domain: 'governors' },

  // Layer 2: Package & AppExchange Governance
  { layer: 2, pos: 0, label: 'Managed Package Namespace', domain: 'devops' },
  { layer: 2, pos: 1, label: '2GP Second-Gen Packaging', domain: 'devops' },
  { layer: 2, pos: 2, label: 'AppExchange Security Review', domain: 'security' },

  // Layer 3: Data Cloud & External Services
  { layer: 3, pos: 0, label: 'Named Credentials Vault', domain: 'security' },
  { layer: 3, pos: 1, label: 'External Services OpenAPI', domain: 'devops' },
  { layer: 3, pos: 2, label: 'MuleSoft AnyPoint Proxy', domain: 'async' },

  // Layer 4: Event-Driven Bus
  { layer: 4, pos: 0, label: 'Change Data Capture (CDC)', domain: 'async' },
  { layer: 4, pos: 1, label: 'CometD Streaming Client', domain: 'async' },
  { layer: 4, pos: 2, label: 'EventBus.publish() Buffer', domain: 'async' },

  // Layer 5: Architecture Framework (fflib)
  { layer: 5, pos: 0, label: 'fflib Domain Layer', domain: 'governors' },
  { layer: 5, pos: 1, label: 'fflib Selector Layer', domain: 'governors' },
  { layer: 5, pos: 2, label: 'fflib Service Layer', domain: 'governors' },

  // Layer 6: Enterprise Security Architecture
  { layer: 6, pos: 0, label: 'Shield Platform Encryption', domain: 'security' },
  { layer: 6, pos: 1, label: 'OAuth Connected App Policy', domain: 'security' },
  { layer: 6, pos: 2, label: 'Salesforce Code Analyzer', domain: 'devops' },

  // Layer 7: Release Gate & Production Audit (Stage 11)
  { layer: 7, pos: 0, label: 'Production Freeze Window', domain: 'devops' },
  { layer: 7, pos: 1, label: 'Apex Test Assertions Gate', domain: 'devops' },
  { layer: 7, pos: 2, label: 'Technical Debt Ceiling', domain: 'governors' },

  // Layer 8: CPQ & Revenue Engine (Stage 10)
  { layer: 8, pos: 0, label: 'QCP Quote Calculator', domain: 'cpq' },
  { layer: 8, pos: 1, label: 'Subscription Billing Engine', domain: 'cpq' },
  { layer: 8, pos: 2, label: 'Idempotent Order Activation', domain: 'cpq' },

  // Layer 9: Lightning Web Security & Locker (Stage 9)
  { layer: 9, pos: 0, label: 'Lightning Web Security (LWS)', domain: 'lwc' },
  { layer: 9, pos: 1, label: 'SLDS Design Tokens', domain: 'lwc' },
  { layer: 9, pos: 2, label: 'NavigationMixin Router', domain: 'lwc' },

  // Layer 10: Apex Runtime Governors & CPU (Stage 8)
  { layer: 10, pos: 0, label: 'CPU Timeout (10s)', domain: 'governors' },
  { layer: 10, pos: 1, label: 'Heap Size Limit (12MB)', domain: 'governors' },
  { layer: 10, pos: 2, label: 'Apex Callout Limit (100)', domain: 'governors' },

  // Layer 11: DevOps & Quick Deploy (Stage 7)
  { layer: 11, pos: 0, label: 'RunLocalTests Coverage 85%', domain: 'devops' },
  { layer: 11, pos: 1, label: 'Quick Deploy Staging ID', domain: 'devops' },
  { layer: 11, pos: 2, label: 'Validation Check-Only Gate', domain: 'devops' },

  // Layer 12: Dynamic Schema & Metadata (Stage 6)
  { layer: 12, pos: 0, label: 'Custom Metadata CMDT', domain: 'cpq' },
  { layer: 12, pos: 1, label: 'Describe SObject Cache', domain: 'cpq' },
  { layer: 12, pos: 2, label: 'RecordType DeveloperName', domain: 'cpq' },

  // Layer 13: Async Apex Limits (Stage 5)
  { layer: 13, pos: 0, label: '250k Daily Async Cap', domain: 'async' },
  { layer: 13, pos: 1, label: 'Database.Batchable Scope', domain: 'async' },
  { layer: 13, pos: 2, label: 'High-Volume Platform Events', domain: 'async' },

  // Layer 14: LWC & Shadow DOM (Stage 4)
  { layer: 14, pos: 0, label: 'LWC Shadow DOM Boundary', domain: 'lwc' },
  { layer: 14, pos: 1, label: 'Lightning Data Service', domain: 'lwc' },
  { layer: 14, pos: 2, label: '@salesforce/schema Import', domain: 'lwc' },

  // Layer 15: Mixed DML Concurrency (Stage 3)
  { layer: 15, pos: 0, label: 'Setup Object Lock Guard', domain: 'governors' },
  { layer: 15, pos: 1, label: 'Queueable Job Finalizer', domain: 'async' },
  { layer: 15, pos: 2, label: 'System.runAs() Isolation', domain: 'security' },

  // Layer 16: Security & Sharing (Stage 2)
  { layer: 16, pos: 0, label: 'With Sharing Mode', domain: 'security' },
  { layer: 16, pos: 1, label: 'StripInaccessible FLS', domain: 'security' },
  { layer: 16, pos: 2, label: 'WITH USER_MODE Parser', domain: 'security' },

  // Layer 17: Top Pinnacle - Apex Governors (Stage 1)
  { layer: 17, pos: 0, label: 'SOQL Governor (101)', domain: 'governors' },
  { layer: 17, pos: 1, label: 'Bulkified Trigger Map', domain: 'governors' },
  { layer: 17, pos: 2, label: 'DML Limit (10k Rows)', domain: 'governors' },
];

// Realistic distributed Jenga removal sequence across middle and lower layers (avoiding top-down peeling)
const REMOVAL_SEQUENCE = [
  // Early Stages (Holes created across middle and lower layers):
  21, // Layer 7, pos 0 (CPQ / Order Activation)
  38, // Layer 12, pos 2 (Describe SObject Cache)
  13, // Layer 4, pos 1 (Platform Cache - Center block hollowed out!)
  27, // Layer 9, pos 0 (Lightning Web Security)
  11, // Layer 3, pos 2 (High-Volume CDC)
  44, // Layer 14, pos 2 (@salesforce/schema Import)
  18, // Layer 6, pos 0 (Shield Platform Encryption)
  34, // Layer 11, pos 1 (Quick Deploy - Center block removed!)

  // Mid Stages (Cantilever stress & precarious balance):
  26, // Layer 8, pos 2 (Idempotent Order Activation)
  15, // Layer 5, pos 0 (EventBus Retry)
  40, // Layer 13, pos 1 (Database.Batchable Scope - Center block!)
  8,  // Layer 2, pos 2 (Standard Controller Extension)
  30, // Layer 10, pos 0 (CPU Timeout 10s)
  47, // Layer 15, pos 2 (System.runAs() Isolation)
  23, // Layer 7, pos 2 (Leaving only single center spine block 22!)
  12, // Layer 4, pos 0 (Leaving only block 14 on Layer 4!)

  // Later Stages (High-risk structural thinning):
  29, // Layer 9, pos 2 (NavigationMixin Router)
  36, // Layer 12, pos 0 (Custom Metadata CMDT)
  9,  // Layer 3, pos 0 (Apex Trigger Handler)
  20, // Layer 6, pos 2 (Setup Audit Trail)
  35, // Layer 11, pos 2 (Validation Gate)
  24, // Layer 8, pos 0 (QCP Calculator)
  42, // Layer 14, pos 0 (LWC Shadow DOM)
  17, // Layer 5, pos 2 (Platform Event Replay)
  41, // Layer 13, pos 2 (Platform Events)
  6,  // Layer 2, pos 0 (Visualforce ViewState)
  32, // Layer 10, pos 2 (Apex Callout Limit)
  45, // Layer 15, pos 0 (Setup Object Lock Guard)
  50, // Layer 16, pos 2 (WITH USER_MODE)
  48, // Layer 16, pos 0 (With Sharing)
  3,  // Layer 1, pos 0 (External ID Index)
  5,  // Layer 1, pos 2 (Selective SOQL Filter)

  // Top Pinnacle Layers (Touched only late in high stress):
  51, // Layer 17, pos 0 (SOQL Governor 101)
  53, // Layer 17, pos 2 (DML Limit 10k Rows)

  // Center Spine Risky Extractions:
  22, 37, 28, 19, 16, 25, 43, 31, 46, 49, 10, 7, 4, 52,

  // Bedrock Foundation:
  0, 2, 1
];

// Procedural Minecraft Pixel Textures (Rich, Vibrant & Authentic)
function drawMinecraftVoxelPattern(ctx, type, width, height) {
  const pixelSize = 16;
  const cols = Math.ceil(width / pixelSize);
  const rows = Math.ceil(height / pixelSize);

  if (type === 'redstone') {
    // Redstone Block: Vibrant glowing crimson block with darker beveled edges
    ctx.fillStyle = '#b71515';
    ctx.fillRect(0, 0, width, height);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isBorder = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
        if (isBorder) {
          ctx.fillStyle = '#7a0909';
          ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
        } else {
          const rand = (Math.sin(c * 17.3 + r * 31.6) + 1) / 2;
          if (rand > 0.7) {
            ctx.fillStyle = '#e62424';
          } else if (rand > 0.35) {
            ctx.fillStyle = '#cb1a1a';
          } else {
            ctx.fillStyle = '#9e1212';
          }
          ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  } else if (type === 'diamond') {
    // Diamond Block: Brilliant glowing cyan with crystalline facets
    ctx.fillStyle = '#1dd1a1';
    ctx.fillRect(0, 0, width, height);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isBorder = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
        if (isBorder) {
          ctx.fillStyle = '#00a896';
          ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
        } else {
          const rand = (Math.sin(c * 11.2 + r * 23.4) + 1) / 2;
          if (rand > 0.65) {
            ctx.fillStyle = '#e0fcfc';
          } else if (rand > 0.35) {
            ctx.fillStyle = '#48dbfb';
          } else {
            ctx.fillStyle = '#0abde3';
          }
          ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  } else if (type === 'emerald') {
    // Emerald Block: Vivid gem green with sparkling geometric facets
    ctx.fillStyle = '#10ac84';
    ctx.fillRect(0, 0, width, height);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isBorder = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
        if (isBorder) {
          ctx.fillStyle = '#087055';
          ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
        } else {
          const rand = (Math.sin(c * 14.1 + r * 19.8) + 1) / 2;
          if (rand > 0.65) {
            ctx.fillStyle = '#7bf1a8';
          } else if (rand > 0.35) {
            ctx.fillStyle = '#1dd1a1';
          } else {
            ctx.fillStyle = '#0e9b75';
          }
          ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  } else if (type === 'obsidian') {
    // Obsidian: Deep cosmic purple with glowing crystalline magenta veins
    ctx.fillStyle = '#221133';
    ctx.fillRect(0, 0, width, height);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isBorder = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
        if (isBorder) {
          ctx.fillStyle = '#11081a';
          ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
        } else {
          const rand = (Math.sin(c * 9.4 + r * 27.1) + 1) / 2;
          if (rand > 0.75) {
            ctx.fillStyle = '#9b59b6';
          } else if (rand > 0.45) {
            ctx.fillStyle = '#4b1e6d';
          } else {
            ctx.fillStyle = '#2c1340';
          }
          ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  } else if (type === 'tnt') {
    // TNT Block: Red casing with middle white band
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(0, 0, width, height);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((c + r) % 3 === 0) {
          ctx.fillStyle = '#962d22';
          ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    // White center TNT band
    const bandY = Math.floor(height * 0.32);
    const bandH = Math.floor(height * 0.36);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, bandY, width, bandH);
    ctx.fillStyle = '#e0e0e0';
    for (let x = 0; x < width; x += 32) {
      ctx.fillRect(x, bandY, 16, bandH);
    }
    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TNT', width / 2, height / 2);
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
  } else {
    // Bookshelf / Warm Oak Wood
    ctx.fillStyle = '#d35400';
    ctx.fillRect(0, 0, width, height);
    const plankH = Math.floor(height / 4);
    for (let p = 0; p < 4; p++) {
      ctx.fillStyle = p % 2 === 0 ? '#e67e22' : '#ca6f1e';
      ctx.fillRect(0, p * plankH, width, plankH - 4);
      ctx.fillStyle = '#783f04';
      ctx.fillRect(0, (p + 1) * plankH - 4, width, 4);
    }
  }
}

function createMinecraftBlockTextures(label, domain) {
  const domainInfo = DOMAIN_CONFIG[domain] || DOMAIN_CONFIG.governors;
  const blockType = domainInfo.type || 'redstone';

  // Body / Side texture (256x256)
  const bodyCanvas = document.createElement('canvas');
  bodyCanvas.width = 256;
  bodyCanvas.height = 256;
  const bCtx = bodyCanvas.getContext('2d');
  drawMinecraftVoxelPattern(bCtx, blockType, 256, 256);
  const bodyTexture = new THREE.CanvasTexture(bodyCanvas);
  bodyTexture.magFilter = THREE.NearestFilter;
  bodyTexture.minFilter = THREE.NearestFilter;
  bodyTexture.generateMipmaps = false;

  // Front face with High-Contrast Readable Plaque (1024x256)
  const frontCanvas = document.createElement('canvas');
  frontCanvas.width = 1024;
  frontCanvas.height = 256;
  const fCtx = frontCanvas.getContext('2d');
  drawMinecraftVoxelPattern(fCtx, blockType, 1024, 256);

  // Inset High-Contrast Sign Plaque
  const plaqueMarginX = 20;
  const plaqueMarginY = 16;
  const plaqueW = 1024 - plaqueMarginX * 2;
  const plaqueH = 256 - plaqueMarginY * 2;

  fCtx.fillStyle = 'rgba(10, 12, 16, 0.88)';
  fCtx.fillRect(plaqueMarginX, plaqueMarginY, plaqueW, plaqueH);
  fCtx.lineWidth = 6;
  fCtx.strokeStyle = domainInfo.color;
  fCtx.strokeRect(plaqueMarginX, plaqueMarginY, plaqueW, plaqueH);

  // Corner rivets / bolts
  fCtx.fillStyle = '#ffffff';
  fCtx.fillRect(plaqueMarginX + 8, plaqueMarginY + 8, 10, 10);
  fCtx.fillRect(plaqueMarginX + plaqueW - 18, plaqueMarginY + 8, 10, 10);
  fCtx.fillRect(plaqueMarginX + 8, plaqueMarginY + plaqueH - 18, 10, 10);
  fCtx.fillRect(plaqueMarginX + plaqueW - 18, plaqueMarginY + plaqueH - 18, 10, 10);

  // Domain badge in bright high-contrast color
  fCtx.font = 'bold 26px "JetBrains Mono", monospace';
  fCtx.fillStyle = domainInfo.color;
  fCtx.shadowColor = '#000000';
  fCtx.shadowOffsetX = 2;
  fCtx.shadowOffsetY = 2;
  fCtx.fillText(`★ [${domainInfo.name.toUpperCase()}]`, plaqueMarginX + 30, plaqueMarginY + 54);

  // Component label in large, clean, razor-sharp font
  fCtx.font = 'bold 46px "Outfit", "JetBrains Mono", sans-serif';
  fCtx.fillStyle = '#ffffff';
  fCtx.shadowColor = '#000000';
  fCtx.shadowOffsetX = 4;
  fCtx.shadowOffsetY = 4;

  // Text fitting
  let displayLabel = label;
  if (displayLabel.length > 30) {
    displayLabel = displayLabel.slice(0, 28) + '...';
  }
  fCtx.fillText(displayLabel, plaqueMarginX + 30, plaqueMarginY + 140);

  const frontTexture = new THREE.CanvasTexture(frontCanvas);
  frontTexture.magFilter = THREE.LinearFilter;
  frontTexture.minFilter = THREE.LinearMipmapLinearFilter;
  frontTexture.generateMipmaps = true;

  return { bodyTexture, frontTexture, domainInfo };
}

// Minecraft Grass Platform Textures
function createGrassTopTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#5b8731';
  ctx.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 8) {
    for (let x = 0; x < 128; x += 8) {
      const rand = Math.sin(x * 12.3 + y * 9.7);
      ctx.fillStyle = rand > 0.4 ? '#6ea137' : rand < -0.4 ? '#4a7224' : '#5b8731';
      ctx.fillRect(x, y, 8, 8);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

function createGrassSideTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#866043';
  ctx.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 8) {
    for (let x = 0; x < 128; x += 8) {
      const rand = Math.sin(x * 15.1 + y * 18.2);
      ctx.fillStyle = rand > 0.4 ? '#9b6f4c' : rand < -0.4 ? '#6a4a31' : '#866043';
      ctx.fillRect(x, y, 8, 8);
    }
  }
  ctx.fillStyle = '#5b8731';
  ctx.fillRect(0, 0, 128, 24);
  const drops = [0, 8, 16, 8, 0, 16, 24, 16, 8, 0, 8, 16, 8, 0, 8, 16];
  for (let i = 0; i < 16; i++) {
    ctx.fillRect(i * 8, 24, 8, drops[i]);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

function createDirtTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#866043';
  ctx.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 8) {
    for (let x = 0; x < 128; x += 8) {
      const rand = Math.sin(x * 11.1 + y * 14.2);
      ctx.fillStyle = rand > 0.3 ? '#9b6f4c' : rand < -0.3 ? '#6a4a31' : '#866043';
      ctx.fillRect(x, y, 8, 8);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

function createBedrockTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#333333';
  ctx.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 8) {
    for (let x = 0; x < 128; x += 8) {
      const rand = Math.sin(x * 21.1 + y * 31.7);
      ctx.fillStyle = rand > 0.5 ? '#555555' : rand < -0.4 ? '#111111' : '#282828';
      ctx.fillRect(x, y, 8, 8);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

const Virtual3DTower = forwardRef(function Virtual3DTower(
  {
    totalPulls = 0,
    instabilityPct = 0,
    technicalDebt = 0,
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
  const instabilityPctRef = useRef(instabilityPct);

  useEffect(() => {
    instabilityPctRef.current = instabilityPct;
  }, [instabilityPct]);

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

    // 1. Scene - Minecraft Atmospheric Twilight Sky
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#161a22');
    sceneRef.current = scene;

    // 2. Camera - Framed to comfortably fit all 18 layers + Minecraft pedestal
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
    renderer.toneMappingExposure = 1.35;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Minecraft Sun / Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 2.8);
    sunLight.position.set(24, 45, 28);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 1.2);
    rimLight.position.set(-25, 30, -20);
    scene.add(rimLight);

    const warmGround = new THREE.PointLight(0xf59e0b, 2.0, 45);
    warmGround.position.set(0, 3, 0);
    scene.add(warmGround);

    // Focused Extraction Spotlight for lock-on tracking
    const extractionSpotlight = new THREE.SpotLight(0xff3b30, 0, 50, Math.PI / 4, 0.35, 1.2);
    extractionSpotlight.position.set(0, 15.5, 20);
    scene.add(extractionSpotlight);
    scene.add(extractionSpotlight.target);
    extractionSpotlightRef.current = extractionSpotlight;

    // 5. Authentic Minecraft Voxel Grass & Dirt Platform
    const platformWidth = 24.0;
    const platformHeight = 2.4;
    const platformDepth = 24.0;
    const platformGeo = new THREE.BoxGeometry(platformWidth, platformHeight, platformDepth);

    const grassTopTexture = createGrassTopTexture();
    const grassSideTexture = createGrassSideTexture();
    const dirtBottomTexture = createDirtTexture();

    const grassTopMat = new THREE.MeshStandardMaterial({ map: grassTopTexture, roughness: 0.85 });
    const grassSideMat = new THREE.MeshStandardMaterial({ map: grassSideTexture, roughness: 0.85 });
    const dirtMat = new THREE.MeshStandardMaterial({ map: dirtBottomTexture, roughness: 0.9 });

    // Order: +x, -x, +y (top), -y (bottom), +z, -z
    const platformMats = [
      grassSideMat,
      grassSideMat,
      grassTopMat,
      dirtMat,
      grassSideMat,
      grassSideMat,
    ];

    const platform = new THREE.Mesh(platformGeo, platformMats);
    platform.position.y = -platformHeight / 2;
    platform.receiveShadow = true;
    scene.add(platform);

    // Bedrock lower foundation tier
    const baseGeo = new THREE.BoxGeometry(26.4, 1.2, 26.4);
    const bedrockTexture = createBedrockTexture();
    const baseMat = new THREE.MeshStandardMaterial({ map: bedrockTexture, roughness: 0.9 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -platformHeight - 0.6;
    baseMesh.receiveShadow = true;
    scene.add(baseMesh);

    // Drifting Blocky Minecraft Clouds
    const cloudGroup = new THREE.Group();
    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.32,
    });
    for (let c = 0; c < 7; c++) {
      const cw = 16 + Math.random() * 18;
      const ch = 2.0;
      const cd = 12 + Math.random() * 14;
      const cloudGeo = new THREE.BoxGeometry(cw, ch, cd);
      const cloud = new THREE.Mesh(cloudGeo, cloudMat);
      cloud.position.set(
        (Math.random() - 0.5) * 80,
        34 + Math.random() * 6,
        -25 - Math.random() * 25
      );
      cloudGroup.add(cloud);
    }
    scene.add(cloudGroup);

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

    // Build the 18 layers (54 Minecraft Voxel blocks)
    SF_ARCHITECTURE_BLOCKS.forEach((item, index) => {
      const { layer, pos, label, domain } = item;
      const isEvenLayer = layer % 2 === 0;

      const { bodyTexture, frontTexture, domainInfo } = createMinecraftBlockTextures(label, domain);

      // Body material: Pixelated Minecraft block texture
      const bodyMat = new THREE.MeshStandardMaterial({
        map: bodyTexture,
        roughness: domainInfo.roughness || 0.4,
        metalness: domainInfo.metalness || 0.1,
      });

      const frontFaceMat = new THREE.MeshStandardMaterial({
        map: frontTexture,
        roughness: 0.3,
        metalness: 0.05,
      });

      // Order: +x, -x, +y, -y, +z, -z
      const materials = [
        bodyMat,
        bodyMat,
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

      if (towerGroupRef.current && !isCollapsingRef.current) {
        let rotY = currentRotationRef.current.y;
        let rotX = currentRotationRef.current.x;
        let rotZ = 0;

        const currentInstability = instabilityPctRef.current || 0;
        if (currentInstability > 4) {
          const swayFactor = currentInstability / 100;
          const elapsedTime = clock.getElapsedTime();

          // 1. Permanent off-axis architectural lean scaling with health loss / instability
          const leanX = swayFactor * 0.065;
          const leanZ = swayFactor * 0.052;
          rotX += leanX;
          rotZ += leanZ;

          // 2. Continuous organic architectural swaying motion
          const swayX = Math.sin(elapsedTime * 1.5) * 0.05 * swayFactor;
          const swayZ = Math.cos(elapsedTime * 1.1) * 0.045 * swayFactor;
          rotX += swayX;
          rotZ += swayZ;

          // 3. Realistic creaking tremor jitter if instability is high (>= 35%)
          if (currentInstability >= 35) {
            const tremorRate = currentInstability >= 65 ? 22 : 14;
            const tremorMag = (currentInstability >= 65 ? 0.012 : 0.006) * swayFactor;
            const tremor = (Math.sin(elapsedTime * tremorRate) + (Math.random() - 0.5) * 0.6) * tremorMag;
            rotZ += tremor;
            rotX += tremor * 0.5;
          }

          // 4. Off-center gravity shift
          towerGroupRef.current.position.x = (Math.sin(elapsedTime * 1.5) * 0.35 + leanZ * 3.5) * swayFactor;
          towerGroupRef.current.position.z = (Math.cos(elapsedTime * 1.1) * 0.28 + leanX * 2.8) * swayFactor;
        } else {
          towerGroupRef.current.position.x = 0;
          towerGroupRef.current.position.z = 0;
        }

        towerGroupRef.current.rotation.y = rotY;
        towerGroupRef.current.rotation.x = rotX;
        towerGroupRef.current.rotation.z = rotZ;
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

  // Realistic Jenga structural failure physics (directional gravity topple, no bomb blast)
  const triggerCatastrophicCollapse = useCallback(() => {
    isCollapsingRef.current = true;
    animatingBlocksRef.current.clear();
    const list = [];

    // Smoothly pull back camera to an elevated spectator angle
    cameraDistanceRef.current = 42.0;
    targetLookAtYRef.current = 8.0;
    targetRotationRef.current.x = 0.28;

    // Primary failure topple vector (realistic diagonal forward lean)
    const fallDirX = 0.82;
    const fallDirZ = 0.57;

    blocksMeshMapRef.current.forEach((mesh) => {
      const layer = mesh.userData.layer ?? 0;
      const layerNorm = layer / 17.0; // 0 at foundation, 1 at top pinnacle

      // Realistic column momentum: blocks near top have high forward arc velocity, base stays grounded
      const horizontalSpeed = 1.2 + Math.pow(layerNorm, 1.4) * 11.5 + (Math.random() - 0.5) * 1.5;
      const lateralScatter = (Math.random() - 0.5) * (1.0 + layerNorm * 2.8);

      // Tangent to fall vector for realistic lateral slip
      const perpX = -fallDirZ;
      const perpZ = fallDirX;

      const vx = fallDirX * horizontalSpeed + perpX * lateralScatter;
      const vz = fallDirZ * horizontalSpeed + perpZ * lateralScatter;
      // Downward gravity buckling (NOT shooting upwards like fireworks!)
      const vy = -0.5 - (1.0 - layerNorm) * 2.0 + Math.random() * 0.8;

      list.push({
        mesh,
        vx,
        vy,
        vz,
        rotVx: (fallDirZ * 0.12 + (Math.random() - 0.5) * 0.08) * (0.5 + layerNorm),
        rotVy: ((Math.random() - 0.5) * 0.06) * (0.5 + layerNorm),
        rotVz: (-fallDirX * 0.12 + (Math.random() - 0.5) * 0.08) * (0.5 + layerNorm),
        floorY: 0.8 + Math.random() * 0.5,
        isGrounded: false,
      });
    });

    collapseBlocksRef.current = list;
  }, []);

  // Method to reconstruct and restore tower back to upright position
  const restoreTowerStructure = useCallback((currentPulls = totalPulls) => {
    isCollapsingRef.current = false;
    collapseBlocksRef.current = [];
    animatingBlocksRef.current.clear();

    if (towerGroupRef.current) {
      towerGroupRef.current.position.set(0, 0, 0);
    }

    targetRotationRef.current = { x: 0.12, y: 0.5 };
    targetLookAtYRef.current = DEFAULT_LOOK_AT_Y;
    cameraDistanceRef.current = DEFAULT_CAMERA_DISTANCE;

    if (!blocksMeshMapRef.current || blocksMeshMapRef.current.size === 0) return;

    const pullsLimit = Math.max(0, currentPulls);
    const pulledSet = new Set(REMOVAL_SEQUENCE.slice(0, pullsLimit));
    pulledIndicesRef.current = new Set(pulledSet);

    const historyItems = [];

    blocksMeshMapRef.current.forEach((mesh, blockIdx) => {
      const isExtracted = pulledSet.has(blockIdx);
      mesh.userData.isExtracted = isExtracted;
      mesh.userData.animTime = 0;
      mesh.userData.hasPlayedSlideSound = false;
      mesh.userData.hasPlayedLandSound = false;

      if (isExtracted) {
        // Resting on floor away from tower
        const targetY = 0.8 + (mesh.userData.pos % 2) * 0.4;
        const drift = 14.5;
        mesh.position.set(
          mesh.userData.initialPos.x + mesh.userData.slideDirection.x * drift,
          targetY,
          mesh.userData.initialPos.z + mesh.userData.slideDirection.z * drift
        );
        mesh.rotation.set(0.1, (mesh.userData.pos % 2 === 0 ? 0.35 : -0.35), 0);
        historyItems.push({
          label: mesh.userData.label,
          domain: mesh.userData.domain,
          layer: mesh.userData.layer,
        });
      } else {
        // Upright in the standing tower column!
        mesh.position.copy(mesh.userData.initialPos);
        mesh.rotation.copy(mesh.userData.initialRot);
      }

      if (mesh.material) {
        mesh.material.forEach((m) => {
          if (m && m.emissive) {
            m.emissive.setHex(0x050a14);
            m.emissiveIntensity = 0.5;
          }
        });
      }
    });

    setExtractedHistory(historyItems);
  }, [totalPulls, DEFAULT_LOOK_AT_Y, DEFAULT_CAMERA_DISTANCE]);

  useImperativeHandle(ref, () => ({
    triggerExtractionSequence,
    triggerCatastrophicCollapse,
    restoreTowerStructure,
    resetCamera: () => {
      targetRotationRef.current = { x: 0.12, y: 0.5 };
      targetLookAtYRef.current = DEFAULT_LOOK_AT_Y;
      cameraDistanceRef.current = DEFAULT_CAMERA_DISTANCE;
    },
  }));

  // If game is active (not game over) but tower is collapsed or blocks fallen, restore upright tower
  useEffect(() => {
    if (!isGameOver) {
      let needsRestore = isCollapsingRef.current;
      if (!needsRestore && blocksMeshMapRef.current && blocksMeshMapRef.current.size > 0) {
        const pullsLimit = Math.max(0, totalPulls);
        const pulledSet = new Set(REMOVAL_SEQUENCE.slice(0, pullsLimit));
        for (const [idx, mesh] of blocksMeshMapRef.current.entries()) {
          // If a block that is supposed to be standing upright in the tower is found lying on the ground:
          if (!pulledSet.has(idx) && mesh.position.y < 2.0) {
            needsRestore = true;
            break;
          }
        }
      }
      if (needsRestore) {
        restoreTowerStructure(totalPulls);
      }
    }
  }, [isGameOver, totalPulls, restoreTowerStructure]);

  // Synchronize extracted missing blocks in tower with totalPulls
  useEffect(() => {
    if (!blocksMeshMapRef.current || blocksMeshMapRef.current.size === 0) return;

    if (totalPulls <= 0) {
      restoreTowerStructure(0);
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
    <div className="mc-panel-dark p-3 sm:p-4 flex flex-col justify-between h-full relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div
        className={`absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none transition-colors duration-700 ${
          instabilityPct >= 70 ? 'bg-red-600' : instabilityPct >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
        }`}
      />

      {/* Header */}
      <div className="shrink-0 mb-2">
        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">⛏️</span>
            <div>
              <h3 className="text-white text-xs sm:text-sm font-bold flex items-center gap-2 mc-font tracking-wide">
                <span>REDSTONE TOWER</span>
                <span className="text-[9px] bg-[#1a110a] text-[#ffd700] border border-[#555] px-1.5 py-0.5 mc-font">
                  VOXEL AIDLC
                </span>
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {technicalDebt > 0 && (
              <span className={`text-[9px] px-2 py-0.5 mc-font border font-bold ${
                technicalDebt >= 4
                  ? 'text-[#ff5555] border-[#aa0000] bg-[#3a0000] animate-pulse'
                  : 'text-[#ffaa00] border-[#aa5500] bg-[#3a2200]'
              }`}>
                DEBT: {technicalDebt}/5 {technicalDebt >= 4 ? '⚠️ FRAGILE' : ''}
              </span>
            )}
            <span className={`text-[9px] px-2 py-0.5 mc-font border ${
              instabilityPct >= 65
                ? 'text-[#ff5555] border-[#aa0000] bg-[#3a0000]'
                : instabilityPct >= 30
                ? 'text-[#ffaa00] border-[#aa5500] bg-[#3a2200]'
                : 'text-[#55ff55] border-[#00aa00] bg-[#002b00]'
            }`}>
              STABILITY: {Math.max(0, 100 - instabilityPct)}% {instabilityPct >= 65 ? '⚠️ CRITICAL' : instabilityPct >= 30 ? '⚡ LEANING' : '🛡️ SOLID'}
            </span>
          </div>
        </div>

        {/* Ender Dragon / Boss Bar style Instability progress bar */}
        <div className="w-full bg-[#111111] p-[2px] border-2 border-[#555555] shadow-inner mb-2">
          <div className="w-full bg-[#200020] h-2.5 relative overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${
                instabilityPct >= 75
                  ? 'bg-gradient-to-r from-[#aa00aa] via-[#ff55ff] to-[#ff5555]'
                  : instabilityPct >= 40
                  ? 'bg-gradient-to-r from-[#5500aa] via-[#aa00aa] to-[#ffaa00]'
                  : 'bg-gradient-to-r from-[#00aa00] via-[#55ff55] to-[#55ffff]'
              }`}
              style={{ width: `${Math.max(3, instabilityPct)}%` }}
            />
            {/* Boss bar notches */}
            <div className="absolute inset-0 flex justify-between pointer-events-none opacity-40">
              <span className="w-[2px] h-full bg-black" />
              <span className="w-[2px] h-full bg-black" />
              <span className="w-[2px] h-full bg-black" />
              <span className="w-[2px] h-full bg-black" />
              <span className="w-[2px] h-full bg-black" />
            </div>
          </div>
        </div>

        {/* Subsystem Voxel Domain Badges */}
        <div className="flex flex-wrap gap-1 text-[9px] mc-font">
          {Object.entries(DOMAIN_CONFIG).map(([key, dom]) => (
            <span
              key={key}
              className="px-1.5 py-0.5 bg-[#2b2b2b] border border-[#555] flex items-center gap-1 text-[#e0e0e0] shadow-xs"
            >
              <span className="w-2 h-2 inline-block border border-black/40" style={{ backgroundColor: dom.color }} />
              <span className="truncate">{dom.name}</span>
            </span>
          ))}
        </div>
      </div>

      {/* 3D WebGL Canvas with Close-up Focus & Minecraft Crosshair */}
      <div className="relative w-full flex-1 min-h-[280px] sm:min-h-[320px] bg-[#101318] border-2 border-[#333] overflow-hidden group select-none shadow-inner">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Full-view Target Reticle & Minecraft Mining Banner */}
        {activeExtractionInfo && (
          <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 select-none">
            {/* Top Targeting Lock-on Banner */}
            <div className="bg-[#1b0505]/95 border-2 border-[#ff3333] text-white p-2.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#3a0000] border-2 border-[#ff5555] flex items-center justify-center shrink-0">
                  <Crosshair className="w-5 h-5 text-[#ff5555] animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] mc-font text-[#ff5555] bg-[#330000] px-1.5 py-0.5 border border-[#aa0000]">
                      MINING BLOCK
                    </span>
                    <span className="text-[9px] mc-font text-[#ffaa00]">
                      TOWER STABILITY COMPROMISED
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white mc-font mt-0.5 truncate">
                    Layer {activeExtractionInfo.layer}: [{activeExtractionInfo.label}]
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block shrink-0">
                <span className="text-[8px] mc-font text-[#aaa] uppercase block">Block Type</span>
                <span className="text-[10px] mc-font text-[#ff5555] uppercase">
                  {DOMAIN_CONFIG[activeExtractionInfo.domain]?.name || activeExtractionInfo.domain}
                </span>
              </div>
            </div>

            {/* Authentic Minecraft White Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
              <div className="w-5 h-5 relative flex items-center justify-center">
                <div className="absolute w-5 h-1 bg-white/80 shadow-[0_0_2px_black]" />
                <div className="absolute w-1 h-5 bg-white/80 shadow-[0_0_2px_black]" />
              </div>
            </div>

            {/* Bottom Live Extraction Status Ticker */}
            <div className="self-center bg-[#1a110a]/95 border-2 border-[#ffd700] text-[#ffd700] px-3 py-1 text-[9px] mc-font flex items-center gap-2 backdrop-blur-md shadow-xl">
              <span className="w-2 h-2 bg-[#ff5555] animate-ping inline-block" />
              <span>BLOCK DESTABILIZATION IN PROGRESS...</span>
            </div>
          </div>
        )}

        {/* 3D Camera Controls (Minecraft Stone Buttons) */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
          <button
            onClick={() => handleZoom(-1)}
            title="Zoom In"
            className="mc-btn p-1.5 cursor-pointer text-white shadow-md flex items-center justify-center"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(1)}
            title="Zoom Out"
            className="mc-btn p-1.5 cursor-pointer text-white shadow-md flex items-center justify-center"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetCamera}
            title="Reset View"
            className="mc-btn p-1.5 cursor-pointer text-white shadow-md flex items-center justify-center"
          >
            <Rotate3d className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Drag Hint */}
        <div className="absolute bottom-2 left-2 text-[9px] mc-font text-[#ccc] pointer-events-none flex items-center gap-1.5 bg-[#1e1e1e]/90 px-2 py-1 border border-[#555] backdrop-blur-sm shadow-sm">
          <Rotate3d className="w-3 h-3 text-[#ffd700]" />
          <span>DRAG TO ORBIT • VOXEL WORLD 360°</span>
        </div>
      </div>

      {/* Extracted Subsystems List */}
      <div className="shrink-0 mt-2">
        <div className="flex items-center justify-between text-[9px] mc-font text-[#aaa] mb-1">
          <span>MINED BLOCKS ({totalPulls} EXTRACTED):</span>
        </div>

        {extractedHistory.length === 0 ? (
          <div className="p-2 bg-[#1b1b1b] border border-[#444] text-[9px] text-[#888] mc-font text-center">
            All 54 Voxel Architecture Blocks Intact.
          </div>
        ) : (
          <div className="space-y-1 max-h-16 overflow-y-auto pr-1">
            {extractedHistory.slice(0, 4).map((item, idx) => {
              const dom = DOMAIN_CONFIG[item.domain] || DOMAIN_CONFIG.governors;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between text-[9px] mc-font bg-[#252525] border border-[#444] px-2 py-0.5 shadow-xs"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 inline-block border border-black/40" style={{ backgroundColor: dom.color }} />
                    <span className="text-[#e0e0e0] font-bold truncate">
                      L{item.layer}: {item.label}
                    </span>
                  </div>
                  <span className="text-[#ff5555] text-[8px] shrink-0 font-bold">
                    MINED
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
          className="text-[8px] text-[#777] hover:text-[#ff5555] transition-colors cursor-pointer mc-font"
        >
          [TNT Stress Test: Trigger Full Block Collapse]
        </button>
      </div>
    </div>
  );
});

export default Virtual3DTower;
