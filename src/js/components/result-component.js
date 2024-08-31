import { INFORMATION_FIELD_LIST, INFORMATION_FIELD_MAP, COPYRIGHT } from "../utils/result-util.js";

/**
 * 頁面：資訊欄位清單條列項目
 */
export class ListItem {
    constructor(innerHTML, id) {
        let li = document.createElement('li');
        li.innerHTML = innerHTML;
        if (id) {
            li.id = id;
        }
        this.content = li;
    }
    getInstance() {
        return this.content;
    }
}

/**
 * 頁面：資訊欄位
 */
export class Information {
	foot;
    constructor() {
    }
    createAndAppend(cell, item) {
        let ul = document.createElement('ul');
        ul.appendChild(new ListItem(INFORMATION_FIELD_MAP.Id.title + `：<a data-state='item' value=${item.id}>` + item.id + `</a>`, INFORMATION_FIELD_MAP.Id.key).getInstance());
        ul.appendChild(new ListItem(INFORMATION_FIELD_MAP.ItemYear.title + "：" + (item.applicableYears ? item.applicableYears.join(",") : ""), INFORMATION_FIELD_MAP.ItemYear.key).getInstance());
        ul.appendChild(new ListItem(INFORMATION_FIELD_MAP.BodyOfKnowledge.title + "：" + (item.bodyOfKnowledges ? item.bodyOfKnowledges.map(bodyOfKnowledge => bodyOfKnowledge.name).join(',') : ""), INFORMATION_FIELD_MAP.BodyOfKnowledge.key).getInstance());
        ul.appendChild(new ListItem(INFORMATION_FIELD_MAP.Lesson.title + "：" + (item.metadata && item.metadata["課名"] ? item.metadata["課名"] : ""), INFORMATION_FIELD_MAP.Lesson.key).getInstance());
        ul.appendChild(new ListItem(INFORMATION_FIELD_MAP.DiscreteLesson.title + "：" + (item.metadata && item.metadata["必出課名"] ? item.metadata["必出課名"] : ""), INFORMATION_FIELD_MAP.DiscreteLesson.key).getInstance());
        ul.appendChild(new ListItem(INFORMATION_FIELD_MAP.Knowledge.title + "：" + (item.metadata && item.metadata["知識向度"] ? item.metadata["知識向度"].replace(";", ",") : ""), INFORMATION_FIELD_MAP.Knowledge.key).getInstance());
        ul.appendChild(new ListItem(INFORMATION_FIELD_MAP.DiscreteKnowledge.title + "：" + (item.metadata && item.metadata["必出知識向度"] ? item.metadata["必出知識向度"].replace(";", ",") : ""), INFORMATION_FIELD_MAP.DiscreteKnowledge.key).getInstance());
        ul.appendChild(new ListItem(INFORMATION_FIELD_MAP.Recognition.title + "：" + (item.metadata && item.metadata["認知向度"] ? item.metadata["認知向度"].replace(";", ",") : ""), INFORMATION_FIELD_MAP.Recognition.key).getInstance());
        ul.appendChild(new ListItem(INFORMATION_FIELD_MAP.Difficulty.title + "：" + (item.metadata && item.metadata["難易度"] ? item.metadata["難易度"].replace(";", ",") : ""), INFORMATION_FIELD_MAP.Difficulty.key).getInstance());
        ul.appendChild(new ListItem(INFORMATION_FIELD_MAP.Literacy.title + "：" + (item.metadata && item.metadata["素養題"] ? (item.metadata["素養題"] == "1" ? "是" : "否") : ("否")), INFORMATION_FIELD_MAP.Literacy.key).getInstance());
        ul.appendChild(new ListItem(INFORMATION_FIELD_MAP.Topic.title + "：" + (item.metadata && item.metadata["議題"] ? item.metadata["議題"].replace(";", ",") : ""), INFORMATION_FIELD_MAP.Topic.key).getInstance());
        ul.appendChild(new ListItem(INFORMATION_FIELD_MAP.Copyright.title + "：" + (item.metadata && item.metadata["版權"] ? (COPYRIGHT[item.metadata["版權"]] ? COPYRIGHT[item.metadata["版權"]] : item.metadata["版權"]) : ("")), INFORMATION_FIELD_MAP.Copyright.key).getInstance());
        let link = item.metadata && item.metadata["解題影片"] ? item.metadata["解題影片"].replace(";", ",") : "";
        ul.appendChild(new ListItem(INFORMATION_FIELD_MAP.Video.title + `：<a href="${link}" target="_blank">${link}</a>`, INFORMATION_FIELD_MAP.Video.key).getInstance());
        ul.appendChild(new ListItem(INFORMATION_FIELD_MAP.Audio.title + "：" + (item.metadata && item.metadata["音軌"] ? item.metadata["音軌"].replace(";", ",") : ""), INFORMATION_FIELD_MAP.Audio.key).getInstance());
        ul.appendChild(new ListItem(INFORMATION_FIELD_MAP.EditorRemark.title + "：" + (item.metadata && item.metadata["編輯備註"] ? item.metadata["編輯備註"].replace(";", ",") : ""), INFORMATION_FIELD_MAP.EditorRemark.key).getInstance());
        let answeringMethodText = "";
        if (item.content.questions && item.content.questions.length > 0) {
            answeringMethodText = item.content.questions.length > 1 ? item.content.questions.map((question, index) => `(${index + 1})${question.answeringMethod}`).join(';') : item.content.questions[0].answeringMethod;
        }
        ul.appendChild(new ListItem(INFORMATION_FIELD_MAP.AnsweringMethod.title + "：" + answeringMethodText, INFORMATION_FIELD_MAP.AnsweringMethod.key).getInstance());
        cell.appendChild(ul);

        cell.appendChild(document.createElement('hr'));
        ul = document.createElement('ul');
        ul.appendChild(new ListItem("<strong>真實答對率：</strong>").getInstance());
        ul.appendChild(new ListItem("<strong>線上測驗上下架狀態：</strong>" + (item.isOnlineReady ? "上架" : "下架")).getInstance());
        // load catalog information at connectedCallback
        // ul.appendChild(new ListItem(`<strong>題庫目錄：</strong><a data-state='catalog' value=${item.catalogId}>` + `${item.catalogName}</a>`).getInstance());

        cell.appendChild(ul);
		this.foot = ul;
    }
}

