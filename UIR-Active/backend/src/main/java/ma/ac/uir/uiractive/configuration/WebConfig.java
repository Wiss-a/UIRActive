package ma.ac.uir.uiractive.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded files
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/")
                .setCachePeriod(3600); // Cache for 1 hour

        // Alternative: if you want to be more specific
        registry.addResourceHandler("/uploads/lost-items/**")
                .addResourceLocations("file:" + uploadDir + "/lost-items/")
                .setCachePeriod(3600);
    }
}