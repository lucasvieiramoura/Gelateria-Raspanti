package raspanti.gelateria.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import raspanti.gelateria.ecommerce.model.Sale;
import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findBySellerPhone(String sellerPhone);
}