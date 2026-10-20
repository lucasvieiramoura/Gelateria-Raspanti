package raspanti.gelateria.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import raspanti.gelateria.demo.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    
}
