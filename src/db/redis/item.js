import {v4 as uuidv4} from "uuid";
import {getAppInfo} from "./app.js";

/*export function getItem(itemid) {
    return rc.hGetAll('cash:item:' + itemid).then((item) => {
        return {
            itemid: itemid,
            name: item.name,
            description: item.description,
            image: item.image,
            rarity: item.rarity,
            tags: item.tags,
            created: item.created,
            appid: item.appid
        }
    })
}

export function createItem(useruuid, appid, itemname, description, tags, rarity, image) {
    let itemid = uuidv4()
    return rc.sAdd('cash:user:' + useruuid + ':items', itemid).then(() => {
        return Promise.all(
            rc.hSet('cash:item:' + itemid, 'name', itemname),
            rc.hSet('cash:item:' + itemid, 'description', description),
            rc.hSet('cash:item:' + itemid, 'image', image),
            rc.hSet('cash:item:' + itemid, 'rarity', rarity),
            rc.hSet('cash:item:' + itemid, 'tags', tags.toString()),
            rc.hSet('cash:item:' + itemid, 'created', new Date().getTime().toString()),
            rc.hSet('cash:item:' + itemid, 'appid', appid))
    });
}

export async function getItemList(uuid) {
    let itemids = rc.sMembers('cash:user:' + uuid + ':items')
    return itemids.then((itemids) => {
        let promises = []
        for (let itemid in itemids) {
            promises.push(getItem(itemid))
        }
        return Promise.all(promises)
    })
}

export async function getFilteredItemList(uuid,appid){
    let itemlist = getItemList(uuid)
    return itemlist.then((items) => {
        return items.filter((item) => {
            return item.appid === appid
        })
    })
}

export async function getDetailedItemList(uuid) {
    let items = getItemList(uuid)
    return items.then((items) => {
        let promises = []
        for (let item of items) {
            promises.push(getAppInfo(item.appid))
        }
        return Promise.all(promises)
    }).then((apps) => {
        for (let i = 0; i < items.length; i++) {
            items[i].appname = apps[i].name
        }
        return items
    })
}*/