import React, { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import * as tf from '@tensorflow/tfjs';
import * as bodyPix from '@tensorflow-models/body-pix';
import { Loader2, Download } from 'lucide-react';

export const ImageEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<bodyPix.BodyPix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('edited-image.png');
  
  const {
    image,
    brightness,
    contrast,
    saturation,
    blur,
    removeBackground,
    backgroundType,
    backgroundColor,
    backgroundImage,
    backgroundBlur
  } = useEditorStore();

  // Load BodyPix model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setLoading(true);
        setError(null);
        await tf.ready();
        const loadedModel = await bodyPix.load({
          architecture: 'ResNet50',  // More accurate architecture
          outputStride: 16,
          multiplier: 1.0,          // Full width for better accuracy
          quantBytes: 4             // Higher precision
        });
        setModel(loadedModel);
      } catch (err) {
        setError('Failed to load AI model. Please try again.');
        console.error('Error loading model:', err);
      } finally {
        setLoading(false);
      }
    };
    loadModel();
  }, []);

  // Set a default file name based on original image when it changes
  useEffect(() => {
    if (image) {
      // Extract file name from the image URL or path if possible
      const defaultName = image.split('/').pop()?.split('.')[0] || 'image';
      setFileName(`${defaultName}-edited.png`);
    }
  }, [image]);

  // Process image effect
  const processImage = async (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    originalImageData: ImageData
  ) => {
    try {
      let imageData = new ImageData(
        new Uint8ClampedArray(originalImageData.data),
        width,
        height
      );

      // Create a temporary canvas for background
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      if (removeBackground && model) {
        setLoading(true);
        setError(null);
        
        // Segment person with improved settings
        const segmentation = await model.segmentPerson(imageData, {
          flipHorizontal: false,
          internalResolution: 'high',           // Higher resolution
          segmentationThreshold: 0.8,           // More precise segmentation
          maxDetections: 1,                     // Focus on main subject
          scoreThreshold: 0.4,                  // Better detection threshold
          nmsRadius: 20                         // Improved edge detection
        });
        
        // Handle background based on type
        if (backgroundType === 'color') {
          tempCtx.fillStyle = backgroundColor;
          tempCtx.fillRect(0, 0, width, height);
        } else if (backgroundType === 'image' && backgroundImage) {
          const bgImg = new Image();
          bgImg.src = backgroundImage;
          await new Promise((resolve) => {
            bgImg.onload = () => {
              const scale = Math.max(width / bgImg.width, height / bgImg.height);
              const scaledWidth = bgImg.width * scale;
              const scaledHeight = bgImg.height * scale;
              const x = (width - scaledWidth) / 2;
              const y = (height - scaledHeight) / 2;
              tempCtx.drawImage(bgImg, x, y, scaledWidth, scaledHeight);
              resolve(null);
            };
          });
        } else if (backgroundType === 'blur') {
          // Create blurred version of original image
          tempCtx.filter = `blur(${backgroundBlur}px)`;
          tempCtx.drawImage(ctx.canvas, 0, 0);
          tempCtx.filter = 'none';
        }

        // Apply background and foreground
        const pixels = imageData.data;
        const bgImageData = tempCtx.getImageData(0, 0, width, height);
        const bgPixels = bgImageData.data;

        for (let i = 0; i < segmentation.data.length; i++) {
          const offset = i * 4;
          if (!segmentation.data[i]) {
            pixels[offset] = bgPixels[offset];
            pixels[offset + 1] = bgPixels[offset + 1];
            pixels[offset + 2] = bgPixels[offset + 2];
            pixels[offset + 3] = bgPixels[offset + 3];
          }
        }
      }

      // Apply image adjustments
      let tensor = tf.tidy(() => {
        const imageTensor = tf.browser.fromPixels(imageData, 4);
        let adjusted = imageTensor.toFloat().div(255);
        
        const rgb = adjusted.slice([0, 0, 0], [-1, -1, 3]);
        const alpha = adjusted.slice([0, 0, 3], [-1, -1, 1]);
        
        let processedRgb = rgb;
        
        if (brightness !== 100) {
          const brightnessAdjustment = (brightness - 100) / 100;
          processedRgb = processedRgb.add(brightnessAdjustment);
        }

        if (contrast !== 100) {
          const factor = (contrast + 100) / 200;
          processedRgb = processedRgb.sub(0.5).mul(factor).add(0.5);
        }

        if (saturation !== 100) {
          const gray = processedRgb.mean(2, true);
          const saturationFactor = saturation / 100;
          processedRgb = processedRgb.mul(saturationFactor).add(
            gray.mul(1 - saturationFactor)
          );
        }

        const processed = tf.concat([
          processedRgb.clipByValue(0, 1),
          alpha
        ], 2);

        return processed.mul(255).cast('int32');
      });

      const processedData = await tf.browser.toPixels(tensor as tf.Tensor3D);
      const processedImageData = new ImageData(
        processedData,
        width,
        height
      );
      
      ctx.clearRect(0, 0, width, height);
      ctx.putImageData(processedImageData, 0, 0);

      tensor.dispose();
    } catch (err) {
      setError('Error processing image. Please try again.');
      console.error('Error processing image:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = image;
    
    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      await processImage(ctx, canvas.width, canvas.height, imageData);
    };
  }, [
    image,
    brightness,
    contrast,
    saturation,
    blur,
    removeBackground,
    backgroundType,
    backgroundColor,
    backgroundImage,
    backgroundBlur,
    model
  ]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    try {
      // Get the canvas data as a data URL (PNG format by default)
      const dataUrl = canvasRef.current.toDataURL('image/png');
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      
      // Append to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to download image. Please try again.');
      console.error('Error downloading image:', err);
    }
  };

  if (!image) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAADFJREFUOI1j/P///38GKgETlUIzjBowasCoAaMGjBoAAizUCszRVEk7AxgYGBgYqJAOAQ4LAD6jCQYAAAAASUVORK5CYII=')] bg-repeat"
      />
      {(loading || error) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          {loading && <Loader2 className="w-8 h-8 text-white animate-spin" />}
          {error && <p className="text-white text-center px-4">{error}</p>}
        </div>
      )}
      
      {/* Download Button */}
      <div className="mt-4 flex items-center justify-between">
        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="flex-1 mr-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="File name"
        />
        <button
          onClick={handleDownload}
          disabled={loading || !image}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5 mr-2" />
          Download
        </button>
      </div>
    </div>
  );
};