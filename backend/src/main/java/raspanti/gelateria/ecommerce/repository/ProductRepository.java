package raspanti.gelateria.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import raspanti.gelateria.ecommerce.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    
}
