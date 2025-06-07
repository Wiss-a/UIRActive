package ma.ac.uir.uiractive.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "admin")
@PrimaryKeyJoinColumn(name = "user_id") // Clé étrangère vers la table user
public class Admin extends User {

    public Admin() {
        super();
    }

    public Admin(String firstname, String lastname, String email, String password) {
        super(firstname, lastname, email, password);
    }
}