package ma.ac.uir.uiractive.controller;

import jakarta.servlet.http.HttpSession;
import ma.ac.uir.uiractive.entity.Student;
import ma.ac.uir.uiractive.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:5173") // Autorise les requêtes depuis votre frontend React
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginStudent(
            @RequestBody AdminController.LoginRequest loginRequest,
            HttpSession session) {
        if (studentService.authenticateStudent(loginRequest.getEmail(), loginRequest.getPassword(), session)) {
            return ResponseEntity.ok().body(Map.of(
                    "message", "Student authenticated successfully",
                    "admin", studentService.getCurrentStudent(session)
            ));
        }
        return ResponseEntity.status(401).body(Map.of(
                "message", "Invalid credentials"
        ));
    }

    // Récupérer tous les étudiants
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllStudents() {
        List<Student> students = studentService.getAllStudents();
        List<Map<String, Object>> response = students.stream().map(student -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", student.getIdU());
            map.put("firstname", student.getFirstname());
            map.put("lastname", student.getLastname());
            map.put("email", student.getEmail());
            map.put("statut", student.getStatut());
            map.put("createdAt", student.getDateInscription());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // Récupérer un étudiant par ID
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        Student student = studentService.getStudentById(id);
        return ResponseEntity.ok(student);
    }

    // Mettre à jour un étudiant
    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(
            @PathVariable Long id,
            @RequestBody Student studentDetails) {
        Student updatedStudent = studentService.updateStudent(id, studentDetails);
        return ResponseEntity.ok(updatedStudent);
    }

    // Mettre à jour le statut d'un étudiant
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Boolean>> updateStudentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {
        Boolean status = request.get("status");
        studentService.updateStudentStatus(id, status);

        Map<String, Boolean> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    // Supprimer un étudiant
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);

        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", true);
        return ResponseEntity.ok(response);
    }

    // Rechercher des étudiants
    @GetMapping("/search")
    public ResponseEntity<List<Student>> searchStudents(@RequestParam String query) {
        List<Student> students = studentService.searchStudents(query);
        return ResponseEntity.ok(students);
    }
}