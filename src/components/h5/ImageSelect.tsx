import * as React from 'react'
import * as ReactDOM from 'react-dom';
import { Uploader } from '../../components/Uploader';
import { DairyCowImage } from '../../utils/image';
import { ImageDisplay } from './ImageDisplay';
import { Rect } from '../../store/model'
import { TARGET_FILE_SIZE } from '../../utils/constants';

interface ImageSelectProps {
  onImageSelect: (image: DairyCowImage) => void,
  image: DairyCowImage,
  rect: Rect,
  className?: string
}

export class ImageSelect extends React.Component<ImageSelectProps, any> {
  
  onFileInputChange = (file: File) => {
    new DairyCowImage(file).resize(TARGET_FILE_SIZE).then(resizedFile => {
      this.props.onImageSelect(resizedFile)
    })
  }

  render() {
    const { image, rect, className } = this.props
    return <div className={`image-select ${className}`}>
      <Uploader onFileChange={ this.onFileInputChange }>
        <ImageDisplay image={ image } rect={ rect }></ImageDisplay>
      </Uploader>
    </div>
  }
}