import useSWRInfinite from 'swr/infinite';
import { Cart, ProductPage } from '../types';
import { emptyTypedList } from './utils';
import useSWR from 'swr';

/**
 * Collection of functions to get the SWR key of each page,
 * its return value will be accepted by `fetcher`.
 * If `null` is returned, the request of that page won't start.
 */
export const queryKeys = {
  products:
    (pageLimit: number) =>
    (pageIndex: number, previousPageData: ProductPage | null) => {
      if (previousPageData && !previousPageData.hasMore) return null; // reached the end
      return `/products?page=${pageIndex}&limit=${pageLimit}`; // SWR key
    },
} as const;

export function useProducts(pageLimit: number) {
  // This hook accepts a function that returns the request key, a fetcher
  // function, and options. It returns all the values that useSWR returns,
  // including 2 extra values: the page size and a page size setter,
  // like a React state.
  //
  // In infinite loading, one page is one request, and our goal is to fetch
  // multiple pages and render them.
  const { data, isLoading, size, ...rest } = useSWRInfinite<ProductPage, Error>(
    queryKeys.products(pageLimit)
  );
  const productsPages = data
    ? emptyTypedList<ProductPage>().concat(...data)
    : [];
  const isLoadingMore = Boolean(
    isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')
  );
  const isEmpty = data?.[0] === undefined;

  return {
    ...rest,
    data: productsPages,
    isLoadingMore,
    isEmpty,
    isLoading,
    size,
  };
}

export function useCart() {
  return useSWR<Cart, Error>('/cart');
}
