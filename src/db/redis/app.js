/*export async function getAppIDbyToken(token) {
    return rc.hGet('cash:apptokens', token)
}

export async function createApp(appid, name, description, url, permissions) {
    return Promise.all([
        rc.hSetNX('cash:app:' + appid, 'name', name.toString()),
        rc.hSetNX('cash:app:' + appid, 'description', description.toString()),
        rc.hSetNX('cash:app:' + appid, 'url', url.toString()),
        rc.hSetNX('cash:app:' + appid, 'permissions', permissions.toString()),
        rc.hSetNX('cash:app:' + appid, 'created', new Date().getTime().toString()),
        rc.sAdd('cash:apps', appid)
    ])
}

export async function getAppInfo(appid) {
    let appData = rc.hGetAll('cash:app:' + appid);
    return appData.then(values => {
        return {
            appid: appid,
            name: values.name,
            description: values.description,
            url: values.url,
            permissions: values.permissions,
            created: parseInt(values.created) || undefined
        }
    })
}

export async function deleteApp(appid) {
    //TODO: Delete App
    //TODO: Delete Maintainer Entries
    //TODO: Delete App Tokens
    //TODO: Delete Coupons
    //TODO: Delete Shop Entries
    //TODO: Don't delete Items?
    return false;
}

export async function updateApp(appid, name, description, url, permissions) {
    return Promise.all([
        rc.hSet('cash:app:' + appid, 'name', name),
        rc.hSet('cash:app:' + appid, 'description', description),
        rc.hSet('cash:app:' + appid, 'url', url),
        rc.hSet('cash:app:' + appid, 'permissions', permissions)
    ])
}


export async function getAppList() {
    return rc.sMembers('cash:apps')
}*/