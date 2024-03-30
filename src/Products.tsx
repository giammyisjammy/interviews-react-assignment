import { Box, Grid } from '@mui/material';
import useSWRInfinite, { type SWRInfiniteKeyLoader } from 'swr/infinite';
import { useInView } from 'react-cool-inview';

import { HeavyComponent } from './HeavyComponent.tsx';
import { ProductCard } from './ProductCard.tsx';

import fetcher from './helpers/fetcher.ts';

import type { Cart, Product } from './types.ts';

const limit = 10;

type ProductPage = {
  hasMore: boolean;
  products: Product[];
  total: number;
};

/**
 * A function to get the SWR key of each page,
 * its return value will be accepted by `fetcher`.
 * If `null` is returned, the request of that page won't start.
 *
 * @param pageIndex
 * @param previousPageData
 * @returns
 */
const getKey: SWRInfiniteKeyLoader<ProductPage> = (
  pageIndex,
  previousPageData
) => {
  if (previousPageData && !previousPageData.hasMore) return null; // reached the end
  return `/products?page=${pageIndex}&limit=${limit}`; // SWR key
};

export type ProductsProps = {
  onCartChange: (cart: Cart) => void;
};
export const Products = ({ onCartChange }: ProductsProps) => {
  // This hook accepts a function that returns the request key, a fetcher
  // function, and options. It returns all the values that useSWR returns,
  // including 2 extra values: the page size and a page size setter,
  // like a React state.
  //
  // In infinite loading, one page is one request, and our goal is to fetch
  // multiple pages and render them.
  const {
    data: productsPages,
    isLoading,
    error,
    size,
    setSize,
    mutate,
  } = useSWRInfinite<ProductPage, Error>(getKey, fetcher);

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

  // function addToCart(productId: number, quantity: number) {
  //   mutate(
  //     productsPages?.map(({ products, ...page }) => ({
  //       ...page,
  //       products: products.map((product) => {
  //         if (product.id === productId) {
  //           return {
  //             ...product,
  //             loading: true,
  //           };
  //         }
  //         return product;
  //       }),
  //     }))
  //   );
  //   fetch('/cart', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ productId, quantity }),
  //   }).then(async (response) => {
  //     if (response.ok) {
  //       const cart = await response.json();
  //       mutate(
  //         productsPages?.map(({ products, ...page }) => ({
  //           ...page,
  //           products: products.map((product) => {
  //             if (product.id === productId) {
  //               return {
  //                 ...product,
  //                 itemInCart: (product.itemInCart || 0) + quantity,
  //                 loading: false,
  //               };
  //             }
  //             return product;
  //           }),
  //         }))
  //       );
  //       onCartChange(cart);
  //     }
  //   });
  // }

  async function addToCart(productId: number, quantity: number) {
    try {
      const cart: Cart = await fetcher('/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      });
      console.log('updated cart', cart);

      mutate(
        productsPages?.map(({ products, ...page }) => ({
          ...page,
          products: products.map((product) => {
            if (product.id === productId) {
              return {
                ...product,
                itemInCart: (product.itemInCart || 0) + quantity,
              };
            }
            return product;
          }),
        }))
      );
      onCartChange(cart);
    } catch (error: unknown) {
      // TODO maybe notify user of failure
    }
  }

  if (error) return <div>failed to load</div>;

  if (isLoading || !productsPages) return <div>loading...</div>;

  return (
    <Box overflow="scroll" height="100%">
      <Grid container spacing={2} p={2}>
        {productsPages.map(({ products }, i) =>
          // `productsPages` is an array of each page's API response.
          products.map((product, k) => {
            /**
             * Should only observe the last item of the list
             */
            const shouldObserve = (i + 1) * (k + 1) === size * limit;
            return (
              <Grid item xs={4} key={product.id}>
                {/* Do not remove this */}
                <HeavyComponent />
                <ProductCard
                  product={product}
                  onAdd={() => addToCart(product.id, 1)}
                  onRemove={() => addToCart(product.id, -1)}
                  ref={shouldObserve ? observe : null}
                />
              </Grid>
            );
          })
        )}
      </Grid>
    </Box>
  );
};
