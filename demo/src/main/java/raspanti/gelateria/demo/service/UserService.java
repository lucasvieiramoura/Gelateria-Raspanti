package raspanti.gelateria.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import raspanti.gelateria.demo.model.Role;
import raspanti.gelateria.demo.model.User;
import raspanti.gelateria.demo.repository.UserRepository;

@Service 
public class UserService {
    
    @Autowired 
    private UserRepository userRepository;

    @Autowired 
    private SmsService smsService;

    @Autowired 
    private PasswordEncoder passwordEnconder;

    //Autocadastro de Cliente
    public User registerCliente(String phoneNumber, String rawPassword){
        User user = new User();
        user.setPhoneNumber(phoneNumber);
        user.setPassword(passwordEnconder.encode(rawPassword));
        user.setRole(Role.ROLE_CLIENTE);
        user.setActive(false);

        String code = smsService.generateCode();
        user.setVerificationCode(code);

        smsService.sendSms(phoneNumber, code);
        return userRepository.save(user);
    }

    
    
}
