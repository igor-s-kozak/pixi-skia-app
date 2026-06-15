import * as PIXI from "pixi.js";
export class EventMapper {
  constructor(private canvasElement: HTMLCanvasElement) {}

  transferMouseData(
    event: PIXI.FederatedPointerEvent,
    nativeEvent: MouseEvent,
  ) {
    event.isTrusted = nativeEvent.isTrusted;
    event.timeStamp = performance.now();
    event.type = nativeEvent.type;
    event.altKey = nativeEvent.altKey;
    event.button = nativeEvent.button;
    event.buttons = nativeEvent.buttons;
    event.client.x = nativeEvent.clientX;
    event.client.y = nativeEvent.clientY;
    event.ctrlKey = nativeEvent.ctrlKey;
    event.metaKey = nativeEvent.metaKey;
    event.movement.x = nativeEvent.movementX;
    event.movement.y = nativeEvent.movementY;
    event.page.x = nativeEvent.pageX;
    event.page.y = nativeEvent.pageY;
    event.shiftKey = nativeEvent.shiftKey;
    event.nativeEvent = nativeEvent;
    return event;
  }

  setupPixiEvents(container: PIXI.Container): void {
    const boundary = new PIXI.EventBoundary(container);

    this.canvasElement.addEventListener("mousedown", (e) => {
      const federatedEvent = new PIXI.FederatedPointerEvent(boundary);
      const actualFederatedEvent = this.transferMouseData(federatedEvent, e);
      const hit = this.findHitObject(container, e);
      if (hit && hit.emit) {
        hit.emit("pointerdown", actualFederatedEvent);
        console.log(`Pointerdown on:`, hit);
      }
    });

    this.canvasElement.addEventListener("mouseup", (e) => {
      const federatedEvent = new PIXI.FederatedPointerEvent(boundary);
      const actualFederatedEvent = this.transferMouseData(federatedEvent, e);
      const hit = this.findHitObject(container, e);
      if (hit && hit.emit) {
        hit.emit("pointerup", actualFederatedEvent);
        console.log(`Pointerup on:`, hit);
      }
    });
  }

  private findHitObject(
    container: PIXI.Container,
    event: MouseEvent,
  ): PIXI.DisplayObject | null {
    const rect = this.canvasElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Проверяем всех детей (в обратном порядке для правильного z-index)
    for (let i = container.children.length - 1; i >= 0; i--) {
      const child = container.children[i];
      const hit = this.checkHit(child, x, y);
      if (hit) return hit;
    }

    return null;
  }

  private checkHit(
    obj: PIXI.DisplayObject,
    x: number,
    y: number,
  ): PIXI.DisplayObject | null {
    const bounds = obj.getBounds();

    if (
      x >= bounds.x &&
      x <= bounds.x + bounds.width &&
      y >= bounds.y &&
      y <= bounds.y + bounds.height
    ) {
      if (obj instanceof PIXI.Container && obj.children.length > 0) {
        for (let i = obj.children.length - 1; i >= 0; i--) {
          const hit = this.checkHit(obj.children[i], x, y);
          if (hit) return hit;
        }
      }

      return obj;
    }

    return null;
  }
}
