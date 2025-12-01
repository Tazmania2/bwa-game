import {Component, OnDestroy, OnInit} from '@angular/core';
import {interval, Subscription} from "rxjs";

@Component({
  selector: 'app-breve',
  templateUrl: './breve.component.html',
  styleUrls: ['./breve.component.scss']
})
export class BreveComponent implements OnInit, OnDestroy {

  private subscription: Subscription | any;

  public dateNow = new Date();
  public dDay = new Date('Jun 28 2023 09:00:00');
  private milliSecondsInASecond = 1000;
  private minutesInAnHour = 60;
  private secondsInAMinute = 60;

  public countdown = "";
  public showCountdown = false;

  constructor() {

  }

  private getTimeDifference() {
    let timeDifference = this.dDay.getTime() - new Date().getTime();
    if (timeDifference < 0) {
      this.showCountdown = false;
    }  else {
      this.showCountdown = true;
      this.allocateTimeUnits(timeDifference);
    }
  }

  private allocateTimeUnits(timeDifference: any) {
    let secondsToDday = Math.floor((timeDifference) / (this.milliSecondsInASecond) % this.secondsInAMinute);
    let minutesToDday = Math.floor((timeDifference) / (this.milliSecondsInASecond * this.minutesInAnHour) % this.secondsInAMinute);
    let hoursToDday = Math.floor((timeDifference) / (this.milliSecondsInASecond * this.minutesInAnHour * this.secondsInAMinute));
    this.countdown = this.leadingZeros(hoursToDday) + ":" + this.leadingZeros(minutesToDday) + ":" + this.leadingZeros(secondsToDday);
  }

  leadingZeros(number: number) {
    return number.toString().padStart(2, '0');
  }

  ngOnInit() {
    this.getTimeDifference();
    this.subscription = interval(1000)
      .subscribe(x => {
        this.getTimeDifference();
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