/**
 * 頁面：彈出視窗
 */
export class PopupContainer {
    #container;
    #content;
    #header;
    #body;
    #footer;
    #overlay;
    constructor(title, width = null) {
        let container = document.createElement('div');
        container.classList.add('popup-container');
        container.style.display = 'none';
        let div = document.createElement('div');
        div.classList.add('modal-content', 'popup');
        div.style.width = width;
        let header = document.createElement('div');
        header.classList.add('modal-header', 'padding-full-side');
        let h4 = document.createElement('h4');
        h4.classList.add('modal-title');
        let i = document.createElement('i');
        i.classList.add('fa', 'fa-exclamation-circle');
        let span = document.createElement('span');
        span.innerHTML = " " + title;
        h4.appendChild(i);
        h4.appendChild(span);
        header.appendChild(h4);
        div.appendChild(header);
        let body = document.createElement('div');
        body.classList.add('modal-body', 'padding-full-side');
        window.addEventListener('keydown', (event) => {
            if (event.key == 'Escape') {
                this.hide();
            };
        });
        div.appendChild(body);
        let footer = document.createElement('div');
        footer.classList.add('modal-footer', 'padding-full-side');
        div.appendChild(footer);
        container.appendChild(div);

        let overlay = document.createElement('div');
        overlay.classList.add('overlay');
        overlay.addEventListener('click', (event) => {
            this.hide();
        });
        container.appendChild(overlay);

        this.#container = container;
        this.#content = div;
        this.#header = header;
        this.#body = body;
        this.#footer = footer;
        this.#overlay = overlay;
    }
    getContainer() {
        return this.#container;
    }
    getContent() {
        return this.#content;
    }
    getHeader() {
        return this.#header;
    }
    getBody() {
        return this.#body;
    }
    getFooter() {
        return this.#footer;
    }
    getOverlay() {
        return this.#overlay;
    }
    addHideEvent(element, callback = () => { }) {
        element.addEventListener('click', () => {
            this.hide();
            callback();
        })
    }
    hide() {
        this.#container.classList.remove('show');
        setTimeout(() => {
            this.#container.style.display = 'none';
        }, 200);
    }
    show() {
        this.#container.style.display = 'block';
        requestAnimationFrame(() => {
            this.#container.classList.add('show');
        });
    }
    createCancelButton(callback = () => { }) {
        return this.createButton('取消', 'btn-warning', callback);
    }
    createCheckButton(callback = () => { }) {
        return this.createButton('確定', 'btn-primary', callback);
    }
    createDangerButton(callback = () => { }) {
        return this.createButton('刪除', 'btn-danger', callback);
    }
    createButton(text, cssclass, callback = () => { }) {
        let btn = document.createElement('button');
        btn.classList.add('btn', 'pull-right', cssclass);
        btn.innerHTML = text;
        btn.style.marginLeft = '10px';
        btn.addEventListener('click', () => {
            this.hide();
            callback();
        })
        this.#footer.appendChild(btn);
        return this;
    }
}

