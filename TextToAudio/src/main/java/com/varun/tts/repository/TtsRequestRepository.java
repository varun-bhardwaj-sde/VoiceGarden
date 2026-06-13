package com.varun.tts.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.varun.tts.model.RequestStatus;
import com.varun.tts.model.TtsRequest;

public interface TtsRequestRepository extends JpaRepository<TtsRequest, Long> {

    List<TtsRequest> findByStatus(RequestStatus status);
}

