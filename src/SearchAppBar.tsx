import { useEffect, useState } from 'react';

import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import LinearProgress from '@mui/material/LinearProgress';

import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

import { useDebounce } from 'react-use';
import { useCart } from './common/queries';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  marginRight: theme.spacing(2),
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

const debounceTimeMs = 300;

export type SearchAppBarProps = {
  onChange: (searchTerm: string) => void;
};
export default function SearchAppBar({ onChange }: SearchAppBarProps) {
  const { data: cart } = useCart();
  const price = cart?.totalPrice || 0;
  const quantity = cart?.totalItems || 0;

  const [searchKey, setSearchKey] = useState('');
  const [debouncedKey, setDebouncedKey] = useState('');
  useDebounce(
    () => {
      // setIsLoading('Typing stopped');
      setDebouncedKey(searchKey);
    },
    debounceTimeMs,
    [searchKey]
  );

  useEffect(() => {
    const handleSearch = async () => {
      // setIsLoading(true);
      try {
        await onChange(debouncedKey);
      } catch (error) {
        // noop
      } finally {
        // setIsLoading(false);
      }
    };

    handleSearch();
  }, [debouncedKey]);

  return (
    <Box>
      <AppBar position="relative">
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            FreshCart Market
          </Typography>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchKey}
              onChange={({ currentTarget }) => {
                // setIsLoading(true);
                setSearchKey(currentTarget.value);
              }}
            />
          </Search>
          <Box display="flex" flexDirection="row" mx={2}>
            <Typography variant="h6" noWrap component="div" mr={2}>
              Total:
            </Typography>
            <Typography variant="h6" noWrap component="div">
              $ {(price || 0).toFixed(2)}
            </Typography>
          </Box>
          <Badge badgeContent={quantity || 0} color="secondary">
            <ShoppingCartIcon />
          </Badge>
        </Toolbar>
      </AppBar>
      <LinearProgress />
    </Box>
  );
}
