import { DairyCowImage } from "../utils/image";

export type Rect = [number, number, number, number] | boolean

export interface ICompareResult {
  confidence: number,
  face_rect_1: Rect,
  face_rect_2: Rect,
  threshold: number
}

export interface IState {
  leftImage: DairyCowImage,
  rightImage: DairyCowImage,
  comparing: boolean,
  compareResult: ICompareResult
}