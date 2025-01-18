import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Eraser, Brush, Save, Undo, Trash2 } from 'lucide-react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const ColorPalette = [
  '#000000', 
  '#FF0000', 
  '#00FF00', 
  '#0000FF', 
  '#FFFF00', 
  '#FF00FF', 
  '#00FFFF'  
];

const Canvas = ({ isDrawer, socket, roomCode }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [lastPoint, setLastPoint] = useState(null);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [history, setHistory] = useState([]);
  const [tool, setTool] = useState('brush');

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    setContext(ctx);
  }, [strokeColor, lineWidth]);

  const drawLine = useCallback((start, end, color = '#000000', width = 2, tool = 'brush', ctx = context) => {
    if (!ctx) return;
    
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = 10;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
    }

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }, [context]);

  useEffect(() => {
    initializeCanvas();
  }, [initializeCanvas]);

  useEffect(() => {
    if (!socket) return;

    const handleDraw = (data) => {
      if (!isDrawer) {
        drawLine(
          data.start, 
          data.end, 
          data.color, 
          data.lineWidth, 
          data.tool
        );
      }
    };

    const handleClearCanvas = () => {
      if (context) {
        context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        setHistory([]);
      }
    };

    socket.on('draw', handleDraw);
    socket.on('clearCanvas', handleClearCanvas);

    return () => {
      socket.off('draw', handleDraw);
      socket.off('clearCanvas', handleClearCanvas);
    };
  }, [socket, isDrawer, drawLine, context]);

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    if (!isDrawer || !context) return;
    
    if (e.type === 'touchstart') {
      e.preventDefault();
    }
    
    const point = getCanvasPoint(e);
    setIsDrawing(true);
    setLastPoint(point);
  };

  const draw = (e) => {
    if (!isDrawing || !isDrawer || !context || !socket || !lastPoint) return;
    
    if (e.type === 'touchmove') {
      e.preventDefault();
    }
    
    const currentPoint = getCanvasPoint(e);

    drawLine(
      lastPoint, 
      currentPoint, 
      strokeColor, 
      lineWidth, 
      tool
    );
    
    socket.emit('draw', {
      roomCode,
      start: lastPoint,
      end: currentPoint,
      color: strokeColor,
      lineWidth: lineWidth,
      tool: tool
    });
    
    setHistory((prevHistory) => [...prevHistory, { 
      start: lastPoint, 
      end: currentPoint,
      color: strokeColor,
      lineWidth: lineWidth,
      tool: tool
    }]);
    
    setLastPoint(currentPoint);
  };

  const stopDrawing = (e) => {
    if (e?.type === 'touchend' || e?.type === 'touchcancel') {
      e.preventDefault();
    }
    
    setIsDrawing(false);
    setLastPoint(null);
  };

  const clearCanvas = () => {
    if (!isDrawer || !context || !socket) return;
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    socket.emit('clearCanvas', roomCode);
    setHistory([]);
  };

  const undoLastAction = () => {
    if (history.length === 0) return;
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);

    if (context) {
      context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      newHistory.forEach((action) => {
        drawLine(
          action.start, 
          action.end, 
          action.color, 
          action.lineWidth, 
          action.tool
        );
      });
    }
  };

  const saveCanvas = () => {
    const dataUrl = canvasRef.current.toDataURL();
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `skribbl-drawing-${new Date().toISOString().slice(0,10)}.png`;
    link.click();
  };

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-gray-300 rounded-lg bg-white w-full touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={(e) => {
          e.preventDefault();
          startDrawing(e);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          draw(e);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          stopDrawing(e);
        }}
        onTouchCancel={(e) => {
          e.preventDefault();
          stopDrawing(e);
        }}
      />
      {isDrawer && (
        <div className="absolute top-2 right-2 space-y-2 bg-white/80 p-2 rounded-lg shadow-md">
          <div className="flex space-x-2 mb-2">
            <button 
              onClick={clearCanvas} 
              className="hover:bg-red-100 p-2 rounded-md group"
              title="Clear Canvas"
            >
              <Trash2 className="text-red-500 group-hover:scale-110 transition-transform" />
            </button>
            <button 
              onClick={undoLastAction} 
              className="hover:bg-yellow-100 p-2 rounded-md group"
              title="Undo"
            >
              <Undo className="text-yellow-500 group-hover:scale-110 transition-transform" />
            </button>
            <button 
              onClick={saveCanvas} 
              className="hover:bg-blue-100 p-2 rounded-md group"
              title="Save Drawing"
            >
              <Save className="text-blue-500 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          <div className="flex space-x-2 items-center">
            <button 
              onClick={() => setTool('brush')}
              className={`p-2 rounded-md ${tool === 'brush' ? 'bg-blue-200' : 'hover:bg-gray-100'}`}
              title="Brush Tool"
            >
              <Brush className={tool === 'brush' ? 'text-blue-600' : 'text-gray-500'} />
            </button>
            <button 
              onClick={() => setTool('eraser')}
              className={`p-2 rounded-md ${tool === 'eraser' ? 'bg-blue-200' : 'hover:bg-gray-100'}`}
              title="Eraser Tool"
            >
              <Eraser className={tool === 'eraser' ? 'text-blue-600' : 'text-gray-500'} />
            </button>
          </div>

          <div className="flex space-x-1 mt-2">
            {ColorPalette.map(color => (
              <button
                key={color}
                onClick={() => {
                  setStrokeColor(color);
                  setTool('brush');
                }}
                className={`w-6 h-6 rounded-full ${
                  strokeColor === color ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{ backgroundColor: color }}
                title={`Select ${color}`}
              />
            ))}
          </div>

          <div className="flex space-x-2 mt-2">
            {[2, 5, 8].map(width => (
              <button
                key={width}
                onClick={() => setLineWidth(width)}
                className={`px-3 py-1 rounded-md text-sm ${
                  lineWidth === width 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-300 text-black'
                }`}
              >
                {width === 2 ? 'Thin' : width === 5 ? 'Medium' : 'Thick'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;