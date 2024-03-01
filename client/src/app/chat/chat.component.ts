import { Component } from '@angular/core';
import { Message } from '../model/message';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OllamaService } from '../services/ollama.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  messages: Message[] = [];
  messageForm: FormGroup;
  messageSent : boolean = false;
  fileName:string = '';
  
  constructor(private fb: FormBuilder, 
        private ollamaService: OllamaService) { 
    this.messageForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(3)]],
    });    
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
        this.ollamaService.uploadFile(formData).then((response) => {
          this.messages.push({text: response, sender: 'Ollama', timestamp: new Date(), type:'msg'});
          this.messageSent = false;
        });  
    }
  }

  sendMessage() {
    console.log("Sending...");
    if(this.messageForm.valid){
      const text = this.messageForm.value.text;
      console.log('User: ' + text);
      this.messages.push({text: text, sender: 'User', timestamp: new Date(), type:'msg'});
      this.messageSent = true;
      this.ollamaService.chatwithOllama(text).then((response) => {
        this.messages.push({text: response, sender: 'Ollama', timestamp: new Date(), type:'msg'});
        this.messageSent = false;
      });

      this.messageForm.reset();
    }
  }
}
