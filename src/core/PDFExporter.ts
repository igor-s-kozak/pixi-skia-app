// import type * as PIXI from 'pixi.js';
// import type { CanvasKit } from 'canvaskit-wasm';
// import { PixiToSkiaConverter } from './PixiToSkiaConverter';

// export class PDFExporter {
//   private converter: PixiToSkiaConverter;

//   constructor(canvasKit: CanvasKit) {
//     this.converter = new PixiToSkiaConverter(canvasKit);
//   }

//   async export(container: PIXI.Container, width: number, height: number, filename: string): Promise<void> {
//     console.log(' Начинаем экспорт PDF...');

//     console.log('>>>>', this.converter['canvasKit'])
    
//     const pdfSurface = this.converter['canvasKit'].MakeSurface(width, height);
//     if (!pdfSurface) {
//       throw new Error('Failed to create PDF surface');
//     }
    
//     // Рендерим контейнер в PDF поверхность
//     await this.converter.renderContainer(container, pdfSurface);
    
//     // Получаем PDF данные
//     const pdfData = pdfSurface.makeImageSnapshot();
//     const bytes = pdfData.encodeToBytes();
//     console.log(bytes)
    
//     // Создаем Blob и скачиваем
//     const blob = new Blob([bytes], { type: 'application/pdf' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = filename;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
    
//     pdfSurface.dispose();
    
//     console.log('PDF успешно экспортирован!');
//   }
// }

import type * as PIXI from 'pixi.js';
import type { CanvasKit } from 'canvaskit-wasm';
import type {PDFSurface} from '../types'
import { PixiToSkiaConverter } from './PixiToSkiaConverter';

export class PDFExporter {
  private converter: PixiToSkiaConverter;
  private canvasKit: CanvasKit;

  constructor(canvasKit: CanvasKit, converter: PixiToSkiaConverter) {
    this.canvasKit = canvasKit;
    this.converter = converter;
  }

  async export(container: PIXI.Container, width: number, height: number, filename: string): Promise<void> {
    console.log('Начинаем экспорт PDF...');
    
    // Используем MakePDFSurface вместо MakeSurface
    // @ts-ignore - PDF методы могут быть не в типах
    const pdfSurface: PDFSurface = this.canvasKit.MakePDFSurface(width, height, filename);
    const bro = this.canvasKit.MakePDF('asfdadfadsf', 'afdadsfasdf', 'asfdafsdfsd');
    const broDocument = this.canvasKit.MakePDFDocument('asfdasfdasfd', 'asfdasfdafsd', 'sadfasfdasdfasfd');

    console.log('export >>>>', bro, broDocument);
    if (!pdfSurface) {
      throw new Error('Failed to create PDF surface. Make sure CanvasKit is built with PDF support.');
    }
    
    // Получаем canvas для рисования
    // @ts-ignore
    const pdfCanvas = pdfSurface.getCanvas();
    if (!pdfCanvas) {
      pdfSurface.dispose();
      throw new Error('Failed to get PDF canvas');
    }
    
    // Рендерим контейнер в PDF canvas
    await this.converter.renderContainer(container, pdfSurface);
    
    // Завершаем страницу и получаем PDF
    // @ts-ignore
    pdfSurface.endPage();
    console.log('>>>>>PDF', pdfSurface)
    // @ts-ignore
    const pdfData = pdfSurface.getPDFData();
    
    // Сохраняем PDF
    const blob = new Blob([pdfData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    pdfSurface.dispose();
    console.log('PDF успешно экспортирован!');
  }

//   async export(container: PIXI.Container, width: number, height: number, filename: string): Promise<void> {
//   console.log('Начинаем экспорт PDF...');
  
//   // @ts-ignore
//   const pdfSurface = this.canvasKit.MakePDFSurface(width, height, filename);
//   if (!pdfSurface) {
//     throw new Error('Failed to create PDF surface');
//   }
  
//   // @ts-ignore
//   const pdfCanvas = pdfSurface.getCanvas();
//   if (!pdfCanvas) {
//     pdfSurface.dispose();
//     throw new Error('Failed to get PDF canvas');
//   }
  
//   // ✅ ВРЕМЕННО: Рисуем тестовый красный прямоугольник
//   const paint = new this.canvasKit.Paint();
//   paint.setColor(this.canvasKit.RED);
//   pdfCanvas.drawRect(this.canvasKit.XYWHRect(100, 100, 200, 150), paint);
  
//   // Рисуем синий круг
//   paint.setColor(this.canvasKit.BLUE);
//   pdfCanvas.drawCircle(400, 300, 80, paint);
  
//   // Рисуем зеленую линию
//   paint.setColor(this.canvasKit.GREEN);
//   paint.setStrokeWidth(5);
//   paint.setStyle(this.canvasKit.PaintStyle.Stroke);
//   pdfCanvas.drawLine(50, 500, 750, 100, paint);
  
//   paint.delete();
  
//   // Завершаем страницу и получаем PDF
//   // @ts-ignore
//   pdfSurface.endPage();
//   // @ts-ignore
//   const pdfData = pdfSurface.getPDFData();
  
//   // Сохраняем PDF
//   const blob = new Blob([pdfData], { type: 'application/pdf' });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = filename;
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);
//   URL.revokeObjectURL(url);
  
//   pdfSurface.dispose();
//   console.log('PDF успешно экспортирован!');
// }
}