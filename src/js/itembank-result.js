const styleResult = require('!css-loader!sass-loader!../css/result.scss').default;

import { INFORMATION_FIELD_MAP, EXPORT_FIELD_LIST, SORT_FIELD, ResultUtils, ItemChooseController } from "./utils/result-util.js";
import { CUSTOM_ELEMENT_NAME_RESULT, SEARCH_STATE, storageKey, storageHelper, ajaxCall, requestGetMetadata, requestSearchResult, setShadowRoot, getShadowRoot, notify, CommonUtils } from "./utils/common-util.js";
import { ListItem, PopupContainer, InformationControlPopup, Checkbox, QuestionContext, Information } from "./components/result-component.js"

let itemChooseController;

/**
 * 頁面：上方功能列
 */
class ToolBar {
    content;
    sortType;
    checkboxStatuses = {};
    inputElementMap = {};
    exportForm;
    enabled;
    constructor() {
        let result = storageHelper.getItem(storageKey.searchResult);
        this.enabled = result.size > 0;
        let div = document.createElement('div');
        this.content = div;
        this.#createAll(div);
    }
    #createAll(div) {
        this.#createBackLink(div);
        // add sort options
        let div2 = document.createElement('div');
        div2.classList.add('col-sm-6');
        let settings = [
            { text: "依照更新時間 - 最新到最舊", selected: true, sortField: SORT_FIELD.UpdatedOn, ascending: false },
            { text: "依照輸入題目ID的前後順序", selected: false, sortField: SORT_FIELD.InputId, ascending: false }
        ]
        div2.appendChild(this.#createSortOptions(settings));
        div.appendChild(div2);
        // add external function bar
        div2 = document.createElement('div');
        div2.classList.add('col-sm-6');
        div2.appendChild(this.#createExternalFunctionBar());
        div.appendChild(div2);
    }
    #createBackLink(div) {
        div.classList.add('row');
        let div2 = document.createElement('div');
        div2.classList.add('col-sm-12');
        // add back link
        let a = document.createElement('a');
        a.href = '';
        a.addEventListener('click', (event) => {
            event.preventDefault();
            event = {
                state: SEARCH_STATE.BACK_CLICK,
                searchId: resultInstance.searchId
            };
            resultInstance.onStateChange(event);
            // event.preventDefault();
            // // const url = new URL(window.location.href)
            // // url.searchParams.set('searchId', searchId);
            // // history.pushState(null, '', url.href);
            // document.querySelector(CUSTOM_ELEMENT_NAME_RESULT).remove();
            // document.body.appendChild(document.createElement(CUSTOM_ELEMENT_NAME_INDEX));
        })
        a.innerHTML = '回上一頁';
        div2.appendChild(a);
        div.appendChild(div2);
    }
    getInstance() {
        return this.content;
    }
    #createSortOptions(settings) {
        let select = document.createElement('select');
        select.classList.add('form-control', 'input-sm');
        select.style.width = '63%';

        let payload = storageHelper.getItem(storageKey.requestPayload);
        settings.forEach((setting, index) => {
            let option = document.createElement('option');
            option.label = setting.text;
            option.value = index;
            // option.selected = setting.selected;
            if (setting.sortField == payload.sortField && setting.ascending == payload.ascending) {
                option.selected = true;
            }
            select.appendChild(option);
        })

        if (!this.enabled) {
            select.disabled = true;
            return select;
        }

        select.addEventListener('change', (event) => {
            let sortType = event.target.value;
            if (sortType == this.sortType) {
                return;
            }
            this.sortType = event.target.value;
            this.rerenderPage(settings[sortType]);
        })

