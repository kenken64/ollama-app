package sg.edu.nus.iss.server.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.github.amithkoujalgi.ollama4j.core.exceptions.OllamaBaseException;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import sg.edu.nus.iss.server.service.OllamaService;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping(path="/api/ollama", 
        produces = MediaType.APPLICATION_JSON_VALUE)
public class OllamaRestController {

    @Autowired 
    private OllamaService svc;

    @CrossOrigin
    @GetMapping
    public ResponseEntity<String> getResponseFromOllama(
        @RequestParam(required=true) String message){

        JsonObject result = null;
        try {
            System.out.println(message);
            String response = svc.chatWithOallama(message);
            System.out.println(response);
            JsonObjectBuilder bld = Json.createObjectBuilder()
            .add("response", response);
            result = bld.build();
        } catch (OllamaBaseException e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_JSON)
                .body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_JSON)
                .body(e.getMessage());
        } catch (InterruptedException e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_JSON)
                .body(e.getMessage());
        }
        return ResponseEntity
                .status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(result.toString());
    }
}
