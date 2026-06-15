import CanvasKitInit from "canvaskit-wasm";
import type { Canvas, CanvasKit, CanvasKitInitOptions } from "canvaskit-wasm";
declare global {
  interface Window {
    CanvasKitInit: (opts?: CanvasKitInitOptions) => CanvasKitWithMakePDF;
  }
}

export interface CanvasKitWithMakePDF extends CanvasKit {
  MakePDFSurface: (
    width: number,
    height: number,
    filename: string,
  ) => PDFSurface;
}

export interface PDFSurface {
  getCanvas(): Canvas;
  endPage(): void;
  getPDFData(): Uint8Array<ArrayBuffer>;
  dispose(): void;
}

declare module "*.css";
