import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\PhotoUploadController::upload
* @see app/Http/Controllers/PhotoUploadController.php:18
* @route '/api/upload-photo'
*/
export const upload = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(options),
    method: 'post',
})

upload.definition = {
    methods: ["post"],
    url: '/api/upload-photo',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PhotoUploadController::upload
* @see app/Http/Controllers/PhotoUploadController.php:18
* @route '/api/upload-photo'
*/
upload.url = (options?: RouteQueryOptions) => {
    return upload.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PhotoUploadController::upload
* @see app/Http/Controllers/PhotoUploadController.php:18
* @route '/api/upload-photo'
*/
upload.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PhotoUploadController::upload
* @see app/Http/Controllers/PhotoUploadController.php:18
* @route '/api/upload-photo'
*/
const uploadForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: upload.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PhotoUploadController::upload
* @see app/Http/Controllers/PhotoUploadController.php:18
* @route '/api/upload-photo'
*/
uploadForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: upload.url(options),
    method: 'post',
})

upload.form = uploadForm

/**
* @see \App\Http\Controllers\PhotoUploadController::confirmRoad
* @see app/Http/Controllers/PhotoUploadController.php:249
* @route '/api/confirm-road-selection'
*/
export const confirmRoad = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirmRoad.url(options),
    method: 'post',
})

confirmRoad.definition = {
    methods: ["post"],
    url: '/api/confirm-road-selection',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PhotoUploadController::confirmRoad
* @see app/Http/Controllers/PhotoUploadController.php:249
* @route '/api/confirm-road-selection'
*/
confirmRoad.url = (options?: RouteQueryOptions) => {
    return confirmRoad.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PhotoUploadController::confirmRoad
* @see app/Http/Controllers/PhotoUploadController.php:249
* @route '/api/confirm-road-selection'
*/
confirmRoad.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirmRoad.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PhotoUploadController::confirmRoad
* @see app/Http/Controllers/PhotoUploadController.php:249
* @route '/api/confirm-road-selection'
*/
const confirmRoadForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: confirmRoad.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PhotoUploadController::confirmRoad
* @see app/Http/Controllers/PhotoUploadController.php:249
* @route '/api/confirm-road-selection'
*/
confirmRoadForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: confirmRoad.url(options),
    method: 'post',
})

confirmRoad.form = confirmRoadForm

const photo = {
    upload: Object.assign(upload, upload),
    confirmRoad: Object.assign(confirmRoad, confirmRoad),
}

export default photo