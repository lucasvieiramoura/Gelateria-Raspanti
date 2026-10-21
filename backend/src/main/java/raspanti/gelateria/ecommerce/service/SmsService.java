package raspanti.gelateria.ecommerce.service;

import java.util.Random;

import org.springframework.stereotype.Service;

@Service 
public class SmsService {
    public String generateCode(){
        return String.valueOf(new Random().nextInt(899999)+100000);
    }

    public void sendSms(String phoneNumber, String code) {
        System.out.println("==================================================");
        System.out.println("[SMS ENVIADO] Para: " + phoneNumber);
        System.out.println("Seu código de ativação na Gelateria Raspanti é: " + code);
        System.out.println("==================================================");
    }

    public String generateVerificationCode(){
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    
}
