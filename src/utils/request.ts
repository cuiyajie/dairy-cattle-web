import { DetectionError } from './';
import axios from 'axios'
import env from '../../config/env';
import { ErrorMap } from '../utils/constants';
const qs = require('qs')

const config = env[process.env.NODE_ENV] || env['development'];
axios.defaults.baseURL = config.host
const TIMEOUT = 10000;

const getConfig = {
  method: 'get',
  timeout: TIMEOUT,
  headers: {
    'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
    'Content-Type': 'application/x-www-form-urlencoded'
  }
}

const postConfig = {
  method: 'post',
  timeout: TIMEOUT,
  headers: {
    'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
    'Content-Type': 'application/x-www-form-urlencoded'
  }
}

const postFormDataConfig = {
  method: 'post',
  timeout: TIMEOUT,
  transformRequest: [(data) => {
    const formData = new FormData()
    for(const key in data) {
      formData.append(key, data[key])
    }
    return formData
  }]
}

const handleResult =  async (promise) => {
  const { data } = await promise;
  if (data.status.toUpperCase() === 'OK') {
    return data || {};
  }
}

const handleError = e => {
  if (e && e.code === 'ECONNABORTED') {
    throw new Error('请求超时')
  }

  const { response } = e;
  if (response) {
    const { data, status } = response

    if (data) {
      if (data.status) {
        if (data.status && ErrorMap[data.status]) {
          if (data.status === 'DETECTION_FAILED') {
            throw new DetectionError(data.reason)
          } else {
            throw new Error(ErrorMap[data.status])
          }
        } else {
          throw new Error(data.reason || '服务器内部错误')
        }
      } else {
        throw new Error('服务器内部错误')
      }
    } else {
      throw new Error('网络错误，请重试！')
    }
  } else {
    throw new Error('网络错误，请重试！')
  }
}

export async function get(url: string, params: any = {}, config: any = {}) {
  try {
    return await handleResult(axios(url, { ...getConfig, ...config, params }))
  } catch(e) { 
    handleError(e)
  }
}

export async function post(url: string, params: any = {}, config: any = {}) {
  try {
    return await handleResult(axios(url, { ...postConfig, ...config, params: null, data: params }))
  } catch(e) { 
    handleError(e)
  }
}

export async function postFormData(url: string, params: any = {}, config: any = {}) {
  try {
    return await handleResult(axios(url, { ...postFormDataConfig, params: null, data: params }));
  } catch(e) { 
    handleError(e)
  }
}
