import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PhotoUploadController::store
* @see app/Http/Controllers/PhotoUploadController.php:18
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
* @see app/Http/Controllers/PhotoUploadController.php:18
* @route '/api/upload-photo'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PhotoUploadController::store
* @see app/Http/Controllers/PhotoUploadController.php:18
* @route '/api/upload-photo'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PhotoUploadController::store
* @see app/Http/Controllers/PhotoUploadController.php:18
* @route '/api/upload-photo'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PhotoUploadController::store
* @see app/Http/Controllers/PhotoUploadController.php:18
* @route '/api/upload-photo'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\PhotoUploadController::confirmRoadSelection
* @see app/Http/Controllers/PhotoUploadController.php:249
* @route '/api/confirm-road-selection'
*/
export const confirmRoadSelection = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirmRoadSelection.url(options),
    method: 'post',
})

confirmRoadSelection.definition = {
    methods: ["post"],
    url: '/api/confirm-road-selection',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PhotoUploadController::confirmRoadSelection
* @see app/Http/Controllers/PhotoUploadController.php:249
* @route '/api/confirm-road-selection'
*/
confirmRoadSelection.url = (options?: RouteQueryOptions) => {
    return confirmRoadSelection.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PhotoUploadController::confirmRoadSelection
* @see app/Http/Controllers/PhotoUploadController.php:249
* @route '/api/confirm-road-selection'
*/
confirmRoadSelection.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirmRoadSelection.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PhotoUploadController::confirmRoadSelection
* @see app/Http/Controllers/PhotoUploadController.php:249
* @route '/api/confirm-road-selection'
*/
const confirmRoadSelectionForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: confirmRoadSelection.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PhotoUploadController::confirmRoadSelection
* @see app/Http/Controllers/PhotoUploadController.php:249
* @route '/api/confirm-road-selection'
*/
confirmRoadSelectionForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: confirmRoadSelection.url(options),
    method: 'post',
})

confirmRoadSelection.form = confirmRoadSelectionForm

/**
* @see \App\Http\Controllers\PhotoUploadController::update
* @see app/Http/Controllers/PhotoUploadController.php:314
* @route '/api/reports/{report}'
*/
export const update = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/reports/{report}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\PhotoUploadController::update
* @see app/Http/Controllers/PhotoUploadController.php:314
* @route '/api/reports/{report}'
*/
update.url = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { report: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { report: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            report: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        report: typeof args.report === 'object'
        ? args.report.id
        : args.report,
    }

    return update.definition.url
            .replace('{report}', parsedArgs.report.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PhotoUploadController::update
* @see app/Http/Controllers/PhotoUploadController.php:314
* @route '/api/reports/{report}'
*/
update.put = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\PhotoUploadController::update
* @see app/Http/Controllers/PhotoUploadController.php:314
* @route '/api/reports/{report}'
*/
const updateForm = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PhotoUploadController::update
* @see app/Http/Controllers/PhotoUploadController.php:314
* @route '/api/reports/{report}'
*/
updateForm.put = (args: { report: number | { id: number } } | [report: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const PhotoUploadController = { store, confirmRoadSelection, update }

export default PhotoUploadController