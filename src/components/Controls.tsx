import React from 'react';
import { useEditorStore } from '../store/editorStore';
import { Sliders, RotateCcw, Eraser, Image, Palette, Square } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export const Controls: React.FC = () => {
  const {
    brightness,
    contrast,
    saturation,
    blur,
    removeBackground,
    backgroundType,
    backgroundColor,
    backgroundBlur,
    setBrightness,
    setContrast,
    setSaturation,
    setBlur,
    setRemoveBackground,
    setBackgroundType,
    setBackgroundColor,
    setBackgroundImage,
    setBackgroundBlur,
    resetAdjustments
  } = useEditorStore();

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setBackgroundImage(reader.result as string);
        setBackgroundType('image');
      };
      reader.readAsDataURL(file);
    }
  }, [setBackgroundImage, setBackgroundType]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  });

  return (
    <div className="bg-white rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Sliders className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold">Adjustments</h3>
        </div>
        <button
          onClick={resetAdjustments}
          className="flex items-center text-sm text-gray-600 hover:text-blue-500"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-gray-200">
          <Eraser className="h-5 w-5 text-blue-500" />
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={removeBackground}
              onChange={(e) => setRemoveBackground(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            <span className="ms-3 text-sm font-medium text-gray-700">Remove Background</span>
          </label>
        </div>

        {removeBackground && (
          <div className="mb-6 border-b border-gray-200 pb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Background Type</h4>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setBackgroundType('none')}
                className={`p-2 rounded flex flex-col items-center ${
                  backgroundType === 'none' ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-600'
                }`}
              >
                <Square className="h-4 w-4 mb-1" />
                <span className="text-xs">None</span>
              </button>
              <button
                onClick={() => setBackgroundType('color')}
                className={`p-2 rounded flex flex-col items-center ${
                  backgroundType === 'color' ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-600'
                }`}
              >
                <Palette className="h-4 w-4 mb-1" />
                <span className="text-xs">Color</span>
              </button>
              <button
                onClick={() => setBackgroundType('image')}
                className={`p-2 rounded flex flex-col items-center ${
                  backgroundType === 'image' ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-600'
                }`}
              >
                <Image className="h-4 w-4 mb-1" />
                <span className="text-xs">Image</span>
              </button>
              <button
                onClick={() => setBackgroundType('blur')}
                className={`p-2 rounded flex flex-col items-center ${
                  backgroundType === 'blur' ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-600'
                }`}
              >
                <Sliders className="h-4 w-4 mb-1" />
                <span className="text-xs">Blur</span>
              </button>
            </div>

            {backgroundType === 'color' && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            )}

            {backgroundType === 'image' && (
              <div className="mt-3">
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <input {...getInputProps()} />
                  <Image className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Drop a background image here, or click to select
                  </p>
                </div>
              </div>
            )}

            {backgroundType === 'blur' && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blur Amount ({backgroundBlur}px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={backgroundBlur}
                  onChange={(e) => setBackgroundBlur(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brightness ({brightness}%)
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contrast ({contrast}%)
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Saturation ({saturation}%)
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Blur ({blur}px)
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={blur}
            onChange={(e) => setBlur(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};