        return select;
    }
    #createExternalFunctionBar() {
        let div = document.createElement('div');
        div.classList.add('btn-toolbar', 'pull-right');
        // add export button
        this.#addExportButton(div);
        // add download button
        this.#addDownloadIdsCsvButton(div);
        // add item compare button
        // this.#addItemCompareButton(div);
        // add delete button
        // this.#addDeleteButton(div);
        // add non-existing id list button
        let payload = storageHelper.getItem(storageKey.requestPayload);
        let result = storageHelper.getItem(storageKey.searchResult);
        if (payload.ids.length > result.content.length) {
            this.#addNonExistingIdsButton(div);
        }

        return div;
    }
    #addExportButton(div) {
        let div2 = document.createElement('div');
        div2.classList.add('btn-group');
        // button: export download
        let button = document.createElement('button');
        button.type = 'button';
        button.classList.add('btn', 'btn-default', 'btn-sm');
        button.innerHTML = '匯出';
        let popupDownload = new PopupContainer(`預計下載總題數(題組為一題)：<span name="itemTotalChoosen">0</span>題`, '20%').createCancelButton(() => {
            this.#checkboxStatusRecover();
        }).createButton('下載', 'btn-primary', () => {
            this.#exportToMail();
        });
        let popupBody = popupDownload.getBody();
        let form = document.createElement('form');
        let div3 = document.createElement('div');
        div3.innerHTML = 'Mail：';
        let input = document.createElement('input');
        input.type = 'email';
        input.name = 'mails';
        input.placeholder = '寄送信箱';
        input.required = true;
        div3.appendChild(input);
        form.appendChild(div3);
        form.appendChild(document.createElement('br'));
        div3 = document.createElement('div');
        div3.innerHTML = '檔案名稱（至少3個字）：';
        input = document.createElement('input');
        input.type = 'text';
        input.name = 'fileName';
        input.placeholder = '檔案名稱';
        input.required = true;
        div3.appendChild(input);
        form.appendChild(div3);
        form.appendChild(document.createElement('br'));
        div3 = document.createElement('div');
        div3.innerHTML = '分割檔案題數：';
        input = document.createElement('input');
        input.type = 'number';
        input.name = 'rowSize';
        input.min = '1';
        input.value = '200';
        input.placeholder = '數量';
        input.required = true;
        div3.appendChild(input);
        form.appendChild(div3);
        form.appendChild(document.createElement('br'));
        div3 = document.createElement('div');
        div3.innerHTML = '分割檔案出處：';
        input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'useSplittingSource';
        input.addEventListener('change', (event) => {
            event.target.value = event.target.checked;
        })
        div3.appendChild(input);
        form.appendChild(div3);
        form.appendChild(document.createElement('br'));
        this.exportForm = form;
        popupBody.appendChild(form);
        div3 = document.createElement('div');
        div3.innerHTML = '預計下載時間：<span name="itemTotalChoosen">0</span>分鐘';
        popupBody.appendChild(div3);

        button.addEventListener('click', () => {
            popupDownload.show();
        })
        div2.appendChild(button);
        div.appendChild(div2);
        this.content.appendChild(popupDownload.getContainer());
        return;
        // button: export field setting
        button = document.createElement('button');
        button.type = 'button';
        button.classList.add('btn', 'btn-default', 'btn-sm');
        button.title = '資訊欄匯出設定';
        button.innerHTML = '<i class="fa fa-sliders"></i>';
        let popupField = new PopupContainer('匯出資訊欄位設定').createCancelButton(() => {
            this.#checkboxStatusRecover();
        }).createCheckButton(() => {
            EXPORT_FIELD_LIST.forEach(name => {
                this.checkboxStatuses[name] = this.inputElementMap[name].checked;
            })
        });
        popupField.getOverlay().addEventListener('click', () => {
            this.#checkboxStatusRecover();
        })
        popupBody = popupField.getBody();
        // popup body
        div3 = document.createElement('div');
        let select = document.createElement('select');
        let option = document.createElement('option');
        select.appendChild(option);
        div3.appendChild(select);
        div3 = document.createElement('div');
        div3.classList.add('label-checkbox-list');
        EXPORT_FIELD_LIST.forEach(name => {
            let title = INFORMATION_FIELD_MAP[name].title;
            let label = document.createElement('label');
            label.classList.add('full-width');
            let input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = true;
            input.classList.add('pull-right');
            label.innerHTML = title;
            label.appendChild(input);
            div3.appendChild(label);
            let hr = document.createElement('hr');
            hr.classList.add('narrow-hr');
            div3.appendChild(hr);

            this.checkboxStatuses[name] = true;
            this.inputElementMap[name] = input;
        })
        popupBody.appendChild(div3);
        button.addEventListener('click', () => {
            // export setting popup
            popupField.show();
        });
        div2.appendChild(button);
        this.content.appendChild(popupField.getContainer());
    }
    #checkboxStatusRecover() {
        for (let name in this.checkboxStatuses) {
            this.inputElementMap[name].checked = this.checkboxStatuses[name];
        }
    }
    #exportToMail() {
        let payload = { exportFields: [], mails: [], type: "Search", pageUrl: "" };
        // let exportValidFields = [
        //     "id",
        //     "difficulty",
        //     "knowledge",
        //     "discreteKnowledge",
        //     "recognition",
        //     "answerCount",
        //     "lesson",
        //     "discreteLesson",
        //     "applicableYear",
        //     "publishSource",
        //     "source",
        //     "editorRemark",
        //     "answeringMethod",
        //     "importRemark",
        //     "publishYear",
        //     "type",
        //     "keyword",
        //     "stroke",
        //     "page",
        //     "category",
        //     "videos",
        //     "proposeAnswer",
        //     "copyright",
        //     "literacy",
        //     "coreLiteracy",
        //     "learnExpress",
        //     "learnContent",
        //     "topic",
        //     "status",
        //     "ver"
        // ];
        // EXPORT_FIELD_LIST.forEach(name => {
        //     if (this.checkboxStatuses[name]) {
        //         let fieldName = INFORMATION_FIELD_MAP[name].key;
        //         if (!exportValidFields.includes(fieldName)) {
        //             return;
        //         }
        //         payload.exportFields.push(fieldName);
        //     }
        // })
        const formData = new FormData(this.exportForm);
        formData.forEach((value, key) => {
            if (key.startsWith('mails')) {
                payload.mails.push(value);
                return;
            }
            payload[key] = value;
        })
        payload.pageUrl = window.location.href;
        payload.query = ResultUtils.mappingToOldExportQueryPayload(storageHelper.getItem(storageKey.requestPayload));
        itemChooseController.applyChoosenIds(payload.query);

        let requestInfo = storageHelper.getItem(storageKey.requestInfo);
        ajaxCall(requestInfo.metadataUrl + '/api/v1/item/download', 'POST', payload, true, () => {
            notify.show('匯出至信箱中...');
        });
    }
    #addDownloadIdsCsvButton(div) {
        let div2 = document.createElement('div');
        div2.classList.add('btn-group');
        let button1 = document.createElement('button');
        button1.type = 'button';
        button1.classList.add('btn', 'btn-default', 'btn-sm');
        button1.innerHTML = '下載 ID';
        button1.addEventListener('click', () => {
            this.#downloadIdsCsv(false, button1);
        })
        div2.appendChild(button1);
        div.appendChild(div2);
        return;
        // dropdown button for download distinct ids
        let button2 = document.createElement('button');
        button2.type = 'button';
        button2.classList.add('btn', 'btn-default', 'btn-sm', 'dropdown-toggle');
        let span = document.createElement('span');
        span.classList.add('caret');
        button2.appendChild(span);
        div2.appendChild(button2);
        let ul = document.createElement('ul');
        ul.classList.add('dropdown-menu');
        let li = document.createElement('li');
        let a = document.createElement('a');
        a.href = '#';
        a.innerHTML = '下載不重複題 ID';
        button2.addEventListener('click', () => {
            ul.style.display = 'block';
        })
        button2.addEventListener('blur', () => {
            setTimeout(() => {
                ul.style.display = 'none';
            }, 100);
        })
        a.addEventListener('click', () => {
            this.#downloadIdsCsv(true, button2);
        })
        li.appendChild(a);
        ul.appendChild(li);
        div2.appendChild(ul);
    }
    #downloadIdsCsv(ignoreDuplicated, button) {
        button.disabled = true;

        let payload = storageHelper.getItem(storageKey.requestPayload);
        itemChooseController.applyChoosenIds(payload);
        payload.ignoreDuplicated = ignoreDuplicated;
        payload.pageSize = 1;
        payload.pageSize = 2147483647;
        // download ids
        requestSearchResult('/itembank-index-backend/item/ids', 'POST', payload, true, function (list) {
            var csv = "";
            list.forEach(item => {
                csv += item + '\n';
            })
            // create a blob from the CSV
            var blob = new Blob([csv], { type: 'text/csv' });
            // create a link element
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'id.csv'; // Set the file name
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            button.disabled = false;
        });
    }
    #addItemCompareButton(div) {
        let button = document.createElement('button');
        button.type = 'button';
        button.classList.add('btn', 'btn-default', 'btn-sm');
        button.innerHTML = '比對試題';
        button.addEventListener('click', () => {
            let payload = storageHelper.getItem(storageKey.requestPayload);
            itemChooseController.applyChoosenIds(payload);
            payload.ignoreDuplicated = true;
            payload.pageSize = 1;
            payload.pageSize = 2147483647;
            requestSearchResult('/itembank-index-backend/item/ids', 'POST', payload, true, function (list) {
                let event = {
                    ids: list,
                    state: SEARCH_STATE.COMPARE_CLICK
                };
                resultInstance.onStateChange(event);
                // redirect
                // http://qa-itembank.hle.com.tw/#/v2/review/items/1
            });
        })
        div.appendChild(button);
    }
    #addDeleteButton(div) {
        let button = document.createElement('button');
        button.type = 'button';
        button.classList.add('btn', 'btn-default', 'btn-sm');
        button.innerHTML = '搜尋時永不顯示題目';
        let popupObject = new PopupContainer('確認', '20%').createCancelButton().createDangerButton(() => {
            button.disabled = true;

            let payload = storageHelper.getItem(storageKey.requestPayload);
            itemChooseController.applyChoosenIds(payload);
            payload.ignoreDuplicated = true;
            payload.pageSize = 1;
            payload.pageSize = 2147483647;
            requestSearchResult('/itembank-index-backend/item/ids', 'POST', payload, true, function (list) {
                let requestInfo = storageHelper.getItem(storageKey.requestInfo);
                ajaxCall(requestInfo.metadataUrl + '/api/v1/item/deleteItems', 'POST', { itemIds: list }, true, () => {
                    notify.show('已經刪除');
                    button.disabled = false;
                })
            });
        });
        popupObject.getBody().innerHTML = '確定要將選取的試題刪除嗎？刪除的試題將無法透過搜尋再被找到。';
        button.addEventListener('click', () => {
            popupObject.show();
        })
        div.appendChild(button);
        this.content.appendChild(popupObject.getContainer());
    }
    #addNonExistingIdsButton(div) {
        let button = document.createElement('button');
        button.type = 'button';
        button.classList.add('btn', 'btn-default', 'btn-sm');
        button.innerHTML = '列出未存在題目ID';
        let popupObject = new PopupContainer('未在搜尋條件的題目ID：', '20%').createCheckButton();
        button.addEventListener('click', () => {
            this.#getNonExistingIdsInfo(popupObject, button);
        })
        div.appendChild(button);
        this.content.appendChild(popupObject.getContainer());
    }
    #getNonExistingIdsInfo(popupObject, button) {
        button.disabled = true;

        let payload = storageHelper.getItem(storageKey.requestPayload);
        payload.pageSize = 1;
        payload.pageSize = 2147483647;
        requestSearchResult('/itembank-index-backend/item/ids', 'POST', payload, true, function (list) {
            let idMap = {};
            list.forEach(item => {
                idMap[item] = true;
            });
            let nonExistingIdList = [];
            payload.ids.forEach(item => {
                if (!idMap[item]) {
                    nonExistingIdList.push(item);
                }
            })
            let infoStr = nonExistingIdList.join("<br>");

            popupObject.getBody().innerHTML = infoStr;
            popupObject.show();

            button.disabled = false;
        });
    }
    rerenderPage(setting) {
        ResultFormHelper.rerenderPageSorting(setting.sortField, setting.accending);
    }
}

