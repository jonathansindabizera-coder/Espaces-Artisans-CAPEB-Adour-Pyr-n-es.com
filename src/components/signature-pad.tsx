import { useEffect, useRef, useState } from "react";

export function SignaturePad({
  value,
  onChange,
  label,
}: {
  value: string | null;
  onChange: (data: string | null) => void;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const isSigned = !!value;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value;
    }
  }, []);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width)  * e.currentTarget.width,
      y: ((e.clientY - rect.top)  / rect.height) * e.currentTarget.height,
    };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = e.currentTarget.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = e.currentTarget.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1A1714";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    setDrawing(false);
    onChange(e.currentTarget.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      {/* Label de rôle */}
      <div
        className="text-[11px] font-bold uppercase tracking-[.06em]"
        style={{ color: "#8B847D" }}
      >
        {label}
      </div>

      {/* Zone de signature */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={500}
          height={160}
          className="w-full touch-none rounded-[10px] transition-all duration-150"
          style={{
            height: 100,
            border: isSigned ? "1.5px solid #1E8E55" : "1.5px dashed #B7B0A8",
            background: isSigned ? "#F0FAF4" : "white",
            cursor: "crosshair",
          }}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />

        {/* Placeholder "Tracez ici" quand vide */}
        {!isSigned && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-1">
            <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, stroke: "#CFC8C0", strokeWidth: 1.5, fill: "none" }}>
              <path d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18z" />
            </svg>
            <span className="text-[11.5px] font-medium" style={{ color: "#B7B0A8" }}>
              Tracez votre signature ici
            </span>
          </div>
        )}

        {/* Badge "Signé ✓" quand signé */}
        {isSigned && (
          <div
            className="absolute top-2 right-2 flex items-center gap-1 text-[11px] font-bold rounded-[6px] px-2 py-[3px]"
            style={{ background: "#E7F4EC", color: "#1E8E55" }}
          >
            ✓ Signé
          </div>
        )}
      </div>

      {/* Bouton effacer (seulement quand signé) */}
      {isSigned && (
        <button
          type="button"
          onClick={clear}
          className="text-[11px] font-medium underline transition-colors"
          style={{ color: "#8B847D" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#4A453F")}
          onMouseLeave={e => (e.currentTarget.style.color = "#8B847D")}
        >
          Effacer la signature
        </button>
      )}
    </div>
  );
}
