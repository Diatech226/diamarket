export const cx = (...items) => items.filter(Boolean).join(' ');

export const mapSize = (size = 'md', sizeMap = {}) => sizeMap[size] || sizeMap.md;

export const mapState = (state = 'default', stateMap = {}) => stateMap[state] || '';
