import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {Chart} from "chart.js";
import {translate} from "../../providers/translate.provider";

@Component({
  selector: 'c4u-grafico-linhas',
  templateUrl: './c4u-grafico-linhas.component.html',
  styleUrls: ['./c4u-grafico-linhas.component.scss']
})
export class C4uGraficoLinhasComponent implements AfterViewInit {
  @ViewChild('chart', {static: true})
  chartCanvas: any;

  chart: Chart | null = null;

  @Input()
  labels: Array<string> = [];

  @Input()
  values: Array<{ valueList: Array<number>, label: string }> = [];

  @Input()
  showLegend = false;

  private colors = ["white", "red", "blue", "yellow", "pink", "purple", "green"];
  private pointStyle = ["circle", "rect", "rectRot", "star", "triangle", "rectRounded", "cross", "crossRot", "dash", "line"];

  // @Input()
  // labelY: string = '';

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

  private sortLabelsChronologically(labels: string[]): string[] {
    return [...labels].sort((a, b) => {
      // Extract day numbers from labels (assuming format like "Dia 1", "Dia 2", etc.)
      const dayA = parseInt(a.replace(/\D/g, ''));
      const dayB = parseInt(b.replace(/\D/g, ''));
      return dayA - dayB;
    });
  }

  ngAfterViewInit(): void {
    let dataSetsChart = [];

    // Sort labels chronologically
    const sortedLabels = this.sortLabelsChronologically(this.labels);

    for (let i=0; i<this.values.length; i++) {
      let value = this.values[i];
      // Format the label if it's an email
      const formattedLabel = value.label.includes('@') 
        ? this.formatEmailToName(value.label)
        : value.label;

      dataSetsChart.push({
        label: formattedLabel,
        data: value.valueList,
        borderWidth: 2,
        pointStyle: this.getPointStyle(i),
        borderColor: this.getColor(i),
        pointBackgroundColor: this.getColor(i)
      });
    }

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: "line",
      data: {
        labels: sortedLabels,
        datasets: dataSetsChart
      },
      options: {
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 30,
            bottom: 0
          }
        },
        datasets: {
          line: {
            fill: true
          }
        },
        maintainAspectRatio: false,
        responsive: true,
        plugins: <any>{
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
      },
      plugins: [plugin],
    });
  }

  private getPointStyle(index: number) {
    if (index >= this.pointStyle.length) {
      do {
        index = index - this.pointStyle.length
      } while (index >= this.pointStyle.length)
    }
    return this.pointStyle[index];
  }

  getColor(index: number) {
    if (index >= this.colors.length) {
      do {
        index = index - this.colors.length
      } while (index >= this.colors.length)
    }
    return this.colors[index];
  }

}

const plugin = {
  id: 'pluginPaddingLegenda',
  beforeInit(chart: any) {
    // Get a reference to the original fit function
    const originalFit = chart.legend.fit;

    // Override the fit function
    chart.legend.fit = function fit() {
      // Call the original function and bind scope in order to use `this` correctly inside it
      originalFit.bind(chart.legend)();
      // Change the height as suggested in other answers
      this.height += 20;
    }
  }
}
