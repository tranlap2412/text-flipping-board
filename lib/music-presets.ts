export interface MusicPreset {
  id: string;
  name: string;
  url: string;
}

/** Royalty-free tracks (Kevin MacLeod / incompetech.com, CC BY 4.0) */
export const MUSIC_PRESETS: MusicPreset[] = [
  {
    id: "cinematic-dramatic",
    name: "Cinematic Dramatic",
    url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Impact%20Moderato.mp3",
  },
  {
    id: "space-ambient-dark",
    name: "Space Ambient (Dark)",
    url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Lightless%20Dawn.mp3",
  },
  {
    id: "cosmic-drone",
    name: "Cosmic Drone",
    url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Drone%20in%20D.mp3",
  },
  {
    id: "ethereal-space",
    name: "Ethereal Space",
    url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Ether%20Vox.mp3",
  },
];

export const DEFAULT_MUSIC_ID = MUSIC_PRESETS[0].id;

export function findPresetById(id: string): MusicPreset | undefined {
  return MUSIC_PRESETS.find((preset) => preset.id === id);
}
