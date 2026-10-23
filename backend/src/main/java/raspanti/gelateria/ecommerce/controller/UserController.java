package raspanti.gelateria.ecommerce.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import raspanti.gelateria.ecommerce.model.Role;
import raspanti.gelateria.ecommerce.model.User;
import raspanti.gelateria.ecommerce.service.UserService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.security.access.prepost.PreAuthorize;


@RestController 
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired 
    private UserService userService;

    @PostMapping("/gerente")
    public ResponseEntity<User> createGerente(@RequestParam  String phone, @RequestParam  String password) {
        return ResponseEntity.ok(userService.createUserByAdminOrGerente(phone, password, Role.ROLE_GERENTE));
    }

    @PostMapping("/vendedor")
    public ResponseEntity<User> createVendedor(@RequestParam String phone, @RequestParam String password) {
        return ResponseEntity.ok(userService.createUserByAdminOrGerente(phone, password, Role.ROLE_VENDEDOR));
    }

    // Apenas ADMIN ou GERENTE podem criar funcionários
    @PostMapping("/employee")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<?> createEmployee(
        @RequestParam String phone,
        @RequestParam String password,
        @RequestParam String roleStr ){
        
        try {
            Role role = Role.valueOf(roleStr);
            User employee = userService.createUserByAdminOrGerente(phone, password, role);
            return ResponseEntity.ok("Funcionário cadsatrado com sucesso!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao cadastrar funcionários");
        }
    }

    
}