/**
 * 頁面：主要結果清單
 */
class DataTable {
    currentPage;
    totalElements;
    hasContent;
    hasNextPage;
    hasPreviousPage;
    isFirstPage;
    isLastPage;

    pageNumberBar;
    table;
    popupObject;
    loadingRow;
    constructor() {
    }
    createAndAppend(table, popupObject, searchResult) {
        let hasData = searchResult.content && searchResult.content.length > 0;
        this.#applyPaginationInfo(searchResult);
        // caption
        let caption = this.#createCaption(searchResult);
        table.appendChild(caption);
        // header row
        this.#createHeaderRow(table, popupObject);
        // data row
        this.#createLoadingRow(table, hasData);
        this.#createDataRow(table, searchResult);
        // footer row
        this.#createFooter(table);

        if (!this.table) {
            this.table = table;
            this.popupObject = popupObject;
        }
    }
    #createCaption(searchResult) {
        const caption = document.createElement('caption');
        caption.classList.add('text-muted');
        let span = document.createElement('span');
        span.innerHTML = `已選取 <strong name="itemTotalChoosen">${itemChooseController.count}</strong> 題`;
        caption.appendChild(span);
        span = document.createElement('span');
        span.innerHTML = ` 共 <strong id="total">${searchResult.totalElements}</strong> 筆`;
        caption.appendChild(span);

