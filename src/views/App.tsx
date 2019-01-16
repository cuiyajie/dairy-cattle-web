import { DetectionError } from '../utils';
import * as React from 'react';
import { connect, Dispatch } from "react-redux";
import { Button, Modal, Icon } from '../antd'
import { ICompareResult, IState } from "../store/model";
import { ImageSelect } from "../components/ImageSelect";
import { DairyCowImage } from "../utils/image";
import ActionTypes from '../store/type'
import { postFormData, post } from '../utils/request'
import { error } from "../utils/message";
import { CompareResult } from "../components/CompareResult";
const requireContext = require.context('../assets/images/samples', true, /\.(jpg|jpeg|png)$/i);
const sampleImagesAlive = requireContext.keys().filter(p => /-2\.jpg$/.test(p)).map(requireContext)
const sampleImagesDead = requireContext.keys().filter(p => /-1\.jpg$/.test(p)).map(requireContext)

interface AppProps {
  leftImage: DairyCowImage,
  rightImage: DairyCowImage,
  comparing: boolean,
  compareResult: ICompareResult,
  dispatch: Dispatch<any>
}

function mapStateToProps(state: IState) {
  return { ...state }
}

class App extends React.Component<AppProps, any> {

  compare = async () => {
    const { dispatch, leftImage, rightImage } = this.props
    dispatch({ type: ActionTypes.START_COMPARE })
    const params = {}
    Array.prototype.forEach.call([ leftImage, rightImage ], (image: DairyCowImage, index: number) => {
      params[`${image.imageType === 'blob' ? 'file' : 'url'}_${index+1}`] = image.image
    })
    try {
      const result = await postFormData('/cow/verify', params)
      if (result) {
        const { confidence, threshold, face_rect_1, face_rect_2 } = result
        dispatch({ type: ActionTypes.SUCCEED_COMPARE, payload: {
          compareResult: { confidence, face_rect_1, face_rect_2, threshold }
        }})
      }
    } catch (e) {
      if (e.name === DetectionError.name) {
        dispatch({ type: ActionTypes.SUCCEED_COMPARE, payload: {
          ...(e.imageIndex === 1 ? { leftImage: null } : {}),
          ...(e.imageIndex === 2 ? { rightImage: null } : {}),
          compareResult: { 
            confidence: -1, 
            face_rect_1: e.imageIndex === 1 ? false : null, 
            face_rect_2: e.imageIndex === 2 ? false : null
          }
        }})
      } else {
        setTimeout(() => error(e.message), 600)
        dispatch({ type: ActionTypes.FAIL_COMPARE })
      }
    }
  }

  selectImage = (id: string) => {
    const { dispatch } = this.props
    return (image) => {
      if (id === 'left') {
        dispatch({ type: ActionTypes.SELECT_LEFT_IMAGE, payload: { leftImage: image } })
      } else {
        dispatch({ type: ActionTypes.SELECT_RIGHT_IMAGE, payload: { rightImage: image } })
      }
    }
  }

  render() {
    const { leftImage, rightImage, comparing, compareResult, dispatch } = this.props
    return <div>
      <header>
        <div className="container"><span className="logo">Deepfinch</span>奶牛核验系统</div>
      </header>
      <div className="container body">
        <ImageSelect image={ leftImage } rect={compareResult ? compareResult.face_rect_1 : null} onImageSelect={ this.selectImage('left') } sampleImages={ sampleImagesDead }></ImageSelect>
        <div className="image-compare">{ 
          (compareResult && compareResult.confidence > 0) ? 
          <CompareResult outer={84} inner={76} padding={6} compareResult={ compareResult } />  :
          <span style={{ fontSize: '24px', fontWeight: 'bold', fontStyle: 'italic' }}>VS.</span> }
        </div>
        <ImageSelect image={ rightImage } rect={compareResult ? compareResult.face_rect_2 : null} onImageSelect={ this.selectImage('right') } sampleImages={ sampleImagesAlive }></ImageSelect>
      </div>
      <div style={{ textAlign: 'center', marginTop: '20px' }}><Button type="primary" size="large" disabled={ !(leftImage && rightImage) } onClick={ this.compare }>开始核验</Button></div>
      <Modal 
        visible={ comparing }
        footer={ null }
        className="loading-modal"
        closable={ false }
        width={ 120 }
        style={{ textAlign: 'center' }}>
        <Icon type="loading" style={{ margin: '15px 0', fontSize: '20px', color: '#108ee9' }}></Icon><br />核验中</Modal>
    </div>
  }
}

export default connect(mapStateToProps)(App)