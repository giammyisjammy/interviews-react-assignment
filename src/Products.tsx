import React from 'react';
import { useInView } from 'react-cool-inview';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import { HeavyComponent } from './HeavyComponent.tsx';
import { ProductCard } from './ProductCard.tsx';

import { useCart, useProducts } from './common/queries.ts';
import { useAddToCart } from './common/mutations.ts';

import { useToast } from './Toast/useToast.ts';

const PAGE_SIZE = 10;

export const Products = () => {
  const { showToast } = useToast();
  const showCartError = () =>
    showToast({
      severity: 'warning',
      message: 'An error occurred, please try again later.',
    });

  const { data: cart } = useCart();
  const addToCart = useAddToCart();

  const {
    data: productsPages,
    isLoading,
    error,
    size,
    setSize,
    isLoadingMore,
    isEmpty,
  } = useProducts(PAGE_SIZE);

  // A React hook that monitors an element enters or leaves the viewport
  const { observe } = useInView({
    // For better UX, we can grow the root margin so the data will be loaded earlier
    rootMargin: '50px 0px',
    // When the last item comes to the viewport
    onEnter: ({ unobserve }) => {
      // Pause observe when loading data
      unobserve();
      // Load more data
      setSize((previousSize) => previousSize + 1);
    },
  });
  // When it comes to render a large lists, performance will be a problem.
  // In that case, switching to react-cool-virtual can help you out!

  return (
    <Box overflow="scroll" height="100%">
      {error ? (
        // error UI
        <Alert severity="warning">
          Something went wrong. Please try again later.
        </Alert>
      ) : isLoading || !productsPages ? (
        // loading UI
        <CircularProgress sx={{ m: 2 }} />
      ) : // settled UI
      isEmpty ? (
        <Alert severity="info">No products available.</Alert>
      ) : (
        <Grid container spacing={2} p={2}>
          {productsPages.map(({ products }, i) =>
            // `productsPages` is an array of each page's API response.
            products.map((product, k) => {
              const isLastItem = (i + 1) * (k + 1) === size * PAGE_SIZE;
              const quantity =
                cart?.items.find((x) => x.product.id === product.id)
                  ?.quantity || 0;
              return (
                <Grid item xs={4} key={product.id}>
                  {/* Do not remove this */}
                  <HeavyComponent />
                  <ProductCard
                    quantity={quantity}
                    product={product}
                    onAdd={async () => {
                      try {
                        await addToCart(product.id, 1);
                      } catch (error: unknown) {
                        showCartError();
                      }
                    }}
                    onRemove={async () => {
                      try {
                        await addToCart(product.id, -1);
                      } catch (error: unknown) {
                        showCartError();
                      }
                    }}
                    ref={isLastItem ? observe : null}
                  />
                </Grid>
              );
            })
          )}
          {isLoadingMore && (
            <Grid item key="loading-spinner">
              <CircularProgress />
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};
