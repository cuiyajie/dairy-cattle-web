import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { DairyCowImage } from '../../utils/image';
import { Rect } from '../../store/model';
const classNames = require('classnames')

interface ImageDisplayProps {
  image: DairyCowImage,
  rect?: Rect,
  onClick?: () => void
}

export class ImageDisplay extends React.Component<ImageDisplayProps, any> {

  // canvas: HTMLCanvasElement = null
  img: HTMLImageElement = null
  render() {
    const { image, rect, children } = this.props
    let element;
    if (children) {
      element = children;
    } else if (rect === false) {
      element = <span className="image-empty">未检测到牛脸<br />请重新选择一张图片</span>
    } else if (image) {
      element = <img ref={ C => { this.img = C } } />
      setTimeout(() => {
        image.autoFit(this.img.parentElement, rect, this.img)
      })
    }
    return <div className={classNames({ "image-display-container": true, "empty-container": !element  })} onClick={ () => { this.props.onClick() } }>{ element }</div>
  }
}