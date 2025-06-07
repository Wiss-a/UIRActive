package ma.ac.uir.uiractive.dto;

import java.time.LocalDateTime;
import java.util.Date;

public class CreateMatchupRequest {
    private String title;
    private String description;
    private String sport;
    private String location;
    private Date eventDate;
    private int maxParticipants;
    private String skillLevel;
    private Integer creatorId; // Just the ID instead of full User object

    // Constructors
    public CreateMatchupRequest() {}

    public CreateMatchupRequest(String title, String description, String sport,
                                String location, Date eventDate,
                                int maxParticipants, String skillLevel, Integer creatorId) {
        this.title = title;
        this.description = description;
        this.sport = sport;
        this.location = location;
        this.eventDate = eventDate;
        this.maxParticipants = maxParticipants;
        this.skillLevel = skillLevel;
        this.creatorId = creatorId;
    }

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSport() { return sport; }
    public void setSport(String sport) { this.sport = sport; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Date getEventDate() { return eventDate; }
    public void setEventDate(Date eventDate) { this.eventDate = eventDate; }

    public int getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(int maxParticipants) { this.maxParticipants = maxParticipants; }

    public String getSkillLevel() { return skillLevel; }
    public void setSkillLevel(String skillLevel) { this.skillLevel = skillLevel; }

    public Integer getCreatorId() { return creatorId; }
    public void setCreatorId(Integer creatorId) { this.creatorId = creatorId; }
}
