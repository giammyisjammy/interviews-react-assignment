import { useState } from 'react';
import { Box, CssBaseline, LinearProgress } from '@mui/material';

import { useProducts } from './common/queries.ts';

import SearchAppBar from './SearchAppBar';
import { Categories } from './Categories';
import { Products } from './Products';
import { match } from 'ts-pattern';
import { P } from './helpers/match.ts';

const limit = 10;

function App() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [query, setQuery] = useState<string | undefined>(undefined);
  const useProductsReturns = useProducts({
    limit,
    category,
    q: query,
  });

  // const { isLoading, data: productsPages } = useProductsReturns;
  return (
    <Box height="100vh" display="flex" flexDirection="column">
      <CssBaseline />
      <SearchAppBar
        onChange={(query) => {
          setQuery(query);
        }}
      />
      {match(useProductsReturns)
        .with(P.loading, P.revalidate, () => (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        ))
        .otherwise(() => null)}
      {/* {(isLoading || !productsPages) && ( )} */}
      <Box flex={1} display="flex" flexDirection="row">
        <Categories
          onCategoryClick={(category) => {
            setCategory(category);
          }}
        />
        <Box flex={1}>
          <Products {...useProductsReturns} pageSize={limit} />
        </Box>
      </Box>
    </Box>
  );
}

export default App;
