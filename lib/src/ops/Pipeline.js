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
   */
  addStage(name, config) {
    switch (name) {
      case 'extractLevels': this.stages.push(() => Ops.EXTRACT.run(this.model, config)); break
      case 'findLevels': this.stages.push(() => Ops.LEVELS.run(this.model, config)); break
      default: throw new Error('Unknown operation: ', name)
    }
  }


  /** Run the pipeline. */
  run() {
    for (let i = 0; i < this.stages.length; i++) {
      const op = this.stages[i]
      op()
    }
  }
}
