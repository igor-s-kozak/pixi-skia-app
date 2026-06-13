// import type { CanvasKit, Surface } from "canvaskit-wasm";
// import type * as PIXI from "pixi.js";



// export class SkiaWrapper {
//   private canvasKit: CanvasKit | null = null;
//   private surfaces: Map<string, Surface> = new Map();
//   private initPromise: Promise<void> | null = null;

//   async init(): Promise<void> {
//     if (this.canvasKit) return;

//     if (!this.initPromise) {
//       this.initPromise = this.initCanvasKit();
//     }

//     await this.initPromise;
//   }

//   private async initCanvasKit(): Promise<void> {
//     try {      
//       // const CanvasKitInit = (await import("")).default;
//       console.log('here we are')
//       this.canvasKit = await window.CanvasKitInit({
//       //  locateFile: (file) => 'https://unpkg.com/canvaskit-wasm@latest/bin/full/'+file,
//       locateFile: (file: string) => '/src/'+file,
//       });    
//       console.log("CanvasKit initialized", this.canvasKit);
//     } catch (error) {
//       console.error("Failed to initialize CanvasKit:", error);
//       throw error;
//     }
//   }

//   createSurface(
//     canvasIdOrElement: string | HTMLCanvasElement,
//     width: number,
//     height: number,
//   ): Surface {
//     if (!this.canvasKit) throw new Error("CanvasKit not initialized");

//     let surface: Surface | null = null;

//     if (typeof canvasIdOrElement === "string") {
//       surface = this.canvasKit.MakeCanvasSurface(canvasIdOrElement);
//     } else {
//       // Для кастомного canvas элемента
//       surface = this.canvasKit.MakeCanvasSurface(canvasIdOrElement.id);
//     }

//     if (!surface) throw new Error(`Failed to create surface`);

//     const key =
//       typeof canvasIdOrElement === "string"
//         ? canvasIdOrElement
//         : canvasIdOrElement.id;
//     this.surfaces.set(key, surface);
//     return surface;
//   }

//   createPDFSurface(width: number, height: number): Surface | null {
//     if (!this.canvasKit) return null;
//     return this.canvasKit.MakePDFSurface(width, height);
//   }

//   getCanvasKit(): CanvasKit {
//     if (!this.canvasKit) throw new Error("CanvasKit not initialized");
//     return this.canvasKit;
//   }

//   dispose(): void {
//     this.surfaces.forEach((surface) => surface.dispose());
//     this.surfaces.clear();
//   }
// }

import type { CanvasKit, Surface } from "canvaskit-wasm";

export class SkiaWrapper {
  private canvasKit: CanvasKit | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.canvasKit) return;

    if (!this.initPromise) {
      this.initPromise = this.initCanvasKit();
    }

    await this.initPromise;
  }

  private async initCanvasKit(): Promise<void> {
    try {      
      this.canvasKit = await window.CanvasKitInit({
        locateFile: (file: string) => '/src/' + file,
      });    
      console.log("CanvasKit initialized",this.canvasKit,'\n\n', this.canvasKit.MakePDF,'\n\n', this.canvasKit.MakePDFDocument,'\n\n\nsurface', this.MakePDFSurface);
    } catch (error) {
      console.error("Failed to initialize CanvasKit:", error);
      throw error;
    }
  }

  createSurface(canvas: HTMLCanvasElement, width: number, height: number): Surface {
    if (!this.canvasKit) throw new Error("CanvasKit not initialized");
    
    const surface = this.canvasKit.MakeCanvasSurface(canvas.id);
    if (!surface) throw new Error(`Failed to create surface`);
    
    return surface;
  }

  getCanvasKit(): CanvasKit {
    if (!this.canvasKit) throw new Error("CanvasKit not initialized");
    return this.canvasKit;
  }
}
