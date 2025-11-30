import RoadController from './RoadController'
import PotholeAnalysisController from './PotholeAnalysisController'
import PhotoUploadController from './PhotoUploadController'
import AnnouncementController from './AnnouncementController'
import Settings from './Settings'

const Controllers = {
    RoadController: Object.assign(RoadController, RoadController),
    PotholeAnalysisController: Object.assign(PotholeAnalysisController, PotholeAnalysisController),
    PhotoUploadController: Object.assign(PhotoUploadController, PhotoUploadController),
    AnnouncementController: Object.assign(AnnouncementController, AnnouncementController),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers