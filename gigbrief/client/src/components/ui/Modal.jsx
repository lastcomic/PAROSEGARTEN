import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, wide }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className={`bg-gb-card border border-gb-border rounded-lg shadow-2xl ${wide ? 'w-[800px]' : 'w-[500px]'} max-h-[85vh] flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gb-border">
          <h2 className="text-sm font-semibold text-gb-text">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gb-panel rounded">
            <X className="w-4 h-4 text-gb-muted" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
