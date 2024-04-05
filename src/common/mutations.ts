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
      })
    );
  };
}
