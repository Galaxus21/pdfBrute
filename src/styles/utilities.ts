import { StyleSheet } from 'aphrodite';
import { spacing } from './theme';



export const mobileView = '@media only screen and (max-width: 768px)';

export const tabletView = '@media only screen and (max-width: 1024px)';

export const utils = StyleSheet.create({
  rootContainer: {
    position: 'relative',
    padding: `0 ${spacing.marginDesktop}`,
    [mobileView]: {
      padding: `0 ${spacing.marginMobile}`,
    }
  },
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
  justifyFlexEnd: {
    justifyContent: 'flex-end',
  },
  justifySpaceBetween: {
    justifyContent: 'space-between',
  },
  justifySpaceAround: {
    justifyContent: 'space-around',
  },
  alignItemsCenter: {
    alignItems: 'center',
  },
  alignItemsFlexEnd: {
    alignItems: 'flex-end',
  },
  alignItemsFlexStart: {
    alignItems: 'flex-start',
  },
  alignSelfFlexEnd: {
    alignSelf: 'flex-end',
  },
  width100P: {
    width: '100%',
  },
  widthAuto: {
    width: 'auto',
  },
  height100P: {
    height: '100%',
  },
  wspNoWrap: {
    whiteSpace: 'nowrap',
  },
  wordBreakAll: {
    wordBreak: 'break-all',
  },
  grid: {
    display: 'grid',
  },
  positionRelative: {
    position: 'relative',
  },
  positionAbsolute: {
    position: 'absolute',
  },
  textAlignCenter: {
    textAlign: 'center',
  },
  overflowHidden: {
    overflow: 'hidden',
  },
  cursorPointer: {
    cursor: 'pointer',
  },
  noBorder: {
    border: 'none',
  },
  noBackground: {
    background: 'none',
  }
});
