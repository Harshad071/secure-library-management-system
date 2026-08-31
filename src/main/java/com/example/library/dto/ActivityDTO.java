package com.example.library.dto;

import java.time.LocalDateTime;

public class ActivityDTO {
    private String type;
    private String message;
    private LocalDateTime occurredAt;

    public ActivityDTO(String type, String message, LocalDateTime occurredAt) {
        this.type = type;
        this.message = message;
        this.occurredAt = occurredAt;
    }

    public String getType() { return type; }
    public String getMessage() { return message; }
    public LocalDateTime getOccurredAt() { return occurredAt; }
}
