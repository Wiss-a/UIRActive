package ma.ac.uir.uiractive.dto;

public class UserUpdateDTO {
    private String firstname;
    private String lastname;
    private String email;
    private String phonenumber;
    private String password;

    public UserUpdateDTO() {}

    public UserUpdateDTO(String firstname, String lastname, String email, String password,String phonenumber) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.phonenumber = phonenumber;
        this.password = password;
    }



    // Getters et Setters
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
    public String getPhonenumber() {return phonenumber; }
    public void setPhonenumber(String phonenumber) {this.phonenumber = phonenumber; }

    @Override
    public String toString() {
        return "UserUpdateDTO{" +
                "firstname='" + firstname + '\'' +
                ", lastname='" + lastname + '\'' +
                ", email='" + email + '\'' +
                ", phonenumber='" + phonenumber + '\'' +
                ", password='" + password + '\'' +
                '}';
    }
}