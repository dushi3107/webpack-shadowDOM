// "ID", "適用學年度", "入學學程", "課名", "必出課名", "知識向度", "必出知識向度", "認知向度", "難易度", "素養題", "議題", "版權", "解題影片", "音檔", "編輯備註", "作答方式"
export const INFORMATION_FIELD_LIST = ["Id", "ItemYear", "BodyOfKnowledge", "Lesson", "DiscreteLesson", "Knowledge", "DiscreteKnowledge"
    , "Recognition", "Difficulty", "Literacy", "Topic", "Copyright", "Video", "Audio", "EditorRemark", "AnsweringMethod"];

export const EXPORT_FIELD_LIST = ["Id", "ItemYear", "BodyOfKnowledge", "Lesson", "DiscreteLesson", "Knowledge", "DiscreteKnowledge"
    , "Recognition", "Difficulty", "Literacy", "Topic", "Copyright", "Video", "EditorRemark", "AnsweringMethod"];

export const INFORMATION_FIELD_MAP = {
    Id: { "title": "編號", "id": "l0", "key": "id" },
    ItemYear: { "title": "適用學年度", "id": "l1", "key": "applicableYear" },
    BodyOfKnowledge: { "title": "入學學程", "id": "l2", "key": "bodyOfKnowledge" },
    Lesson: { "title": "課名", "id": "l3", "key": "lesson" },
    DiscreteLesson: { "title": "必出課名", "id": "l4", "key": "discreteLesson" },
    Knowledge: { "title": "知識向度", "id": "l5", "key": "knowledge" },
    DiscreteKnowledge: { "title": "必出知識向度", "id": "l6", "key": "discreteKnowledge" },
    Recognition: { "title": "認知向度", "id": "l7", "key": "recognition" },
    Difficulty: { "title": "難易度", "id": "l8", "key": "difficulty" },
    Literacy: { "title": "素養題", "id": "l9", "key": "literacy" },
    Topic: { "title": "議題", "id": "l10", "key": "topic" },
    Copyright: { "title": "版權", "id": "l11", "key": "copyright" },
    Video: { "title": "解題影片", "id": "l12", "key": "videos" },
    Audio: { "title": "音檔", "id": "l13", "key": "audios" },
    EditorRemark: { "title": "編輯備註", "id": "l14", "key": "editorRemark" },
    AnsweringMethod: { "title": "作答方式", "id": "l15", "key": "answeringMethod" },
}

export const COPYRIGHT = {
    0: "無版權",
    1: "有版權限制",
    2: "版權是翰教科",
    3: "待談版權",
}

export const SORT_FIELD = {
    UpdatedOn: "updatedOn",
    InputId: "inputId"
}

export const ResultUtils = {
    mappingToOldSearchPayload: (originPayload) => {
        // payload mapping for download API
        let bodyOfKnowledgeCode = originPayload.bodyOfKnowledgeCode;
        let itemYears = [];
        originPayload.itemYears.forEach(year => {
            itemYears.push({ bodyOfKnowledgeCode: bodyOfKnowledgeCode, year: year });
        })
        originPayload.itemYears = itemYears;
        let neItemYears = [];
        originPayload.neItemYears.forEach((year, index) => {
            neItemYears.push({ year: year });
        })
        originPayload.neItemYears = neItemYears;
        originPayload.bodyOfKnowledgeCodes = [originPayload.bodyOfKnowledgeCode];
        delete originPayload.bodyOfKnowledgeCode;

        for (let key in originPayload) {
            if (originPayload[key] == null || Array.isArray(originPayload[key]) && originPayload[key].length == 0) {
                delete originPayload[key];
            }
        }
        return originPayload;
    },
    mappingToOldExportQueryPayload: (originPayload) => {
        let payload = ResultUtils.mappingToOldSearchPayload(originPayload);
        delete payload.pageNumber;
        delete payload.pageSize;
        delete payload.neLabelNames;
        delete payload.subject;
        return payload;
    }
}

/**
 * 頁面：題目選擇控制器
 */
export class ItemChooseController {
    idMap = new Map();
    neIdMap = new Map();
    count = 0;
    totalCount = 0;
    conditionReverseToggle = false;
    updateViewAndStorage = (count) => {};
    constructor(viewUpdatingCallback) {
        this.updateViewAndStorage = viewUpdatingCallback;
    }
    setTotalCount(totalCount) {
        this.totalCount = totalCount;
    }
    reset() {
        this.conditionReverseToggle = false;
        this.idMap = new Map();
        this.neIdMap = new Map();
        this.count = 0;
        this.updateViewAndStorage(this.count);
    }
    add(id) {
        this.count++;
        if (this.conditionReverseToggle) {
            this.neIdMap.delete(id);
        } else {
            this.idMap.set(id, true);
        }
        this.updateViewAndStorage(this.count);
    }
    remove(id) {
        this.count--;
        if (this.conditionReverseToggle) {
            this.neIdMap.set(id, true);
        } else {
            this.idMap.delete(id);
        }
        this.updateViewAndStorage(this.count);
    }
    addAll(itemCheckboxes) {
        itemCheckboxes.forEach((input) => {
            input.checked = true;
        })
        this.count = this.totalCount;
        this.conditionReverseToggle = true;
        this.idMap = new Map();
        this.neIdMap = new Map();
        this.updateViewAndStorage(this.count);
    }
    removeAll(itemCheckboxes) {
        itemCheckboxes.forEach((input) => {
            input.checked = false;
        })
        this.count = 0;
        this.conditionReverseToggle = false;
        this.idMap = new Map();
        this.neIdMap = new Map();
        this.updateViewAndStorage(this.count);
    }
    isChecked(itemId) {
        if (this.conditionReverseToggle) {
            return !this.neIdMap.has(itemId);
        } else {
            return this.idMap.has(itemId);
        }
    }
    /**
     * apply now choosen items to payload from the page
     */
    applyChoosenIds(payload) {
        let ids = Array.from(this.idMap.keys());
        if (ids.length > 0) {
            payload.ids = ids;
        }
        let neIds = Array.from(this.neIdMap.keys());
        if (neIds.length > 0) {
            payload.neIds = neIds;
        }
    }
}