import * as React from 'react'

interface UploaderProps {
  onFileChange?: (file: File) => void
}

export interface UploaderChildProps {
  triggerFileInput: () => void
}

export class Uploader extends React.Component<any, any> {

  fileInput: HTMLInputElement = null

  fileChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length) {
      e.persist()
      this.props.onFileChange && this.props.onFileChange(files[0])
      e.currentTarget.value = null
    }
  }

  triggerFileInput = () => {
    this.fileInput.click()
  }

  render() {
    const childrenWithProps = React.Children.map(this.props.children, (child: React.ReactElement<any>) => React.cloneElement(child, {
      onClick: this.triggerFileInput
    }))
    return <span>
      { childrenWithProps }
      <input ref={ input => { this.fileInput = input } } type="file" accept=".jpg, .jpeg, .png" className="hidden" onChange={ this.fileChange } />
    </span>
  }
}