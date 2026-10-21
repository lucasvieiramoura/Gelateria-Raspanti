package raspanti.gelateria.ecommerce.model;

import jakarta.persistence.*;
import lombok.*;

@Entity 
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor  @AllArgsConstructor 
public class User {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (unique = true, nullable = false)
    private String phoneNumber;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean active =false;
    private String verificationCode;
}
