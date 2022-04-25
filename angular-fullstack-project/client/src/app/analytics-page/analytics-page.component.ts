import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {AnalyticsService} from "../shared/services/analytics.service";
import {AnalyticsPage} from "../shared/interfaces";
import {Subscription} from "rxjs";
import {Chart,registerables} from "chart.js";

@Component({
  selector: 'app-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.css']
})
export class AnalyticsPageComponent implements AfterViewInit, OnDestroy {

  @ViewChild('gain') gainRef!: ElementRef
  @ViewChild('order') orderRef!: ElementRef
  aSub!: Subscription
  average: number = 0
  pending: boolean = true



  constructor(private service:AnalyticsService) {
    Chart.register(...registerables)
  }

  ngAfterViewInit() {
    const gainConfig: any = {
      label: 'Gain',
      color: 'rgb(255,99,132)'
    }
    const orderConfig: any = {
      label: 'Orders',
      color: 'rgb(54, 162, 235)'
    }

    this.aSub = this.service.getAnalytics().subscribe({
      next: (data:AnalyticsPage) => {
        this.average = data.average

        gainConfig.labels = data.chart.map(item => item.label)
        gainConfig.data = data.chart.map(item => item.gain)

        orderConfig.labels = data.chart.map(i => i.label)
        orderConfig.data = data.chart.map(i => i.order)

        //**** Gain ****
        // gainConfig.labels.push('18.04.2022')
        // gainConfig.labels.push('19.04.2022')
        // gainConfig.data.push(86)
        // gainConfig.data.push(12)

       // **** Gain ****

        //**** Order ****
        // orderConfig.labels.push('18.04.2022')
        // orderConfig.labels.push('19.04.2022')
        // orderConfig.data.push(8)
        // orderConfig.data.push(2)

        //**** Order ****

        const gainCtx = this.gainRef.nativeElement.getContext('2d')
        const orderCtx = this.orderRef.nativeElement.getContext('2d')
        gainCtx.canvas.height = '300px'
        orderCtx.canvas.height = '300px'

        new Chart(gainCtx,createChartConfig(gainConfig))
        new Chart(orderCtx,createChartConfig(orderConfig))

        this.pending = false
      }
    })
  }
  ngOnDestroy() {
    if(this.aSub){
      this.aSub.unsubscribe()
    }
  }
}

function createChartConfig({labels, data, label, color}: any){
  return {
    type: 'line' as any,
    options: {
      responsive:true
    },
    data:{
      labels,
      datasets:[
        {
          label,
          data,
          borderColor: color,
          steppedLine:false,
          fill:false
        }
      ]
    }
  }
}
