package raspanti.gelateria.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import raspanti.gelateria.ecommerce.model.Sale;

public interface SaleRepository extends JpaRepository<Sale, Long> {
}