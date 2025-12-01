import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from "rxjs";
// import { pagesReleaseNotes1_3 } from "../../../assets/update-notes/v1.0/notes-version-1.3";

export const UPDATE_NOTE_DONE = "update-notes-end-season-one-done";
export const UPDATE_NOTE_DONE_OLDER = "update-notes-end-season-beta-done";

// @Component({
//   selector: 'update-notes',
//   templateUrl: './update-notes.component.html',
//   styleUrls: ['./update-notes.component.scss']
// })
// export class UpdateNotesComponent implements OnInit, OnDestroy {

//   private subscription: Subscription | any;
//   public shownText: Array<string> = [''];
//   private fullText: Array<string> = [];
//   public done = false;
//   public lastSeenPage = 0;
//   public userAnswers: Array<string> = [];

//   private currentPage = 0;
//   private pagesReleaseNotes = [];
//   public buttonClicked = false;

//   ngOnInit() {
//     this.fullText = this.pagesReleaseNotes[this.currentPage].texts;
//     this.startTyping();
//   }

//   startTyping() {
//     this.subscription = interval(2)
//       .subscribe(x => {
//         let currentTextIndex = this.shownText.length - 1;
//         if (this.shownText[currentTextIndex].length === this.fullText[currentTextIndex].length) {
//           if (this.fullText[currentTextIndex + 1]) {
//             this.shownText[currentTextIndex + 1] = '';
//           } else {
//             this.done = true;
//             this.lastSeenPage = this.currentPage;
//             setTimeout(() => {
//               this.subscription.unsubscribe();
//             }, 100);
//           }
//         } else {
//           this.shownText[currentTextIndex] += this.fullText[currentTextIndex][this.shownText[currentTextIndex].length];
//         }
//       });
//   }

//   ngOnDestroy() {
//     this.subscription.unsubscribe();
//   }

//   continue() {
//     if (this.isQuiz) {
//       if (this.isButtonContinueActive()) {
//         this.buttonClicked = true;
//         for (let i = 0; i <= this.correctAnswers.length - 1; i++) {
//           let answer = this.userAnswers[i];
//           let respostaCorreta = this.correctAnswers[i].map((ca: string) => this.normalizeAnswer(ca)).includes(this.normalizeAnswer(answer));
//           if (!respostaCorreta) {
//             if (this.shownText.length > this.fullText.length) {
//               this.shownText.splice(this.fullText.length, 1);
//             }
//             setTimeout(() => {
//               this.shownText.push('<span class="wrong-answer">Uma ou mais respostas estão incorretas. Tente novamente.</span>');
//               this.buttonClicked = false;
//             }, 500);
//             return;
//           }
//         }
//       } else {
//         return;
//       }
//     }
//     this.done = false;
//     this.shownText = [''];
//     this.currentPage++;
//     this.fullText = this.pagesReleaseNotes[this.currentPage].texts;
//     if (this.currentPage <= this.lastSeenPage) {
//       this.shownText = [];
//       this.shownText.push(...this.pagesReleaseNotes[this.currentPage].texts);
//       this.fullText = this.pagesReleaseNotes[this.currentPage].texts;
//       this.done = true;
//     } else {
//       this.startTyping();
//     }
//   }

//   get hasNextPage() {
//     return this.pagesReleaseNotes[this.currentPage + 1];
//   }

//   get canGoBack() {
//     return this.currentPage > 0;
//   }

//   get buttonText() {
//     return this.pagesReleaseNotes[this.currentPage].buttonText;
//   }

//   voltar() {
//     this.currentPage--;
//     this.shownText = [];
//     this.shownText.push(...this.pagesReleaseNotes[this.currentPage].texts);
//     this.fullText = this.pagesReleaseNotes[this.currentPage].texts;
//   }

//   get isQuiz() {
//     return this.pagesReleaseNotes[this.currentPage]?.quiz;
//   }

//   get questions() {
//     return this.pagesReleaseNotes[this.currentPage]?.quiz?.map(q => q.question);
//   }

//   get correctAnswers(): Array<Array<string>> | any {
//     return this.pagesReleaseNotes[this.currentPage]?.quiz?.map(q => q.answers);
//   }

//   private normalizeAnswer(str: string) {
//     return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
//   }

//   enterGame() {
//     if (localStorage.getItem(UPDATE_NOTE_DONE_OLDER)) localStorage.removeItem(UPDATE_NOTE_DONE_OLDER);
    
//     localStorage.setItem(UPDATE_NOTE_DONE, "OK");
//     location.href = "/";
//   }

//   isButtonContinueActive() {
//     return this.isQuiz ? this.allQuestionsAnswered() : true;
//   }

//   private allQuestionsAnswered() {
//     return this.userAnswers.length === this.correctAnswers.length && !this.userAnswers.some(ua => ua.length === 0);
//   }

// }