        return caption;
    }
    #createHeaderRow(table, popupObject) {
        const thead = table.createTHead();
        const headerRow = thead.insertRow();

        let th = document.createElement('th');
        th.classList.add('text-center');
        let checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.id = 'checkAll';
        checkBox.checked = itemChooseController.conditionReverseToggle;
        checkBox.addEventListener('change', (event) => {
            let itemCheckboxes = getShadowRoot().querySelectorAll('input[name="itemChoose"]');
            event.target.checked ? itemChooseController.addAll(itemCheckboxes) : itemChooseController.removeAll(itemCheckboxes);
        })
        th.appendChild(checkBox);
        headerRow.appendChild(th);

        th = document.createElement('th');
        th.classList.add('text-center');
        th.innerHTML = '題號';
        headerRow.appendChild(th);

        th = document.createElement('th');
        th.classList.add('text-center');
        th.innerHTML = '題目';
        headerRow.appendChild(th);

        th = document.createElement('th');
        th.classList.add('text-center', 'info-cell');
        th.innerHTML = '資訊 ';
        let a = document.createElement('a');
        a.href = "#";
        let i = document.createElement('i');
        i.classList.add('fa', 'fa-align-justify');
        a.appendChild(i);
        a.addEventListener('click', (event) => {
            event.preventDefault();
            popupObject.show();
        })
        th.appendChild(a);
        headerRow.appendChild(th);
    }
    #createLoadingRow(table, hasData) {
        const tbody = table.createTBody();
        tbody.style.display = 'none';
        let row = tbody.insertRow();
        let cell = row.insertCell();
        cell.classList.add('text-info');
        cell.colSpan = 4;
        if (hasData) {
            cell.innerHTML = '載入資料中... ';
            let loading = document.createElement('i');
            loading.classList.add('fa', 'fa-spinner', 'fa-spin');
            cell.appendChild(loading);
        } else {
            cell.innerHTML = '沒有試題';
            tbody.style.display = '';
        }
        this.loadingRow = tbody;
    }
    #createDataRow(table, searchResult) {
        const tbody = table.createTBody();
        let questionInitialNumber = (searchResult.number - 1) * searchResult.size + 1;
        let numberPadding = questionInitialNumber > 100 ? '0px' : '5px';
        searchResult.content.forEach(item => {
            let row = tbody.insertRow();
            // checkbox
            let cell = row.insertCell();
            let isChecked = itemChooseController.isChecked(item.id);
            let onStateChangeCallback = (event) => {
                event.target.checked ? itemChooseController.add(event.target.id) : itemChooseController.remove(event.target.id);
            }
            cell.appendChild(new Checkbox(item, isChecked, onStateChangeCallback).getInstance());
            // question number
            cell = row.insertCell();
            cell.style.paddingLeft = numberPadding;
            if (questionInitialNumber > 1000) {
                cell.style.fontSize = '10px';
            }
            cell.innerHTML = questionInitialNumber++;
            // question context
            cell = row.insertCell();
            let questionContext = new QuestionContext();
            questionContext.createAndAppend(cell, item);
            // information
            cell = row.insertCell();
            let information = new Information();
            information.createAndAppend(cell, item);
            InformationCellFoot[item.id] = information.foot;
        })
    }
    #createFooter(table) {
        const tfoot = table.createTFoot();
        let tr = tfoot.insertRow();
        let td = document.createElement('td');
        td.colSpan = 4;
        let div = document.createElement('div');
        if (this.hasContent && (this.totalElements > 50 || this.totalPages > 1)) {
            let ul = this.#createPaginationNumberBar();
            div.appendChild(ul);
            ul = this.#createPaginationCapacityBar();
            div.appendChild(ul);
            let div2 = document.createElement('div');
            div2.classList.add('text-muted', 'form-control-static', 'pull-left');
            div2.style.padding = '5px 10px';
            let span = document.createElement('span');
            let remainItems = this.totalElements - this.pageCapacity * this.currentPage;
            remainItems = remainItems < 0 || this.currentPage == this.totalPages ? 0 : remainItems;
            span.innerHTML = remainItems == 0 ? '已到最後一筆' : `還剩 <strong>${remainItems}</strong> 筆`;
            div2.appendChild(span);
            div.appendChild(div2);
            this.pageNumberBar = ul;
        }
        td.appendChild(div);
        tr.appendChild(td);
    }
    #applyPaginationInfo(searchResult) {
        this.totalElements = searchResult.totalElements;
        this.currentPage = searchResult.number;
        this.pageCapacity = searchResult.size;
        this.pageSize = searchResult.numberOfElements;
        this.totalPages = searchResult.totalPages;
        this.hasContent = searchResult.hasContent;
        this.hasNextPage = searchResult.hasNextPage;
        this.hasPreviousPage = searchResult.hasPreviousPage;
        this.isFirstPage = searchResult.isFirstPage;
        this.isLastPage = searchResult.isLastPage;

        let x = Math.floor((this.currentPage - 1) / 5) * 5;
        this.intervalBegin = x + 1;
        this.intervalEnd = x + 5 > this.totalPages ? this.totalPages : x + 5;
        this.hasPreviousInterval = this.currentPage > 5;
        this.hasNextInterval = this.intervalEnd < this.totalPages;
    }
    #createPaginationNumberBar() {
        let ul = document.createElement('ul');
        ul.classList.add('pagination', 'pagination-sm', 'pagination-collapse', 'pull-left');

        // Fixed buttons
        let buttonSettings = [
            { text: 'First', liClass: 'pagination-first', btnClass: 'btn-first', destinationPageNumber: 1, disabled: this.isFirstPage },
            { text: 'Previous', liClass: 'pagination-prev', btnClass: '', destinationPageNumber: this.currentPage - 1, disabled: this.isFirstPage },
            { text: 'Next', liClass: 'pagination-next', btnClass: '', destinationPageNumber: this.currentPage + 1, disabled: this.isLastPage },
            { text: 'Last', liClass: 'pagination-last', btnClass: 'btn-last', destinationPageNumber: this.totalPages, disabled: this.isLastPage }
        ];
        let liButtonList = [];
        buttonSettings.forEach(setting => {
            let li = document.createElement('li');
            li.classList.add(setting.liClass);

            let btn = document.createElement('button');
            btn.classList.add('btn', 'btn-default', 'btn-sm');
            btn.innerHTML = setting.text;
            if (setting.btnClass) {
                btn.classList.add(setting.btnClass);
            }
            if (setting.disabled) {
                li.classList.add('disabled');
                btn.disabled = true;
            } else {
                btn.addEventListener('click', (event) => {
                    event.preventDefault();
                    ResultFormHelper.rerenderPagePagination(setting.destinationPageNumber, this.pageCapacity);
                });
            }

            li.appendChild(btn);
            ul.appendChild(li);
            liButtonList.push(li);
        });

        // Pages buttons
        let firstPage = this.hasPreviousInterval ? this.intervalBegin - 1 : this.intervalBegin;
        let lastPage = this.hasNextInterval ? this.intervalEnd + 1 : this.intervalEnd;
        for (let i = firstPage; i <= lastPage; i++) {
            let li = document.createElement('li');
            li.classList.add('pagination-page');

            let btn = document.createElement('button');
            btn.classList.add('btn', 'btn-default', 'btn-sm');
            btn.innerHTML = i < this.intervalBegin || i > this.intervalEnd ? '...' : i;
            if (i == this.currentPage) {
                btn.classList.add('active');
            } else {
                btn.addEventListener('click', (event) => {
                    event.preventDefault();
                    ResultFormHelper.rerenderPagePagination(i, this.pageCapacity);
                });
            }

            li.appendChild(btn);
            ul.insertBefore(li, liButtonList[2]);
        }
        return ul;
    }
    #createPaginationCapacityBar() {
        let div = document.createElement('div');
        div.classList.add('btn-group', 'btn-group-sm', 'pull-left');

        let ul = document.createElement('ul');
        ul.classList.add('pagination', 'pagination-sm', 'pagination-collapse', 'pull-left');

        // Fixed buttons
        let buttonSettings = [
            { text: '每頁', liClass: 'pagination-first', btnClass: 'btn-first', pageCapacity: 0, disabled: true },
            { text: '50筆', liClass: 'pagination-page', btnClass: '', pageCapacity: 50, disabled: false },
            { text: '100筆', liClass: 'pagination-page', btnClass: '', pageCapacity: 100, disabled: false },
            { text: '全部', liClass: 'pagination-last', btnClass: 'btn-last', pageCapacity: this.totalElements, disabled: false }
        ];
        buttonSettings.forEach(setting => {
            let li = document.createElement('li');
            li.classList.add(setting.liClass);

            let btn = document.createElement('button');
            btn.classList.add('btn', 'btn-default', 'btn-sm');
            btn.innerHTML = setting.text;
            if (setting.btnClass) {
                btn.classList.add(setting.btnClass);
            }
            if (setting.disabled) {
                li.classList.add('disabled');
                btn.disabled = true;
            } else if (this.pageCapacity == setting.pageCapacity) {
                btn.classList.add('active');
            } else {
                btn.addEventListener('click', (event) => {
                    event.preventDefault();
                    ResultFormHelper.rerenderPagePagination(1, setting.pageCapacity);
                });
            }

            li.appendChild(btn);
            ul.appendChild(li);
        });

        div.appendChild(ul);
        return div;
    }
    rerender(searchResult) {
        this.table.innerHTML = '';
        this.createAndAppend(this.table, this.popupObject, searchResult, getShadowRoot());

        ResultRenderer.renderAllInformation(searchResult.content);
    }
    loading() {
        this.loadingRow.style.display = '';
    }
    loaded() {
        this.loadingRow.style.display = 'none';
    }
}
let dataTable;

