import { StyleSheet } from 'aphrodite';

export const mobileView = '@media only screen and (max-width: 768px)';
export const tabletView = '@media only screen and (max-width: 1024px)';

export const utils = StyleSheet.create({
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  flexWrap: {
    flexWrap: 'wrap',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifySpaceBetween: {
    justifyContent: 'space-between',
  },
  alignItemsCenter: {
    alignItems: 'center',
  },
  grid: {
    display: 'grid',
  },
  height100P: {
    height: '100%',
  },
});
