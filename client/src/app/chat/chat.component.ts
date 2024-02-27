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
  
  constructor(private fb: FormBuilder, 
        private ollamaService: OllamaService) { 
    this.messageForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(3)]],
    });    
  }

  sendMessage() {
    console.log("Sending...");
    if(this.messageForm.valid){
      const text = this.messageForm.value.text;
      console.log('User: ' + text);
      this.messages.push({text: text, sender: 'User', timestamp: new Date()});
      this.ollamaService.chatwithOllama(text).then((response) => {
        this.messages.push({text: response.message, sender: 'Ollama', timestamp: new Date()});
      });

      this.messageForm.reset();
    }
  }
}