let InformationCellFoot = {};

class ItembankResultForm extends HTMLElement {
    searchId = "";
    onStateChange = () => {
        // do something...
    };

    constructor(param = { searchId: "", onStateChangeCallback: () => { } }) {
        super();
        resultInstance = this;
        this.searchId = window.itembanksearch.searchId ? window.itembanksearch.searchId : param.searchId;
        this.onStateChange = window.itembanksearch.onStateChange ? window.itembanksearch.onStateChange : param.onStateChangeCallback;

        window.itembanksearch.searchId = null;
        window.itembanksearch.onStateChange = null;

        const shadow = this.attachShadow({ mode: 'closed' });
        setShadowRoot(shadow);

        dataTable = new DataTable();
        itemChooseController = new ItemChooseController((count) => {
            // view for count
            getShadowRoot().querySelectorAll('[name="itemTotalChoosen"]').forEach((item) => {
                item.innerHTML = count;
            })
            // toolbar control
            let disabled = count == 0;
            ResultFormHelper.functionBarDisabled(disabled);
        });
        InformationCellFoot = {};
        storageHelper.resetConfig();

        const style = document.createElement('style');
        style.textContent = styleResult;
        shadow.appendChild(style);

        let popupObject = new InformationControlPopup();
        const h3 = document.createElement('h3');
        h3.innerHTML = '試題搜尋結果';
        shadow.appendChild(h3);
        let loadingNotify = document.createElement('h4');
        loadingNotify.style.color = '#1b9';
        let span = document.createElement('span');
        loadingNotify.appendChild(span);
        let spinner = document.createElement('i');
        shadow.appendChild(loadingNotify);

        let getSearchResultDefault = () => {
            return {
                content: [],
                hasContent: false,
                hasNextPage: false,
                hasPreviousPage: false,
                isFirstPage: true,
                isLastPage: true,
                number: 1,
                numberOfElements: 0,
                size: 0,
                totalElements: 0,
                totalPages: 0
            }
        }

        let createTable = (searchResult) => {
            if (!searchResult) {
                searchResult = getSearchResultDefault();
            }
            storageHelper.setItem(storageKey.searchResult, searchResult);
            itemChooseController.setTotalCount(searchResult.totalElements);
            // Create function bar
            shadow.appendChild(new ToolBar().getInstance());
            ResultFormHelper.functionBarDisabled(true);
            // Create table
            const table = document.createElement('table');
            table.classList.add('table', 'table-bordered', 'table-striped');
            // Create table content
            dataTable.createAndAppend(table, popupObject, searchResult, shadow);
            // Attach the created elements to the shadow dom
            shadow.appendChild(table);
        }

        if (this.searchId) {
            span.innerHTML = '搜尋結果中. . . . . ... ';
            spinner.classList.add('fa', 'fa-spinner', 'fa-spin', 'text-info');
            loadingNotify.appendChild(spinner);
            let searchId = this.searchId;
            // get condition
            requestSearchResult(`/itembank-index-backend/item/index?recordId=${searchId}`, 'GET', null, true, function (conditionPayload) {
                if (!conditionPayload) {
                    span.textContent = '搜尋ID無效. . . . . ... ';
                    loadingNotify.removeChild(spinner);
                    return;
                }
                storageHelper.setItem(storageKey.requestPayload, conditionPayload);
                // get search result
                requestSearchResult(`/itembank-index-backend/item/index/search?recordId=${searchId}`, 'GET', null, true, function (searchResult) {
                    if (!searchResult) {
                        span.innerHTML = '無符合結果. . . . . ... ';
                        loadingNotify.removeChild(spinner);
                        createTable();
                        return;
                    }
                    shadow.removeChild(loadingNotify);
                    createTable(searchResult);
                    ResultRenderer.renderAllInformation(searchResult.content);
                });
            });
        } else {
            span.innerHTML = '未附帶搜尋ID. . . . . ... ';
        }

        // Load and inject multiple CSS files
        const cssFiles = ['https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'];
        cssFiles.forEach(cssFile => {
            const link = document.createElement('link');
            link.href = cssFile;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            shadow.appendChild(link);
        });

        shadow.appendChild(notify.getInstance());
        shadow.appendChild(popupObject.getInstance());
    }

