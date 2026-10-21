package raspanti.gelateria.ecommerce.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import raspanti.gelateria.ecommerce.model.Product;
import raspanti.gelateria.ecommerce.service.ProductService;

@RestController 
@RequestMapping ("/api/products")
public class ProductController {
    
    @Autowired 
    private ProductService productService;

    // Criar Produto
    @PostMapping 
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.createProduct(product));
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

    // Editar Produto
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product ){
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    // Incrementar Estoque
    @PatchMapping ("/{id}/add-stock")
    public ResponseEntity<Product> addStock(@PathVariable  Long id, @RequestParam Integer quantity) {
        return ResponseEntity.ok(productService.addStock(id, quantity));
    }

    // Excluir Produto
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Producto excluiído com sucesso!");
    }

}
