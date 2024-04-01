import fetcher from '../helpers/fetcher';
import { useCart } from './queries';

export function useAddToCart() {
  const { mutate } = useCart();

  return async function addToCart(productId: number, quantity: number) {
    return mutate(
      fetcher('/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      }),
      {
        populateCache: (updatedCart) => updatedCart,
        // Since the API already gives us the updated information,
        // we don't need to revalidate here.
        revalidate: false,
      }
    );
  };
}
