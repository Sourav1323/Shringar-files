import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Upload, Download, RotateCw, ZoomIn, ZoomOut,
  Move, Sliders, CheckCircle2, RefreshCw, Eye, Calendar, 
  Layers, Palette, ArrowRight, Camera, Video, VideoOff,
  FlipHorizontal, Crosshair, HelpCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';

// ── Ultra-Detailed, Authentic Handcrafted Henna Stencils ──
// Realistic line weights (1.2-2.5px), intricate jaal lattice, shaded petals, paisleys, finger vines & cuffs
const HENNA_STENCILS = {
  // 1. Arabic Glam Sawan Bel: Cascading shaded roses, flowing paisley, delicate index finger trail & wrist cuff
  arabic: (color) => (
    <svg viewBox="0 0 500 650" className="w-full h-full drop-shadow-sm" style={{ mixBlendMode: 'multiply' }}>
      <defs>
        <radialGradient id="arabShade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="70%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </radialGradient>
      </defs>

      {/* ── Central Main Blooming Arabic Rose ── */}
      <g transform="translate(250, 320)">
        {/* Rose Pistil Center Spiral */}
        <circle cx="0" cy="0" r="10" fill={color} />
        <circle cx="0" cy="0" r="16" fill="none" stroke={color} strokeWidth="2" strokeDasharray="3 2" />
        <path d="M -4 -4 Q 0 -12 6 -6 Q 10 4 0 6 Q -10 6 -4 -4" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6" />

        {/* 5 Inner Shaded Petals */}
        {[0, 72, 144, 216, 288].map((deg) => (
          <path
            key={'in-pet-' + deg}
            d="M 0 -16 C -18 -26, -16 -46, 0 -48 C 16 -46, 18 -26, 0 -16"
            fill={color}
            opacity="0.9"
            transform={`rotate(${deg})`}
          />
        ))}

        {/* 5 Outer Scalloped Shaded Petals with Contour Lines */}
        {[36, 108, 180, 252, 324].map((deg) => (
          <g key={'out-pet-' + deg} transform={`rotate(${deg})`}>
            <path
              d="M 0 -24 C -30 -38, -32 -72, 0 -75 C 32 -72, 30 -38, 0 -24"
              fill={color}
              opacity="0.82"
            />
            <path
              d="M 0 -24 C -24 -35, -25 -65, 0 -68 C 25 -65, 24 -35, 0 -24"
              fill="none"
              stroke="#fff"
              strokeWidth="1.2"
              opacity="0.4"
            />
            {/* Fine Radial Shading Lines */}
            <line x1="-12" y1="-38" x2="-8" y2="-62" stroke="#fff" strokeWidth="0.8" opacity="0.45" />
            <line x1="0" y1="-32" x2="0" y2="-68" stroke="#fff" strokeWidth="0.8" opacity="0.45" />
            <line x1="12" y1="-38" x2="8" y2="-62" stroke="#fff" strokeWidth="0.8" opacity="0.45" />
          </g>
        ))}
      </g>

      {/* ── Classical Ambi / Paisley (Attached to lower-left of Rose) ── */}
      <g transform="translate(190, 360)">
        {/* Paisley Outer Curled Body */}
        <path
          d="M 20 -40 C 60 -10, 50 50, -10 60 C -60 70, -80 20, -50 -20 C -30 -50, 0 -70, 30 -85 Q 45 -90 40 -70 Q 30 -60 10 -50"
          fill={color}
          opacity="0.88"
        />
        {/* Inner Jaal Mesh in Paisley */}
        <path
          d="M 10 -30 C 40 -5, 30 40, -10 45 C -45 50, -60 15, -35 -15 C -20 -35, 5 -45, 10 -30"
          fill="none"
          stroke="#fff"
          strokeWidth="1.2"
          opacity="0.6"
        />
        {/* Crosshatch Hatching inside Paisley */}
        <line x1="-30" y1="20" x2="20" y2="-10" stroke="#fff" strokeWidth="0.9" opacity="0.5" />
        <line x1="-20" y1="35" x2="25" y2="10" stroke="#fff" strokeWidth="0.9" opacity="0.5" />
        <line x1="-40" y1="0" x2="10" y2="-30" stroke="#fff" strokeWidth="0.9" opacity="0.5" />
        <line x1="-10" y1="-30" x2="10" y2="35" stroke="#fff" strokeWidth="0.9" opacity="0.5" />
        <line x1="-30" y1="-10" x2="-5" y2="45" stroke="#fff" strokeWidth="0.9" opacity="0.5" />
        {/* Paisley Scalloped Border Pearls */}
        {[-70, -45, -20, 5, 30].map((deg, i) => (
          <circle key={'p-dot-' + i} cx={-25 + i * 14} cy={48 - Math.abs(i - 2) * 6} r="2.5" fill={color} />
        ))}
      </g>

      {/* ── Graceful Flowing Arabic Sawan Trail to Index Finger ── */}
      {/* Main S-Curve Vine Stem */}
      <path
        d="M 285 260 C 310 200, 270 140, 240 70 C 225 35, 230 10, 235 -20"
        fill="none"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M 283 258 C 307 198, 268 138, 238 68 C 223 33, 228 8, 233 -22"
        fill="none"
        stroke={color}
        strokeWidth="1"
      />

      {/* Paired Arabic Shaded Leaves along the Trail */}
      {[
        { x: 295, y: 220, r: 25, sc: 1.1 },
        { x: 275, y: 170, r: -35, sc: 1.0 },
        { x: 285, y: 135, r: 40, sc: 0.95 },
        { x: 250, y: 100, r: -30, sc: 0.85 },
        { x: 245, y: 60, r: 35, sc: 0.75 },
        { x: 232, y: 25, r: -20, sc: 0.65 },
        { x: 236, y: -5, r: 25, sc: 0.55 },
      ].map((lf, i) => (
        <g key={'lf-' + i} transform={`translate(${lf.x}, ${lf.y}) rotate(${lf.r}) scale(${lf.sc})`}>
          {/* Leaf Body */}
          <path
            d="M 0 0 C -14 -10, -18 -32, 0 -42 C 18 -32, 14 -10, 0 0"
            fill={color}
            opacity="0.9"
          />
          {/* Leaf Inner Rib */}
          <line x1="0" y1="-2" x2="0" y2="-36" stroke="#fff" strokeWidth="1" opacity="0.6" />
          {/* Accompanying Delicate Pearl Drop */}
          <circle cx="16" cy="-24" r="3" fill={color} />
          <circle cx="23" cy="-30" r="2" fill={color} />
        </g>
      ))}

      {/* ── Index Finger Knuckle Ring & Tip Ornamentation ── */}
      <g transform="translate(235, -30)">
        {/* Double Knuckle Ring Bands */}
        <path d="M -26 0 Q 0 -6 26 0" fill="none" stroke={color} strokeWidth="3" />
        <path d="M -26 6 Q 0 0 26 6" fill="none" stroke={color} strokeWidth="1.5" />
        <path d="M -26 12 Q 0 6 26 12" fill="none" stroke={color} strokeWidth="2.5" />
        {/* Knuckle Hanging Pearl Fringe */}
        {[-20, -10, 0, 10, 20].map((x) => (
          <circle key={'ring-dot-' + x} cx={x} cy="18" r="2" fill={color} />
        ))}
        {/* Fingertip Vine Cap */}
        <path d="M -18 -30 Q 0 -48 18 -30" fill="none" stroke={color} strokeWidth="2.5" />
        <circle cx="0" cy="-42" r="3" fill={color} />
        <circle cx="-10" cy="-34" r="2.5" fill={color} />
        <circle cx="10" cy="-34" r="2.5" fill={color} />
      </g>

      {/* ── Lower Palm & Wrist Floral Cuff (Bel Base) ── */}
      {/* Cascading Lower Vine to Wrist */}
      <path
        d="M 235 380 C 200 420, 180 470, 170 530"
        fill="none"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Secondary Rose Rosette at Wrist */}
      <g transform="translate(195, 460) scale(0.65)">
        <circle cx="0" cy="0" r="14" fill={color} />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <path
            key={'wr-pet-' + deg}
            d="M 0 -14 C -22 -24, -20 -48, 0 -50 C 20 -48, 22 -24, 0 -14"
            fill={color}
            opacity="0.88"
            transform={`rotate(${deg})`}
          />
        ))}
      </g>

      {/* Ornate Wrist Cuff Bands */}
      <g transform="translate(180, 540)">
        <path d="M -80 0 Q 30 -12 140 0" fill="none" stroke={color} strokeWidth="3.5" />
        <path d="M -80 8 Q 30 -4 140 8" fill="none" stroke={color} strokeWidth="1.5" />
        <path d="M -80 16 Q 30 4 140 16" fill="none" stroke={color} strokeWidth="3.5" />
        {/* Scallop Arch Fringe */}
        {[-60, -35, -10, 15, 40, 65, 90, 115].map((x) => (
          <g key={'sc-arch-' + x}>
            <path d={`M ${x - 10} 16 Q ${x} 26 ${x + 10} 16`} fill="none" stroke={color} strokeWidth="1.8" />
            <circle cx={x} cy="29" r="2.5" fill={color} />
          </g>
        ))}
      </g>
    </svg>
  ),

  // 2. Rajasthani Bridal Jaal: Grand peacock, intricate diamond checked jaal, multi-tier bridal wrist churi & finger caps
  bridal: (color) => (
    <svg viewBox="0 0 500 650" className="w-full h-full drop-shadow-sm" style={{ mixBlendMode: 'multiply' }}>
      {/* ── Background Intricate Diagonal Jaal Lattice covering Palm ── */}
      <g opacity="0.82">
        {/* Forward Diagonals */}
        {[-150, -100, -50, 0, 50, 100, 150, 200, 250, 300].map((offset) => (
          <line
            key={'diag1-' + offset}
            x1={100 + offset}
            y1="160"
            x2={280 + offset}
            y2="440"
            stroke={color}
            strokeWidth="1.4"
          />
        ))}
        {/* Backward Diagonals */}
        {[-150, -100, -50, 0, 50, 100, 150, 200, 250, 300].map((offset) => (
          <line
            key={'diag2-' + offset}
            x1={380 - offset}
            y1="160"
            x2={200 - offset}
            y2="440"
            stroke={color}
            strokeWidth="1.4"
          />
        ))}
        {/* Tiny Floral Stars / Diamond Dots at every Jaal Intersection */}
        {[
          { x: 190, y: 230 }, { x: 230, y: 230 }, { x: 270, y: 230 }, { x: 310, y: 230 },
          { x: 170, y: 270 }, { x: 210, y: 270 }, { x: 250, y: 270 }, { x: 290, y: 270 }, { x: 330, y: 270 },
          { x: 190, y: 310 }, { x: 230, y: 310 }, { x: 270, y: 310 }, { x: 310, y: 310 },
          { x: 210, y: 350 }, { x: 250, y: 350 }, { x: 290, y: 350 },
          { x: 230, y: 390 }, { x: 270, y: 390 },
        ].map((pt, i) => (
          <circle key={'jaal-dot-' + i} cx={pt.x} cy={pt.y} r="2.8" fill={color} />
        ))}
      </g>

      {/* ── Center Royal Peacock Motif ── */}
      <g transform="translate(250, 290)">
        {/* Peacock Body & Arched Royal Neck */}
        <path
          d="M -30 20 C -60 -10, -50 -60, -20 -70 C -5 -75, 10 -65, 0 -45 C -15 -25, 0 10, 20 25 C 10 40, -15 35, -30 20 Z"
          fill={color}
        />
        {/* Peacock Beak & Eye */}
        <polygon points="-25,-75 -35,-82 -25,-68" fill={color} />
        <circle cx="-16" cy="-62" r="2.5" fill="#fff" />
        <circle cx="-16" cy="-62" r="1.2" fill={color} />
        {/* Kalgi Crown Plumes */}
        <path d="M -18 -72 Q -30 -90 -26 -100" stroke={color} strokeWidth="1.8" fill="none" />
        <circle cx="-26" cy="-102" r="3" fill={color} />
        <path d="M -15 -74 Q -15 -92 -12 -103" stroke={color} strokeWidth="1.8" fill="none" />
        <circle cx="-12" cy="-105" r="3" fill={color} />
        <path d="M -12 -72 Q 0 -88 5 -98" stroke={color} strokeWidth="1.8" fill="none" />
        <circle cx="5" cy="-100" r="3" fill={color} />

        {/* Peacock Wing Feathers (Concentric Shaded Scallops) */}
        {[0, 1, 2, 3].map((row) => (
          <path
            key={'p-wing-' + row}
            d={`M ${-15 + row * 10} ${10 + row * 8} Q ${0 + row * 12} ${-10 + row * 6} ${15 + row * 10} ${15 + row * 8}`}
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
            opacity="0.75"
          />
        ))}

        {/* Concentric Floral Rosette Chakra Framing Peacock */}
        <circle cx="0" cy="0" r="75" fill="none" stroke={color} strokeWidth="2.5" />
        <circle cx="0" cy="0" r="82" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="3 3" />
        <circle cx="0" cy="0" r="90" fill="none" stroke={color} strokeWidth="2" />
        {/* Scalloped Petal Border */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <path
            key={'chk-pet-' + deg}
            d="M 0 -90 C -12 -98, -12 -112, 0 -115 C 12 -112, 12 -98, 0 -90"
            fill={color}
            transform={`rotate(${deg})`}
          />
        ))}
      </g>

      {/* ── Multi-Tier Bridal Wrist Churi Band (Forearm Cuff) ── */}
      <g transform="translate(250, 470)">
        <path d="M -130 0 Q 0 -15 130 0" fill="none" stroke={color} strokeWidth="4" />
        <path d="M -130 10 Q 0 -5 130 10" fill="none" stroke={color} strokeWidth="1.5" />
        <path d="M -130 20 Q 0 5 130 20" fill="none" stroke={color} strokeWidth="3" />
        {/* Chevron Zig-Zag Layer */}
        <path
          d="M -120 20 L -110 30 L -100 20 L -90 30 L -80 20 L -70 30 L -60 20 L -50 30 L -40 20 L -30 30 L -20 20 L -10 30 L 0 20 L 10 30 L 20 20 L 30 30 L 40 20 L 50 30 L 60 20 L 70 30 L 80 20 L 90 30 L 100 20 L 110 30 L 120 20"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
        <path d="M -130 32 Q 0 17 130 32" fill="none" stroke={color} strokeWidth="3" />
        <path d="M -130 42 Q 0 27 130 42" fill="none" stroke={color} strokeWidth="1.5" />
        {/* Hanging Bridal Jhumki / Pearl Drops */}
        {[-100, -70, -40, -10, 20, 50, 80, 110].map((x) => (
          <g key={'jhumki-' + x}>
            <line x1={x} y1="42" x2={x} y2="56" stroke={color} strokeWidth="1.5" />
            <circle cx={x} cy="60" r="3.5" fill={color} />
            <circle cx={x} cy="68" r="2" fill={color} />
          </g>
        ))}
      </g>

      {/* ── 5 Finger Extensions with Bridal Caps (Por) ── */}
      {/* Index Finger */}
      <g transform="translate(185, 140)">
        <path d="M 0 0 L 0 -110" stroke={color} strokeWidth="2.5" fill="none" />
        {[-20, -50, -80].map((y) => (
          <circle key={'idx-c-' + y} cx="0" cy={y} r="3" fill={color} />
        ))}
        <path d="M -12 -110 L 0 -130 L 12 -110 Z" fill={color} />
      </g>
      {/* Middle Finger */}
      <g transform="translate(235, 120)">
        <path d="M 0 0 L 0 -135" stroke={color} strokeWidth="2.8" fill="none" />
        {[-25, -60, -95].map((y) => (
          <circle key={'mid-c-' + y} cx="0" cy={y} r="3.5" fill={color} />
        ))}
        <path d="M -14 -135 L 0 -158 L 14 -135 Z" fill={color} />
      </g>
      {/* Ring Finger */}
      <g transform="translate(285, 135)">
        <path d="M 0 0 L 0 -115" stroke={color} strokeWidth="2.5" fill="none" />
        {[-20, -50, -80].map((y) => (
          <circle key={'rng-c-' + y} cx="0" cy={y} r="3" fill={color} />
        ))}
        <path d="M -12 -115 L 0 -135 L 12 -115 Z" fill={color} />
      </g>
      {/* Pinky Finger */}
      <g transform="translate(335, 160)">
        <path d="M 0 0 L 0 -85" stroke={color} strokeWidth="2" fill="none" />
        {[-20, -50].map((y) => (
          <circle key={'pnk-c-' + y} cx="0" cy={y} r="2.5" fill={color} />
        ))}
        <path d="M -10 -85 L 0 -105 L 10 -85 Z" fill={color} />
      </g>
    </svg>
  ),

  // 3. Floral Minimalist: Chic blooming lotus mandala, haathphool pearl chain, and modern wristlet
  minimal: (color) => (
    <svg viewBox="0 0 500 650" className="w-full h-full drop-shadow-sm" style={{ mixBlendMode: 'multiply' }}>
      {/* ── Blooming Central Lotus Mandala ── */}
      <g transform="translate(250, 310)">
        {/* Core Seed Capsule */}
        <circle cx="0" cy="0" r="12" fill={color} />
        <circle cx="0" cy="0" r="18" fill="none" stroke={color} strokeWidth="1.5" />
        <circle cx="0" cy="0" r="24" fill="none" stroke={color} strokeWidth="1" strokeDasharray="2 2" />

        {/* 16 Pointed Lotus Petals */}
        {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((deg) => (
          <path
            key={'min-lot-' + deg}
            d="M 0 -24 C -12 -36, -10 -58, 0 -68 C 10 -58, 12 -36, 0 -24"
            fill={color}
            opacity="0.88"
            transform={`rotate(${deg})`}
          />
        ))}

        {/* Concentric Aura Pearls */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <circle
            key={'min-dot-' + deg}
            cx="0"
            cy="-82"
            r="2.8"
            fill={color}
            transform={`rotate(${deg})`}
          />
        ))}
      </g>

      {/* ── Haathphool Chain extending to Middle Finger ── */}
      <g transform="translate(250, 220)">
        {/* Dotted Connection Chain */}
        <line x1="0" y1="0" x2="0" y2="-170" stroke={color} strokeWidth="1.8" strokeDasharray="4 3" />
        {[0, -35, -70, -105, -140].map((y) => (
          <g key={'chain-charm-' + y}>
            <circle cx="0" cy={y} r="3" fill={color} />
            <circle cx="0" cy={y} r="5" fill="none" stroke={color} strokeWidth="1" />
          </g>
        ))}
        {/* Knuckle Double Chevron Band */}
        <path d="M -16 -170 L 0 -182 L 16 -170" fill="none" stroke={color} strokeWidth="2.5" />
        <path d="M -16 -176 L 0 -188 L 16 -176" fill="none" stroke={color} strokeWidth="1.5" />
        <circle cx="0" cy="-196" r="3" fill={color} />
      </g>

      {/* ── Modern Minimalist Double Wrist Band ── */}
      <g transform="translate(250, 480)">
        <path d="M -90 0 Q 0 -8 90 0" fill="none" stroke={color} strokeWidth="3" />
        <path d="M -90 8 Q 0 0 90 8" fill="none" stroke={color} strokeWidth="1.2" />
        {/* Crescent Charm Pendant */}
        <circle cx="0" cy="22" r="8" fill="none" stroke={color} strokeWidth="2" />
        <circle cx="0" cy="22" r="4" fill={color} />
        <circle cx="-30" cy="16" r="2.5" fill={color} />
        <circle cx="30" cy="16" r="2.5" fill={color} />
      </g>
    </svg>
  ),

  // 4. Indo-Arabic Fusion: Mandala center with flowing leafy vine extensions
  fusion: (color) => (
    <svg viewBox="0 0 500 650" className="w-full h-full drop-shadow-sm" style={{ mixBlendMode: 'multiply' }}>
      {/* Central Mandala */}
      <g transform="translate(250, 310)">
        <circle cx="0" cy="0" r="20" fill={color} />
        <circle cx="0" cy="0" r="32" fill="none" stroke={color} strokeWidth="2.5" />
        <circle cx="0" cy="0" r="42" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="0" cy="0" r="58" fill="none" stroke={color} strokeWidth="3" />
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <path
            key={'fus-p-' + deg}
            d="M 0 -58 C -16 -70, -14 -94, 0 -98 C 14 -94, 16 -70, 0 -58"
            fill={color}
            opacity="0.88"
            transform={`rotate(${deg})`}
          />
        ))}
      </g>

      {/* Cascading Arabic Vines to Index and Thumb */}
      <path
        d="M 210 230 C 180 160, 190 90, 180 10"
        fill="none"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {[
        { x: 195, y: 190, r: -30 },
        { x: 185, y: 140, r: 25 },
        { x: 188, y: 90, r: -25 },
        { x: 180, y: 40, r: 20 },
      ].map((pt, i) => (
        <g key={'fus-lf-' + i} transform={`translate(${pt.x}, ${pt.y}) rotate(${pt.r})`}>
          <path d="M 0 0 C -12 -10, -14 -28, 0 -36 C 14 -28, 12 -10, 0 0" fill={color} />
          <circle cx="12" cy="-20" r="2.5" fill={color} />
        </g>
      ))}

      {/* Wrist Cuff */}
      <g transform="translate(250, 480)">
        <path d="M -100 0 Q 0 -12 100 0" fill="none" stroke={color} strokeWidth="3.5" />
        <path d="M -100 10 Q 0 -2 100 10" fill="none" stroke={color} strokeWidth="1.5" />
        <path d="M -100 20 Q 0 8 100 20" fill="none" stroke={color} strokeWidth="3" />
        {[-70, -40, -10, 20, 50, 80].map((x) => (
          <circle key={'fus-w-dot-' + x} cx={x} cy="32" r="3" fill={color} />
        ))}
      </g>
    </svg>
  ),

  // 5. Mughal Classic: Jharokha arch, geometric star lattice, finial crest, and dentil wrist bands
  mughal: (color) => (
    <svg viewBox="0 0 500 650" className="w-full h-full drop-shadow-sm" style={{ mixBlendMode: 'multiply' }}>
      {/* ── Mughal Jharokha Pointed Arch ── */}
      <g transform="translate(250, 290)">
        {/* Outer Arch */}
        <path
          d="M -90 120 L -90 0 Q -90 -80, 0 -140 Q 90 -80, 90 0 L 90 120 Z"
          fill="none"
          stroke={color}
          strokeWidth="4"
        />
        {/* Inner Arch */}
        <path
          d="M -78 115 L -78 5 Q -78 -70, 0 -122 Q 78 -70, 78 5 L 78 115 Z"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
        />

        {/* Geometric Star Jali inside the Arch */}
        {[-50, 0, 50].map((x) => (
          <g key={'jali-col-' + x} transform={`translate(${x}, 0)`}>
            {[-40, 0, 40, 80].map((y) => (
              <g key={'star-' + y} transform={`translate(0, ${y})`}>
                <polygon points="0,-10 7,-7 10,0 7,7 0,10 -7,7 -10,0 -7,-7" fill="none" stroke={color} strokeWidth="1.2" />
                <circle cx="0" cy="0" r="2" fill={color} />
              </g>
            ))}
          </g>
        ))}

        {/* Dome Finial Crest */}
        <circle cx="0" cy="-148" r="6" fill={color} />
        <path d="M 0 -154 L 0 -180" stroke={color} strokeWidth="3" />
        <circle cx="0" cy="-185" r="4" fill={color} />
      </g>

      {/* ── Architectural Border Wrist Cuff ── */}
      <g transform="translate(250, 480)">
        <path d="M -120 0 Q 0 -10 120 0" fill="none" stroke={color} strokeWidth="4" />
        <path d="M -120 12 Q 0 2 120 12" fill="none" stroke={color} strokeWidth="2" />
        {/* Dentil Arch Blocks */}
        {[-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100].map((x) => (
          <rect key={'dentil-' + x} x={x - 6} y="14" width="12" height="12" fill={color} />
        ))}
        <path d="M -120 28 Q 0 18 120 28" fill="none" stroke={color} strokeWidth="3" />
      </g>
    </svg>
  )
};