    connectedCallback() {
    }
}

/**
 * depends on global variables
 */
const ResultFormHelper = {
    /**
     * rerender
     */
    rerenderPagePagination: (pageNumber, pageCapacity = null) => {
        let payload = storageHelper.getItem(storageKey.requestPayload);
        payload.pageNumber = pageNumber;
        if (pageCapacity) {
            payload.pageSize = pageCapacity;
        }
        ResultFormHelper.rerenderPage(payload);
    },
    rerenderPageSorting: (sortField, ascending) => {
        let payload = storageHelper.getItem(storageKey.requestPayload);
        payload.sortField = sortField;
        payload.ascending = ascending;
        // back to first page and reset choosen status
        payload.pageNumber = 1;
        itemChooseController.reset();
        ResultFormHelper.rerenderPage(payload);
    },
    rerenderPage: (payload) => {
        dataTable.loading();
        requestSearchResult('/itembank-index-backend/item/search', 'POST', payload, true, function (data) {
            storageHelper.setItem(storageKey.searchResult, data);
            storageHelper.setItem(storageKey.requestPayload, payload);
            dataTable.rerender(data);
            dataTable.loaded();
        });
        window.scrollTo({
            top: 0,
            behavior: 'auto'
        });
    },
    functionBarDisabled: (disabled) => {
        getShadowRoot().querySelectorAll('.btn-toolbar button').forEach((item) => {
            item.disabled = disabled;
        })
    }
}

