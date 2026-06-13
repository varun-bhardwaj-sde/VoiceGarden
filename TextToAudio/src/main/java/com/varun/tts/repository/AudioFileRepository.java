package com.varun.tts.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.varun.tts.model.AudioFile;
import com.varun.tts.model.TtsRequest;

public interface AudioFileRepository extends JpaRepository<AudioFile, Long> {
	public Optional<AudioFile> findByTtsRequest(TtsRequest request);
    
	public List<AudioFile> findByExpiresAtBeforeAndDeletedFalse(LocalDateTime time);
}
