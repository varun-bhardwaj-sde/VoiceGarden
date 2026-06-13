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
import com.varun.tts.repository.AudioFileRepository;
import com.varun.tts.repository.TtsRequestRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CleanupService {

    private final AudioFileRepository audioFileRepository;
    private final TtsRequestRepository ttsRequestRepository;

    // 🔹 Runs every 60 seconds
    @Scheduled(fixedDelay = 60000)
    public void cleanExpiredFiles() {

        List<AudioFile> expiredFiles =
                audioFileRepository.findByExpiresAtBeforeAndDeletedFalse(LocalDateTime.now());

        if (expiredFiles.isEmpty()) {
            log.info("No expired audio files to clean");
            return;
        }

        log.info("Found {} expired files", expiredFiles.size());

        for (AudioFile audioFile : expiredFiles) {

            try {
                // 1 Delete file from disk FIRST
                Path filePath = Paths.get(audioFile.getFilePath());
                Files.deleteIfExists(filePath);

                // 2️ Mark AudioFile as deleted
                audioFile.setDeleted(true);
                audioFileRepository.save(audioFile);

                // 3️ Update linked TtsRequest status
                TtsRequest request = audioFile.getTtsRequest();
                request.setStatus(RequestStatus.EXPIRED);
                ttsRequestRepository.save(request);

                log.info("Deleted expired file: {}", filePath);

            } catch (Exception ex) {
                //  Do NOT stop entire loop
                log.error("Failed to delete file: {}", audioFile.getFilePath(), ex);
            }
        }
    }
}