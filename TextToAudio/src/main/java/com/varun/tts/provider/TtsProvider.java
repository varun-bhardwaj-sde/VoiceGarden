package com.varun.tts.provider;

public interface TtsProvider {

	public byte[] synthesize(String text,String voiceId) throws RuntimeException;
}
