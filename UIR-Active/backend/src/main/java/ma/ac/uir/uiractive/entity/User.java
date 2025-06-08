package ma.ac.uir.uiractive.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Inheritance(strategy = InheritanceType.JOINED) // Stratégie: tables jointes
@Table(name = "user")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idU")
    private int idU;

    @Column(name = "firstname", nullable = false)
    private String firstname;

    @Column(name = "lastname", nullable = false)
    private String lastname;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "phonenumber", nullable = false, unique = true)
    private String phonenumber;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "date_inscription", nullable = false)
    private Date dateInscription;

    // Events created by this user

    @OneToMany(mappedBy = "creator", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<SportEvent> createdEvents = new ArrayList<>();

    // Events this user is participating in
    @ManyToMany(mappedBy = "participants", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JsonIgnore
    private List<SportEvent> participatingEvents = new ArrayList<>();


    // Constructeurs
    public User() {
        this.dateInscription = new Date(); // Date courante par défaut
    }

    public User(String firstname, String lastname, String email, String password,String phonenumber) {
        this();
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.phonenumber = phonenumber;
        this.password = password;
    }


    public String getPhonenumber() {
        return phonenumber;
    }

    public void setPhonenumber(String phonenumber) {
        this.phonenumber = phonenumber;
    }

    public List<SportEvent> getCreatedEvents() {
        return createdEvents;
    }

    public void setCreatedEvents(List<SportEvent> createdEvents) {
        this.createdEvents = createdEvents;
    }

    public List<SportEvent> getParticipatingEvents() {
        return participatingEvents;
    }

    public void setParticipatingEvents(List<SportEvent> participatingEvents) {
        this.participatingEvents = participatingEvents;
    }

    // Getters et Setters
    public int getIdU() {
        return idU;
    }

    public void setIdU(int idU) {
        this.idU = idU;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Date getDateInscription() {
        return dateInscription;
    }

    public void setDateInscription(Date dateInscription) {
        this.dateInscription = dateInscription;
    }

    @Override
    public String toString() {
        return "User{" +
                "idU=" + idU +
                ", firstName='" + firstname + '\'' +
                ", lastName='" + lastname + '\'' +
                ", email='" + email + '\'' +
                ", dateInscription=" + dateInscription +
                '}';
    }

}