import { DetectionError } from '../utils';
import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { Button, WingBlank, Toast, Modal, Icon } from '../antd/mobile'
import { ICompareResult, IState } from "../store/model";
import { ImageSelect } from "../components/h5/ImageSelect";
import { DairyCowImage } from "../utils/image";
import ActionTypes from '../store/type'
import { postFormData, post } from '../utils/request'
import { CompareResult } from "../components/CompareResult";
const classNames = require('classnames')
const error = (message: string, callback?: () => void) => {
  setTimeout(() => {
    Toast.fail(message, 2, callback)
  }, 800)
}

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
      params[`file_${index+1}`] = image.image
    })
    try {
      const result = await postFormData('/cow/verify', params)
      if (result) {
        const { confidence, threshold, face_rect_1, face_rect_2 } = result
        dispatch({ type: ActionTypes.SUCCEED_COMPARE, payload: {
          compareResult: { confidence, face_rect_1, face_rect_2,  threshold }
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
        error(e.message);
        dispatch({ type: ActionTypes.FAIL_COMPARE })
      }
    }
  }

  reCompare = async() => {
    this.props.dispatch({ type: ActionTypes.FAIL_COMPARE })
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
    return <div className="body">
      <WingBlank size="lg">
        <ImageSelect image={ leftImage } className="left" rect={compareResult ? compareResult.face_rect_1 : null} onImageSelect={ this.selectImage('left') }></ImageSelect>
        <div className="image-compare">{ (compareResult && compareResult.confidence > 0) ? <CompareResult outer={84} inner={76} padding={6} compareResult={ compareResult } />  : null }</div>
        <ImageSelect image={ rightImage } className="right" rect={compareResult ? compareResult.face_rect_2 : null} onImageSelect={ this.selectImage('right') }></ImageSelect>
        { (compareResult && compareResult.confidence > 0) ? <Button type="primary" onClick={ this.reCompare } style={{ marginTop: '15px' }}>重新核验</Button> : <Button type="primary" disabled={ !(leftImage && rightImage) } onClick={ this.compare } style={{ marginTop: '15px' }}>开始核验</Button> }
      </WingBlank>
      <Modal 
        transparent
        visible={ comparing }
        footer={[]}
        className="loading-modal"
        closable={ false }
        maskClosable={false}        
        style={{ textAlign: 'center' }}>
        <Icon type="loading" style={{ margin: '15px 0', fontSize: '20px', color: '#108ee9' }}></Icon><br />核验中</Modal>
    </div>
  }
}

export default connect(mapStateToProps)(App)