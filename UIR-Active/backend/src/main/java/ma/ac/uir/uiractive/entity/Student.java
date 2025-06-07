package ma.ac.uir.uiractive.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "student")
@PrimaryKeyJoinColumn(name = "user_id") // Clé étrangère vers la table user
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})

public class Student extends User {

    // Getters et Setters
    @Setter
    @Getter
    @ElementCollection
    @CollectionTable(name = "student_sports", joinColumns = @JoinColumn(name = "student_id"))
    @Column(name = "sport")
    private List<String> sportsPreferences;

    @Setter
    @Getter
    @Column(name = "statut")
    private Boolean statut;

    // Add to getters and setters
    @Setter
    @Getter
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
//    @JsonIgnoreProperties("user")
    @JsonIgnore
    private List<Reservation> reservations;

    // Ajoutez ces getters et setters
    @Setter
    @Getter
//    @JsonIgnore
    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MarketplaceItem> marketplaceItems;

    @OneToMany(mappedBy = "buyer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Transaction> purchases = new ArrayList<>();

    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Transaction> sales = new ArrayList<>();

    @OneToMany(mappedBy = "reporter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LostItem> reportedLostItems = new ArrayList<>();

    // Constructeurs
    public Student() {
        super();
        this.statut = true; // Par défaut, statut actif
    }

    public Student(String firstname, String lastname, String email, String password) {
        super(firstname, lastname, email, password);
        this.statut = true;
    }

    // Méthodes spécifiques à l'étudiant
    public void addSportPreference(String sport) {
        this.sportsPreferences.add(sport);
    }

    public List<String> getSportsPreferences() {
        return sportsPreferences;
    }

    public void setSportsPreferences(List<String> sportsPreferences) {
        this.sportsPreferences = sportsPreferences;
    }

    public Boolean getStatut() {
        return statut;
    }

    public void setStatut(Boolean statut) {
        this.statut = statut;
    }

    public List<Reservation> getReservations() {
        return reservations;
    }

    public void setReservations(List<Reservation> reservations) {
        this.reservations = reservations;
    }

    public List<MarketplaceItem> getMarketplaceItems() {
        return marketplaceItems;
    }

    public void setMarketplaceItems(List<MarketplaceItem> marketplaceItems) {
        this.marketplaceItems = marketplaceItems;
    }

    public List<Transaction> getPurchases() {
        return purchases;
    }

    public void setPurchases(List<Transaction> purchases) {
        this.purchases = purchases;
    }

    public List<Transaction> getSales() {
        return sales;
    }

    public void setSales(List<Transaction> sales) {
        this.sales = sales;
    }

    public List<LostItem> getReportedLostItems() {
        return reportedLostItems;
    }

    public void setReportedLostItems(List<LostItem> reportedLostItems) {
        this.reportedLostItems = reportedLostItems;
    }
}