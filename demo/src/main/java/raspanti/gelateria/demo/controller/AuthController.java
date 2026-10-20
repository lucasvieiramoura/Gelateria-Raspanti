package raspanti.gelateria.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import raspanti.gelateria.demo.service.UserService;
import org.springframework.web.bind.annotation.PostMapping;


@RestController 
@RequestMapping ("/api/auth")
public class AuthController {

    @Autowired 
    private  UserService userService;

    @PostMapping("/register")
    public ResponseEntity<String> register( @RequestParam String phone, @RequestParam String password ) {
        userService.registerCliente(phone, password);
        return ResponseEntity.ok("Código de ativação enviado via SMS.");
    }
    
    @PostMapping("/activate")
    public ResponseEntity<String> activate(@RequestParam String phone, @RequestParam String code) {
        boolean success = userService.activateAccount(phone, code);

        if(success) {
            return ResponseEntity.ok("Conta ativada com sucesso!");
        }
        return ResponseEntity.badRequest().body("Código inválido.");
    }
    
}
