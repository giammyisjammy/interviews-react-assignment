import React from 'react';
import { useInView } from 'react-cool-inview';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Snackbar, { SnackbarProps } from '@mui/material/Snackbar';
import { HeavyComponent } from './HeavyComponent.tsx';
import { ProductCard } from './ProductCard.tsx';

import { useCart, useProducts } from './common/queries.ts';
import { useAddToCart } from './common/mutations.ts';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const PAGE_SIZE = 10;

export const Products = () => {
  // I already sense that this could be moved in a component but for now I'll
  // keep it as is to avoid abstracting a behaviour used only once on the whole
  // project
  const [showErrorToast, setShowToast] = React.useState(false);
  const handleCloseToast = (
    _event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setShowToast(false);
  };

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
                        setShowToast(true);
                      }
                    }}
                    onRemove={async () => {
                      try {
                        await addToCart(product.id, -1);
                      } catch (error: unknown) {
                        setShowToast(true);
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
      <ErrorFeedback open={showErrorToast} onClose={handleCloseToast} />
    </Box>
  );
};

type ErrorFeedbackProps = Omit<SnackbarProps, 'onClose'> & {
  onClose?: (event: React.SyntheticEvent | Event, reason?: string) => void;
};
function ErrorFeedback({ onClose, ...props }: ErrorFeedbackProps) {
  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={onClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );
  return (
    <Snackbar
      {...props}
      autoHideDuration={6000}
      action={action}
      onClose={onClose}
      message="An error occurred, please try again later."
    />
  );
}
