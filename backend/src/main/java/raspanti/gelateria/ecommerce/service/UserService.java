package raspanti.gelateria.ecommerce.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import raspanti.gelateria.ecommerce.model.Role;
import raspanti.gelateria.ecommerce.model.User;
import raspanti.gelateria.ecommerce.repository.UserRepository;

@Service 
public class UserService {
    
    @Autowired 
    private UserRepository userRepository;

    @Autowired 
    private SmsService smsService;

    @Autowired 
    private PasswordEncoder passwordEncoder;

    // 1. Autocadastro do Cliente (informando telefone e senha)
    public User registerCliente(String phoneNumber, String rawPassword, String name) {
        if (userRepository.findByPhoneNumber(phoneNumber).isPresent()) {
            throw new RuntimeException("Este número de telefone já está cadastrado.");
        }

        User user = new User();
        user.setPhoneNumber(phoneNumber);
        user.setName(name);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(Role.ROLE_CLIENTE);
        user.setActive(false); // Conta inativa até validar o SMS

        // Gera e envia o código SMS
        String code = smsService.generateVerificationCode();
        user.setVerificationCode(code);
        smsService.sendSms(phoneNumber, code);

        return userRepository.save(user);
    }

    // Ativação da conta no primeior acesso
    public boolean activateAccount(String phoneNumber, String code){
        User user = userRepository.findByPhoneNumber(phoneNumber)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (code.equals(user.getVerificationCode())){
            user.setActive(true);
            user.setVerificationCode(null);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    // Cadastro por Admin/Gerente
    public User createUserByAdminOrGerente(String phoneNumber, String password, Role role) {
        User user = new User();
        user.setPhoneNumber(phoneNumber);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setActive(true);
        return userRepository.save(user);
    }
    
}
