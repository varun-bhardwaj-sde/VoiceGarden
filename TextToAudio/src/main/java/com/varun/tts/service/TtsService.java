package com.varun.tts.service;

import java.io.File;

import org.springframework.stereotype.Service;

import com.varun.tts.dto.TtsRequestDTO;
import com.varun.tts.dto.TtsResponseDTO;
import com.varun.tts.exception.ResourceNotFoundException;
import com.varun.tts.model.AudioFile;
import com.varun.tts.model.RequestStatus;
import com.varun.tts.model.TtsRequest;
import com.varun.tts.provider.TtsProvider;
import com.varun.tts.repository.AudioFileRepository;
import com.varun.tts.repository.TtsRequestRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TtsService {

    private final TtsRequestRepository ttsRequestRepository;
    private final AudioFileRepository audioFileRepository;
    private final TtsProvider ttsProvider;

    public TtsResponseDTO submitRequest(TtsRequestDTO dto) {

        TtsRequest request = new TtsRequest();
        request.setExtractedText(dto.getText());
        request.setVoiceId(dto.getVoiceId());
        request.setStatus(RequestStatus.PENDING);

        TtsRequest saved = ttsRequestRepository.save(request);

        return buildResponseDTO(saved);
    }

    public TtsResponseDTO getRequestStatus(Long requestId) {

        TtsRequest request = ttsRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with id: " + requestId));

        return buildResponseDTO(request);
    }

    public String getAudioFile(Long requestId) {

        TtsRequest request = ttsRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found with id: " + requestId));

        if (request.getStatus() != RequestStatus.DONE) {
            throw new RuntimeException("Audio not ready");
        }

        AudioFile audioFile = audioFileRepository.findByTtsRequest(request)
                .orElseThrow(() -> new ResourceNotFoundException("Audio file not found"));

        if (audioFile.isDeleted()) {
            throw new RuntimeException("Audio file deleted");
        }

        File file = new File(audioFile.getFilePath());

        if (!file.exists()) {
            throw new RuntimeException("File not found on disk");
        }

        return audioFile.getFilePath();
    }

    private TtsResponseDTO buildResponseDTO(TtsRequest request) {

        TtsResponseDTO dto = new TtsResponseDTO();
        dto.setRequestId(request.getId());
        dto.setStatus(request.getStatus().name());
        dto.setVoiceId(request.getVoiceId());
        dto.setErrorMessage(request.getErrorMessage());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());

        return dto;
    }
}