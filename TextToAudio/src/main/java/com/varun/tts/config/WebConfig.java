package com.varun.tts.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {

        registry.addMapping("/api/**")   // apply only to API endpoints
                .allowedOrigins("*")    // allow all origins ( for dev only)
                .allowedMethods("GET", "POST")
                .allowedHeaders("*");
    }
}