import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { DairyCowImage, drawRect, RectOffset } from '../utils/image';
import { Rect } from '../store/model';
import { Icon } from '../antd'
import ImageZoom from 'react-medium-image-zoom'

interface ImageDisplayProps {
  image: DairyCowImage,
  rect?: Rect
}

export class ImageDisplay extends React.Component<ImageDisplayProps, any> {

  zoomer: any = null
  imageZoom: HTMLImageElement = null

  onZoom = () => {
    const { image, rect } = this.props;
    if (rect && this.imageZoom) {
      image.getMeta().then(({ source, width, height }) => {
        setTimeout(() => {
          const { width: zw, height: zh, top, left } = this.imageZoom.getBoundingClientRect()
          drawRect(this.imageZoom.parentElement, rect, width, height, {
            newW: zw, 
            newH: zh, 
            topOffset: top,
            leftOffset: left
          })
        }, 400)
      })
    }
  }

  render() {
    const { image, rect, children } = this.props
    let element;
    if (children) {
      element = children;
    } else if (rect === false) {
      element = <span className="image-empty"><Icon style={{ fontSize: '64px' }} type="info-circle"></Icon><br />未检测到牛脸<br />请重新选择一张图片</span>
    } else if (image) {
      element = <ImageZoom 
        ref = { C => { this.zoomer = C } } 
        onZoom = { this.onZoom }
        image = {{ src: '' }}
        zoomImage = {{ 
          className: 'img-zoomed', 
          ref: C => { this.imageZoom = C } 
        }}></ImageZoom>
      setTimeout(() => {
        if (this.zoomer.image) {
          image.autoFit(this.zoomer.image.parentElement, rect, this.zoomer.image)
        }
      })
    } else {
      element = <span className="image-empty"><Icon style={{ fontSize: '64px' }} type="cloud-upload"></Icon><br />请上传图片或者在样例图片中选择</span>
    }
    return <div className="image-display-container">{ element }</div>
  }
}