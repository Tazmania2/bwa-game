import {Component, OnInit} from '@angular/core';
import {SeasonNewsModalService} from '@services/season-news-modal.service';

@Component({
  selector: 'page-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  constructor(private seasonNewsModal: SeasonNewsModalService) {}

  ngOnInit(): void {
    // Aguarda o dashboard montar antes de abrir o modal de novidades.
    setTimeout(() => this.seasonNewsModal.tryShowAfterLogin(), 400);
  }
}
