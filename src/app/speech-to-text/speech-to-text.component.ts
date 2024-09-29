import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, viewChild } from '@angular/core';

@Component({
  selector: 'app-speech-to-text',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './speech-to-text.component.html',
  styleUrl: './speech-to-text.component.scss'
})
export class SpeechToTextComponent implements AfterViewChecked {

  recognizing = false;
  recognition = new (window as any).webkitSpeechRecognition();
  messageElement = viewChild.required<ElementRef>('el');

  ngAfterViewChecked(): void {
    this.#initRecognition();
  }

  #initRecognition() {
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'fr-FR';

    this.recognition.onresult = (event: any) => {
      console.log('result', event.results[event.results.length - 1][0].transcript);
      this.messageElement().nativeElement.value = event.results[event.results.length - 1][0].transcript;
    };

    this.recognition.onend = () => {
      this.recognizing = false;
    };
  }

  recordMessage() {
    this.recognizing ? this.recognition.stop() : this.recognition.start();
    this.recognizing = !this.recognizing;
  }

  sendMessage() {
    console.log('send message', this.messageElement().nativeElement.value);
    this.messageElement().nativeElement.value = '';
  }
}
