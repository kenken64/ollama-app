import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Message } from '../model/message';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { OllamaService } from '../services/ollama.service';
import { markdownToHtml } from '../markdown-renderer/transform-markdown';

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

  @ViewChild('userMessages')
  private inputMessageRef?: ElementRef;

  constructor(private fb: FormBuilder, 
        private ollamaService: OllamaService) { 
    this.messageForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(3)]],
    });    
  }

  ngOnInit(): void {
    this.scrollToBottom();
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
      
    }
  }

  ngAfterViewChecked() {  
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
        this.inputMessageRef!.nativeElement.scrollTop = this.inputMessageRef?.nativeElement.scrollHeight;
    } catch(err) { }                 
  }
}
