package raspanti.gelateria.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration 
@EnableMethodSecurity 
public class SecurityConfig {
    
    @Bean 
    public PasswordEncoder passwordEnconder() {
        return new BCryptPasswordEncoder();
    }

    @Bean 
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Endpints Públicos ( Cadastro de Cliente e Ativação SMS)
                .requestMatchers("/api/auth/**").permitAll()
                // Cadasdo de Geretne: Apenas ADMIN
                .requestMatchers("/api/user/gerente").hasRole("ADMIN")
                // Cadastro de Vendedor: ADMIN e Gerente 
                .requestMatchers("/api/user/vendedor").hasAnyRole("ADMIN","GERENTE")
                // Gestão de Produtos: aPenas Gerente
                .requestMatchers("/api/products/**").hasRole("GERENTE")
                // Demais requisições precisam estar autenticadas
                .anyRequest().authenticated()
            );
        return http.build();
    }
}