/**
 * 頁面：資訊欄位(控制右側顯示欄位)彈出視窗
 */
export class InformationControlPopup {
    content;
    checkboxStatuses = {};
    inputElementMap = {};
    popupContainerObject;
    constructor() {
        let popupContainerObject = new PopupContainer('資訊顯示').createCancelButton(() => {
            this.checkboxStatusRecover();
        }).createCheckButton(() => {
            this.refreshInformationDisplaying();
        });
        let divContainer = popupContainerObject.getContainer();
        let divBody = popupContainerObject.getBody();

        // popup body
        let div3 = document.createElement('div');
        let select = document.createElement('select');
        let option = document.createElement('option');
        select.appendChild(option);
        div3.appendChild(select);
        div3 = document.createElement('div');
        div3.classList.add('label-checkbox-list');

        INFORMATION_FIELD_LIST.forEach(name => {
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

            let id = INFORMATION_FIELD_MAP[name].key;
            this.checkboxStatuses[id] = true;
            this.inputElementMap[id] = input;
        })
        divBody.appendChild(div3);

        // overlay
        popupContainerObject.getOverlay().addEventListener('click', () => {
            this.checkboxStatusRecover();
        })

        this.content = divContainer;
        this.popupContainerObject = popupContainerObject;
    }
    getInstance() {
        return this.content;
    }
    checkboxStatusRecover() {
        for (let name in this.checkboxStatuses) {
            this.inputElementMap[name].checked = this.checkboxStatuses[name];
        }
    }
    refreshInformationDisplaying() {
        for (let id in this.checkboxStatuses) {
            this.checkboxStatuses[id] = this.inputElementMap[id].checked;
        }
        for (let id in this.checkboxStatuses) {
            if (!this.checkboxStatuses[id]) {
                getShadowRoot().querySelectorAll('#' + id).forEach(item => {
                    item.style.display = 'none';
                });
            } else {
                getShadowRoot().querySelectorAll('#' + id).forEach(item => {
                    item.style.display = null;
                });
            }
        }
    }
    show() {
        this.popupContainerObject.show();
    }
}

/**
 * 頁面：選擇框，用於主要結果清單的題目選取
 */
export class Checkbox {
    content;
    constructor(item, isChecked, onStateChangeCallback) {
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = item.id;
        checkbox.checked = isChecked;
        checkbox.name = 'itemChoose';
        if (onStateChangeCallback) {
            checkbox.addEventListener('change', (event) => {
                onStateChangeCallback(event);
            })
        }
        this.content = checkbox;
    }
    getInstance() {
        return this.content;
    }
}

/**
 * 頁面：圖片連結，用於主要結果清單的題目圖片顯示
 */
export class ImageLink {
    content;
    imageLink;
    image;
    constructor() {
        let div = document.createElement('div');
        let innerDiv = document.createElement('div');
        innerDiv.classList.add('pull-right');
        let imageLink = document.createElement('a');
        imageLink.href = "#";
        imageLink.target = '_blank';
        imageLink.innerHTML = '<i class="fa fa-picture-o"></i>';
        innerDiv.appendChild(imageLink);
        div.appendChild(innerDiv);
        innerDiv = document.createElement('div');
        innerDiv.classList.add('clearfix');
        div.appendChild(innerDiv);

        this.imageLink = imageLink;
        this.content = div;
    }
    getInstance() {
        return this.content;
    }
    bindImageLinkEvent(questionContextDiv, item) {
        this.imageLink.addEventListener('click', (event) => {
            event.preventDefault();
            if (this.image) {
                this.image.style.display = this.image.style.display === 'none' ? 'block' : 'none';
                return;
            }
            let img = document.createElement('img');
            img.classList.add('full-width');
            img.src = '#';
            item.resourceLinks.forEach((link) => {
                if (link.contentType == 'image/png' && link.rel == 'original') {
                    img.src = link.href;
                }
            })
            img.style.display = 'block';
            questionContextDiv.appendChild(img);
            this.image = img;
        })
        return this.content;
    }
}

/**
 * 頁面：題目欄位(題組內容)
 */
