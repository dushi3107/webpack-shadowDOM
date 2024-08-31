import { requestGetMetadata, requestSearchResult } from "./common-util.js";

export const CONDITION = {
	Subject: "subject",
	BodyOfKnowledge: "bodyofknowledge",
	ItemYear: "itemyear",
	Product: "product",
	Catalog: "catalog",
	PublishSource: "publishsource",
	Source: "source",
	Version: "version",
	Knowledge: "knowledge",
	DiscreteKnowledge: "discreteknowledge",
	Lesson: "lesson",
	DiscreteLesson: "discretelesson",
	Recognition: "recognition",
	UserType: "usertype",
	AnsweringMethod: "answeringmethod",
	HasSolution: "hassolution",
	HasVideoUrl: "hasvideourl",
	IsSet: "isset",
	OnlineReadiness: "onlinereadiness",
	Answer: "answer",
	ProductStatus: "productstatus",
	Copyright: "copyright",
	IsLiteracy: "isliteracy",
	EditorRemark: "editorremark",
	FileName: "filename",
	MustSearchText: "mustsearchtext",
	SearchText: "searchtext",
	HasLatex: "haslatex",
	Topic: "topic",
	ImportRecordId: "importrecordid",
	DocumentId: "documentid",
	DocumentRepositoryId: "documentrepositoryid",
	Id: "id",
}

/**
 * set this flag in configs, use this flag to do special process instead of normal flow
 */
export const SPECIAL_CASE_CONDITION = {
	NONE: 0,
	// RENDER_XXX: 1X,
	RENDER_DEFAULT: 10,
	// SUBMIT_XXX: 2X,
	SUBMIT_SINGLE_VALUE: 20,
	// METADATA_XXX: 3X
	METADATA_REQUEST_TARGET: 30,
	// INPUT_XXX: 4X
	INPUT_DROPDOWN_ALLOW_PASTE: 40,
	INPUT_TYPING_PASS_SPLIT: 41,

}

/**
 * 是否有剔除條件
 */
export const HAS_EXCLUSION = {
	Subject: false,
	BodyOfKnowledge: false,
	ItemYear: true,
	Product: false,
	Catalog: true,
	PublishSource: true,
	Source: true,
	Version: true,
	Knowledge: true,
	DiscreteKnowledge: true,
	Lesson: true,
	DiscreteLesson: true,
	Recognition: true,
	UserType: true,
	AnsweringMethod: true,
	HasSolution: false,
	HasVideoUrl: false,
	IsSet: false,
	Answer: false,
	OnlineReadiness: false,
	ProductStatus: false,
	Copyright: false,
	IsLiteracy: false,
	EditorRemark: true,
	FileName: true,
	MustSearchText: true,
	SearchText: true,
	HasLatex: false,
	Topic: false,
	ImportRecordId: true,
	DocumentId: true,
	DocumentRepositoryId: true,
	Id: true,
}

/**
 * input box type(sigle select/dropdown multi/typing multi/autocomplete multi)
 */
export const MULTISELECT_TYPE = {
	SINGLE: 0,
	DROPDOWN: 1,
	TYPING: 2,
	AUTOCOMPLETE: 3,
}

/**
 * mainly used for rendering part, indicates what time should render
 */
export const RENDER_LEVEL = {
	None: -1, // no need to render
	Construction: 0, // at construction
	Subject: 1, // at the subject event trigger
	BodyOfKnowledge: 2, // at the body of knowledge event trigger
	File: 3, // at the file event trigger
	Others: 99
}

/**
 * 學制前綴
 */
export const SUBJECT_PREFIX = {
	Elementary: "E-",
	Junior: "J-",
	Senior: "S-",
	Vocational: "V-",
}

/**
 * 自定義字段 須在後端做額外判斷處理
 */
export const REQ_PAYLOAD_DEF = {
	nullBodyOfKnowledgeCode: '無學程',
	onShelfProductStatus: 'on_shelf',
	offShelfProductStatus: 'off_shelf'
}

