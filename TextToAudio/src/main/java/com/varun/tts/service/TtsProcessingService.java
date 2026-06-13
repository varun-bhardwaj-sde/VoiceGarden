package com.varun.tts.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.varun.tts.model.AudioFile;
import com.varun.tts.model.RequestStatus;  
import com.varun.tts.model.TtsRequest;
import com.varun.tts.provider.TtsProvider;
import com.varun.tts.repository.AudioFileRepository;
import com.varun.tts.repository.TtsRequestRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TtsProcessingService {

    private final TtsRequestRepository ttsRequestRepository;
    private final AudioFileRepository audioFileRepository;
    private final TtsProvider ttsProvider;

    // 🔹 File storage path
    private static final String DIRECTORY_PATH = "C:\\tts-data\\audio\\";

    // 🔹 Core Processing Method
    public void processRequest(TtsRequest request) {

        try {
           
            request.setStatus(RequestStatus.STREAMING);
            ttsRequestRepository.save(request);

         
            byte[] audioBytes = ttsProvider.synthesize(
                    request.getExtractedText(),
                    request.getVoiceId()
            );


            Path dirPath = Paths.get(DIRECTORY_PATH);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }

            
            String fileName = "tts_" + request.getId() + "_" + System.currentTimeMillis() + ".mp3";
            Path filePath = dirPath.resolve(fileName);

            // 5️⃣ Write file
            Files.write(filePath, audioBytes);

            // 6️⃣ Save AudioFile entity
            AudioFile audioFile = new AudioFile();
            audioFile.setFilePath(filePath.toString());
            audioFile.setFileSize((long) audioBytes.length); 
            audioFile.setExpiresAt(LocalDateTime.now().plusHours(1));
            audioFile.setTtsRequest(request);

            audioFileRepository.save(audioFile);

            // 7️⃣ Mark as DONE
            request.setStatus(RequestStatus.DONE);
            ttsRequestRepository.save(request);

            log.info("TTS completed for request {}", request.getId());

        } catch (Exception ex) {

            // ❌ Fail Fast
            request.setStatus(RequestStatus.FAILED);
            request.setErrorMessage(ex.getMessage());
            ttsRequestRepository.save(request);

            log.error("TTS processing failed for request {}", request.getId(), ex);
        }
    }

  
    @Scheduled(fixedDelay = 5000)
    public void pickUpPendingRequests() {

        List<TtsRequest> pendingRequests =
                ttsRequestRepository.findByStatus(RequestStatus.PENDING); // ✅ FIXED

        if (pendingRequests.isEmpty()) {
            log.info("No pending TTS requests");
            return;
        }

        log.info("Found {} pending requests", pendingRequests.size());

        for (TtsRequest request : pendingRequests) {
            processRequest(request);
        }
    }
}