export class Preamble {
    content;
    constructor(text) {
        let li = document.createElement('li');
        li.classList.add('list-group-item', 'list-group-item-info');
        let p = document.createElement('p');
        p.classList.add('text-muted');
        p.innerHTML = '<strong>題幹</strong>';
        li.appendChild(p);
        p = document.createElement('p');
        p.innerHTML = text;
        li.appendChild(p);
        this.content = li;
    }
    getInstance() {
        return this.content;
    }
}

/**
 * 頁面：題目欄位(解析)
 */
export class SolutionSummary {
    content;

    constructor(item) {
        let li = document.createElement('li');
        li.classList.add('list-group-item');
        if (!item.solution) {
            let p = document.createElement('p');
            p.classList.add('text-muted');
            p.innerHTML = '沒有解析';
            li.appendChild(p);
        } else {
            let div = document.createElement('div');
            div.innerHTML = item.solution;
            li.appendChild(div);
        }
        this.content = li;
    }
    getInstance() {
        return this.content;
    }
}

/**
 * 頁面：題目欄位(題目內容)
 */
export class Question {
    div;
    li;

    constructor(question, index, enableListNumber = false) {
        this.#createStemBlock(question, enableListNumber, index);
        if (question.options.length > 0) {
            this.#createOptionBlock(question);
        }
        this.li.appendChild(this.div);
        this.#createAnswerBlock(question);
        if (question.solution) {
            this.#createSolutionBlock(question);
        }
    }
    #createStemBlock(question, enableListNumber, index) {
        this.li = document.createElement('li');
        this.li.classList.add('list-group-item');
        // stem number
        if (enableListNumber) {
            let p = document.createElement('p');
            p.classList.add('text-muted');
            p.innerHTML = `<strong>（${index + 1}）</strong>`;
            this.li.appendChild(p);
        }
        this.div = document.createElement('div');
        this.div.setAttribute('question', 'question');
        this.div.setAttribute('item', 'item');
        this.div.setAttribute('question-index', index);
        let divContent = document.createElement('div');
        divContent.innerHTML += question.stem;
        this.div.appendChild(divContent);
    }
    #createOptionBlock(question) {
        let ol = document.createElement('ol');
        ol.type = 'A';
        question.options.forEach(option => {
            let li = document.createElement('li');
            let p = document.createElement('p');
            p.innerHTML = option;
            li.appendChild(p);
            ol.appendChild(li);
        })
        this.div.appendChild(ol);
    }
    #createAnswerSpan(text, index) {
        let strong = document.createElement('strong');
        if (index > 0) {
            let span = document.createElement('span');
            span.innerHTML = ' ； ';
            strong.appendChild(span);
        }
        let span = document.createElement('span');
        span.innerHTML = text;
        strong.appendChild(span);
        return strong;
    }
    #createAnswerBlock(question) {
        let div = document.createElement('div');
        div.innerHTML = '答案：';
        question.answers.forEach((answer, index) => {
            if (Array.isArray(answer)) {
                answer.forEach((ans, idx) => {
                    let strong = this.#createAnswerSpan(ans, idx);
                    div.appendChild(strong);
                });
                return;
            }
            let strong = this.#createAnswerSpan(ans, idx);
            div.appendChild(strong);
        });
        this.li.appendChild(div);
    }
    #createSolutionBlock(question) {
        let hr = document.createElement('hr');
        this.li.appendChild(hr);
        let div = document.createElement('div');
        div.classList.add('solution');
        div.innerHTML = '解析：';
        let span = document.createElement('span');
        span.innerHTML = question.solution;
        div.appendChild(span);
        this.li.appendChild(div);
    }
    getInstance() {
        return this.li;
    }
}

/**
 * 頁面：題目欄位
 */
export class QuestionContext {
    constructor() {
    }
    createAndAppend(cell, item) {
        // image link
        cell.appendChild(new ImageLink().bindImageLinkEvent(cell, item));

        let div = document.createElement('div');
        div.setAttribute('ib-item-content', 'item');
        let ol = document.createElement('ol');
        ol.classList.add('list-group');

        // preamble
        if (item.preamble) {
            ol.appendChild(new Preamble(item.preamble).getInstance());
        } else if (item.content.preamble) {
            ol.appendChild(new Preamble(item.content.preamble).getInstance());
        }

        // questions
        let enableListNumber = item.content.questionCount > 1;
        item.content.questions.forEach((question, index) => {
            ol.appendChild(new Question(question, index, enableListNumber).getInstance());
        })

        // solution summary
        ol.appendChild(new SolutionSummary(item).getInstance());

        div.appendChild(ol);
        cell.appendChild(div);
    }
}