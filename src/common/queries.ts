import useSWR from 'swr';
import queryString from 'query-string';

import type { Cart, ProductPage } from '../types';

import {
  P,
  SWRInfiniteResponseWithLoadingState,
  useSWRInfiniteWithLoadingState,
} from '../helpers/match';
import { match } from 'ts-pattern';

export type UseProductsOpts = {
  limit?: number;
  category?: string;
  q?: string;
};

// export type UseProductsReturns = SWRInfiniteResponse<ProductPage, Error> & {
//   isLoadingMore: boolean;
//   isEmpty: boolean;
// };

export type UseProductsReturns = SWRInfiniteResponseWithLoadingState<
  ProductPage,
  Error
>;

/**
 * Collection of functions to get the SWR key of each page,
 * its return value will be accepted by `fetcher`.
 * If `null` is returned, the request of that page won't start.
 */
export const queryKeys = {
  products:
    ({ limit = 10, category, q }: UseProductsOpts) =>
    (pageIndex: number = 0, previousPageData: ProductPage | null) => {
      if (previousPageData && !previousPageData.hasMore) return null; // reached the end
      const searchParams = queryString.stringify(
        {
          q,
          category,
          limit,
          page: pageIndex,
        },
        { skipNull: true, skipEmptyString: true }
      );
      return `/products?${searchParams}`; // SWR key
    },
} as const;

// export function useProducts(opts: UseProductsOpts): UseProductsReturns {
//   // This hook accepts a function that returns the request key, a fetcher
//   // function, and options. It returns all the values that useSWR returns,
//   // including 2 extra values: the page size and a page size setter,
//   // like a React state.
//   //
//   // In infinite loading, one page is one request, and our goal is to fetch
//   // multiple pages and render them.
//   const { data, isLoading, size, ...rest } = useSWRInfinite<ProductPage, Error>(
//     queryKeys.products(opts)
//   );
//   const productsPages = data
//     ? emptyTypedList<ProductPage>().concat(...data)
//     : [];
//   const isLoadingMore = Boolean(
//     isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')
//   );
//   const firstPage = data?.[0];
//   const isEmpty =
//     firstPage === undefined || (firstPage && firstPage.total === 0);

//   return {
//     ...rest,
//     data: productsPages,
//     isLoadingMore,
//     isEmpty,
//     isLoading,
//     size,
//   };
// }

export function useProducts(opts: UseProductsOpts): UseProductsReturns {
  const state = useSWRInfiniteWithLoadingState<ProductPage, Error>(
    queryKeys.products(opts)
  );
  // Ignore default isEmpty to re-evaluate based on API response
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isEmpty: _isEmpty, ...loadingState } = state;

  const firstPage = match(state)
    .with(P.loading, ({ data }) => data && data[0])
    .with(P.revalidate, ({ data }) => data && data[0])
    .with(P.success, ({ data }) => data[0])
    .with(P.error, () => undefined)
    .otherwise(() => undefined);

  const isEmpty = firstPage === undefined || firstPage.total === 0;

  return { ...loadingState, isEmpty };
}

export function useCart() {
  return useSWR<Cart, Error>('/cart');
}
