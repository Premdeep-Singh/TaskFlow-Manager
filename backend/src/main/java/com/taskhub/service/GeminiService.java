package com.taskhub.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.taskhub.web.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Thin client for the Google Gemini API (generativelanguage.googleapis.com). */
@Service
public class GeminiService {
    private final RestClient http = RestClient.create("https://generativelanguage.googleapis.com");
    private final String apiKey;
    private final String model;

    public GeminiService(@Value("${gemini.api-key}") String apiKey, @Value("${gemini.model}") String model) {
        this.apiKey = apiKey;
        this.model = model;
    }

    public String generate(String prompt, boolean json) {
        if (apiKey == null || apiKey.isBlank())
            throw new ApiException(503, "AI features are off. Set GEMINI_API_KEY on the server to turn them on.");
        Map<String, Object> body = new HashMap<>();
        body.put("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));
        if (json) body.put("generationConfig", Map.of("responseMimeType", "application/json"));
        try {
            JsonNode res = http.post().uri("/v1beta/models/{m}:generateContent", model)
                    .header("x-goog-api-key", apiKey).contentType(MediaType.APPLICATION_JSON)
                    .body(body).retrieve().body(JsonNode.class);
            String text = res == null ? "" : res.at("/candidates/0/content/parts/0/text").asText("");
            if (text.isBlank()) throw new ApiException(502, "The AI returned no answer. Try again.");
            return text;
        } catch (RestClientException e) {
            throw new ApiException(502, "Couldn't reach the AI service. Check your API key and try again.");
        }
    }
}
