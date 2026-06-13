package com.varun.tts.provider;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Service
@Primary
public class ElevenLabsTtsProvider implements TtsProvider {

    @Value("${elevenlabs.api.key}")
    private String apiKey;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Override
    public byte[] synthesize(String text, String voiceId) {

        String url = "https://api.elevenlabs.io/v1/text-to-speech/" + voiceId;

        String requestBody = "{"
                + "\"text\": \"" + text + "\","
                + "\"model_id\": \"eleven_flash_v2_5\""
                + "}";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("xi-api-key", apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        try {
            HttpResponse<byte[]> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofByteArray()
            );

            if (response.statusCode() != 200) {
                throw new RuntimeException(
                        "ElevenLabs API failed with status: " + response.statusCode()
                );
            }

            return response.body();

        } catch (Exception e) {
            throw new RuntimeException("Error calling ElevenLabs API", e);
        }
    }
}