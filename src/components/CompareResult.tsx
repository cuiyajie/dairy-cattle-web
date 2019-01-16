import * as React from 'react'
import { ICompareResult } from '../store/model'
const raf = require('raf')

interface ResultProps {
  compareResult: ICompareResult,
  outer: number,
  inner: number,
  padding: number
}

export class CompareResult extends React.Component<ResultProps, any> {
  
  componentDidMount() {
    this.drawDoughnut()
  }

  componentWillReceiveProps(nextProps: ResultProps) {
    if (nextProps.compareResult !== this.props.compareResult) {
      this.drawDoughnut() 
    }
  }

  canvas: HTMLCanvasElement = null

  drawDoughnut() {
    const { outer, inner, compareResult: { confidence } } = this.props
    const ctx = this.canvas.getContext('2d');
    this.resetDoughnut(ctx)
    const grd = ctx.createLinearGradient(outer, 0, outer, outer * 2);
    grd.addColorStop(0, '#FFA040'); 
    grd.addColorStop(1, '#924FFF');
    this.drawDoughnutFrame(ctx, grd, 0);

    let that = this;
    let duration = 2;
    let totalCount = Math.floor(confidence * 60 * duration);
    let frameCount = totalCount;
    const handle = raf(function draw() {
      if (frameCount <= 0) {
        that.drawDoughnutFrame(ctx, grd, confidence);
        raf.cancel(handle);
      } else {
        frameCount--;
        that.drawDoughnutFrame(ctx, grd, (totalCount - frameCount) / (60 * duration));
        raf(draw);
      }
    })
  }

  resetDoughnut = (ctx: CanvasRenderingContext2D) => {
    const { outer } = this.props
    ctx.clearRect(0, 0, outer * 2, outer * 2)
    ctx.save()
  }

  drawDoughnutFrame(ctx: CanvasRenderingContext2D, grd: CanvasGradient, percent: number) {
    const angle = percent * Math.PI * 2 - Math.PI / 2;
    const { outer, inner, compareResult: { confidence, threshold } } = this.props
    const passed = confidence >= threshold
    const thickness = (outer - inner) / 2;
    const roundRadius = (outer + inner) / 2;
    const ratio = outer / 90;
    const round = Math.round

    ctx.clearRect(0, 0, outer * 2, outer * 2);

    ctx.beginPath();
    ctx.moveTo(outer, outer);
    ctx.fillStyle = 'rgb(240, 240, 240)'
    ctx.arc(outer, outer, outer, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = grd;
    ctx.moveTo(outer, outer);
    ctx.arc(outer, outer, outer, -Math.PI / 2, angle, false);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.arc(outer, outer, inner, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.save();
    const startAngle = -Math.PI / 2;
    const endAngle = angle;
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(outer + roundRadius * Math.cos(startAngle), outer + roundRadius * Math.sin(startAngle), thickness, 0, Math.PI * 2);
    ctx.arc(outer + roundRadius * Math.cos(endAngle), outer + roundRadius * Math.sin(endAngle), thickness, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.textAlign = 'center'
    ctx.font = `${round(ratio*18)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif`;
    ctx.fillStyle = passed ? '#65B872' : '#D0021B'
    ctx.fillText(`核验${passed?'':'未'}通过`, outer, round(ratio*50));
    ctx.fillStyle = '#9B9B9B'
    ctx.fillText('分', outer, outer * 2 - round(ratio*18));
    ctx.fillStyle = '#4A4A4A'
    ctx.font = `bold ${round(ratio*90)}px Arial`;
    ctx.fillText(round(percent * 100).toString(), outer, outer + round(ratio*42));
    ctx.closePath();
    ctx.restore();

    ctx.save();
  }

  render() {
    const { compareResult: { confidence }, outer, padding } = this.props
    return <div style={{ width: `${outer*2+padding*2}px`, height: `${outer*2+padding*2}px` }} className="result-container">
      <canvas 
        width={`${outer*2}`} 
        height={`${outer*2}`} 
        style={{ marginTop: `${padding}px`, marginLeft: `${padding}px` }}
        ref={ C => { this.canvas = C } } ></canvas>
    </div>
  }
}