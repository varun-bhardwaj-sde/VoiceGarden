package com.varun.tts.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TtsResponseDTO {

	private Long requestId;
	
	private String status;
	
	private String voiceId;
	
	private String errorMessage;
	
	private LocalDateTime createdAt;
	
	private LocalDateTime updatedAt;
	
}
