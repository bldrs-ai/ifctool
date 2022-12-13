import Ops from './Ops.js'


/**
 * A configurable pipeline of IFC operations.
 */
export default class Pipeline {
  /**
   * @param {object} model IfcModel
   */
  constructor(model) {
    this.model = model
    this.stages = []
  }


  /**
   * @param {string} name
   * @param {object} config Object with stage parameters.
   * @param {object} globalFlags
   */
  addStage(name, config, globalFlags) {
    switch (name) {
      case 'extractLevels': this.stages.push((ifcProps, results) =>
        ({extractLevels: Ops.EXTRACT.run(this.model, config, ifcProps, results, globalFlags)}))
        break
      case 'findLevels': this.stages.push((ifcProps, results) =>
        ({findLevels: Ops.LEVELS.run(this.model, config, ifcProps, results, globalFlags)}))
        break
      default: throw new Error(`Unknown operation: "${name}"`)
    }
  }


  /**
   * Run the pipeline.
   *
   * @param {object} ifcProps
   * @return {Array} results
   */
  run(ifcProps) {
    const results = []
    for (let i = 0; i < this.stages.length; i++) {
      const op = this.stages[i]
      const result = op(ifcProps, results)
      results.push(result)
    }
    return results
  }
}
