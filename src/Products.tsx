import useSWR from 'swr';
import useSWRInfinite, { type SWRInfiniteKeyLoader } from 'swr/infinite';
import { useInView } from 'react-cool-inview';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
// import { HeavyComponent } from './HeavyComponent.tsx';
import { ProductCard } from './ProductCard.tsx';

import fetcher from './helpers/fetcher.ts';

import type { Cart, Product } from './types.ts';
import Alert from '@mui/material/Alert';
import { HeavyComponent } from './HeavyComponent.tsx';

const PAGE_SIZE = 10;

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
const getProductsKey: SWRInfiniteKeyLoader<ProductPage> = (
  pageIndex,
  previousPageData
) => {
  if (previousPageData && !previousPageData.hasMore) return null; // reached the end
  return `/products?page=${pageIndex}&limit=${PAGE_SIZE}`; // SWR key
};

// Little trick to give a type to an empty array
type TypedEmptyList = <T>() => Array<T>;
const emptyTypedList: TypedEmptyList = () => [];

export const Products = () => {
  const { data: cart, mutate: mutateCart } = useSWR<Cart, Error>('/cart');

  async function addToCart(productId: number, quantity: number) {
    try {
      const cart: Cart = await fetcher('/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      });

      mutateCart(cart);
    } catch (error: unknown) {
      // TODO maybe notify user of failure
    }
  }

  // This hook accepts a function that returns the request key, a fetcher
  // function, and options. It returns all the values that useSWR returns,
  // including 2 extra values: the page size and a page size setter,
  // like a React state.
  //
  // In infinite loading, one page is one request, and our goal is to fetch
  // multiple pages and render them.
  const { data, isLoading, error, size, setSize } = useSWRInfinite<
    ProductPage,
    Error
  >(getProductsKey);
  const productsPages = data
    ? emptyTypedList<ProductPage>().concat(...data)
    : [];
  const isLoadingMore = Boolean(
    isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')
  );
  const isEmpty = data?.[0] === undefined;

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

  console.log('isEmpty', isEmpty, data?.[0]);
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
              // Should only observe the last item of the list
              const shouldObserve = (i + 1) * (k + 1) === size * PAGE_SIZE;
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
                    onAdd={() => addToCart(product.id, 1)}
                    onRemove={() => addToCart(product.id, -1)}
                    ref={shouldObserve ? observe : null}
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
