import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PotholeAnalysisController::analyze
* @see app/Http/Controllers/PotholeAnalysisController.php:10
* @route '/api/analyze-pothole'
*/
export const analyze = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: analyze.url(options),
    method: 'post',
})

analyze.definition = {
    methods: ["post"],
    url: '/api/analyze-pothole',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PotholeAnalysisController::analyze
* @see app/Http/Controllers/PotholeAnalysisController.php:10
* @route '/api/analyze-pothole'
*/
analyze.url = (options?: RouteQueryOptions) => {
    return analyze.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PotholeAnalysisController::analyze
* @see app/Http/Controllers/PotholeAnalysisController.php:10
* @route '/api/analyze-pothole'
*/
analyze.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: analyze.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PotholeAnalysisController::analyze
* @see app/Http/Controllers/PotholeAnalysisController.php:10
* @route '/api/analyze-pothole'
*/
const analyzeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: analyze.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PotholeAnalysisController::analyze
* @see app/Http/Controllers/PotholeAnalysisController.php:10
* @route '/api/analyze-pothole'
*/
analyzeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: analyze.url(options),
    method: 'post',
})

analyze.form = analyzeForm

const PotholeAnalysisController = { analyze }

export default PotholeAnalysisController