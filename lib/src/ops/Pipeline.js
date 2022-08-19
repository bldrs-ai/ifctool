import Ops from './Ops.js'
import {isObject, isArray, isString} from '../asserts.js'


/**
 * A configurable pipeline of IFC operations.
 */
export default class Pipeline {
  /**
   * @param {object} model IfcModel
   * @param {object} config Object with stage definitions.
   */
  constructor(model, config) {
    this.model = model
    this.stages = []
    const stageConfigs = isArray(config.stages)
    for (let i = 0; i < stageConfigs.length; i++) {
      const stage = stageConfigs[i]
      console.log('STAGE: ', stage)
      const stageName = isString(stage.name)
      const stageConfig = isObject(stage.config)
      switch (stageName) {
        case 'findLevels': this.stages.push(() => Ops.LEVELS.run(model, stageConfig)); break
        default: throw new Error('Unknown operation: ', stageName)
      }
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
