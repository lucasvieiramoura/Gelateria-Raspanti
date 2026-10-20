package raspanti.gelateria.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import raspanti.gelateria.demo.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByPhoneNumber(String phoneNumber);
}
