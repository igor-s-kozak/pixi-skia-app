import * as PIXI from "pixi.js";
import type { CanvasKit, Canvas, Paint } from "canvaskit-wasm";

export class GraphicsRenderer {
  constructor(private canvasKit: CanvasKit) {}

  render(
    graphics: PIXI.Graphics,
    skCanvas: Canvas,
    transform?: {
      x: number;
      y: number;
      rotation: number;
      scaleX: number;
      scaleY: number;
    },
  ): void {
    skCanvas.save();
    if (transform) {
      skCanvas.translate(transform.x, transform.y);
      skCanvas.rotate(transform.rotation, 0, 0);
      skCanvas.scale(transform.scaleX, transform.scaleY);
    }

    const graphicsData = graphics.geometry.graphicsData;

    for (const data of graphicsData) {
      if (
        data.fillStyle &&
        data.fillStyle.visible &&
        data.fillStyle.color !== 0
      ) {
        const paint = new this.canvasKit.Paint();
        const color = data.fillStyle.color;
        paint.setColor(
          this.canvasKit.Color(
            (color >> 16) & 0xff,
            (color >> 8) & 0xff,
            color & 0xff,
            data.fillStyle.alpha,
          ),
        );
        paint.setStyle(this.canvasKit.PaintStyle.Fill);
        paint.setAntiAlias(true);

        this.drawShape(data.shape, skCanvas, paint);
        paint.delete();
      }

      if (
        data.lineStyle &&
        data.lineStyle.visible &&
        data.lineStyle.width > 0
      ) {
        const paint = new this.canvasKit.Paint();
        const color = data.lineStyle.color;
        paint.setColor(
          this.canvasKit.Color(
            (color >> 16) & 0xff,
            (color >> 8) & 0xff,
            color & 0xff,
            data.lineStyle.alpha,
          ),
        );
        paint.setStyle(this.canvasKit.PaintStyle.Stroke);
        paint.setStrokeWidth(data.lineStyle.width);
        paint.setAntiAlias(true);
        this.drawShape(data.shape, skCanvas, paint);
        paint.delete();
      }
    }

    skCanvas.restore();
  }

  private drawShape(shape: PIXI.IShape, canvas: Canvas, paint: Paint): void {
    if (shape.type === PIXI.SHAPES.RECT) {
      canvas.drawRect(
        this.canvasKit.XYWHRect(shape.x, shape.y, shape.width, shape.height),
        paint,
      );
    } else if (shape.type === PIXI.SHAPES.CIRC) {
      canvas.drawCircle(shape.x, shape.y, shape.radius, paint);
    } else if (shape.type === PIXI.SHAPES.ELIP) {
      canvas.drawOval(
        this.canvasKit.XYWHRect(
          shape.x - shape.width,
          shape.y - shape.height,
          shape.width * 2,
          shape.height * 2,
        ),
        paint,
      );
    } else if (shape.type === PIXI.SHAPES.POLY) {
      if (shape.points && shape.points.length >= 4) {
        const pathBuilder = new this.canvasKit.PathBuilder();

        pathBuilder.moveTo(shape.points[0], shape.points[1]);

        for (let i = 2; i < shape.points.length; i += 2) {
          pathBuilder.lineTo(shape.points[i], shape.points[i + 1]);
        }

        const path = pathBuilder.detach();

        canvas.drawPath(path, paint);

        path.delete();
        pathBuilder.delete();
      }
    }
  }
}
