import {findLevels, extractLevels} from './levels/index.js'


const Ops = {
  EXTRACT: {
    getUsage: extractLevels.getUsage,
    run: (model, config) => {
      return extractLevels.extractLevels(model, config)
    },
  },
  LEVELS: {
    getUsage: findLevels.getUsage,
    run: (model, config) => {
      return findLevels.calSecLevels(model, config)
    },
  },
}


export default Ops
