import { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';

import { useCart, useProducts } from './common/queries.ts';

import SearchAppBar from './SearchAppBar';
import { Categories } from './Categories';
import { Products } from './Products';

const limit = 10;

function App() {
  const { data: cart } = useCart();

  const [category, setCategory] = useState<string | undefined>(undefined);
  const [query, setQuery] = useState<string | undefined>(undefined);
  const useProductsReturns = useProducts({
    limit,
    category,
    q: query,
  });

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      <CssBaseline />
      <SearchAppBar
        quantity={cart?.totalItems || 0}
        price={cart?.totalPrice || 0}
        onChange={(query) => {
          setQuery(query);
        }}
      />
      <Box flex={1} display="flex" flexDirection="row">
        <Categories
          onClick={(category) => {
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
