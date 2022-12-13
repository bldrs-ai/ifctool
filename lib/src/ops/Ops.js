import {findLevels, extractLevels} from './levels/index.js'


const Ops = {
  EXTRACT: {
    getUsage: extractLevels.getUsage,
    /**
     * Run the stage.
     *
     * @param {object} model IfcModel.
     * @param {object} config Object with stage parameters.
     * @param {object} globalFlags
     * @param {object} ifcProps
     * @param {object} results previous stage results
     * @return {object} result
     */
    run: (model, config, globalFlags, ifcProps, results) => {
      return extractLevels.extractLevels(model, config, globalFlags, ifcProps, results)
    },
  },
  LEVELS: {
    getUsage: findLevels.getUsage,
    /**
     * Run the stage.
     *
     * @param {object} model IfcModel.
     * @param {object} config Object with stage parameters.
     * @param {object} globalFlags
     * @param {object} ifcProps
     * @param {object} results previous stage results
     * @return {object} results
     */
    run: (model, config, globalFlags, ifcProps, results) => {
      return findLevels.calSecLevels(model, config, globalFlags, ifcProps, results)
    },
  },
}


export default Ops
