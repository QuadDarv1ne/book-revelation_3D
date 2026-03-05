"use client";

interface ControlButtonProps {
  isRotating: boolean;
  onClick: () => void;
}

export function ControlButton({ isRotating, onClick }: ControlButtonProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-lg backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400"
      style={{
        background: 'rgba(10, 10, 20, 0.6)',
        border: '1px solid rgba(212, 175, 55, 0.2)',
      }}
      aria-label={isRotating ? 'Приостановить вращение' : 'Включить вращение'}
      aria-pressed={isRotating}
    >
      <span className="text-xs text-amber-400/80 tracking-wider uppercase flex items-center gap-1.5">
        {isRotating ? (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Пауза
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Вращение
          </>
        )}
      </span>
    </button>
  );
}