/**
 * html attribute define
 */
export const ATTRIBUTE = {
	SUBMIT_TARGET: "submit-value",
	VALUE_OPTION: "value",
	VALUE_OPTION_CONTENT: "content",
	VALUE_OPTION_LABEL: "label",
}

/**
 * sorting type, according to the field name
 */
export const SORT_FIELD = {
	UpdatedOn: "updatedOn",
	InputId: "inputId"
}

/**
 * independent(stateless) utils
 */
export const IndexUtils = {
	defaultDropdownValueList: ["都包含", "不分"],
	/**
	 * elements that are managed by subject condition
	 */
	subjectControlItems: () => {
		return [CONDITION.BodyOfKnowledge].concat(IndexUtils.bodyOfKnowledgeCodeControlItems().concat(IndexUtils.itemYearsControlItems()));
	},
	/**
	 * elements that are managed by bodyOfKnowledge condition
	 */
	bodyOfKnowledgeCodeControlItems: () => {
		return [CONDITION.Knowledge, CONDITION.DiscreteKnowledge, CONDITION.Lesson, CONDITION.DiscreteLesson];
	},
	/**
	 * elements that are managed by itemYears condition
	 */
	itemYearsControlItems: () => {
		return [CONDITION.Catalog, CONDITION.PublishSource, CONDITION.UserType];
	},
	getexclusionName: (name) => {
		return "ne" + name;
	},
	checkItemExists: (items, target) => {
		for (let item of items) {
			if (item.getAttribute(ATTRIBUTE.SUBMIT_TARGET) === target) {
				return true; // Item already exists, do not add
			}
		}
		return false;
	},

	/**
	 * Makes the HTML element with the given id draggable.
	 * @param {Element} element The element to make draggable.
	 */
	draggableElement: (element, innerHeaderElement = null) => {
		var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
		if (innerHeaderElement) {
			innerHeaderElement.onmousedown = dragMouseDown;
		} else {
			element.onmousedown = dragMouseDown;
		}

		function dragMouseDown(e) {
			e = e || window.event;
			e.preventDefault();
			// get the mouse cursor position at startup:
			pos3 = e.clientX;
			pos4 = e.clientY;
			document.onmouseup = closeDragElement;
			// call a function whenever the cursor moves:
			document.onmousemove = elementDrag;
		}

		function elementDrag(e) {
			e = e || window.event;
			e.preventDefault();
			// Calculate the new cursor position
			pos1 = pos3 - e.clientX;
			pos2 = pos4 - e.clientY;
			pos3 = e.clientX;
			pos4 = e.clientY;

			// Calculate new position
			let newTop = element.offsetTop - pos2;
			let newLeft = element.offsetLeft - pos1;

			const borderBottom = window.innerHeight + window.scrollY - 100;
			const borderRight = window.innerWidth + window.scrollX - 100;
			const borderLeft = -element.offsetWidth + 100;

			// Limit the position within the window
			if (newTop < 0) {
				newTop = 0;
			} else if (newTop > borderBottom) {
				newTop = borderBottom;
			}

			if (newLeft < borderLeft) {
				newLeft = borderLeft;
			} else if (newLeft > borderRight) {
				newLeft = borderRight;
			}

			// Set the element's new position
			element.style.top = newTop + "px";
			element.style.left = newLeft + "px";
		}

		function closeDragElement() {
			// stop moving when mouse button is released:
			document.onmouseup = null;
			document.onmousemove = null;
		}
	}

}

/**
 * config for each condition, add or update this object to the list of ConditionConfigs if needed
 */
