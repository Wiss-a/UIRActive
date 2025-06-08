package ma.ac.uir.uiractive;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
@SpringBootApplication(scanBasePackages = "ma.ac.uir")

public class UirActiveApplication extends SpringBootServletInitializer {

    public static void main(String[] args) {
        SpringApplication.run(UirActiveApplication.class, args);
    }

}
