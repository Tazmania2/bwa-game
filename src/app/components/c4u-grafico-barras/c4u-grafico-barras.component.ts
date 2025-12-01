import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Chart} from "chart.js";
import {translate} from "../../providers/translate.provider";

@Component({
  selector: 'c4u-grafico-barras',
  templateUrl: './c4u-grafico-barras.component.html',
  styleUrls: ['./c4u-grafico-barras.component.scss']
})
export class C4uGraficoBarrasComponent implements OnInit {
  @ViewChild('chart', {static: true})
  chartCanvas: any;

  chart: Chart | null = null;

  @Input()
  labels: Array<string> = [];

  @Input()
  values: Array<{ valueList: Array<number>, label: string }> = [];

  @Input()
  showLegend = false;

  // @Input()
  // labelY: string = '';

  private colors = [
    'rgba(255, 255, 255)',
    'rgba(255, 0, 0)',
    'rgba(0, 0, 255)',
    'rgba(255, 255, 0)',
    'rgba(255, 192, 203)',
    'rgba(128, 0, 128)',
    'rgba(0, 128, 0)'];
  private colorsTransparent = [
    'rgba(255, 255, 255, 0.25)',
    'rgba(255, 0, 0, 0.25)',
    'rgba(0, 0, 255, 0.25)',
    'rgba(255, 255, 0, 0.25)',
    'rgba(255, 192, 203, 0.25)',
    'rgba(128, 0, 128, 0.25)',
    'rgba(0, 128, 0, 0.25)'];

  private formatEmailToName(email: string): string {
    // Remove domain part
    const namePart = email.split('@')[0];
    // Split by dots and underscores
    const nameParts = namePart.split(/[._]/);
    // Capitalize each part and join with space
    return nameParts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  ngOnInit(): void {
    const max = Math.max(...this.values[0].valueList) ? Math.max(...this.values[0].valueList) : 1;

    // Format labels if they are emails
    const formattedLabels = this.labels.map(label => {
      if (label.includes('@')) {
        return this.formatEmailToName(label);
      }
      return label;
    });

    let dataSetsChart = [];

    for (let i = 0; i < this.values.length; i++) {
      let value = this.values[i];
      dataSetsChart.push({
        label: value.label,
        data: value.valueList,
        borderWidth: 1,
        borderColor: "transparent",
        backgroundColor: (context: any) => {
          if (context.chart.chartArea) {
            const h = context.chart.chartArea.bottom;
            const elh = Number(context.raw) * h / max
            const gradient = this.chartCanvas.nativeElement.getContext('2d').createLinearGradient(
              0, h - elh, 0, h);
            gradient.addColorStop(0, this.getColor(this.colors, i));
            gradient.addColorStop(1, this.getColor(this.colorsTransparent, i));
            return gradient;
          }

          return 'white';
        },
        borderRadius: {
          topLeft: 4,
          topRight: 4
        },
      })
    }

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: "bar",
      data: {
        labels: formattedLabels,
        datasets: dataSetsChart
      },

      options: {
        datasets: {
          line: {
            fill: true
          }
        },
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            display: this.showLegend,
            align: 'start',
            title: {
              text: translate("LABEL_LEGEND"),
              display: true,
              position: 'start'
            },
            labels: {
              padding: 20,
              usePointStyle: true
              // generateLabels: (chart: any) => {
              //   let labels = chart.data?.labels;
              //   for (var key in labels) {
              //     labels[key].fillStyle  = this.getColor(this.colors, Number(key));
              //   }
              //   return labels;
              // }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: false,
            }
          },
          x: {
            grid: {
              color: "rgba(238, 238, 238, 0.25)",
              drawTicks: false
            },
            ticks: {
              color: this.values[0].valueList.map(v => v <= 0 ? 'rgba(238, 238, 238, 0.5)' : '#EEEEEE')
            },
            border: {
              dash: [2, 2]
            }
          }
        }
      }
    });
  }

  private getColor(listaCores: Array<string>, index: number) {
    if (index >= listaCores.length) {
      do {
        index = index - listaCores.length
      } while (index >= listaCores.length)
    }
    return listaCores[index];
  }
}
