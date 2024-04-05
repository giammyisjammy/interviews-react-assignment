import { Box, CssBaseline } from '@mui/material';

import { useCart } from './common/queries.ts';

import SearchAppBar from './SearchAppBar';
import { Categories } from './Categories';
import { Products } from './Products';

function App() {
  const { data: cart } = useCart();

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      <CssBaseline />
      <SearchAppBar
        quantity={cart?.totalItems || 0}
        price={cart?.totalPrice || 0}
      />
      <Box flex={1} display="flex" flexDirection="row">
        <Categories />
        <Box flex={1}>
          <Products />
        </Box>
      </Box>
    </Box>
  );
}

export default App;
