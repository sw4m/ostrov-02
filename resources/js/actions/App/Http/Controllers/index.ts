import RoadController from './RoadController'
import PotholeAnalysisController from './PotholeAnalysisController'
import Settings from './Settings'

const Controllers = {
    RoadController: Object.assign(RoadController, RoadController),
    PotholeAnalysisController: Object.assign(PotholeAnalysisController, PotholeAnalysisController),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers