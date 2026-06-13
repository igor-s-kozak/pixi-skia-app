// import * as PIXI from 'pixi.js';


// const renderer = await PIXI.autoDetectRenderer();

// interface IEventSystemWithInternals extends PIXI.EventSystem {
//   rootBoundary: PIXI.EventBoundary;
//   rootPointerEvent: PIXI.FederatedPointerEvent;
//   transferMouseData: (event: PIXI.FederatedPointerEvent, nativeEvent: MouseEvent) => void;
//   mapPositionToPoint: (point: PIXI.Point, x: number, y: number) => void;
// }

// export class EventMapper {
//   private eventSystem: PIXI.EventSystem;
//   private rootBoundary: PIXI.EventBoundary;

//   constructor(
//     private canvasElement: HTMLCanvasElement,
//     renderer =  PIXI.Renderer
//   ) {
//     this.eventSystem = new PIXI.EventSystem(renderer);
//     this.rootBoundary = this.eventSystem.rootBoundary;
//   }

//   setupPixiEvents(container: PIXI.Container): void {
//     this.canvasElement.addEventListener('mousedown', (nativeEvent) => {
//       const event = this.createFederatedEvent(nativeEvent, 'pointerdown');
//       this.rootBoundary.rootTarget = container;
//       this.rootBoundary.mapEvent(event);
//     });
    
//     this.canvasElement.addEventListener('mouseup', (nativeEvent) => {
//       const event = this.createFederatedEvent(nativeEvent, 'pointerup');
//       this.rootBoundary.rootTarget = container;
//       this.rootBoundary.mapEvent(event);
//     });
//   }

//   private createFederatedEvent(
//     nativeEvent: MouseEvent, 
//     type: string
//   ): PIXI.FederatedPointerEvent {
//     const event = new PIXI.FederatedPointerEvent(null);
    
//     this.eventSystem.transferMouseData(event, nativeEvent);
    
//     event.type = type;
    
//     const screenPoint = new PIXI.Point();
//     this.eventSystem.mapPositionToPoint(screenPoint, nativeEvent.clientX, nativeEvent.clientY);
    
//     event.screen = screenPoint;
//     event.global = screenPoint.clone();
//     event.offset = screenPoint.clone();
    
//     return event;
//   }
// }





import * as PIXI from 'pixi.js';

export class EventMapper {
  constructor(private canvasElement: HTMLCanvasElement) {}

  setupPixiEvents(container: PIXI.Container): void {
    // Добавляем обработчики событий на Skia канвас
    this.canvasElement.addEventListener('mousedown', (e) => {
      const hit = this.findHitObject(container, e);
      if (hit && hit.emit) {
        hit.emit('pointerdown', e);
        console.log(`Pointerdown on:`, hit);
      }
    });
    
    this.canvasElement.addEventListener('mouseup', (e) => {
      const hit = this.findHitObject(container, e);
      if (hit && hit.emit) {
        hit.emit('pointerup', e);
        
        console.log(`Pointerup on:`, hit);
      }
    });
  }

  private findHitObject(container: PIXI.Container, event: MouseEvent): PIXI.DisplayObject | null {
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

  private checkHit(obj: PIXI.DisplayObject, x: number, y: number): PIXI.DisplayObject | null {
    // Получаем границы объекта с учетом трансформаций
    const bounds = obj.getBounds();
    
    if (x >= bounds.x && x <= bounds.x + bounds.width &&
        y >= bounds.y && y <= bounds.y + bounds.height) {
      
      // Если есть дети, проверяем их в первую очередь
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