import React, { useState, useRef, useEffect } from 'react';
import { Download, Github, Palette, Type } from 'lucide-react';

function App() {
  const [text, setText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [textColor, setTextColor] = useState('#000000');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addExtraSpacing = (text: string) => {
    return text.split(' ')
      .filter(word => word.trim() !== '')
      .join('    ');
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number) => {
    ctx.font = `${fontSize}px Arial Narrow`;
    const words = text.split('    ').filter(word => word.trim() !== '');
    const lines: string[] = [];
    let currentLine: string[] = [];
    let currentWidth = 0;

    for (const word of words) {
      const wordWidth = ctx.measureText(word).width;
      const spaceWidth = ctx.measureText('    ').width;
      
      if (currentLine.length === 0) {
        currentLine.push(word);
        currentWidth = wordWidth;
      } else if (currentWidth + spaceWidth + wordWidth <= maxWidth) {
        currentLine.push(word);
        currentWidth += spaceWidth + wordWidth;
      } else {
        lines.push(currentLine.join('    '));
        currentLine = [word];
        currentWidth = wordWidth;
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine.join('    '));
    }

    return lines;
  };

  const generateImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !text) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas settings
    const canvasSize = 500;
    const padding = 20;
    const maxFontSize = 120;
    const minFontSize = 20;
    const canvasWidth = canvasSize - 2 * padding;

    // Clear canvas with selected background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    const spacedText = addExtraSpacing(text);

    // Determine font size
    let fontSize = maxFontSize;
    let lines: string[] = [];
    
    do {
      fontSize--;
      lines = wrapText(ctx, spacedText, canvasWidth, fontSize);
    } while (
      (lines.length * fontSize * 1.5 > canvasSize - 2 * padding) && 
      (fontSize > minFontSize)
    );

    // Draw text
    const lineHeight = fontSize * 1.5;
    const totalHeight = lines.length * lineHeight;
    const startY = ((canvasSize - totalHeight) / 2) + 15;

    ctx.font = `${fontSize}px Arial Narrow`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    lines.forEach((line, i) => {
      const metrics = ctx.measureText(line);
      const x = (canvasSize - metrics.width) / 2;
      ctx.fillText(line, x, startY + i * lineHeight);
    });

    // Apply blur effect
    ctx.filter = 'blur(2px)';
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasSize;
    tempCanvas.height = canvasSize;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, 0);
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      ctx.drawImage(tempCanvas, 0, 0);
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'bart-text.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  useEffect(() => {
    if (text) {
      generateImage();
    }
  }, [text, backgroundColor, textColor]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
        <main className="flex-grow">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Bart Text Generator
              </h1>
              <p className="text-gray-400">Create beautiful spaced text images with custom colors</p>
            </div>
            
            <div className="bg-gray-800 rounded-2xl p-6 shadow-xl mb-8">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Text
                </label>
                <textarea
                  className="w-full p-4 bg-gray-700 rounded-xl text-white resize-none border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
                  rows={4}
                  placeholder="Enter your text here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Palette size={18} />
                    Background Color
                  </label>
                  <div className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="h-8 w-16 rounded cursor-pointer"
                    />
                    <span className="text-sm font-mono">{backgroundColor}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Type size={18} />
                    Text Color
                  </label>
                  <div className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="h-8 w-16 rounded cursor-pointer"
                    />
                    <span className="text-sm font-mono">{textColor}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mb-8">
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={500}
                    className="bg-white rounded-xl shadow-2xl max-w-full h-auto"
                  />
                  {!text && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      Preview will appear here
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={downloadImage}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={!text}
                >
                  <Download size={20} />
                  Download Image
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-auto py-6 text-center">
          <a
            href="https://github.com/AllxdDev-Hosting"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <Github size={20} />
            <span>Created by AllxdDev-Hosting</span>
          </a>
        </footer>
      </div>
    </div>
  );
}

export default App;