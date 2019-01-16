import { getBase64 } from "../utils";
import { Rect } from "../store/model";
import EXIF = require('exif-js');

export interface RectOffset {
  newW: number,
  newH: number,
  topOffset: number,
  leftOffset: number
}

const handleResize = function(canvas: HTMLCanvasElement, targetSize: number, name: string): Promise<File> {
  const { width: cw, height: ch } = canvas
  let canvas2: HTMLCanvasElement
  if (cw > targetSize || ch > targetSize) {
    const ratio = Math.min(targetSize / cw, targetSize / ch)
    canvas2 = document.createElement('canvas')
    canvas2.width = cw * ratio;
    canvas2.height = ch * ratio;
    const ctx2 = canvas2.getContext('2d')
    ctx2.drawImage(canvas, 0, 0, cw, ch, 0, 0, canvas2.width, canvas2.height);
  } else {
    canvas2 = canvas
  }
  return new Promise<File>((resolve, reject) => {
    canvas2.toBlob(blob => {
      const f: any = blob
      f.lastModifiedDate = new Date()
      f.name = name
      resolve(f as File)
    }, 'image/jpeg', .7)
  })
}

const handleRotate = function(image: HTMLImageElement): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const { width: iw, height: ih } = image
  const size = Math.max(iw, ih)
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, (size - iw) / 2, (size - ih) / 2);

  return new Promise<HTMLCanvasElement>((resolve, reject) => {
    // rotate
    EXIF.getData(image, () => {
      const orientation = EXIF.getTag(image, 'Orientation');
      let newW = iw, newH = ih;
      ctx.save();
      ctx.clearRect(0, 0, size, size)
      ctx.translate(size / 2, size / 2)
      switch(orientation) {
        case 6: 
          ctx.rotate(90 * Math.PI / 180);
          newW = ih;
          newH = iw;
          break;
        case 3:  
          ctx.rotate(Math.PI);
          break;
        case 8:
          ctx.rotate(-90 * Math.PI / 180);
          newW = ih;
          newH = iw;
          break;
        default:;
      }
      ctx.drawImage(image, -iw/2, -ih/2, iw, ih)
      ctx.restore()
      const canvas2 = document.createElement('canvas')
      canvas2.width = newW
      canvas2.height = newH
      const ctx2 = canvas2.getContext('2d')
      ctx2.drawImage(canvas, (size - newW) / 2, (size -newH) / 2, newW, newH, 0, 0, newW, newH);
      resolve(canvas2)
    })
  })
}

export const drawRect = function(container: HTMLElement, rect: Rect, 
  originWidth: number, originHeight: number, resized: RectOffset): void {
  // delete old rect
  let rectDom = container.querySelector<HTMLDivElement>('div.rect-face');
  if (rectDom) {
    container.removeChild(rectDom)
    rectDom = null
  }
  const ratio = resized.newW / originWidth;
  if (rect && rect instanceof Array) {
    rectDom = document.createElement('div')
    rectDom.className = 'rect-face'
    let  [ x1, y1, x2, y2 ] = rect.map(r => r * ratio);
    rectDom.style.left = `${x1 + resized.leftOffset}px`
    rectDom.style.top = `${y1 + resized.topOffset}px`
    rectDom.style.width = `${x2 - x1}px`
    rectDom.style.height = `${y2 - y1}px`
    container.appendChild(rectDom)
  } 
}

export class DairyCowImage {

  imageType: string = null

  image: File | string = null

  constructor(image: File | string) {
    if (image instanceof File) {
      this.imageType = 'blob'
    } else {
      this.imageType = 'string'
    }
    this.image = image
  }

  async getSource(): Promise<string> {
    if (this.imageType === 'blob') {
      return await getBase64(this.image as File)
    } else {
      return new Promise<string>(resolve => resolve(this.image as string))
    }
  }

  getName(): string {
    if (this.imageType === 'blob') {
      return (this.image as File).name
    } else {
      const url = this.image as string
      return url.slice(url.lastIndexOf('/') + 1);
    }
  }

  async getMeta(): Promise<{ source: string, width: number, height: number }> {
    const source = await this.getSource()
    const cImage = new Image()
    cImage.src = source
    return new Promise<{ source: string, width: number, height: number }>((resolve, reject) => {
      cImage.addEventListener('load', () => {
        resolve({ source, width: cImage.width, height: cImage.height })
      })
    })
  }

  async autoFit(container: HTMLElement, rect?: Rect, img?: HTMLImageElement) {

    const { source: src, width: iw, height: ih } = await this.getMeta()
    const { clientWidth: cw, clientHeight: ch } = container
    const ratio = Math.min(cw / iw, ch / ih, 1)
    // no rect, align center
    const nw = iw * ratio;
    const nh = ih * ratio;
    const padW = (cw - nw) / 2;
    const padH = (ch - nh) / 2;
    const rectOffset = drawRect(container, rect, iw, ih, { newW: nw, newH: nh, leftOffset: padW, topOffset: padH });
    
    if (img) {
      img.src = src
      img.width = nw
      img.height = nh
      img.style.top = `${padH}px`
      img.style.left = `${padW}px`
    }
  }

  async resize(targetSize: number): Promise<DairyCowImage> {
    const image = new Image()
    image.src = await this.getSource()
    return new Promise<DairyCowImage>((resolve, reject) => {
      image.addEventListener('load', async () => {
        this.image = await handleResize(await handleRotate(image), targetSize, this.getName())
        this.imageType = 'blob'
        resolve(this)
      })
    })
  }
}