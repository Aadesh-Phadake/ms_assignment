import React, { useCallback, useRef } from 'react';

interface ColumnResizerProps {
  onResize: (width: number) => void;
  currentWidth: number;
  minWidth: number;
}

export const ColumnResizer: React.FC<ColumnResizerProps> = ({
  onResize,
  currentWidth,
  minWidth,
}) => {
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(currentWidth);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      startXRef.current = e.clientX;
      startWidthRef.current = currentWidth;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startXRef.current;
        const newWidth = Math.max(minWidth, startWidthRef.current + delta);
        onResize(newWidth);
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [currentWidth, minWidth, onResize]
  );

  return (
    <div
      onMouseDown={handleMouseDown}
      className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/50 group-hover:bg-slate-300 transition-colors z-20"
      title="Drag to resize column"
    />
  );
};
