package raspanti.gelateria.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import raspanti.gelateria.demo.model.Role;
import raspanti.gelateria.demo.model.User;
import raspanti.gelateria.demo.service.UserService;
import org.springframework.web.bind.annotation.PostMapping;


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
    
}
