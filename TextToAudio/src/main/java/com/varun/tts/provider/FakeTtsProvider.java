package com.varun.tts.provider;

import org.springframework.stereotype.Service;

@Service
public class FakeTtsProvider implements TtsProvider {

	@Override
	public byte[] synthesize(String text, String voiceId) throws RuntimeException {
		// TODO Auto-generated method stub
		try {
			System.out.println("FakeTtsProvider: Converting text of length"+text.length()+"with voice"+voiceId);
			Thread.sleep(2000);
		}
		catch(InterruptedException e) {
			throw new RuntimeException("Fake TTS interrupted",e);
		}
		
		return new  byte[] {24};
	}

}
