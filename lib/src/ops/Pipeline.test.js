import Pipeline from './Pipeline'


describe('Pipeline', () => {
  it('has extractLevels and findLevels stage', () => {
    const p = new Pipeline(null)
    p.addStage('findLevels', {help: true})
    p.addStage('extractLevels', {help: true})
    p.run()
  })
})
