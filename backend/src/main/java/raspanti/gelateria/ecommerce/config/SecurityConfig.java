package raspanti.gelateria.ecommerce.config;

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
    public org.springframework.security.authentication.AuthenticationManager authenticationManager(
        org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration authenticationConfiguration) throws Exception {
    return authenticationConfiguration.getAuthenticationManager();
}

    @Bean 
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Endpints Públicos ( Cadastro de Cliente e Ativação SMS)
                .requestMatchers("/api/auth/**").permitAll()
                // Cadasdo de Geretne: Apenas ADMIN
                .requestMatchers("/api/user/gerente").hasAuthority("ROLE_ADMIN")
                // Cadastro de Vendedor: ADMIN e Gerente 
                .requestMatchers("/api/user/vendedor").hasAnyAuthority("ROLE_ADMIN","ROLE_GERENTE")
                // Gestão de Produtos: aPenas Gerente
                .requestMatchers("/api/products/**").hasAnyAuthority("ROLE_ADMIN","ROLE_GERENTE")
                // Demais requisições precisam estar autenticadas
                .anyRequest().authenticated()
            ).httpBasic(httpBasic -> {});
        return http.build();
    }
}
