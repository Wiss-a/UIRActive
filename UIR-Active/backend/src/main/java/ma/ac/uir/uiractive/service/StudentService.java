package ma.ac.uir.uiractive.service;

import jakarta.servlet.http.HttpSession;
import ma.ac.uir.uiractive.entity.Student;

import java.util.List;
import java.util.Optional;

public interface StudentService {

    boolean authenticateStudent(String email, String password, HttpSession session);

    Student getCurrentStudent(HttpSession session);

    /**
     * Récupère tous les étudiants
     *
     * @return Liste des étudiants
     */
    List<Student> getAllStudents();

    /**
     * Récupère un étudiant par son ID
     *
     * @param id ID de l'étudiant
     * @return L'étudiant trouvé
     */
    Student getStudentById(Long id);

    /**
     * Met à jour le statut d'un étudiant (actif/inactif)
     *
     * @param id     ID de l'étudiant
     * @param status Nouveau statut (true = actif, false = inactif)
     */
    void updateStudentStatus(Long id, Boolean status);

    /**
     * Supprime un étudiant
     *
     * @param id ID de l'étudiant à supprimer
     */
    void deleteStudent(Long id);

    /**
     * Crée un nouvel étudiant
     *
     * @param student L'étudiant à créer
     * @return L'étudiant créé
     */
    Student createStudent(Student student);

    /**
     * Met à jour les informations d'un étudiant
     *
     * @param id             ID de l'étudiant
     * @param studentDetails Nouvelles informations
     * @return L'étudiant mis à jour
     */
    Student updateStudent(Long id, Student studentDetails);

    /**
     * Recherche des étudiants par nom ou email
     *
     * @param query Terme de recherche
     * @return Liste des étudiants correspondants
     */
    List<Student> searchStudents(String query);

    Optional<Student> getStudentByEmail(String email);
}