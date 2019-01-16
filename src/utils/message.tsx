import * as React from 'react'
import * as ReactDOM from 'react-dom';
import { Modal, Button } from '../antd'

export function error(message) {
  const wrapper = document.createElement('span')
  document.body.appendChild(wrapper)
  const closeModal = () => {
    if (ReactDOM.unmountComponentAtNode(wrapper)) {
      document.body.removeChild(wrapper)
    }
  }

  const modal = ReactDOM.render(<Modal
    visible={ true }
    width={ 420 }
    className='confirm-modal'
    closable={ false }
    footer={ <Button type="primary" size="large" onClick={ closeModal }>确定</Button>  }
  >{ message }</Modal>, wrapper) as Modal
}