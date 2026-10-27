package raspanti.gelateria.ecommerce.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import raspanti.gelateria.ecommerce.model.Product;
import raspanti.gelateria.ecommerce.model.Sale;
import raspanti.gelateria.ecommerce.repository.ProductRepository;
import raspanti.gelateria.ecommerce.repository.SaleRepository;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createSale(@RequestParam Long productId, @RequestParam int quantity, Authentication authentication) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return ResponseEntity.badRequest().body("Produto não encontrado.");
        }

        if (product.getStockQuantity() < quantity) {
            return ResponseEntity.badRequest().body("Stock insuficiente para esta venda.");
        }

        // Atualiza o stock
        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);

        // Regista a venda
        Sale sale = new Sale();
        sale.setProductId(product.getId());
        sale.setProductName(product.getName());
        sale.setQuantity(quantity);
        double total = product.getPrice().multiply(BigDecimal.valueOf(quantity)).doubleValue();
        sale.setTotalPrice(total);
        sale.setSellerPhone(authentication.getName());

        Sale savedSale = saleRepository.save(sale);
        return ResponseEntity.ok(savedSale);
    }

    @GetMapping("/my-sales")
    public List<Sale> getMySales(Authentication authentication){
        return saleRepository.findBySellerPhone(authentication.getName());
    }
}