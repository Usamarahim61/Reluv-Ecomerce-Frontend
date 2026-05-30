"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface Props {
  imageSrc: string;          // object URL or data URL of the picked file
  onCancel: () => void;
  onSave: (croppedBlob: Blob, croppedDataUrl: string) => void;
}

const CANVAS_SIZE = 300;   // px — size of the preview canvas
const CIRCLE_R   = 130;    // px — radius of the crop circle

export default function ImageCropModal({ imageSrc, onCancel, onSave }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef    = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  /* drag state */
  const offsetRef      = useRef({ x: 0, y: 0 });
  const dragStartRef   = useRef<{ x: number; y: number } | null>(null);
  const dragOriginRef  = useRef({ x: 0, y: 0 });

  /* zoom */
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);

  /* ---- load image ---- */
  useEffect(() => {
    const img = new Image();
    img.onload  = () => { imgRef.current = img; setImgLoaded(true); };
    img.onerror = () => console.error("ImageCropModal: failed to load image");
    img.src = imageSrc;
  }, [imageSrc]);

  /* ---- draw ---- */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    /* dark background */
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    /* image */
    const scale = (CIRCLE_R * 2 * zoomRef.current) /
      Math.min(img.naturalWidth, img.naturalHeight);
    const w = img.naturalWidth  * scale;
    const h = img.naturalHeight * scale;
    const cx = CANVAS_SIZE / 2 + offsetRef.current.x;
    const cy = CANVAS_SIZE / 2 + offsetRef.current.y;
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);

    /* dim overlay with circular hole */
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CIRCLE_R, 0, Math.PI * 2, true);
    ctx.fill("evenodd");
    ctx.restore();

    /* circle border */
    ctx.save();
    ctx.strokeStyle = "#cb6f4d";
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CIRCLE_R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }, []);

  useEffect(() => {
    if (imgLoaded) draw();
  }, [imgLoaded, draw]);

  /* ---- drag handlers ---- */
  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pt = "touches" in e ? e.touches[0] : e;
    dragStartRef.current  = { x: pt.clientX, y: pt.clientY };
    dragOriginRef.current = { ...offsetRef.current };
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragStartRef.current) return;
      e.preventDefault();
      const pt = "touches" in e ? (e as TouchEvent).touches[0] : e as MouseEvent;
      offsetRef.current = {
        x: dragOriginRef.current.x + (pt.clientX - dragStartRef.current.x),
        y: dragOriginRef.current.y + (pt.clientY - dragStartRef.current.y),
      };
      draw();
    };
    const onEnd = () => { dragStartRef.current = null; };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend",  onEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend",  onEnd);
    };
  }, [draw]);

  /* ---- zoom ---- */
  const handleZoom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value) / 100;
    zoomRef.current = v;
    setZoom(v);
    draw();
  };

  /* ---- save ---- */
  const handleSave = () => {
    const img = imgRef.current;
    if (!img) return;

    /* render at 2× for crispness */
    const OUTPUT = CIRCLE_R * 2 * 2;
    const out  = document.createElement("canvas");
    out.width  = OUTPUT;
    out.height = OUTPUT;
    const ctx  = out.getContext("2d")!;

    /* clip to circle */
    ctx.beginPath();
    ctx.arc(OUTPUT / 2, OUTPUT / 2, OUTPUT / 2, 0, Math.PI * 2);
    ctx.clip();

    /* replicate crop maths scaled to output */
    const ratio = OUTPUT / (CIRCLE_R * 2);
    const scale = (CIRCLE_R * 2 * zoomRef.current) /
      Math.min(img.naturalWidth, img.naturalHeight);
    const w = img.naturalWidth  * scale * ratio;
    const h = img.naturalHeight * scale * ratio;
    const cx = (CANVAS_SIZE / 2 + offsetRef.current.x) * ratio;
    const cy = (CANVAS_SIZE / 2 + offsetRef.current.y) * ratio;
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);

    const dataUrl = out.toDataURL("image/png");
    out.toBlob((blob) => {
      if (blob) onSave(blob, dataUrl);
    }, "image/png");
  };

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-semibold text-gray-800 text-base">Crop your photo</h2>

        {/* canvas */}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="rounded-lg cursor-move touch-none"
            style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
            onMouseDown={startDrag}
            onTouchStart={startDrag}
          />
        </div>

        {!imgLoaded && (
          <p className="text-center text-sm text-gray-400">Loading image…</p>
        )}

        {/* zoom */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-10 shrink-0">Zoom</span>
          <input
            type="range"
            min={50}
            max={250}
            step={1}
            value={Math.round(zoom * 100)}
            onChange={handleZoom}
            className="flex-1 accent-[#cb6f4d]"
          />
          <span className="text-xs text-gray-500 w-9 text-right">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        <p className="text-xs text-gray-400 text-center -mt-1">
          Drag the image to reposition · use slider to zoom
        </p>

        {/* actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!imgLoaded}
            className="flex-1 py-2 rounded-lg bg-[#cb6f4d] text-white text-sm font-medium hover:bg-[#d08f77] disabled:opacity-40 transition-all"
          >
            Apply crop
          </button>
        </div>
      </div>
    </div>
  );
}