export const CommonUtils = {
    getNowAcademicChYear: () => {
        let date = new Date();
        let year = date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1;
        return year - 1911;
    },
    getRecentAcademicChYears: (recentYearNum, returnTypeString = false) => {
        let nowChYear = CommonUtils.getNowAcademicChYear();
        let years = [];
        for (let i = 0; i < recentYearNum; i++) {
            if (returnTypeString) {
                years.push((nowChYear - i).toString());
            } else {
                years.push(nowChYear - i);
            }
        }
        return years;
    },
    filterRecentYearItems: (items, recentYearNum) => {
        let nowChYear = CommonUtils.getNowAcademicChYear();
        return Array.from(items).filter((item) => item.year <= nowChYear && item.year > nowChYear - recentYearNum);
    }
}

export const SEARCH_STATE = {
    INIT: 0,
    SUBMIT: 1,
    BACK_CLICK: 2,
    COMPARE_CLICK: 3
}
export const CUSTOM_ELEMENT_NAME_INDEX = "itembank-index";
export const CUSTOM_ELEMENT_NAME_RESULT = "itembank-result";
window.itembanksearch = {
    SEARCH_STATE: SEARCH_STATE,
    CUSTOM_ELEMENT_NAME_INDEX: CUSTOM_ELEMENT_NAME_INDEX,
    CUSTOM_ELEMENT_NAME_RESULT: CUSTOM_ELEMENT_NAME_RESULT
}

export const storageKey = {
    searchResult: "itembank.searchResult",
    requestPayload: "itembank.requestPayload",
    destinationHref: "itembank.destinationHref",
    requestInfo: "itembank.requestInfo",
    authorizationData: "itembank.authorizationData",
    autoFillDoneMap: "itembank.autoFillDoneMap",
}
export const requestInfo = {
    "metadataUrl": process.env.METADATA_URL,
    "searchUrl": process.env.SEARCH_URL,
    "catalogUrl": process.env.CATALOG_URL,
    "itemUrl": process.env.ITEM_URL
}
export const config = {
    'itembank.requestInfo': requestInfo,
}
/**
 * the stored values only for object format
 */
class StorageHelper {
    data = {};
    /**
     * shadow cloning, note: the nested object will still reference the origin object
     */
    getItem(key) {
        if (this.data[key] == null) {
            return null;
        }
        return { ...this.data[key] };
    }
    setItem(key, value) {
        this.data[key] = value;
    }
    removeItem(key) {
        this.data[key] = null;
    }
    resetConfig() {
        this.data = {};
        for (let key in config) {
            this.data[key] = config[key];
        }
    }
}

export let storageHelper = new StorageHelper();

/**
 * 頁面：彈出提醒
 */
class Notify {
    div;
    span;
    constructor() {
        let div = document.createElement('div');
        div.id = 'notify';
        div.classList.add('notify');
        let span = document.createElement('span');
        span.id = 'notifyMessage';
        div.appendChild(span);
        this.div = div;
        this.span = span;
    }
    getInstance() {
        return this.div;
    }
    show(message) {
        this.span.textContent = message;
        this.div.classList.add('show');
        setTimeout(() => {
            this.div.classList.remove('show');
        }, 3000);
    };
}
export let notify = new Notify();

// resolve is for promise use
export function ajaxCall(path, httpMethod, payload, async, successCallback, resolve = null) {
    let authorizationData = storageHelper.getItem(storageKey.authorizationData);
    let data = payload == null ? null : JSON.stringify(payload);

    let xhr = new XMLHttpRequest();
    xhr.open(httpMethod, path, async);
    if (authorizationData) {
        xhr.setRequestHeader("Authorization", "Bearer " + authorizationData.token);
    }
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            let object;
            try {
                object = JSON.parse(xhr.responseText);
            } catch (e) {
                object = xhr.responseText;
            } finally {
                successCallback(object);
            }
        } else if (xhr.status == 404) {
            successCallback(null);
        } else {
            alert("Error: " + xhr.responseText);
        }

        if (resolve) {
            resolve();
        }
    };

    xhr.onerror = function () {
        if (resolve) {
            resolve();
        }
    };

    xhr.send(data);
}

export function requestGetMetadata(path, async, successCallback, resolve = null) {
    let requestInfo = storageHelper.getItem(storageKey.requestInfo);

    ajaxCall(requestInfo.metadataUrl + path, 'GET', null, async, successCallback, resolve);
}

export function requestPostMetadata(path, payload, async, successCallback, resolve = null) {
    let requestInfo = storageHelper.getItem(storageKey.requestInfo);

    ajaxCall(requestInfo.metadataUrl + path, 'POST', payload, async, successCallback, resolve);
}

export function requestSearchResult(path, method, payload, async, successCallback, resolve = null) {
    let requestInfo = storageHelper.getItem(storageKey.requestInfo);

    ajaxCall(requestInfo.searchUrl + path, method, payload, async, successCallback, resolve);
}

let shadowRootInstance = null;
export let getShadowRoot = () => { return shadowRootInstance };
export let setShadowRoot = (shadowRoot) => { shadowRootInstance = shadowRoot };
