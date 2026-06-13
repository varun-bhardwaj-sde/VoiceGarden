package com.varun.tts.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TtsRequestDTO {
	@NotBlank(message="Text can not be empty")
	@Size(max=10000,message="Text cannot exceed 10000 characters")
	private String text;
	@NotBlank(message="voiceId cannot be empty")
	private String voiceId;
	private String sourceWindow;

}
