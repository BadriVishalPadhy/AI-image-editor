import { ImageUploader } from './components/ImageUploader';
import { ImageEditor } from './components/ImageEditor';
import { Controls } from './components/Controls';
import { useEditorStore } from './store/editorStore';
import { Image } from 'lucide-react';
import "./App.css";


function App() {
  const image = useEditorStore((state) => state.image);

  return (
    <div className="min-h-screen bg-gray-100 p-8 bg-gray-800 flex items-center justify-center">
      <div className="max-w-6xl mx-auto flex items-center justify-center flex-col">
        <div className="flex items-center mb-8">
          <Image className="h-8 w-8 text-blue-500 mr-2" />
          <h1 className="text-3xl font-bold text-amber-50">AI Image Editor</h1>
        </div>

        <div className="flex items-center justify-center">
          <div className="lg:col-span-3 space-y-8">
            {!image ? (
              <ImageUploader />
            ) : (
              <ImageEditor />
            )}
          </div>
          
          {image && (
            <div className="lg:col-span-1">
              <Controls />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;