const TRYON_DESIGNS = [
  {
    id: 1,
    stencilType: 'arabic',
    name: 'Arabic Glam Sawan Bel',
    category: 'Arabic',
    price: 1500,
    cones: 1.5,
    duration: '2-3 hrs',
    thumbnail: '/images/arabic-sawan.jpg',
    defaultScale: 1.05,
    defaultY: -10,
    defaultX: 0,
    tags: ['Flowing Trail', 'Bold Shading', 'Index Finger']
  },
  {
    id: 2,
    stencilType: 'bridal',
    name: 'Rajasthani Bridal Jaal',
    category: 'Bridal',
    price: 2500,
    cones: 2,
    duration: '3-4 hrs',
    thumbnail: '/images/rajasthani-bridal.jpg',
    defaultScale: 1.08,
    defaultY: 0,
    defaultX: 0,
    tags: ['Peacock Motif', 'Full Jaal', 'Royal Bridal']
  },
  {
    id: 3,
    stencilType: 'minimal',
    name: 'Floral Minimalist Bloom',
    category: 'Minimal',
    price: 800,
    cones: 1,
    duration: '1-2 hrs',
    thumbnail: '/images/floral-minimal.jpg',
    defaultScale: 1.0,
    defaultY: 10,
    defaultX: 0,
    tags: ['Lotus Blossom', 'Airy Palm', 'Modern Cuff']
  },
  {
    id: 4,
    stencilType: 'fusion',
    name: 'Indo-Arabic Lotus Fusion',
    category: 'Fusion',
    price: 2000,
    cones: 2,
    duration: '2.5 hrs',
    thumbnail: '/images/indo-arabic.png',
    defaultScale: 1.02,
    defaultY: 5,
    defaultX: 0,
    tags: ['Mandala Center', 'Vines', 'Bridal Fusion']
  },
  {
    id: 5,
    stencilType: 'mughal',
    name: 'Mughal Classic Arches',
    category: 'Mughal',
    price: 2200,
    cones: 2,
    duration: '3-3.5 hrs',
    thumbnail: '/images/mughal-classic.jpg',
    defaultScale: 1.05,
    defaultY: 5,
    defaultX: 0,
    tags: ['Domed Arches', 'Geometric Jaal', 'Heritage']
  }
];

