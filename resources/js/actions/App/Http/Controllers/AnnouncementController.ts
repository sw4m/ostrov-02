import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\AnnouncementController::index
* @see app/Http/Controllers/AnnouncementController.php:14
* @route '/api/announcements'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/announcements',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AnnouncementController::index
* @see app/Http/Controllers/AnnouncementController.php:14
* @route '/api/announcements'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AnnouncementController::index
* @see app/Http/Controllers/AnnouncementController.php:14
* @route '/api/announcements'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AnnouncementController::index
* @see app/Http/Controllers/AnnouncementController.php:14
* @route '/api/announcements'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AnnouncementController::index
* @see app/Http/Controllers/AnnouncementController.php:14
* @route '/api/announcements'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AnnouncementController::index
* @see app/Http/Controllers/AnnouncementController.php:14
* @route '/api/announcements'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AnnouncementController::index
* @see app/Http/Controllers/AnnouncementController.php:14
* @route '/api/announcements'
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

/**
* @see \App\Http\Controllers\AnnouncementController::store
* @see app/Http/Controllers/AnnouncementController.php:24
* @route '/api/announcements'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/announcements',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AnnouncementController::store
* @see app/Http/Controllers/AnnouncementController.php:24
* @route '/api/announcements'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AnnouncementController::store
* @see app/Http/Controllers/AnnouncementController.php:24
* @route '/api/announcements'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AnnouncementController::store
* @see app/Http/Controllers/AnnouncementController.php:24
* @route '/api/announcements'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AnnouncementController::store
* @see app/Http/Controllers/AnnouncementController.php:24
* @route '/api/announcements'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\AnnouncementController::show
* @see app/Http/Controllers/AnnouncementController.php:43
* @route '/api/announcements/{announcement}'
*/
export const show = (args: { announcement: number | { id: number } } | [announcement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/announcements/{announcement}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AnnouncementController::show
* @see app/Http/Controllers/AnnouncementController.php:43
* @route '/api/announcements/{announcement}'
*/
show.url = (args: { announcement: number | { id: number } } | [announcement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { announcement: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { announcement: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            announcement: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        announcement: typeof args.announcement === 'object'
        ? args.announcement.id
        : args.announcement,
    }

    return show.definition.url
            .replace('{announcement}', parsedArgs.announcement.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AnnouncementController::show
* @see app/Http/Controllers/AnnouncementController.php:43
* @route '/api/announcements/{announcement}'
*/
show.get = (args: { announcement: number | { id: number } } | [announcement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AnnouncementController::show
* @see app/Http/Controllers/AnnouncementController.php:43
* @route '/api/announcements/{announcement}'
*/
show.head = (args: { announcement: number | { id: number } } | [announcement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AnnouncementController::show
* @see app/Http/Controllers/AnnouncementController.php:43
* @route '/api/announcements/{announcement}'
*/
const showForm = (args: { announcement: number | { id: number } } | [announcement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AnnouncementController::show
* @see app/Http/Controllers/AnnouncementController.php:43
* @route '/api/announcements/{announcement}'
*/
showForm.get = (args: { announcement: number | { id: number } } | [announcement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AnnouncementController::show
* @see app/Http/Controllers/AnnouncementController.php:43
* @route '/api/announcements/{announcement}'
*/
showForm.head = (args: { announcement: number | { id: number } } | [announcement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\AnnouncementController::update
* @see app/Http/Controllers/AnnouncementController.php:53
* @route '/api/announcements/{announcement}'
*/
export const update = (args: { announcement: number | { id: number } } | [announcement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/announcements/{announcement}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\AnnouncementController::update
* @see app/Http/Controllers/AnnouncementController.php:53
* @route '/api/announcements/{announcement}'
*/
update.url = (args: { announcement: number | { id: number } } | [announcement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { announcement: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { announcement: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            announcement: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        announcement: typeof args.announcement === 'object'
        ? args.announcement.id
        : args.announcement,
    }

    return update.definition.url
            .replace('{announcement}', parsedArgs.announcement.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AnnouncementController::update
* @see app/Http/Controllers/AnnouncementController.php:53
* @route '/api/announcements/{announcement}'
*/
update.put = (args: { announcement: number | { id: number } } | [announcement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\AnnouncementController::update
* @see app/Http/Controllers/AnnouncementController.php:53
* @route '/api/announcements/{announcement}'
*/
update.patch = (args: { announcement: number | { id: number } } | [announcement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\AnnouncementController::update
* @see app/Http/Controllers/AnnouncementController.php:53
* @route '/api/announcements/{announcement}'
*/
const updateForm = (args: { announcement: number | { id: number } } | [announcement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AnnouncementController::update
* @see app/Http/Controllers/AnnouncementController.php:53
* @route '/api/announcements/{announcement}'
*/
updateForm.put = (args: { announcement: number | { id: number } } | [announcement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AnnouncementController::update
* @see app/Http/Controllers/AnnouncementController.php:53
* @route '/api/announcements/{announcement}'
*/
updateForm.patch = (args: { announcement: number | { id: number } } | [announcement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\AnnouncementController::destroy
* @see app/Http/Controllers/AnnouncementController.php:74
* @route '/api/announcements/{announcement}'
*/
export const destroy = (args: { announcement: number | { id: number } } | [announcement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/announcements/{announcement}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\AnnouncementController::destroy
* @see app/Http/Controllers/AnnouncementController.php:74
* @route '/api/announcements/{announcement}'
*/
destroy.url = (args: { announcement: number | { id: number } } | [announcement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { announcement: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { announcement: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            announcement: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        announcement: typeof args.announcement === 'object'
        ? args.announcement.id
        : args.announcement,
    }

    return destroy.definition.url
            .replace('{announcement}', parsedArgs.announcement.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AnnouncementController::destroy
* @see app/Http/Controllers/AnnouncementController.php:74
* @route '/api/announcements/{announcement}'
*/
destroy.delete = (args: { announcement: number | { id: number } } | [announcement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\AnnouncementController::destroy
* @see app/Http/Controllers/AnnouncementController.php:74
* @route '/api/announcements/{announcement}'
*/
const destroyForm = (args: { announcement: number | { id: number } } | [announcement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AnnouncementController::destroy
* @see app/Http/Controllers/AnnouncementController.php:74
* @route '/api/announcements/{announcement}'
*/
destroyForm.delete = (args: { announcement: number | { id: number } } | [announcement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const AnnouncementController = { index, store, show, update, destroy }

export default AnnouncementController