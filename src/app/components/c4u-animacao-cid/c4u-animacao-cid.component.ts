import {ChangeDetectorRef, Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, combineLatest, filter} from "rxjs";
import {AnimationOptions, LottieComponent} from "ngx-lottie";

@Component({
  selector: 'c4u-animacao-cid',
  templateUrl: './c4u-animacao-cid.component.html',
  styleUrls: ['./c4u-animacao-cid.component.scss']
})
export class C4uAnimacaoCidComponent implements OnInit, OnChanges {
  protected readonly Array = Array;

  @ViewChild('spawnAnim', {static: true})
  spawnAnim!: LottieComponent;

  @ViewChild('idleAnim', {static: true})
  idleAnim: any;

  @Input()
  showValues = true;

  showAnimation = true;

  @Input()
  text: string = '';

  @Input()
  subtext: string | any

  $spawnAnimReady = new BehaviorSubject(false);
  $idleAnimReady = new BehaviorSubject(false);
  $spawnAnimComplete = new BehaviorSubject(false);

  optionsSpawn: AnimationOptions = {
    path: '/assets/anim/cid/cid_spawn.json',
    loop: false
  };

  optionsIdle: AnimationOptions = {
    path: '/assets/anim/cid/cid_idle.json',
    loop: true
  }

  constructor(private cdf: ChangeDetectorRef) {
    this.cdf.markForCheck();

    combineLatest([this.$spawnAnimReady, this.$idleAnimReady])
      .pipe(filter(([a, b]) => a && b))
      .subscribe(_ => {
        this.spawnAnim.container.nativeElement.style.display = 'unset';
        this.showAnimation = true;
      });

    this.$spawnAnimComplete.pipe(filter(a => a)).subscribe(_ => {
      this.spawnAnim.container.nativeElement.style.display = 'none';
      this.idleAnim.container.nativeElement.style.display = 'unset';
      this.cdf.detectChanges();
    });
  }

  ngOnInit() {
    this.spawnAnim.container.nativeElement.style.display = 'none';
    this.idleAnim.container.nativeElement.style.display = 'none';
  }

  ngOnChanges() {
    this.showAnimation = this.showAnimation;
    this.showValues = this.showValues;
  }

}
