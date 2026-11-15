import React from 'react';
import type { IconPresetId } from './types';

export interface IconPresetOption {
  id: IconPresetId;
  label: string;
  path: string;
}

export const FRONTDESK_ICON_PRESETS: IconPresetOption[] = [
  {
    id: 'chat',
    label: 'Chat Bubble',
    path: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z'
  },
  {
    id: 'headset',
    label: 'Support Headset',
    path: 'M12 1a9 9 0 0 0-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 0 0-9-9z'
  },
  {
    id: 'sparkles',
    label: 'AI Sparkles',
    path: 'M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z'
  },
  {
    id: 'message',
    label: 'Q&A Forum',
    path: 'M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z'
  },
  {
    id: 'wrench',
    label: 'Service Wrench',
    path: 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z'
  },
  {
    id: 'heart',
    label: 'Care Heart',
    path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
  },
  {
    id: 'shield',
    label: 'Trusted Shield',
    path: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z'
  },
  {
    id: 'bolt',
    label: 'Fast Bolt',
    path: 'M7 2v11h3v9l7-12h-4l4-8z'
  }
];

export function PresetSvgIcon({
  preset,
  className = 'w-6 h-6'
}: {
  preset?: string;
  className?: string;
}) {
  const item = FRONTDESK_ICON_PRESETS.find((p) => p.id === preset) || FRONTDESK_ICON_PRESETS[0];
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={item.path} />
    </svg>
  );
}
