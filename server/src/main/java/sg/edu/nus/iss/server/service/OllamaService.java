package sg.edu.nus.iss.server.service;

import java.io.IOException;
import java.util.List;

import org.springframework.stereotype.Service;

import io.github.amithkoujalgi.ollama4j.core.OllamaAPI;
import io.github.amithkoujalgi.ollama4j.core.exceptions.OllamaBaseException;
import io.github.amithkoujalgi.ollama4j.core.models.OllamaResult;
import io.github.amithkoujalgi.ollama4j.core.types.OllamaModelType;
import io.github.amithkoujalgi.ollama4j.core.utils.OptionsBuilder;

@Service
public class OllamaService {
    
    public String chatWithOllama(String message) throws OllamaBaseException, 
            IOException, InterruptedException {
        String host = "http://localhost:11434/";
        OllamaAPI ollamaAPI = new OllamaAPI(host);
        ollamaAPI.setVerbose(true);
        
        OllamaResult result = ollamaAPI.generate(OllamaModelType.MISTRAL, 
                        message, new OptionsBuilder().build());
        System.out.println(result.getResponse());
        return result.getResponse();
    }

}
