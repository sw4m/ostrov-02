import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PhotoUploadController::store
* @see app/Http/Controllers/PhotoUploadController.php:17
* @route '/api/upload-photo'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/upload-photo',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PhotoUploadController::store
* @see app/Http/Controllers/PhotoUploadController.php:17
* @route '/api/upload-photo'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PhotoUploadController::store
* @see app/Http/Controllers/PhotoUploadController.php:17
* @route '/api/upload-photo'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PhotoUploadController::store
* @see app/Http/Controllers/PhotoUploadController.php:17
* @route '/api/upload-photo'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PhotoUploadController::store
* @see app/Http/Controllers/PhotoUploadController.php:17
* @route '/api/upload-photo'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const PhotoUploadController = { store }

export default PhotoUploadController