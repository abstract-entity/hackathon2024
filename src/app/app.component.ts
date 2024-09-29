import { AfterViewChecked, Component, ElementRef, inject, Signal, ViewChild, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpeechToTextComponent } from './speech-to-text/speech-to-text.component';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SpeechToTextComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewChecked {

  prodMode: boolean = true;
  botName = 'S@vMe';
  #http: HttpClient = inject(HttpClient);
  recognizing = false;
  recognition = new (window as any).webkitSpeechRecognition();
  @ViewChild('message') private messageElement!: ElementRef;
  output: string = '';
  loading: boolean = false;
  notifications: any[] = [];

  basicPrompt: string = `Tu es un commercial dans le domaine de le transport et la logistique en frais et surgelés. ​
Tu feras une réponse {{data.length}} avec une tonalité {{data.tonality}} avec des compétences soft skill importantes.​

Tu feras une réponse en prenant en compte que l'entreprise cliente est {{data.client}}.​
Tu répondras au prompt ci-dessous : 
{{data.message}}`;

  ragPrompty: string = `Tu es un commercial dans le domaine de le transport et la logistique en frais et surgelés. ​
Tu feras une réponse {{data.length}} avec une tonalité {{data.tonality}} avec des compétences soft skill importantes.​

Tu feras une réponse en prenant en compte que l'entreprise cliente est {{data.client}}.​
Prends en compte : 
- la satisfaction client
- l'évolution de son chiffre d'affaire sur l'année écoulée
- le montant des litiges sur l'année écoulée
- le ratio litige sur sur chiffre d'affaire
- les derniers échanges avec le client
Tu répondras au prompt ci-dessous : 
{{data.message}}`;

//   basicPrompt: string = `Tu es un commercial dans le domaine de le transport et la logistique en frais et surgelés. ​
// Tu feras une réponse {{data.length}} avec une tonalité {{data.tonality}} avec des compétences soft skill importantes.​

// Tu feras une réponse en prenant en compte que l'entreprise cliente est {{data.client}} et le site est {{data.site}}.​
// Tu répondras au prompt ci-dessous : 
// {{data.message}}`;

//   ragPrompty: string = `Tu es un commercial dans le domaine de le transport et la logistique en frais et surgelés. ​
// Tu feras une réponse {{data.length}} avec une tonalité {{data.tonality}} avec des compétences soft skill importantes.​

// Tu feras une réponse en prenant en compte que l'entreprise cliente est {{data.client}} et le site est {{data.site}}.​
// Prends en compte : 
// - la satisfaction client
// - l'évolution de son chiffre d'affaire sur l'année écoulée
// - le montant des litiges sur l'année écoulée
// - le ratio litige sur sur chiffre d'affaire
// - les derniers échanges avec le client
// Tu répondras au prompt ci-dessous : 
// {{data.message}}`;

  tonalities: any[] = [
    { id: 'amical', name: 'Amical' },
    { id: 'direct', name: 'Direct' },
    { id: 'empathique', name: 'Empathique' },
    { id: 'familier', name: 'Familier' },
    { id: 'formel', name: 'Formel' },
    { id: 'neutre', name: 'Neutre' },
    { id: 'professionnel', name: 'Professionnel' },
    { id: 'soutenu', name: 'Soutenu' },
  ];
  lengths: any[] = [
    { id: 'bullet-point', name: 'Bullet point' },
    { id: 'courte', name: 'Short' },
    { id: '', name: 'Standard' },
    { id: 'longue', name: 'Long' }
  ];
  models: any[] = [
    { id: '1anthropic.claude-3-5-sonnet-20240620-v1:0', name: 'Claude 3.5' },
    { id: 'anthropic.claude-3-sonnet-20240229-v1:0', name: 'Claude 3 sonnet' },
    { id: 'anthropic.claude-3-haiku-20240307-v1:0', name: 'Claude 3 haiku' },
    { id: 'meta.llama3-2-3b-instruct-v1:0', name: 'Llama 3.2 3b' },
    { id: 'mistral.mistral-large-2402-v1:0', name: 'Mistral large' },
    { id: 'mistral.mixtral-8x7b-instruct-v0:1', name: 'Mixtral 8x7b' }
  ];

  

  form = new FormGroup({
    client: new FormControl('Rana'),
    site: new FormControl('028F - Stef Fidenza'),
    rag: new FormControl(false),
    prompt: new FormControl(this.basicPrompt),
    message: new FormControl('je dois appliquer une augmentation de 10% aux prestations que je fournis à mon client, comment dois je aborder le sujet avec lui ?'),
    tonality: new FormControl('professionnel'),
    length: new FormControl('longue'),
    modelId: new FormControl('anthropic.claude-3-sonnet-20240229-v1:0')
  });

  onSubmit() {
  }


  ngAfterViewChecked(): void {;
    //when rag value in form change we update the prompt
    this.form.get('rag')?.valueChanges.subscribe((value) => {
      if (value) {
        this.form.get('prompt')?.setValue(this.ragPrompty);
      } else {
        this.form.get('prompt')?.setValue(this.basicPrompt);
      }
    });
    this.#initRecognition();
  }

  #initRecognition() {
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'fr-FR';
    let timeout: any;

    this.recognition.onresult = (event: any) => {
      console.log('result', event.results[event.results.length - 1][0].transcript);
      this.form.get('message')?.setValue(event.results[event.results.length - 1][0].transcript);

      clearTimeout(timeout);
      timeout = setTimeout(() => { 
        this.recognition.stop();
        this.recognizing =false;
      }, 1000); 
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
    this.loading = true;
    this.notifications.push({
      author: 'You',
      date: new Date(),
      msg: this.form.get('message')?.value
    });
    this.#http.post<any>('/api', this.form?.value).subscribe((data) => {
      console.log(data);
      if (data.output.text) {
        this.notifications.push({
          author: this.botName,
          date: new Date(),
          msg: data.output.text,
          citations: data.citations
        });
      } else {
        this.notifications.push({
          author: this.botName,
          date: new Date(),
          msg: data.output.message.content[0].text
        });
      }
      this.loading = false;
    });
    this.form.get('message')?.setValue('');
  }
}
