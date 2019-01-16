import { handleActions } from 'redux-actions'
import { IState, ICompareResult } from './model'
import Types from './type'

export const initialState = {
  leftImage: null,
  rightImage: null,
  comparing: false,
  compareResult: null
}

export default handleActions<IState>({
  [Types.SELECT_LEFT_IMAGE]: (state, { payload }) => ({
    ...state,
    leftImage: payload.leftImage,
    compareResult: null
  }),

  [Types.SELECT_RIGHT_IMAGE]: (state, { payload }) => ({
    ...state,
    rightImage: payload.rightImage,
    compareResult: null
  }),

  [Types.START_COMPARE]: state => ({
    ...state,
    comparing: true
  }),

  [Types.FAIL_COMPARE]: state => ({
    ...state,
    comparing: false,
    compareResult: null
  }),

  [Types.SUCCEED_COMPARE]: (state, { payload }) => {
    return {
      ...state,
      comparing: false,
      ...payload
    }
  }
}, initialState)