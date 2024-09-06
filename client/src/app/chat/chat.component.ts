import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Message } from '../model/message';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { OllamaService } from '../services/ollama.service';
import { markdownToHtml } from '../markdown-renderer/transform-markdown';
import { SunoApiService } from '../services/suno.api.service';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit{
  messages: Message[] = [];
  messageForm: FormGroup;
  messageSent : boolean = false;
  fileName:string = '';
  responseMessage:string = "";
  pdfUrl: string = "";
  screenAvailWidth: number = 0;

  @ViewChild('userMessages')
  private inputMessageRef?: ElementRef;

  constructor(private fb: FormBuilder, 
        private ollamaService: OllamaService, private cdRef: ChangeDetectorRef,
        private sunoSvc: SunoApiService) { 
    this.messageForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(3)]],
    });    
  }

  ngOnInit(): void {
    console.log(screen.availWidth);
    this.screenAvailWidth = screen.availWidth;
    if(screen.availWidth < 1090){
      console.log("In Potrait mode");
    }else{
      console.log("In Landscape mode");
    }
  } 

  onFileSelected(event: any) {
    this.messageSent = true;
    let imageUrl: string = "";
    const file:File = event.target?.files[0];
    if (file) {
        this.fileName = file.name;
        const formData = new FormData();
        formData.append("file", file);
        var reader = new FileReader();
        reader.onload = (event:any) => {
            imageUrl = event.target.result;
            console.log(imageUrl);
            this.messages.push({text: imageUrl, sender: 'User', timestamp: new Date(), type:'img'});
        }
        reader.readAsDataURL(event.target.files[0]);
        this.ollamaService.uploadFile(formData).then(async (response)  => {
          if(response.match(/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/gm)){
            console.log("contains dot n number !");
          }
          this.responseMessage = await markdownToHtml(response);
          this.messages.push({text: this.responseMessage, sender: 'Ollama', timestamp: new Date(), type:'msg'});
          this.messageSent = false;
        });  
    }
  }

  b64toBlob(b64Data:any, contentType=''){
    const byteCharacters = atob(b64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArrays = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArrays], {type: contentType});
    return blob;
  }

  onPDFFileSelected(event: any) {
    this.messageSent = true;
    
    const file:File = event.target?.files[0];
    if (file) {
        this.fileName = file.name;
        const formData = new FormData();
        formData.append("pdf-file", file);
        var reader = new FileReader();
        reader.onload = (event:any) => {
            let pdfBase64 = event.target.result;
            pdfBase64.replace(/^[^,]+,/, '');
            const base64Data = pdfBase64.split(',')[1];
            console.log(base64Data);
            var fileblob = this.b64toBlob(base64Data, 'application/pdf');
            this.pdfUrl = window.URL.createObjectURL(fileblob); 
            console.log(this.pdfUrl);
            this.messages.push({text: this.fileName, sender: 'User', timestamp: new Date(), type:'pdf'});
        }
        reader.readAsDataURL(event.target.files[0]);
        this.ollamaService.uploadPDFFile(formData).then(async (response)  => {
          if(response.match(/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/gm)){
            console.log("contains dot n number !");
          }
          console.log(response);
          this.messages.push({text: response, sender: 'Ollama', timestamp: new Date(), type:'msg'});
          this.messageSent = false;
        });  
    }
  }

  sendMessage(formDirective: FormGroupDirective) {
    console.log("Sending...");
    if(this.messageForm.valid){
      const text = this.messageForm.value.text;
      console.log('User: ' + text);
      this.messages.push({text: text, sender: 'User', timestamp: new Date(), type:'msg'});
      this.messageSent = true;
      this.ollamaService.chatwithOllama(text).then(async (response) => {
        this.responseMessage = await markdownToHtml(response);
        this.messages.push({text: this.responseMessage, sender: 'Ollama', timestamp: new Date(), type:'msg'});
        this.messageSent = false;
      });

      this.messageForm.reset();
      formDirective.resetForm();
      this.scrollToBottom();
    }
  }

  talktoPDF(){
    console.log("Sending...");
    if(this.messageForm.valid){
      const text = this.messageForm.value.text;
      console.log('User: ' + text);
      this.messages.push({text: text, sender: 'User', timestamp: new Date(), type:'msg'});
      this.messageSent = true;
      this.ollamaService.chatwithOllamaPDF(text).then(async (response) => {
        console.log(response);
        //this.responseMessage = await markdownToHtml(response);
        this.messages.push({text: response, sender: 'Ollama', timestamp: new Date(), type:'msg'});
        this.messageSent = false;
      });

      this.messageForm.reset();
      this.scrollToBottom();
    }
  }

  ngAfterViewChecked() {  
    this.scrollToBottom();
  }

  generateSong(): void {
    if(this.messageForm.valid){
      const text = this.messageForm.value.text;
      console.log('User: ' + text);
      this.messages.push({text: text, sender: 'User', timestamp: new Date(), type:'msg'});
      this.messageSent = true;
      this.sunoSvc.generateSongFromSuno(text).then(async (response) => {
        console.log(response[0]?.audio_url);
        this.messages.push({text: response[0]?.audio_url, sender: 'Ollama', timestamp: new Date(), type:'audio'});
        this.messageSent = false;
      });
      this.messageForm.reset();
    }
  }

  scrollToBottom(): void {
    try {
      this.cdRef.detectChanges();
      this.inputMessageRef!.nativeElement.scrollTop = this.inputMessageRef?.nativeElement.scrollHeight;
    } catch(err) { }                 
  }
}