// Curated realistic hand palm bases
const HAND_MODELS = [
  { id: 'palm-fair', name: 'Fair Ivory Palm', url: '/images/traditional-1.jpg' },
  { id: 'palm-golden', name: 'Golden Honey Palm', url: '/images/arabic-mehndi-sawan.jpg' },
  { id: 'palm-wheatish', name: 'Warm Wheatish Palm', url: '/images/bridal-fullhand.jpg' }
];

export default function AiTryOnPage() {
  const { showSuccess, showError } = useToast();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Selected design & Hand image
  const [selectedDesign, setSelectedDesign] = useState(TRYON_DESIGNS[0]);
  const [handImage, setHandImage] = useState(HAND_MODELS[0].url);

  // Live Camera mode
  const [isLiveCamera, setIsLiveCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Transform Controls
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(TRYON_DESIGNS[0].defaultScale);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(TRYON_DESIGNS[0].defaultY);
  const [tilt3D, setTilt3D] = useState(0);
  const [flipX, setFlipX] = useState(false); // Left hand vs Right hand mirror
  const [stainDepth, setStainDepth] = useState('peak'); // Default to rich peak mahogany!
  const [opacity, setOpacity] = useState(0.95);

  // Interactive Dragging on Hand
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialPosX: 0, initialPosY: 0 });

  const fileInputRef = useRef(null);
  const stageRef = useRef(null);

  // Authentic Henna Stain Colors (warm natural tones matching skin absorption)
  const stainColors = {
    peak: {
      color: '#450e04', // Royal deep burgundy mahogany (Authentic bridal peak)
      label: 'Day 2 Peak Mahogany (Recommended)',
      desc: '48 hours post-wash — deepest royal bridal burgundy with rich undertones'
    },
    day1: {
      color: '#7e2210', // Vibrant warm terracotta amber
      label: 'Day 1 Warm Terracotta',
      desc: '24 hours post-wash — warm terracotta amber with herbal glow'
    },
    aged: {
      color: '#2b0602', // Aged deep chestnut
      label: 'Royal Deep Chestnut',
      desc: 'Deepest Ayurvedic stain with clove smoke infusion'
    },
    fresh: {
      color: '#22160d', // Dark chocolate herbal paste (Not green slime!)
      label: 'Fresh Wet Henna Paste',
      desc: 'Applied within 2 hours — rich dark herbal paste before peeling'
    }
  };

  // Start / Stop Live Webcam
  const startLiveCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsLiveCamera(true);
        showSuccess('Live camera activated! Hold your hand up in front of the lens.');
      } else {
        showError('Camera is not supported on this device/browser.');
      }
    } catch (err) {
      console.error('Camera error:', err);
      showError('Unable to access webcam. Please check permissions or upload a photo.');
    }
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsLiveCamera(false);
  };

  const captureCameraSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 800;
    canvas.height = videoRef.current.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setHandImage(dataUrl);
    stopLiveCamera();
    showSuccess('Hand snapshot captured! Adjust and inspect your virtual henna design.');
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      stopLiveCamera();
      const url = URL.createObjectURL(file);
      setHandImage(url);
      showSuccess('Your hand photo is loaded! Drag the henna to position it on your hand.');
    }
  };

  // Drag Handlers
  const handlePointerDown = (e) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPosX: posX,
      initialPosY: posY
    };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPosX(dragStartRef.current.initialPosX + dx);
    setPosY(dragStartRef.current.initialPosY + dy);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Wheel to Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setScale((prev) => Math.min(Math.max(prev + delta, 0.5), 2.2));
  };

  const resetTransforms = () => {
    setRotation(0);
    setScale(selectedDesign.defaultScale || 1);
    setPosX(selectedDesign.defaultX || 0);
    setPosY(selectedDesign.defaultY || 0);
    setTilt3D(0);
    setFlipX(false);
    setOpacity(0.95);
  };

  const handleSelectDesign = (d) => {
    setSelectedDesign(d);
    setScale(d.defaultScale || 1);
    setPosY(d.defaultY || 0);
    setPosX(d.defaultX || 0);
  };

  // Quick Placement Presets
  const applyPreset = (preset) => {
    if (preset === 'center') {
      setPosX(0);
      setPosY(0);
      setScale(1.0);
    } else if (preset === 'index-trail') {
      setPosX(flipX ? -25 : 25);
      setPosY(-40);
      setScale(1.1);
    } else if (preset === 'wrist') {
      setPosX(0);
      setPosY(60);
      setScale(1.0);
    }
  };

  const handleBookSelected = () => {
    addToCart(selectedDesign);
    showSuccess(`${selectedDesign.name} added to booking cart!`);
    navigate('/booking');
  };

  const activeColor = stainColors[stainDepth]?.color || '#450e04';

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-8 px-4 sm:px-6 lg:px-8 selection:bg-brand-gold/30">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Studio Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-brand-gold text-xs font-bold uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4 animate-spin" />
              Royal 3D Virtual Hand Studio
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-white">
              Instant Palm & Hand Try-On Experience
            </h1>
            <p className="text-stone-400 text-xs mt-0.5">
              Click & drag to position authentic henna directly onto your hand. Toggle between left and right hand, adjust skin stain maturity, and tilt in 3D.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Live Camera Toggle */}
            {isLiveCamera ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={captureCameraSnapshot}
                  className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-serif font-bold text-xs transition shadow flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Capture Photo
                </button>
                <button
                  onClick={stopLiveCamera}
                  className="px-3.5 py-2 rounded-full bg-red-600/80 hover:bg-red-500 text-white font-serif font-bold text-xs transition flex items-center gap-1"
                >
                  <VideoOff className="w-3.5 h-3.5" />
                  Stop Camera
                </button>
              </div>
            ) : (
              <button
                onClick={startLiveCamera}
                className="px-4 py-2 rounded-full bg-brand-maroon hover:bg-brand-maroon-dark text-brand-gold border border-brand-gold/40 font-serif font-bold text-xs transition shadow flex items-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5" />
                Live Webcam Try-On
              </button>
            )}

            {/* Upload Hand Photo Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-full bg-brand-gold text-stone-950 font-serif font-bold text-xs hover:bg-yellow-400 transition shadow flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Hand Photo
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <button
              onClick={resetTransforms}
              className="px-3 py-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition"
              title="Reset Alignment"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Studio Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: 3D Hand Try-On Canvas Stage (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Stage Container */}
            <div 
              ref={stageRef}
              onWheel={handleWheel}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="relative w-full aspect-[4/5] sm:aspect-[3/4] max-h-[640px] rounded-3xl overflow-hidden bg-stone-950 border-2 border-brand-gold/30 shadow-2xl flex items-center justify-center p-2 [perspective:1000px] select-none cursor-grab active:cursor-grabbing"
              title="Click and drag anywhere on the hand to move the henna design. Use scroll wheel to zoom."
            >
              
              {/* 3D Tilted Inner Stage */}
              <div 
                className="relative w-full h-full rounded-2xl overflow-hidden transition-transform duration-200"
                style={{
                  transform: `rotateY(${tilt3D}deg) scale(0.96)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* 1. Underlying Hand Canvas: Either Live Video or Uploaded Image */}
                {isLiveCamera ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <img
                    src={handImage}
                    alt="Patron Hand Canvas"
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                )}

                {/* 2. Direct Henna Stencil Layer (High-Detail Vector Artwork Rendered Directly ON The Skin) */}
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none select-none transition-all duration-75"
                  style={{
                    transform: `translate(${posX}px, ${posY}px) rotate(${rotation}deg) scale(${scale}) scaleX(${flipX ? -1 : 1})`,
                    opacity: opacity,
                  }}
                >
                  <div className="w-[85%] h-[85%] flex items-center justify-center">
                    {HENNA_STENCILS[selectedDesign.stencilType] ? (
                      HENNA_STENCILS[selectedDesign.stencilType](activeColor)
                    ) : (
                      HENNA_STENCILS.arabic(activeColor)
                    )}
                  </div>
                </div>

                {/* 3. Status Badges */}
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-brand-gold/40 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-serif font-bold text-brand-gold">
                    {isLiveCamera ? 'Live Webcam Feed' : 'Live Simulation'}: {selectedDesign.name}
                  </span>
                </div>

                {/* Left/Right Hand Indicator Badge */}
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-[11px] text-white flex items-center gap-1.5">
                  <span className="text-brand-gold font-bold">{flipX ? 'Left Hand (Mirrored)' : 'Right Hand'}</span>
                </div>

                {/* Drag Help Pill (Appears at bottom center) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md px-4 py-1.5 rounded-full border border-brand-gold/30 text-[11px] text-stone-200 flex items-center gap-2 shadow-lg">
                  <Move className="w-3.5 h-3.5 text-brand-gold animate-bounce" />
                  <span>Click & drag to move henna • Scroll wheel to resize</span>
                </div>

              </div>

            </div>

            {/* Quick Canvas Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700 text-xs">
              
              {/* Hand Model Selectors or Camera indicator */}
              <div className="flex items-center gap-2">
                <span className="text-stone-400 font-semibold text-[11px]">Model:</span>
                {HAND_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => { stopLiveCamera(); setHandImage(model.url); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition font-medium ${
                      !isLiveCamera && handImage === model.url
                        ? 'bg-brand-maroon text-brand-gold border border-brand-gold/50 font-bold'
                        : 'bg-stone-700/60 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    {model.name}
                  </button>
                ))}
              </div>

              {/* Hand Mirror & Alignment Tools */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFlipX(!flipX)}
                  className={`px-3 py-1.5 rounded-xl transition font-semibold flex items-center gap-1.5 ${
                    flipX ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-700 hover:bg-stone-600 text-stone-200'
                  }`}
                  title="Mirror design for Left Hand vs Right Hand"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>{flipX ? 'Flipped (Left Hand)' : 'Flip (Left/Right)'}</span>
                </button>

                <button
                  onClick={handleBookSelected}
                  className="px-4 py-1.5 bg-brand-maroon hover:bg-brand-maroon-dark text-brand-gold rounded-xl transition font-serif font-bold shadow flex items-center gap-1.5 border border-brand-gold/40"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Pattern (₹{selectedDesign.price})</span>
                </button>
              </div>

            </div>

            {/* Alignment Presets Strip */}
            <div className="flex items-center justify-between gap-2 bg-stone-850 p-2.5 rounded-xl border border-stone-800 text-[11px] text-stone-400">
              <span className="font-semibold text-stone-300 flex items-center gap-1">
                <Crosshair className="w-3.5 h-3.5 text-brand-gold" />
                Quick Placement Presets:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => applyPreset('center')}
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200"
                >
                  Center Palm
                </button>
                <button
                  onClick={() => applyPreset('index-trail')}
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200"
                >
                  Index Finger Trail
                </button>
                <button
                  onClick={() => applyPreset('wrist')}
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200"
                >
                  Wrist & Cuff
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT: Controls & Settings (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Design Spec Card */}
            <div className="bg-stone-800/90 rounded-3xl p-6 border border-stone-700 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-gold/20 text-brand-gold border border-brand-gold/30">
                  {selectedDesign.category} Motif
                </span>
                <span className="text-xl font-bold font-serif text-brand-gold">
                  ₹{selectedDesign.price}
                </span>
              </div>

              <h2 className="font-serif text-2xl font-bold text-white">{selectedDesign.name}</h2>
              <p className="text-xs text-stone-400">
                Application time: <span className="text-stone-200 font-semibold">{selectedDesign.duration}</span> • Organic cones: <span className="text-stone-200 font-semibold">{selectedDesign.cones}</span>
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedDesign.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] bg-stone-700/60 text-stone-300 px-2 py-0.5 rounded-md">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Ayurvedic Henna Stain Progression (Warm Mahogany Default) */}
            <div className="bg-stone-800/90 rounded-3xl p-6 border border-stone-700 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-gold">
                <Palette className="w-4 h-4" />
                Henna Stain Maturity Progression
              </div>
              <p className="text-[11px] text-stone-400">
                Preview how the Rajasthani Sojat herbal henna darkens naturally over 48 hours:
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(stainColors).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => setStainDepth(key)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      stainDepth === key
                        ? 'bg-brand-maroon/60 border-brand-gold text-white shadow ring-1 ring-brand-gold'
                        : 'bg-stone-900/60 border-stone-700 text-stone-300 hover:bg-stone-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: item.color }} />
                      <p className="font-bold text-xs">{item.label}</p>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 3D Calibration Sliders & Controls */}
            <div className="bg-stone-800/90 rounded-3xl p-6 border border-stone-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-700 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-gold">
                  <Sliders className="w-4 h-4" />
                  Multi-Angle Hand Calibration
                </div>
                <button
                  onClick={resetTransforms}
                  className="text-[11px] text-brand-gold hover:underline"
                >
                  Reset Defaults
                </button>
              </div>

              {/* 3D Perspective Tilt Angle */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-stone-300">
                  <span>Perspective Tilt Angle:</span>
                  <span className="font-mono text-brand-gold">{tilt3D}°</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={tilt3D}
                  onChange={(e) => setTilt3D(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Rotation */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-stone-300">
                  <span>Palm Rotation:</span>
                  <span className="font-mono text-brand-gold">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Scale / Hand Size */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-stone-300">
                  <span>Hand Scale / Fit:</span>
                  <span className="font-mono text-brand-gold">{Math.round(scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Horizontal Position */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-stone-300">
                  <span>Horizontal (Left to Right):</span>
                  <span className="font-mono text-brand-gold">{posX}px</span>
                </div>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  value={posX}
                  onChange={(e) => setPosX(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Vertical Position */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-stone-300">
                  <span>Vertical (Wrist to Fingers):</span>
                  <span className="font-mono text-brand-gold">{posY}px</span>
                </div>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  value={posY}
                  onChange={(e) => setPosY(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Henna Darkness / Opacity */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-stone-300">
                  <span>Stain Depth (Opacity):</span>
                  <span className="font-mono text-brand-gold">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM: Design Switcher Ribbon */}
        <div className="bg-stone-850 p-6 rounded-3xl border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-gold" />
              Switch Design to Try on Your Hand
            </h3>
            <span className="text-xs text-stone-400">Click any motif to render directly onto your hand</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {TRYON_DESIGNS.map((d) => (
              <button
                key={d.id}
                onClick={() => handleSelectDesign(d)}
                className={`group relative rounded-2xl overflow-hidden border-2 text-left transition-all p-2.5 flex flex-col justify-between ${
                  selectedDesign.id === d.id
                    ? 'border-brand-gold bg-brand-maroon/40 shadow-lg scale-105 ring-2 ring-brand-gold/30'
                    : 'border-stone-700 bg-stone-800/80 hover:border-stone-500'
                }`}
              >
                <div className="aspect-square w-full rounded-xl overflow-hidden bg-stone-900 mb-2 border border-stone-700">
                  <img
                    src={d.thumbnail}
                    alt={d.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div>
                  <p className="font-serif font-bold text-xs text-white truncate">{d.name}</p>
                  <p className="text-[11px] text-brand-gold font-semibold">₹{d.price}</p>
                </div>
                {selectedDesign.id === d.id && (
                  <span className="absolute top-3 right-3 w-5 h-5 bg-brand-gold text-brand-maroon rounded-full flex items-center justify-center font-bold text-xs shadow">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
