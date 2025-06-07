package ma.ac.uir.uiractive.service;

import jakarta.servlet.http.HttpSession;
import ma.ac.uir.uiractive.dao.StudentRepository;
import ma.ac.uir.uiractive.entity.Student;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private static final String STUDENT_SESSION_KEY = "STUDENT_ID";

    public StudentServiceImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public boolean authenticateStudent(String email, String password, HttpSession session) {
        return studentRepository.findByEmail(email)
                .filter(student -> student
                        .getPassword().equals(password))
                .map(student -> {
                    session.setAttribute(STUDENT_SESSION_KEY, student.getIdU());
                    return true;
                })
                .orElse(false);
    }

    @Override
    public Student getCurrentStudent(HttpSession session) {
        Integer studentId = (Integer) session.getAttribute(STUDENT_SESSION_KEY);
        if (studentId == null) return null;
        return studentRepository.findById(Long.valueOf(studentId)).orElse(null);
    }

    @Override
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Override
    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé avec l'ID: " + id));
    }

    @Override
    public void updateStudentStatus(Long id, Boolean status) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé avec l'ID: " + id));
        student.setStatut(status);
        studentRepository.save(student);
    }

    @Override
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé avec l'ID: " + id));
        studentRepository.delete(student);
    }

    @Override
    public Student createStudent(Student student) {
        student.setStatut(true); // Par défaut, le statut est actif
        return studentRepository.save(student);
    }

    @Override
    public Student updateStudent(Long id, Student studentDetails) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé avec l'ID: " + id));

        student.setFirstname(studentDetails.getFirstname());
        student.setLastname(studentDetails.getLastname());
        student.setEmail(studentDetails.getEmail());
        student.setSportsPreferences(studentDetails.getSportsPreferences());

        return studentRepository.save(student);
    }

    @Override
    public List<Student> searchStudents(String query) {
        return studentRepository.findByFirstNameContainingOrLastNameContainingOrEmailContaining(query);
    }

    @Override
    public Optional<Student> getStudentByEmail(String email) {
        return studentRepository.findByEmail(email);
    }


}