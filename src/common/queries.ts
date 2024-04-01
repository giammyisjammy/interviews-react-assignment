import useSWR from 'swr';
import useSWRInfinite, { SWRInfiniteResponse } from 'swr/infinite';
import queryString from 'query-string';

import type { Cart, ProductPage } from '../types';

import { emptyTypedList } from './utils';

export type UseProductsOpts = {
  limit?: number;
  category?: string;
  q?: string;
};

export type UseProductsReturns = SWRInfiniteResponse<ProductPage, Error> & {
  isLoadingMore: boolean;
  isEmpty: boolean;
};

/**
 * Collection of functions to get the SWR key of each page,
 * its return value will be accepted by `fetcher`.
 * If `null` is returned, the request of that page won't start.
 */
export const queryKeys = {
  products:
    ({ limit, category, q }: UseProductsOpts) =>
    (pageIndex: number, previousPageData: ProductPage | null) => {
      if (previousPageData && !previousPageData.hasMore) return null; // reached the end
      const searchParams = queryString.stringify(
        {
          q,
          category,
          page: pageIndex || 0,
          limit: limit || 10,
        },
        { skipNull: true, skipEmptyString: true }
      );
      return `/products?${searchParams}`; // SWR key
    },
} as const;

export function useProducts(opts: UseProductsOpts): UseProductsReturns {
  // This hook accepts a function that returns the request key, a fetcher
  // function, and options. It returns all the values that useSWR returns,
  // including 2 extra values: the page size and a page size setter,
  // like a React state.
  //
  // In infinite loading, one page is one request, and our goal is to fetch
  // multiple pages and render them.
  const { data, isLoading, size, ...rest } = useSWRInfinite<ProductPage, Error>(
    queryKeys.products(opts)
  );
  const productsPages = data
    ? emptyTypedList<ProductPage>().concat(...data)
    : [];
  const isLoadingMore = Boolean(
    isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')
  );
  const firstPage = data?.[0];
  const isEmpty =
    firstPage === undefined || (firstPage && firstPage.total === 0);

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
