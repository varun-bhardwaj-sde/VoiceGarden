package com.varun.tts.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name="audio_file")
public class AudioFile {

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id; 
	
	@ManyToOne
	@JoinColumn(name="request_id")
	private TtsRequest ttsRequest;
	
	 private String filePath;

	 private Long fileSize;

	 private LocalDateTime createdAt;

	 private LocalDateTime expiresAt;

	 private boolean deleted = false;

	    @PrePersist
	    protected void onCreate() {
	        createdAt = LocalDateTime.now();
	    }
}
