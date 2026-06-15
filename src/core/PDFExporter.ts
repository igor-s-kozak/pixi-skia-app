import type * as PIXI from "pixi.js";
import { PixiToSkiaConverter } from "./PixiToSkiaConverter";
import { CanvasKitWithMakePDF } from "..";
import { consoleCSSGreen } from "../config";

export class PDFExporter {
  private converter: PixiToSkiaConverter;
  private canvasKit: CanvasKitWithMakePDF;

  constructor(canvasKit: CanvasKitWithMakePDF, converter: PixiToSkiaConverter) {
    this.canvasKit = canvasKit;
    this.converter = converter;
  }

  async export(
    container: PIXI.Container,
    width: number,
    height: number,
    filename: string,
  ): Promise<void> {
    const pdfSurface = this.canvasKit.MakePDFSurface(width, height, filename);

    if (!pdfSurface) {
      throw new Error(
        "Failed to create PDF surface. Make sure CanvasKit is built with PDF support.",
      );
    }

    const pdfCanvas = pdfSurface.getCanvas();
    if (!pdfCanvas) {
      pdfSurface?.dispose();
      throw new Error("Failed to get PDF canvas");
    }

    this.converter.renderContainer(container, pdfSurface!).then(() => {
      const pdfData = pdfSurface.getPDFData();
      const blob = new Blob([pdfData], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      pdfSurface.dispose();
      console.log("%cPDF успешно экспортирован!", consoleCSSGreen);
    });
  }
}
