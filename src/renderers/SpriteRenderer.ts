import type * as PIXI from "pixi.js";
import type { CanvasKit, Canvas, Image } from "canvaskit-wasm";

interface IImageResource {
  source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
}

export class SpriteRenderer {
  private imageCache: Map<string, Image> = new Map();

  constructor(private canvasKit: CanvasKit) {}

  async render(
    sprite: PIXI.Sprite,
    skCanvas: Canvas,
    transform?: {
      x: number;
      y: number;
      rotation: number;
      scaleX: number;
      scaleY: number;
    },
  ): Promise<void> {
    if (!sprite.texture || !sprite.texture.valid) return;

    skCanvas.save();

    if (transform) {
      skCanvas.translate(transform.x, transform.y);
      skCanvas.rotate(transform.rotation, 0, 0);
      skCanvas.scale(transform.scaleX, transform.scaleY);
    }

    const image = await this.getImageFromSprite(sprite);

    if (image) {
      const width = sprite.width;
      const height = sprite.height;
      skCanvas.drawImage(image, -width / 2, -height / 2);
    }

    skCanvas.restore();
  }

  private async getImageFromSprite(sprite: PIXI.Sprite): Promise<Image | null> {
    const texture = sprite.texture;
    const baseTexture = texture.baseTexture;
    const resource = baseTexture.resource;

    if (resource && this.isImageResource(resource)) {
      const source = resource.source;

      if (source instanceof HTMLImageElement && source.complete) {
        const cacheKey = source.src;

        if (this.imageCache.has(cacheKey)) {
          return this.imageCache.get(cacheKey)!;
        }

        const skImage = this.canvasKit.MakeImageFromCanvasImageSource(source);
        if (skImage) {
          this.imageCache.set(cacheKey, skImage);
          return skImage;
        }
      }

      if (source instanceof HTMLCanvasElement) {
        const skImage = this.canvasKit.MakeImageFromCanvasImageSource(source);
        return skImage;
      }
    }

    return null;
  }

  private isImageResource(resource: unknown): resource is IImageResource {
    return (
      typeof resource === "object" &&
      resource !== null &&
      "source" in resource &&
      (resource.source instanceof HTMLImageElement ||
        resource.source instanceof HTMLCanvasElement ||
        resource.source instanceof HTMLVideoElement)
    );
  }

  clearCache(): void {
    this.imageCache.forEach((img) => img.delete());
    this.imageCache.clear();
  }
}
