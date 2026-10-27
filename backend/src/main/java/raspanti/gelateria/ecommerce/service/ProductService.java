package raspanti.gelateria.ecommerce.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import raspanti.gelateria.ecommerce.model.Product;
import raspanti.gelateria.ecommerce.repository.ProductRepository;

@Service 
public class ProductService {
    
    @Autowired 
    private ProductRepository productRepository;

    //1. Cadastrar Produto
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    // 2.Listar Todos os Produtos
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // 3.Buscar Produto por ID
    public Product getProductById(Long id) {
        return  productRepository.findById(id) 
            .orElseThrow(()-> new RuntimeException("Producto não encontrado com o ID: "+id));
    }

    // 4. Editar Produto
    public Product updateProduct(Long id, Product updateProduct) {
        Product existingProduct = getProductById(id);
        existingProduct.setName(updateProduct.getName());
        existingProduct.setDescription(updateProduct.getDescription());
        existingProduct.setPrice(updateProduct.getPrice());
        existingProduct.setStockQuantity(updateProduct.getStockQuantity());
        existingProduct.setImageUrl(updateProduct.getImageUrl());
        return productRepository.save(existingProduct);
    }

    // 5.Aumentar / Ajustar Estoque
    public Product addStock (Long id, Integer quantityToAdd) {
        Product product = getProductById(id);
        if (quantityToAdd <= 0) {
            throw new IllegalArgumentException("A quantidade a ser adicionada deve ser maior que zero");
        }
        product.setStockQuantity(product.getStockQuantity() + quantityToAdd);
        return productRepository.save(product);        
    }

    // 6. Excluit Produto
    public void deleteProduct(Long id){
        Product product = getProductById(id);
        productRepository.delete(product);
    }
}
