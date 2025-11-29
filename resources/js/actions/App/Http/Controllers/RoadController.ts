import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\RoadController::index
* @see app/Http/Controllers/RoadController.php:14
* @route '/api/roads'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/roads',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RoadController::index
* @see app/Http/Controllers/RoadController.php:14
* @route '/api/roads'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RoadController::index
* @see app/Http/Controllers/RoadController.php:14
* @route '/api/roads'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RoadController::index
* @see app/Http/Controllers/RoadController.php:14
* @route '/api/roads'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\RoadController::index
* @see app/Http/Controllers/RoadController.php:14
* @route '/api/roads'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RoadController::index
* @see app/Http/Controllers/RoadController.php:14
* @route '/api/roads'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RoadController::index
* @see app/Http/Controllers/RoadController.php:14
* @route '/api/roads'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

const RoadController = { index }

export default RoadController
