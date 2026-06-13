/**
 * Типы и интерфейсы для проекта Pixi + Skia PDF
 */

import type {Canvas} from 'canvaskit-wasm'
export interface PDFSurface {
  getCanvas(): Canvas ;
  endPage(): void;
  getPDFData(): Uint8Array;
  dispose(): void;
}