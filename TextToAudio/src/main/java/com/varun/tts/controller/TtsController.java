package com.varun.tts.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.varun.tts.dto.TtsRequestDTO;
import com.varun.tts.dto.TtsResponseDTO;
import com.varun.tts.service.TtsService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/tts")
public class TtsController {

    private final TtsService ttsService;

    public TtsController(TtsService ttsService) {
        this.ttsService = ttsService;
    }

    // ✅ 1️⃣ Submit TTS Request
    @PostMapping("/requests")
    @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    public TtsResponseDTO submitRequest(@Valid @RequestBody TtsRequestDTO dto) {
        return ttsService.submitRequest(dto);
    }

    // ❌ REMOVED getAllRequests (not part of design)

    // ✅ 2️⃣ Check Request Status
    @GetMapping("/requests/{requestId}")
    public TtsResponseDTO getRequestStatus(@PathVariable Long requestId) {
        return ttsService.getRequestStatus(requestId);
    }

    // ✅ 3️⃣ Get Audio File
    @GetMapping("/requests/{requestId}/audio")
    public ResponseEntity<Resource> getAudioFile(@PathVariable Long requestId) {

        String filePath = ttsService.getAudioFile(requestId);

        Resource resource = new FileSystemResource(filePath);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"audio.mp3\"")
                .contentType(MediaType.parseMediaType("audio/mpeg"))
                .body(resource);
    }
}