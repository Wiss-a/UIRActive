package ma.ac.uir.uiractive.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "matchup")
public class Matchup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "skillLevel", columnDefinition = "TEXT")
    private String skillLevel;

    @Column(name = "sport")
    private String sport;

    @Column(name = "status", columnDefinition = "TEXT")
    private String status;

    @Column(name = "event_date", nullable = false)
    private Date eventDate;

    @Column(name = "max_participants")
    private Integer maxParticipants;

    @Column(name = "location")
    private String location;

    @Column(name = "contact_email")
    private String contactEmail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    @JsonIgnore
    private User creator;

    @ManyToMany
    @JoinTable(
            name = "matchup_participants",
            joinColumns = @JoinColumn(name = "matchup_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonIgnore
    private List<User> participants;

    @Column(name = "created_at", nullable = false)
    private Date createdAt;

    public Matchup() {
        this.createdAt = new Date();
    }

    public Matchup(String title, String description, Date eventDate, User creator) {
        this();
        this.title = title;
        this.description = description;
        this.eventDate = eventDate;
        this.creator = creator;
    }

    // Add these JSON properties to expose participant data without full User objects
    @JsonProperty("participants")
    public List<ParticipantDto> getParticipantsDto() {
        if (participants == null) {
            return List.of();
        }
        return participants.stream()
                .map(user -> new ParticipantDto(user.getIdU(), user.getFirstname(),user.getLastname()))
                .collect(Collectors.toList());
    }

    @JsonProperty("createdBy")
    public Integer getCreatedBy() {
        return creator != null ? creator.getIdU() : null;
    }

    // Inner class for participant data transfer
    public static class ParticipantDto {
        private Integer id;
        private String firstname;
        private String lastname;

        public ParticipantDto(Integer id, String firstname, String lastname) {
            this.id = id;
            this.firstname = firstname;
            this.lastname = lastname;
        }

        public Integer getId() {
            return id;
        }
        public String getFirstname() {
            return firstname;
        }
        public String getLastname() {
            return lastname;
        }


    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSkillLevel() {
        return skillLevel;
    }

    public void setSkillLevel(String skillLevel) {
        this.skillLevel = skillLevel;
    }

    public String getSport() {
        return sport;
    }

    public void setSport(String sport) {
        this.sport = sport;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Date getEventDate() {
        return eventDate;
    }

    public void setEventDate(Date eventDate) {
        this.eventDate = eventDate;
    }

    public Integer getMaxParticipants() {
        return maxParticipants;
    }

    public void setMaxParticipants(Integer maxParticipants) {
        this.maxParticipants = maxParticipants;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public User getCreator() {
        return creator;
    }

    public void setCreator(User creator) {
        this.creator = creator;
    }

    public List<User> getParticipants() {
        return participants;
    }

    public void setParticipants(List<User> participants) {
        this.participants = participants;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "Matchup{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", eventDate=" + eventDate +
                ", creator=" + (creator != null ? creator.getEmail() : "null") +
                '}';
    }
}