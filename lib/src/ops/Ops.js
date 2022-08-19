import {findLevels, extractLevels} from './levels/index.js'


const Ops = {
  EXTRACT: {
    run: (model, config) => {
      // TODO(pablo): refactor extractLevels to use passed model and config
      return extractLevels.extractLevels()
    },
  },
  LEVELS: {
    run: (model, config) => {
      return findLevels.calSecLevels(model, config)
    },
  },
}


export default Ops
