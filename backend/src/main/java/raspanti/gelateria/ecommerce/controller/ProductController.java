package raspanti.gelateria.ecommerce.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import raspanti.gelateria.ecommerce.model.Product;
import raspanti.gelateria.ecommerce.repository.ProductRepository;
import raspanti.gelateria.ecommerce.service.ProductService;

@RestController 
@RequestMapping ("/api/products")
public class ProductController {
    
    @Autowired 
    private ProductService productService;

    @Autowired 
    private ProductRepository productRepository;

    // Criar Produto
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'VENDEDOR')")
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        Product saved = productRepository.save(product);
        return ResponseEntity.ok(saved);
    }

    // Listar Produtos
    @GetMapping 
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // Buscar Produto por ID    
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    } 

    // Endpoint de Atualização (PUT) essencial para atualizar o stock e outros campos
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        Product updatedProduct = productService.updateProduct(id, productDetails);
        return ResponseEntity.ok(updatedProduct);
    }
    // Incrementar Estoque
    @PatchMapping ("/{id}/add-stock")
    public ResponseEntity<Product> addStock(@PathVariable  Long id, @RequestParam Integer quantity) {
        return ResponseEntity.ok(productService.addStock(id, quantity));
    }

    // Inativar produto (Apenas Gerente/Admin)
    @PutMapping("/{id}/inactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<?> inactivateProduct(@PathVariable Long id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) return ResponseEntity.badRequest().body("Produto não encontrado.");

        product.setStockQuantity(0); // Ou marcar como inativo se tiver campoativo
        productRepository.save(product);
        return ResponseEntity.ok("Produto inativado com sucesso.");
    }

    // Excluir Produto
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Producto excluiído com sucesso!");
    }

}
