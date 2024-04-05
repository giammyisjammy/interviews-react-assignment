import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';

const drawerWidth = 180;

const categories = [
  'Fruit',
  'Vegetables',
  'Dairy',
  'Bakery',
  'Meat',
  'Seafood',
  'Snacks',
  'Beverages',
];

export type CategoriesProps = { onCategoryClick: (category: string) => void };
export const Categories = ({ onCategoryClick: onClick }: CategoriesProps) => {
  return (
    <Box minWidth={drawerWidth} sx={{ borderRight: '1px solid grey' }}>
      <List>
        {categories.map((text) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemText
                primary={text}
                onClick={() => {
                  onClick(text);
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
