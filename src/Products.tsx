import { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import { HeavyComponent } from './HeavyComponent.tsx';
import { ProductCard } from './ProductCard.tsx';

import type { Cart, Product } from './types.ts';


export type ProductsProps = {
  onCartChange: (cart: Cart) => void;
};
export const Products = ({ onCartChange }: ProductsProps) => {

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/products?limit=200').then(response => response.json()).then(data => setProducts(data.products));
  }, []);

  function addToCart(productId: number, quantity: number) {
    setProducts(products.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          loading: true,
        };
      }
      return product;
    }));
    fetch('/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, quantity }),
    }).then(async response => {
      if (response.ok) {
        const cart = await response.json();
        setProducts(products.map(product => {
          if (product.id === productId) {
            return {
              ...product,
              itemInCart: (product.itemInCart || 0) + quantity,
              loading: false,
            };
          }
          return product;
        }));
        onCartChange(cart);

      }
    });
  }

  return (
    <Box overflow="scroll" height="100%">
      <Grid container spacing={2} p={2}>
        {products.map(product => (
          <Grid item xs={4} key={product.id}>
            {/* Do not remove this */}
            <HeavyComponent />
            <ProductCard
              product={product}
              onRemove={() => addToCart(product.id, -1)}
              onAdd={() => addToCart(product.id, 1)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
