package raspanti.gelateria.demo.service;

import java.util.Random;

import org.springframework.stereotype.Service;

@Service 
public class SmsService {
    public String generateCode(){
        return String.valueOf(new Random().nextInt(899999)+100000);
    }

    public void sendSms(String phoneNumber, String code) {
        System.out.println("Enviado SMS para :"+phoneNumber+" com código: "+code);
    }
}