const ResultRenderer = {
    renderAllInformation: (items) => {
        let ids = [];
        items.forEach(item => {
            ids.push(item.id);
        })

        let promises = [ResultRenderer.catalogInformationPromise(ids)];
        Promise.all(promises).then(() => {
            LinkRouter.route();
        })
    },
    catalogInformationPromise: (ids) => {
        return new Promise((resolve, reject) => {
            let catalogMapList = {};
            requestSearchResult("/itembank-index-backend/catalog/detail", "POST", ids, true, (list) => {
                list.forEach(catalog => {
                    if (catalogMapList[catalog.id] == null) {
                        catalogMapList[catalog.id] = [];
                    }
                    catalogMapList[catalog.id].push(catalog);
                });

                for (let catelogId in catalogMapList) {
                    catalogMapList[catelogId].forEach(catalog => {
                        let nowChYear = CommonUtils.getNowAcademicChYear();
                        if (catalog.year > nowChYear - 3 && catalog.year <= nowChYear) {
                            InformationCellFoot[catalog.itemId].appendChild(new ListItem(`<strong>題庫目錄：</strong><a data-state='catalog' value=${catalog.id}>` + `${catalog.name}</a>`).getInstance());
                        }
                    })
                }
            }, resolve);
        })
    }
}

const LinkRouter = {
    route: () => {
        getShadowRoot().querySelectorAll('a[data-state]').forEach(element => {
            element.addEventListener('click', (event) => {
                event.preventDefault();
                const state = event.target.getAttribute('data-state');
                const value = event.target.getAttribute('value');
                LinkRouter.navigateTo(state, value);
            });
        });
    },
    navigateTo: (stateName, value) => {
        const state = LinkRouter.states[stateName];
        if (state) {
            state.controller(value);
        } else {
            console.error(`State '${stateName}' not found`);
        }
    },
    states: {
        item: {
            controller: function (value) {
                let url = storageHelper.getItem(storageKey.requestInfo).itemUrl;
                url = url.replace('{id}', value);
                window.open(url, '_blank');
            }
        },
        catalog: {
            controller: function (value) {
                let url = storageHelper.getItem(storageKey.requestInfo).catalogUrl;
                url = url.replace('{id}', value);
                window.open(url, '_blank');
            }
        }
    }
}

if (!customElements.get(CUSTOM_ELEMENT_NAME_RESULT)) {
    customElements.define(CUSTOM_ELEMENT_NAME_RESULT, ItembankResultForm);
}

let resultInstance = null;

// global variables for external files
const createResultForm = (param = { searchId: null, onStateChangeCallback: null }) => {
    window.itembanksearch.searchId = param.searchId;
    window.itembanksearch.onStateChange = param.onStateChangeCallback;
    const element = document.createElement(CUSTOM_ELEMENT_NAME_RESULT);
    return element;
}

const removeResultForm = () => {
    let instance = document.querySelector(CUSTOM_ELEMENT_NAME_RESULT);
    if (instance) {
        instance.remove();
    }
}

window.itembanksearch.createResultForm = createResultForm;
window.itembanksearch.removeResultForm = removeResultForm;
