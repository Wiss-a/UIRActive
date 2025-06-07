package ma.ac.uir.uiractive.dto;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class UserResponse {
    private int idU;
    private String firstname;
    private String lastname;
}
