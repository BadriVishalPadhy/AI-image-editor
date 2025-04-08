import { create } from 'zustand';

interface EditorState {
  image: string | null;
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  removeBackground: boolean;
  backgroundType: 'none' | 'color' | 'image' | 'blur';
  backgroundColor: string;
  backgroundImage: string | null;
  backgroundBlur: number;
  setImage: (image: string | null) => void;
  setBrightness: (value: number) => void;
  setContrast: (value: number) => void;
  setSaturation: (value: number) => void;
  setBlur: (value: number) => void;
  setRemoveBackground: (value: boolean) => void;
  setBackgroundType: (value: 'none' | 'color' | 'image' | 'blur') => void;
  setBackgroundColor: (value: string) => void;
  setBackgroundImage: (value: string | null) => void;
  setBackgroundBlur: (value: number) => void;
  resetAdjustments: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  image: null,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  removeBackground: false,
  backgroundType: 'none',
  backgroundColor: '#ffffff',
  backgroundImage: null,
  backgroundBlur: 5,
  setImage: (image) => set({ image }),
  setBrightness: (brightness) => set({ brightness }),
  setContrast: (contrast) => set({ contrast }),
  setSaturation: (saturation) => set({ saturation }),
  setBlur: (blur) => set({ blur }),
  setRemoveBackground: (removeBackground) => set({ removeBackground }),
  setBackgroundType: (backgroundType) => set({ backgroundType }),
  setBackgroundColor: (backgroundColor) => set({ backgroundColor }),
  setBackgroundImage: (backgroundImage) => set({ backgroundImage }),
  setBackgroundBlur: (backgroundBlur) => set({ backgroundBlur }),
  resetAdjustments: () => set({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    removeBackground: false,
    backgroundType: 'none',
    backgroundColor: '#ffffff',
    backgroundImage: null,
    backgroundBlur: 5,
  }),
}));