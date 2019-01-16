import * as React from 'react'
import * as ReactDOM from 'react-dom';
import { Button } from '../antd'
import { Uploader } from '../components/Uploader';
import { DairyCowImage } from '../utils/image';
import ImageGallery from 'react-image-gallery'
import { ImageDisplay } from '../components/ImageDisplay';
import { Rect } from '../store/model';
import { TARGET_FILE_SIZE } from '../utils/constants';

interface ImageSelectProps {
  onImageSelect: (image: DairyCowImage) => void,
  image: DairyCowImage,
  rect: Rect,
  sampleImages: string[]
}

export class ImageSelect extends React.Component<ImageSelectProps, { image: DairyCowImage, startIndex: number }> {
  
  imageGallery: ImageGallery = null

  state = {
    image: null,
    startIndex: -1
  }

  onFileInputChange = (file: File) => {
    const activeImage = ReactDOM.findDOMNode(this.imageGallery).querySelector('.image-gallery-thumbnail.active')
    activeImage && activeImage.classList.remove('active')
    new DairyCowImage(file).resize(TARGET_FILE_SIZE).then(resizedFile => {
      this.props.onImageSelect(resizedFile)
    })
  }

  onImageGallerySelect = e => {
    new DairyCowImage(e.target.src).resize(TARGET_FILE_SIZE).then(resizedFile => {
      this.props.onImageSelect(resizedFile)
    })
  }

  render() {
    const { image, rect, sampleImages } = this.props
    const images = sampleImages.map(image => ({ original: image, thumbnail: image }))
    return <div className="image-select">
      <ImageDisplay image={ image } rect={ rect }></ImageDisplay>
      <Uploader onFileChange={ this.onFileInputChange }><Button icon="cloud-upload">选择上传文件</Button></Uploader>
      <ImageGallery 
        ref={ C =>  { this.imageGallery = C } }
        items={ images } 
        infinite={ false }
        disableArrowKeys={ true }
        renderItem={ () => null }
        showFullscreenButton={ false }
        showPlayButton={ false }
        startIndex={ -1 }
        onThumbnailClick={ this.onImageGallerySelect }></ImageGallery>
    </div>
  }
}