export class ConditionConfig {
	/**
	 * use this with .setBasic().setDetails().setRenderInfo().setSubmitInfo()
	 */
	constructor() {
		this.name;
		this.enName;
		this.title;
		this.isAdvanced;
		this.hasExclusiveCondition;
		this.multipleSelectType;
		this.note;
		this.metadataPath;
		this.queryParamGenerationFunction;
		this.defaultMetadata;
		this.callBackRenderFunction;
		this.renderLevel = RENDER_LEVEL.None;
		this.payloadKeys;
		this.resourcePath;
		this.resourceParamField;
		this.resourceParamFieldValue;
		this.shouldGetResourceParam = false;
		this.placeholder;
		this.disabled = true;
		/**
		 * if this "specialCaseCondition" flag is set to not none, it will not follow the normal process,
		 * you can customize the independent judgement instead of normal process
		 */
		this.specialCaseConditionRender = SPECIAL_CASE_CONDITION.NONE;
		/**
		 * if this "specialCaseCondition" flag is set to not none, it will not follow the normal process,
		 * you can customize the independent judgement instead of normal process
		 */
		this.specialCaseConditionSubmit = SPECIAL_CASE_CONDITION.NONE;
		/**
		 * if this "specialCaseCondition" flag is set to not none, it will not follow the normal process,
		 * you can customize the independent judgement instead of normal process
		 */
		this.specialCaseConditionInput = SPECIAL_CASE_CONDITION.NONE;
		this.submitValueMappingFunction = (value) => { return value; };
		this.autoFillValueMappingFunction = (value) => { return value; };
	}
	/**
	 * the basic info of the condition
	 * 
	 * EX: .setBasic("科目", CONDITION.Subject, "科目", null, "請輸入科目")
	 * 
	 * @param {string} name 條件名稱
	 * @param {string} enName 條件英文名稱
	 * @param {string} title 條件標題
	 * @param {string} note 備註(optional)
	 * @param {string} placeholder placeholder
	 * @returns {this}
	 */
	setBasic(name, enName, title, note, placeholder = null) {
		this.name = name;
		this.enName = enName;
		this.title = title;
		this.note = note;
		this.placeholder = placeholder;
		return this;
	}
	/**
	 * the details of the condition object for displaying
	 * 
	 * EX: .setDetails(true, false, HAS_EXCLUSION.Subject, MULTISELECT_TYPE.SINGLE)
	 * 
	 * @param {boolean} defaultDisabled 是否為預設鎖定
	 * @param {boolean} isAdvanced 是否為進階條件
	 * @param {boolean} hasExclusiveCondition 是否有剔除條件欄位
	 * @param {number} multipleSelectType 多選類型
	 * @returns {this}
	 */
	setDetails(defaultDisabled, isAdvanced, hasExclusiveCondition, multipleSelectType, specialCaseCondition = SPECIAL_CASE_CONDITION.NONE) {
		this.disabled = defaultDisabled;
		this.isAdvanced = isAdvanced;
		this.hasExclusiveCondition = hasExclusiveCondition;
		this.multipleSelectType = multipleSelectType;
		this.specialCaseConditionInput = specialCaseCondition;
		return this;
	}
	/**
	 * the render info, refer to the description of parameters
	 * 
	 * EX: .setRenderInfo("/api/v1/itemYear/bodyOfKnowledgeId/years?bodyOfKnowledgeIds=", (item) => { return item.getAttribute("body-of-knowledge-id"); }, null, (list) => Renderer.itemYear(list), RENDER_LEVEL.BodyOfKnowledge)
	 * 
	 * EX: .setRenderInfo(null, null, ["無版權", "有版權限制", "版權是翰教科", "待談版權"], (list) => Renderer.copyright(list), RENDER_LEVEL.Construction)
	 * 
	 * @param {string} metadataPath 元數據請求路徑(從server拿取)，若要直接使用預設值則設定為null，並設置defaultMetadata
	 * @param {function(any)} queryParamGenerationFunction 組成路徑請求參數的函數，置於metadataPath後(此與setResourceParamInfo只能擇一)
	 * @param {*} defaultMetadata 元數據預設值，寫死的元數據才能用此(可直接傳入callBackRenderFunction做render)，***如果此預設選單中有包含特定的數值會當成該input的預設值被點擊(參考IndexFormHelper.applyDefault())
	 * @param {function(any)} callBackRenderFunction 元數據請求回調函數，可不傳入參數
	 * @param {number} renderLevel 建構層級，判斷在什麼時候render
	 * @param {number} specialCaseCondition 特殊案例種類，用來做獨立判斷處理（預設為NONE）
	 * @returns {this}
	 */
	setRenderInfo(metadataPath, queryParamGenerationFunction, defaultMetadata, callBackRenderFunction, renderLevel, specialCaseCondition = SPECIAL_CASE_CONDITION.NONE) {
		this.metadataPath = metadataPath;
		this.queryParamGenerationFunction = queryParamGenerationFunction;
		this.defaultMetadata = defaultMetadata;
		this.callBackRenderFunction = callBackRenderFunction;
		this.renderLevel = renderLevel;
		this.specialCaseConditionRender = specialCaseCondition;

		// if it needs to be rendered then it must have a callBackRenderFunction with metadataPath or defaultMetadata
		// if (renderLevel != RENDER_LEVEL.None && !callBackRenderFunction && (!metadataPath || !defaultMetadata)) {
		// 	console.error('config not correct, data insufficient for an element to be rendered, condition name: ' + this.enName);
		// }
		return this;
	}
	/**
	 * Some APIs need to get the path/query parameter from other configuration API,
	 * you can only use this or queryParamGenerationFunction at the same time.
	 * @param {string} resourcePath to get the metadata path parameter config
	 * @param {string} resourceDataField the value of the config field to append to the metadataPath
	 * @returns {this}
	 */
	setResourceParamInfo(resourcePath, resourceDataField) {
		if (!resourcePath || !resourceDataField) {
			return this;
		}
		this.shouldGetResourceParam = true;
		this.resourcePath = resourcePath;
		this.resourceParamField = resourceDataField
		return this;
	}
	getResourceParam() {
		this.#fetchResourceParam();
	}
	getResourceParamPromise() {
		return new Promise((resolve, reject) => {
			this.#fetchResourceParam(resolve);
		})
	}
	#fetchResourceParam(resolve = null) {
		requestGetMetadata(this.resourcePath, true, (data) => {
			this.resourceParamFieldValue = data[this.resourceParamField];
		}, resolve);
	}
	/**
	 * the submit info
	 * 
	 * EX: .setSubmitInfo(["copyright"], (value) => { return value == "無版權" || value == "待談版權" ? false : value != "" ? true : null; }),
	 * 
	 * EX: .setSubmitInfo(["itemYears", "neItemYears"], null), if that condition has exclusive condition
	 * 
	 * @param {Array<string>} payloadKeys 預期被提交的那些key，如有剔除條件則會傳入兩個key[條件key, 剔除條件key]
	 * @param {function(string)} submitValueMappingFunction 數值需要轉換的函數
	 * @param {number} specialCaseCondition 特殊案例種類，用來做獨立判斷處理（預設為NONE）
	 * @returns {this}
	 */
	setSubmitInfo(payloadKeys, submitValueMappingFunction, specialCaseCondition = SPECIAL_CASE_CONDITION.NONE) {
		this.payloadKeys = payloadKeys;
		if (submitValueMappingFunction != null) {
			this.submitValueMappingFunction = submitValueMappingFunction;
		}
		this.specialCaseConditionSubmit = specialCaseCondition;
		return this;
	}
	setAutoFillInfo(autoFillValueMappingFunction) {
		this.autoFillValueMappingFunction = autoFillValueMappingFunction;
		return this;
	}
	/**
	 * render the list
	 * @param {HTMLElement} item 如果路徑有需要傳入的參數，則傳入該物件，將會藉由屬性id取回並組回url
	 */
	render(item = null) {
		this.#doRender(item);
	}
	/**
	 * render the list, use for confirming all render task done
	 * 
	 * let promises = [];
	 * promises.push(config.renderPromise(item));
	 * Promise.all(promises).then(() => {
	 * 	Utils.handleInputDisabled(false);
	 * });
	 * @param {HTMLElement} item 如果路徑有需要傳入的參數，則傳入該物件，將會藉由屬性id取回並組回url
	 */
	renderPromise(item = null) {
		return new Promise((resolve, reject) => {
			if (this.renderLevel == RENDER_LEVEL.None) {
				resolve();
				return;
			}
			this.#doRender(item, resolve);
		})
	}
	/**
	 * just render the default metadata to dropdown list
	 */
	renderDefault(resolve = null) {
		if (!this.defaultMetadata || this.renderLevel == RENDER_LEVEL.None) {
			return;
		}
		this.callBackRenderFunction(this.defaultMetadata);
		if (resolve) {
			resolve();
		}
	}
	renderDefaultPromise() {
		return new Promise((resolve, reject) => {
			this.renderDefault(resolve);
		})
	}
	#doRender(item, resolve = null) {
		if (this.renderLevel == RENDER_LEVEL.None) {
			return;
		}
		// if default metadata exist and metadataPath is not defined, render it directly
		if (this.defaultMetadata && this.metadataPath == null) {
			this.callBackRenderFunction(this.defaultMetadata);
			if (resolve) {
				resolve();
			}
			return;
		}

		let requestPath = this.getMetadataPath(item);
		if (requestPath != null && requestPath != "") {
			if (requestPath.includes("=")) {
				let timestamp = "timestamp=" + Date.now().toString();
				requestPath += requestPath.includes("?") ? ("&" + timestamp) : ("?" + timestamp);
			}
			if (this.specialCaseConditionRender == SPECIAL_CASE_CONDITION.METADATA_REQUEST_TARGET) {
				requestSearchResult(requestPath, 'GET', null, true, this.callBackRenderFunction, resolve);
				return;
			}
			requestGetMetadata(requestPath, true, this.callBackRenderFunction, resolve);
		} else if (resolve) {
			resolve();
		}
	}
	/**
	 * suggest to use particularly when metadataPath needs to attach param
	 * @param {HTMLElement} item 
	 */
	getMetadataPath(item = null) {
		// resourceParamFieldValue has priority over queryParamGenerationFunction
		if (this.resourceParamFieldValue) {
			return this.metadataPath + this.resourceParamFieldValue;
		}
		if (this.queryParamGenerationFunction && typeof this.queryParamGenerationFunction == 'function') {
			let queryParam = this.queryParamGenerationFunction(item);
			return this.metadataPath + (queryParam ? queryParam : "");
		}
		return this.metadataPath;
	}
	/**
	 * for all, but bodyOfKnowledge use base querySelector then get attribute value
	 * 
	 * gets value from DropdownComponentMap[enName].input
	 * 
	 * returns 2-dimensional array
	 */
	getSubmitValues(DropdownComponentMap) {
		if (!DropdownComponentMap || !this.payloadKeys || this.payloadKeys.length == 0) {
			return null;
		}

		if (this.specialCaseConditionSubmit == SPECIAL_CASE_CONDITION.SUBMIT_SINGLE_VALUE) {
			return [DropdownComponentMap[this.enName].input.getAttribute(ATTRIBUTE.SUBMIT_TARGET)];
		}

		let values = [];
		if (this.multipleSelectType == MULTISELECT_TYPE.SINGLE) {
			values.push(this.submitValueMappingFunction(DropdownComponentMap[this.enName].input.value));
			if (this.hasExclusiveCondition) {
				values.push(this.submitValueMappingFunction(DropdownComponentMap[IndexUtils.getexclusionName(this.enName)].input.value));
			}
		} else {
			values.push(this.submitValueMappingFunction(DropdownComponentMap[this.enName].getSelectedItemSpanValues()));
			if (this.hasExclusiveCondition) {
				values.push(this.submitValueMappingFunction(DropdownComponentMap[IndexUtils.getexclusionName(this.enName)].getSelectedItemSpanValues()));
			}
		}
		return values;
	}
}