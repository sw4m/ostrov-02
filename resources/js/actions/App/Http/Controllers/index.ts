import RoadController from './RoadController'
import PotholeAnalysisController from './PotholeAnalysisController'
import PhotoUploadController from './PhotoUploadController'
import Settings from './Settings'

const Controllers = {
    RoadController: Object.assign(RoadController, RoadController),
    PotholeAnalysisController: Object.assign(PotholeAnalysisController, PotholeAnalysisController),
    PhotoUploadController: Object.assign(PhotoUploadController, PhotoUploadController),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers
