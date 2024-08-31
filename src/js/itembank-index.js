const styleIndex = require('!css-loader!sass-loader!../css/index.scss').default;
const styleMathQuill = require('!css-loader!sass-loader!../css/mathquill.css').default;

import { CONDITION, SPECIAL_CASE_CONDITION, SUBJECT_PREFIX, MULTISELECT_TYPE, RENDER_LEVEL, HAS_EXCLUSION, ATTRIBUTE, REQ_PAYLOAD_DEF, SORT_FIELD, ConditionConfig, IndexUtils } from "./utils/index-util.js";
import { CUSTOM_ELEMENT_NAME_INDEX, SEARCH_STATE, storageKey, storageHelper, requestGetMetadata, requestSearchResult, setShadowRoot, notify, CommonUtils } from "./utils/common-util.js";
import { DropdownComponent, ToggleCheckboxComponent } from "./components/index-component.js";
import { MathQuillKeyboardComponent, MathQuillInputComponent } from "./components/mathquill-component.js";

/**
 * condition list shown in page
 */
const ConditionConfigs = [
	new ConditionConfig().setBasic("關鍵字(聯集)", CONDITION.SearchText, "關鍵字(聯集)", null, "輸入數字、文字、符號、方程式(只能用小鍵盤key)").setDetails(false, false, HAS_EXCLUSION.SearchText, MULTISELECT_TYPE.TYPING, SPECIAL_CASE_CONDITION.INPUT_TYPING_PASS_SPLIT)
		.setRenderInfo(null, null, CONDITION.SearchText, (conditionName) => IndexRenderer.searchText(conditionName), RENDER_LEVEL.Construction)
		.setSubmitInfo(["searchTexts", "neSearchTexts"], null),
	new ConditionConfig().setBasic("關鍵字(交集)", CONDITION.MustSearchText, "關鍵字(交集)", null, "輸入數字、文字、符號、方程式(只能用小鍵盤key)").setDetails(false, false, HAS_EXCLUSION.MustSearchText, MULTISELECT_TYPE.TYPING, SPECIAL_CASE_CONDITION.INPUT_TYPING_PASS_SPLIT)
		.setRenderInfo(null, null, CONDITION.MustSearchText, (conditionName) => IndexRenderer.searchText(conditionName), RENDER_LEVEL.Construction)
		.setSubmitInfo(["mustSearchTexts", "neMustSearchTexts"], null),
	new ConditionConfig().setBasic("科目", CONDITION.Subject, "科目", null).setDetails(true, false, HAS_EXCLUSION.Subject, MULTISELECT_TYPE.SINGLE)
		.setRenderInfo("/api/v1/subject", null, null, (list) => IndexRenderer.subject(list), RENDER_LEVEL.Construction)
		.setSubmitInfo(["subjectId"], null, SPECIAL_CASE_CONDITION.SUBMIT_SINGLE_VALUE),
	new ConditionConfig().setBasic("入學學程", CONDITION.BodyOfKnowledge, "入學學程<br>(須先設定科目)", "例：105").setDetails(true, false, HAS_EXCLUSION.BodyOfKnowledge, MULTISELECT_TYPE.SINGLE)
		.setRenderInfo("/api/v1/body-of-knowledge?subjectid=", (item) => { return item.getAttribute("subject-id"); }, null, (list) => IndexRenderer.bodyOfKnowledge(list), RENDER_LEVEL.Subject)
		.setSubmitInfo(["bodyOfKnowledgeCode"], null, SPECIAL_CASE_CONDITION.SUBMIT_SINGLE_VALUE),
	new ConditionConfig().setBasic("適用學年度", CONDITION.ItemYear, "適用學年度", null, "輸入數字").setDetails(false, false, HAS_EXCLUSION.ItemYear, MULTISELECT_TYPE.DROPDOWN)
		.setRenderInfo(null, null, CommonUtils.getRecentAcademicChYears(3), (list) => IndexRenderer.itemYear(list), RENDER_LEVEL.Construction)
		.setSubmitInfo(["itemYears", "neItemYears"], null),
	new ConditionConfig().setBasic("目錄", CONDITION.Catalog, "目錄<br>(須先設定科目、適用學年度)", "例：00　例：通用　例：105").setDetails(true, false, HAS_EXCLUSION.Catalog, MULTISELECT_TYPE.DROPDOWN)
		.setRenderInfo("/itembank-index-backend/catalog?subjectid=", (item) => { return item.getAttribute("subject-id") + "&years=" + CommonUtils.getRecentAcademicChYears(3).join("&years="); }, null, (list) => IndexRenderer.catalog(list), RENDER_LEVEL.Subject, SPECIAL_CASE_CONDITION.METADATA_REQUEST_TARGET)
		.setSubmitInfo(["catalogIds", "neCatalogIds"], null),
	new ConditionConfig().setBasic("知識向度", CONDITION.Knowledge, "知識向度<br>(須先設定入學學程)", "例：M-1-1　例：m-1-1　例：整數與數線", "輸入名稱或代碼").setDetails(true, false, HAS_EXCLUSION.Knowledge, MULTISELECT_TYPE.DROPDOWN, SPECIAL_CASE_CONDITION.INPUT_DROPDOWN_ALLOW_PASTE)
		.setRenderInfo("/api/v1/dim-value?type=knowledge&dimensionIds=", (item) => { let ids = item.getAttribute("knowledge-id"); return ids ? ids.split(',').join('&dimensionIds=') : "0"; }, null, (list) => { IndexRenderer.knowledge(list); IndexRenderer.discreteKnowledge(list); }, RENDER_LEVEL.BodyOfKnowledge)
		.setSubmitInfo(["knowledgeIds", "neKnowledgeIds"], null),
	new ConditionConfig().setBasic("必出知識向度", CONDITION.DiscreteKnowledge, "必出知識向度<br>(須先設定入學學程)", "例：M-1-1　例：m-1-1　例：整數與數線", "輸入名稱或代碼").setDetails(true, false, HAS_EXCLUSION.DiscreteKnowledge, MULTISELECT_TYPE.DROPDOWN, SPECIAL_CASE_CONDITION.INPUT_DROPDOWN_ALLOW_PASTE)
		.setSubmitInfo(["discreteKnowledgeIds", "neDiscreteKnowledgeIds"], null)
		.setRenderInfo(null, null, null, null, RENDER_LEVEL.BodyOfKnowledge), // no need to pass callBackRenderFunction, it is assigned at knowledge
	new ConditionConfig().setBasic("課名", CONDITION.Lesson, "課名<br>(須先設定入學學程)", "例：C101　例：c101　例：夏夜", "輸入名稱或代碼").setDetails(true, false, HAS_EXCLUSION.Lesson, MULTISELECT_TYPE.DROPDOWN, SPECIAL_CASE_CONDITION.INPUT_DROPDOWN_ALLOW_PASTE)
		.setRenderInfo("/api/v1/dim-value?type=lesson&dimensionIds=", (item) => { let ids = item.getAttribute("lesson-id"); return ids ? ids.split(',').join('&dimensionIds=') : "0"; }, null, (list) => { IndexRenderer.lesson(list); IndexRenderer.discreteLesson(list); }, RENDER_LEVEL.BodyOfKnowledge)
		.setSubmitInfo(["lessonIds", "neLessonIds"], null),
	new ConditionConfig().setBasic("必出課名", CONDITION.DiscreteLesson, "必出課名<br>(須先設定入學學程)", "例：C101　例：c101　例：夏夜", "輸入名稱或代碼").setDetails(true, false, HAS_EXCLUSION.DiscreteLesson, MULTISELECT_TYPE.DROPDOWN, SPECIAL_CASE_CONDITION.INPUT_DROPDOWN_ALLOW_PASTE)
		.setSubmitInfo(["discreteLessonIds", "neDiscreteLessonIds"], null)
		.setRenderInfo(null, null, null, null, RENDER_LEVEL.BodyOfKnowledge), // no need to pass callBackRenderFunction, it is assigned at lesson
	new ConditionConfig().setBasic("出處", CONDITION.PublishSource, "出處<br>(須先設定科目、適用學年度)", "例：試題集錦", "輸入名稱").setDetails(true, false, HAS_EXCLUSION.PublishSource, MULTISELECT_TYPE.DROPDOWN)
		.setRenderInfo("/itembank-index-backend/metadata/source?subjectid=", (item) => { return item.getAttribute("subject-id") + "&years=" + CommonUtils.getRecentAcademicChYears(3).join("&years="); }, null, (list) => IndexRenderer.publishSource(list), RENDER_LEVEL.Subject, SPECIAL_CASE_CONDITION.METADATA_REQUEST_TARGET)
		.setSubmitInfo(["publishSources", "nePublishSources"], null),
	new ConditionConfig().setBasic("題型", CONDITION.UserType, "題型<br>(須先設定科目、適用學年度)", "例：閱讀測驗　例：會考特色題", "輸入名稱").setDetails(true, true, HAS_EXCLUSION.UserType, MULTISELECT_TYPE.DROPDOWN)
		.setRenderInfo("/itembank-index-backend/metadata/usertype?subjectid=", (item) => { return item.getAttribute("subject-id") + "&years=" + CommonUtils.getRecentAcademicChYears(3).join("&years="); }, null, (list) => IndexRenderer.userType(list), RENDER_LEVEL.Subject, SPECIAL_CASE_CONDITION.METADATA_REQUEST_TARGET)
		// .setRenderInfo("/api/v1/custom-metadata-value?metadataId=", null, null, (list) => IndexRenderer.userType(list), RENDER_LEVEL.Construction)
		.setSubmitInfo(["userTypes", "neUserTypes"], null),
	new ConditionConfig().setBasic("編輯備註", CONDITION.EditorRemark, "編輯備註", null, "輸入文字").setDetails(false, false, HAS_EXCLUSION.EditorRemark, MULTISELECT_TYPE.TYPING, SPECIAL_CASE_CONDITION.INPUT_TYPING_PASS_SPLIT)
		.setSubmitInfo(["editorRemarks", "neEditorRemarks"], null),
	new ConditionConfig().setBasic("題目ID", CONDITION.Id, "題目id", "例：58b6bc1c8fe0c28b14d744d0", "輸入id").setDetails(false, true, HAS_EXCLUSION.Id, MULTISELECT_TYPE.TYPING)
		.setSubmitInfo(["ids", "neIds"], null),
	new ConditionConfig().setBasic("線上測驗上下架狀態", CONDITION.ProductStatus, "線上測驗上下架狀態", null, "").setDetails(false, true, HAS_EXCLUSION.ProductStatus, MULTISELECT_TYPE.SINGLE)
		.setRenderInfo(null, null, ["都包含", "上架", "下架"], (list) => IndexRenderer.productStatus(list), RENDER_LEVEL.Construction)
		.setSubmitInfo(["productStatus"], (value) => { return value == "上架" ? REQ_PAYLOAD_DEF.onShelfProductStatus : value == "下架" ? REQ_PAYLOAD_DEF.offShelfProductStatus : null; })
		.setAutoFillInfo((value) => { return value == REQ_PAYLOAD_DEF.onShelfProductStatus ? "上架" : value == REQ_PAYLOAD_DEF.offShelfProductStatus ? "下架" : "都包含"; }),
	new ConditionConfig().setBasic("五欄資料夾id", CONDITION.DocumentRepositoryId, "五欄資料夾id(repo id)", "例：19142", "輸入id").setDetails(false, true, HAS_EXCLUSION.DocumentRepositoryId, MULTISELECT_TYPE.TYPING)
		.setSubmitInfo(["documentRepositoryIds", "neDocumentRepositoryIds"], null),
	new ConditionConfig().setBasic("五欄檔案id", CONDITION.DocumentId, "五欄檔案id(document id)", "例：19142", "輸入id").setDetails(false, true, HAS_EXCLUSION.DocumentId, MULTISELECT_TYPE.TYPING)
		.setSubmitInfo(["documentIds", "neDocumentIds"], null),
	new ConditionConfig().setBasic("題組", CONDITION.IsSet, "題組", null, "").setDetails(false, true, HAS_EXCLUSION.IsSet, MULTISELECT_TYPE.SINGLE)
		.setRenderInfo(null, null, ["不分", "是", "否"], (list) => IndexRenderer.isSet(list), RENDER_LEVEL.Construction)
		.setSubmitInfo(["isSet"], (value) => { return value == "是" ? true : value == "否" ? false : null; })
		.setAutoFillInfo((value) => { return value == true ? "是" : value == false ? "否" : "不分"; }),
	new ConditionConfig().setBasic("版權", CONDITION.Copyright, "版權", null, "").setDetails(false, true, HAS_EXCLUSION.Copyright, MULTISELECT_TYPE.SINGLE)
		.setRenderInfo(null, null, ["都包含", "0：無版權", "1：有版權限制", "2：版權是翰教科", "3：待談版權"], (list) => IndexRenderer.copyright(list), RENDER_LEVEL.Construction)
		.setSubmitInfo(["copyright"], (value) => { return !value || value == "都包含" ? null : value.substring(0, 1); })
		.setAutoFillInfo((value) => { return value ? `${value}：` + ["無版權", "有版權限制", "版權是翰教科", "待談版權"][value] : "都包含"; }),
	new ConditionConfig().setBasic("素養題", CONDITION.IsLiteracy, "素養題", null, "").setDetails(false, true, HAS_EXCLUSION.IsLiteracy, MULTISELECT_TYPE.SINGLE)
		.setRenderInfo(null, null, ["不分", "是", "否"], (list) => IndexRenderer.isLiteracy(list), RENDER_LEVEL.Construction)
		.setSubmitInfo(["isLiteracy"], (value) => { return value == "是" ? true : value == "否" ? false : null; })
		.setAutoFillInfo((value) => { return value == true ? "是" : value == false ? "否" : "不分"; }),
	new ConditionConfig().setBasic("議題", CONDITION.Topic, "議題", null, "").setDetails(false, true, HAS_EXCLUSION.Topic, MULTISELECT_TYPE.DROPDOWN)
		.setRenderInfo(null, null, ["性別平等", "人權", "環境", "海洋", "品德", "生命", "法治", "科技", "資訊", "能源", "安全", "防災", "家庭教育", "生涯規劃", "多元文化", "閱讀素養", "戶外教育", "國際教育", "原住民教育"], (list) => IndexRenderer.topic(list), RENDER_LEVEL.Construction)
		.setSubmitInfo(["topics"], null),
	new ConditionConfig().setBasic("作答方式", CONDITION.AnsweringMethod, "作答方式", null, "").setDetails(false, true, HAS_EXCLUSION.AnsweringMethod, MULTISELECT_TYPE.DROPDOWN)
		.setRenderInfo(null, null, ["單一選擇題", "多重選擇題", "是非題", "填充題", "問答題", "手寫題", "選填題"], (list) => IndexRenderer.answeringMethod(list), RENDER_LEVEL.Construction)
		.setSubmitInfo(["answeringMethods", "neAnsweringMethods"], null),
	new ConditionConfig().setBasic("解析", CONDITION.HasSolution, "解析", null, "").setDetails(false, true, HAS_EXCLUSION.HasSolution, MULTISELECT_TYPE.SINGLE)
		.setRenderInfo(null, null, ["都包含", "有", "無"], (list) => IndexRenderer.hasSolution(list), RENDER_LEVEL.Construction)
		.setSubmitInfo(["hasSolution"], (value) => { return value == "有" ? true : value == "無" ? false : null; })
		.setAutoFillInfo((value) => { return value == true ? "有" : value == false ? "無" : "都包含"; }),
	new ConditionConfig().setBasic("解題影片", CONDITION.HasVideoUrl, "解題影片", null, "").setDetails(false, true, HAS_EXCLUSION.HasVideoUrl, MULTISELECT_TYPE.SINGLE)
		.setRenderInfo(null, null, ["都包含", "有", "無"], (list) => IndexRenderer.hasVideoUrl(list), RENDER_LEVEL.Construction)
		.setSubmitInfo(["hasVideoUrls"], (value) => { return value == "有" ? true : value == "無" ? false : null; })
		.setAutoFillInfo((value) => { return value == true ? "有" : value == false ? "無" : "都包含"; }),
];

let ConfigIndexMap = {};
/**
 * use IndexFormHelper.getAlwaysEnabledConditions() to get value
 */
let AlwaysEnabledConditions = [];
ConditionConfigs.forEach((config, index) => {
	ConfigIndexMap[config.enName] = index;
	if (!config.disabled) {
		AlwaysEnabledConditions.push(config.enName);
		if (config.hasExclusiveCondition) {
			AlwaysEnabledConditions.push(IndexUtils.getexclusionName(config.enName));
		}
	}
});
const MQKeyboardComponent = new MathQuillKeyboardComponent();
IndexUtils.draggableElement(MQKeyboardComponent.mathQuillKeyboard, MQKeyboardComponent.mathQuillKeyboardHeader);

let DropdownComponentMap = {};

class ItembankIndexForm extends HTMLElement {
	hasRendered = false;
	searchId = "";
	onStateChange = () => {
		// do something...
	}

	constructor(param = { searchId: "", onStateChangeCallback: () => { } }) {
		super();
		indexInstance = this;
		this.searchId = window.itembanksearch.searchId ? window.itembanksearch.searchId : param.searchId;
		this.onStateChange = window.itembanksearch.onStateChange ? window.itembanksearch.onStateChange : param.onStateChangeCallback;

		window.itembanksearch.searchId = null;
		window.itembanksearch.onStateChange = null;

		const shadow = this.attachShadow({ mode: 'closed' });
		setShadowRoot(shadow);
		storageHelper.resetConfig();

		shadow.appendChild(MQKeyboardComponent.mathQuillKeyboard);

		const style = document.createElement('style');
		style.textContent = styleIndex;
		shadow.appendChild(style);

		const style2 = document.createElement('style');
		style2.textContent = styleMathQuill;
		shadow.appendChild(style2);

		// <h3 ng-show="!titleName" class="ng-scope">試題搜尋</h3>
		const h3 = document.createElement('h3');
		h3.innerHTML = '試題搜尋';
		shadow.appendChild(h3);

		// <p class="text-danger ng-scope">
		//   註：◎填入資料後，請按「enter」鍵。◎每個設定項目只跟資訊總碼關聯，與其他項目都不相關、不連動。◎沒有設定的項目，將列出全部題目。◎如果篩選與剔除的項目矛盾時，以剔除項目為優先條件。◎選單一次最多出現150筆，盡量key入必要關鍵字查詢。
		// </p>
		const p = document.createElement('p');
		p.classList.add('text-danger');
		p.innerHTML = `註：◎填入資料後，請按「enter」鍵。◎沒有設定的項目，將列出全部題目。◎如果篩選與剔除的項目矛盾時，以剔除項目為優先條件。`
		shadow.appendChild(p);

		// Create the table element
		const table = document.createElement('table');
		table.classList.add('table', 'table-bordered', 'table-striped', 'search-table');

		// Create the table header
		const thead = table.createTHead();
		const headerRow = thead.insertRow();
		const headers = [
			{ "name": "顯示進階設定>>", "class": "th-title" },
			{ "name": "篩選", "class": "th-search" },
			{ "name": "剔除", "class": "th-search" },
		];
		// 進階設定按鈕&style
		let styleHideAdvanced = document.createElement('style');
		styleHideAdvanced.innerHTML = `
    th:nth-child(3), td:nth-child(3), .advanced-setting { display: none }
    .th-title { width: 20%; text-align:center; }
    .th-search { width: 80%; text-align:center; }`;
		let styleShowAdvanced = document.createElement('style');
		styleShowAdvanced.innerHTML = `
    .th-title { width: 20%; text-align:center; }
    .th-search { width: 40%; text-align:center; }`;
		shadow.appendChild(styleHideAdvanced);

		let th = document.createElement('th');
		th.classList.add(headers[0].class);
		const a = document.createElement('a');
		a.addEventListener('click', (event) => {
			if (event.target.textContent == headers[0].name) {
				event.target.textContent = "隱藏進階設定<<";
				shadow.removeChild(styleHideAdvanced);
				shadow.appendChild(styleShowAdvanced);
			} else {
				event.target.textContent = headers[0].name;
				shadow.removeChild(styleShowAdvanced);
				shadow.appendChild(styleHideAdvanced);
			}
		})
		a.textContent = headers[0].name;
		th.appendChild(a);
		headerRow.appendChild(th);
		if (this.searchId) {
			a.click();
		}
		// base conditions
		th = document.createElement('th');
		th.classList.add(headers[1].class);
		let text = document.createTextNode(headers[1].name);
		th.appendChild(text);
		headerRow.appendChild(th);
		// exclusive conditions
		th = document.createElement('th');
		th.classList.add(headers[2].class);
		text = document.createTextNode(headers[2].name);
		th.appendChild(text);
		headerRow.appendChild(th);

		// Create the table body
		const tbody = table.createTBody();
		const emptyTextNode = document.createTextNode("");

		ConditionConfigs.forEach(config => {
			let row = tbody.insertRow();
			if (config.isAdvanced) {
				row.classList.add('advanced-setting');
			}
			// condition name
			let cell = row.insertCell();
			let span = document.createElement('span');
			span.innerHTML = config.title;
			cell.appendChild(span);
			// base conditions
			cell = row.insertCell();
			let dropdown = new DropdownComponent(config);
			DropdownComponentMap[dropdown.name] = dropdown;
			cell.appendChild(dropdown.container);
			// exclusive conditions
			cell = row.insertCell();
			if (config.hasExclusiveCondition) {
				let dropdown = new DropdownComponent(config);
				DropdownComponentMap[dropdown.exclusionName] = dropdown;
				cell.appendChild(dropdown.container);
			} else {
				cell.appendChild(emptyTextNode);
			}
		});

		// Create a row as the table footer
		let row = tbody.insertRow();
		let td = row.insertCell();
		td.colSpan = 3;
		let btnSubmit = document.createElement('button');
		btnSubmit.type = 'button';
		btnSubmit.classList.add('btn', 'btn-default');
		btnSubmit.addEventListener('click', () => {
			IndexFormHelper.submit();
		});
		btnSubmit.textContent = '確認';
		td.appendChild(btnSubmit);
		let btnClear = document.createElement('button');
		btnClear.type = 'button';
		btnClear.classList.add('btn', 'btn-danger');
		btnClear.addEventListener('click', () => {
			IndexFormHelper.resetAllInputs();
			// let baseUrl = window.location.href.split('?')[0];
			// window.history.replaceState({}, document.title, baseUrl);
		});
		btnClear.textContent = '清除';
		td.appendChild(btnClear);
		// Attach the created elements to the shadow dom
		shadow.appendChild(table);
		shadow.appendChild(notify.getInstance());

		IndexFormHelper.handleAllInputsDisabled();
	}

	// after base elements created by constructor, then render data or create child elements into them
	connectedCallback() {
		if (this.hasRendered) {
			return;
		}
		this.hasRendered = true;

		// get all resources, first get resource params to complete some API url
		let promises = [];
		ConditionConfigs.forEach(config => {
			if (config.shouldGetResourceParam) {
				promises.push(config.getResourceParamPromise());
			}
		})
		Promise.all(promises).then(() => {
			// render all elements that belongs to Construction stage,
			// or the condition has default metadata to render
			let promises = [];
			ConditionConfigs.forEach(config => {
				if (config.renderLevel == RENDER_LEVEL.Construction) {
					promises.push(config.renderPromise());
				} else if (config.specialCaseConditionRender == SPECIAL_CASE_CONDITION.RENDER_DEFAULT) {
					promises.push(config.renderDefaultPromise());
				}
				IndexFormHelper.applyDefault(config);
			})

			// if searchId exist then get search result then do auto fill
			if (this.searchId) {
				let indexPromise = new Promise((resolve, reject) => {
					requestSearchResult(`/itembank-index-backend/item/index?recordId=${this.searchId}`, 'GET', null, true, function (conditionPayload) {
						if (conditionPayload) {
							storageHelper.setItem(storageKey.requestPayload, conditionPayload);
						}
					}, resolve);
				})
				promises.push(indexPromise);
			}
			Promise.all(promises).then(() => {
				IndexFormHelper.autoFill([RENDER_LEVEL.Construction, RENDER_LEVEL.File, RENDER_LEVEL.None, RENDER_LEVEL.Others]);
			});
		});
	}
}

/**
 * depends on global variables
 */
const IndexFormHelper = {
	getAlwaysEnabledConditions: () => {
		return structuredClone(AlwaysEnabledConditions);
	},
	appendAllExclusiveConditionNames: (conditionNames) => {
		conditionNames.forEach(key => {
			if (ConditionConfigs[ConfigIndexMap[key]].hasExclusiveCondition) {
				conditionNames.push(IndexUtils.getexclusionName(key));
			}
		});
		return conditionNames;
	},
	invalidSubmitValue: () => {
		// no need to check the conditions
		return false;
	},
	submit: () => {
		if (IndexFormHelper.invalidSubmitValue()) {
			notify.show('請選擇科目、入學學程、適用學年度 或 輸入搜尋關鍵字。');
			return;
		}
		let payload = { "pageNumber": 1, "pageSize": 50, "ascending": false, "sortField": SORT_FIELD.UpdatedOn, "neLabelNames": ["Deleted"] };

		ConditionConfigs.forEach(config => {
			if (!config.payloadKeys) {
				return;
			}
			let values = config.getSubmitValues(DropdownComponentMap);
			config.payloadKeys.forEach((key, idx) => {
				payload[key] = values[idx];
			});
		});

		if (payload.ids && payload.ids.length > 0) {
			payload.sortField = SORT_FIELD.InputId;
		}

		requestSearchResult('/itembank-index-backend/item/index', 'POST', payload, true, function (data) {
			let event = {
				state: SEARCH_STATE.SUBMIT,
				searchId: data
			};
			indexInstance.onStateChange(event);
		});
	},
	applyDefault: (config) => {
		if (config.defaultMetadata) {
			let dropdownItems = DropdownComponentMap[config.enName].getDropdownItems();

			for (let i = 0; i < dropdownItems.length; i++) {
				let dropdownItem = dropdownItems[i];
				let value = dropdownItem.getAttribute(ATTRIBUTE.VALUE_OPTION);
				if (IndexUtils.defaultDropdownValueList.includes(value)) {
					dropdownItem.dispatchEvent(new Event('mousedown', {
						bubbles: true,
						cancelable: true,
						view: window
					}));
					return;
				}
			}
		}
	},
	/**
	 * autoFill reloads the conditions from previous search, renders those conditions that their renderLevel is in renderLevelList
	 */
	autoFill: (renderLevelList) => {
		let payload = storageHelper.getItem(storageKey.requestPayload);
		if (payload == null) {
			return;
		}
		let autoFillDoneMap = storageHelper.getItem(storageKey.autoFillDoneMap);
		if (!autoFillDoneMap) {
			autoFillDoneMap = {};
		}
		ConditionConfigs.forEach(config => {
			if (!renderLevelList.includes(config.renderLevel) && config.specialCaseConditionRender != SPECIAL_CASE_CONDITION.RENDER_DEFAULT) {
				return;
			}
			if (autoFillDoneMap[config.enName]) {
				return;
			}
			autoFillDoneMap[config.enName] = true;
			storageHelper.setItem(storageKey.autoFillDoneMap, autoFillDoneMap);

			let i = 0;
			config.payloadKeys.forEach(key => {
				i++;
				let condition = payload[key];
				if (condition == null || Array.isArray(condition) && condition.length == 0) {
					return;
				}
				let conditionName = i > 1 ? IndexUtils.getexclusionName(config.enName) : config.enName;
				let dropdown = DropdownComponentMap[conditionName];
				let dropdownItems = dropdown.getDropdownItems();

				if (config.multipleSelectType != MULTISELECT_TYPE.TYPING) {
					if (Array.isArray(condition)) {
						condition.forEach(conditionItem => {
							let conditionValue = config.autoFillValueMappingFunction(conditionItem);

							for (let i = 0; i < dropdownItems.length; i++) {
								let dropdownItem = dropdownItems[i];
								let value = dropdownItem.getAttribute(ATTRIBUTE.VALUE_OPTION);
								if (value == conditionValue) {
									dropdownItem.dispatchEvent(new Event('mousedown', {
										bubbles: true,
										cancelable: true,
										view: window
									}));
									break;
								}
							}
						})
						return;
					} else {
						let conditionValue = config.autoFillValueMappingFunction(condition);

						for (let i = 0; i < dropdownItems.length; i++) {
							let dropdownItem = dropdownItems[i];
							let value = dropdownItem.getAttribute(ATTRIBUTE.VALUE_OPTION);
							if (value == conditionValue) {
								dropdownItem.dispatchEvent(new Event('mousedown', {
									bubbles: true,
									cancelable: true,
									view: window
								}));
								return;
							}
						}
					}
				} else {
					var event = new KeyboardEvent('keydown', {
						key: 'Enter',
						code: 'Enter',
						keyCode: 13,
						charCode: 13,
						which: 13,
						shiftKey: false,
						ctrlKey: false,
						metaKey: false,
						altKey: false,
						bubbles: true,
						cancelable: true
					});
					let input = dropdown.getInputBox();

					if (Array.isArray(condition)) {
						condition.forEach(conditionItem => {
							input.value = conditionItem;
							input.dispatchEvent(event);
						})
					} else {
						input.value = condition;
						input.dispatchEvent(event);
					}
					input.value = "";
				}
			});
		});
	},
	resetAllInputs: () => {
		let enabledList = IndexFormHelper.getAlwaysEnabledConditions().concat(CONDITION.Subject);

		for (let key in DropdownComponentMap) {
			let dropdownComponent = DropdownComponentMap[key];
			let input = dropdownComponent.input;

			// skip those conditions that are always enabled
			if (enabledList.includes(key)) {
				IndexFormHelper.inputEnabled(input);
			} else {
				IndexFormHelper.inputDisabled(input);
			}

			if (dropdownComponent.multipleSelectType == MULTISELECT_TYPE.SINGLE) {
				input.value = "";
				input.removeAttribute(ATTRIBUTE.SUBMIT_TARGET);
				continue;
			}

			dropdownComponent.getSpanList().forEach(span => {
				span.remove();
			})
		}

		ConditionConfigs.forEach(config => {
			IndexFormHelper.applyDefault(config);
		})
	},
	inputEnabled: (input) => {
		input.disabled = false;
		input.classList.remove('input-disabled');
	},
	inputDisabled: (input) => {
		input.disabled = true;
		input.classList.add('input-disabled');
	},
	/**
	 * @param {list} enabledList condition names
	 */
	handleInputsEnabled: (enabledList) => {
		enabledList.forEach(key => {
			let input = DropdownComponentMap[key].input;
			IndexFormHelper.inputEnabled(input);
		})
	},
	handleAllInputsEnabled: () => {
		for (let key in DropdownComponentMap) {
			let input = DropdownComponentMap[key].input;
			IndexFormHelper.inputEnabled(input);
		}
	},
	/**
	 * @param {list} enabledList condition names
	 */
	handleInputsDisabledReverse: (enabledList) => {
		for (let key in DropdownComponentMap) {
			let dropdownComponent = DropdownComponentMap[key];
			let input = dropdownComponent.input;

			// skip those conditions that are always enabled
			if (enabledList.includes(key)) {
				IndexFormHelper.inputEnabled(input);
				continue;
			}

			IndexFormHelper.inputDisabled(input);

			if (dropdownComponent.multipleSelectType == MULTISELECT_TYPE.SINGLE) {
				input.value = "";
				input.removeAttribute(ATTRIBUTE.SUBMIT_TARGET);
				return;
			}

			dropdownComponent.getSpanList().forEach(span => {
				span.remove();
			})
		}
	},
	/**
	 * @param {list} disabledList condition names
	 */
	handleInputsDisabled: (disabledList) => {
		disabledList.forEach(key => {
			let dropdownComponent = DropdownComponentMap[key];
			let input = dropdownComponent.input;
			IndexFormHelper.inputDisabled(input);

			if (dropdownComponent.multipleSelectType == MULTISELECT_TYPE.SINGLE) {
				input.value = "";
				input.removeAttribute(ATTRIBUTE.SUBMIT_TARGET);
				return;
			}

			dropdownComponent.getSpanList().forEach(span => {
				span.remove();
			})
		})
	},
	handleAllInputsDisabled: () => {
		IndexFormHelper.handleInputsDisabledReverse(IndexFormHelper.getAlwaysEnabledConditions());
	}
}

/**
 * Load input component for those condition inputs that have dropdown list
 * needs to be rendered by the data from server, first render elements and then bind events
 */
const IndexRenderer = {
	searchText: (conditionName) => {
		let createToggleBtn = (_id, _component) => {
			let mathQuillInputComponent = new MathQuillInputComponent(MQKeyboardComponent, _id, _component);
			let toggleCheckboxComponent = new ToggleCheckboxComponent("使用方程式", _id, (event) => {
				if (event.target.checked) {
					mathQuillInputComponent.mathFieldSpan.style.display = null;
					_component.input.style.display = "none";
				} else {
					mathQuillInputComponent.mathFieldSpan.style.display = "none";
					_component.input.style.display = null;
					// mathQuillComponent.mathField.clearSelection();
				}
			});

			_component.insertElementBeforeInput(toggleCheckboxComponent.titleSpan);
			_component.insertElementBeforeInput(toggleCheckboxComponent.toggle);
			_component.insertElementAfterInput(mathQuillInputComponent.mathQuillInput);
		};

		let component = DropdownComponentMap[conditionName];
		createToggleBtn(component.name, component);

		if (component.exclusionName) {
			let exclusionComponent = DropdownComponentMap[component.exclusionName];
			createToggleBtn(component.exclusionName, exclusionComponent);
		}
	},
	subject: (list) => {
		let html = '';
		let subjectId = '';
		let subjectMap = {};
		list.forEach(item => {
			subjectId = item.education + '-' + item.standardSubjectCode;
			subjectMap[subjectId] = item.name;
			html += `<div class="dropdown-item" subject-id="${subjectId}" ch-name="${item.name}" ${ATTRIBUTE.VALUE_OPTION}="${subjectId}"><span class="label label-info">${subjectId}</span><span> </span><span class="span-info">${item.name}</span></div>`;
		})
		MQKeyboardComponent.generateFilterOptions(subjectMap);

		let component = DropdownComponentMap[CONDITION.Subject];
		let searchInput = component.input;
		let dropdownList = component.dropdownList;
		dropdownList.innerHTML = html;
		let dropdownItems = component.getDropdownItems();
		// Show dropdown when input is focused
		searchInput.addEventListener('focus', () => {
			dropdownList.style.display = 'block';
		});
		let prevSelected = "";
		searchInput.addEventListener('focusout', (event) => {
			if (event.target.value != "") {
				event.target.value = prevSelected;
			} else {
				searchInput.removeAttribute('subject-id');
				searchInput.removeAttribute(ATTRIBUTE.SUBMIT_TARGET);
				let conditionNames = IndexFormHelper.appendAllExclusiveConditionNames(IndexUtils.subjectControlItems());
				IndexFormHelper.handleInputsDisabled(conditionNames);
			}
			dropdownList.style.display = 'none';
		});
		searchInput.addEventListener('input', (event) => {
			// event.target.removeAttribute('subject-id');
			dropdownItems.forEach(item => {
				if (!item.textContent.includes(event.target.value)) {
					item.style.display = 'none';
				} else {
					item.style.display = null;
				}
			})
		});
		// Handle item click, it will change the konwledge code dropdown list at the same time
		dropdownItems.forEach(item => {
			item.addEventListener('mousedown', () => {
				let conditionNames = IndexFormHelper.appendAllExclusiveConditionNames(IndexUtils.subjectControlItems());
				// conditionNames.splice(conditionNames.indexOf(CONDITION.BodyOfKnowledge), 1);
				IndexFormHelper.handleInputsDisabled(conditionNames);

				prevSelected = searchInput.value = item.getAttribute('ch-name');
				let val = item.getAttribute('subject-id');
				MQKeyboardComponent.render(val);
				searchInput.setAttribute('subject-id', val);
				searchInput.setAttribute(ATTRIBUTE.SUBMIT_TARGET, val);
				dropdownList.style.display = 'none';

				let promises = [];
				ConditionConfigs.forEach(config => {
					if (config.renderLevel == RENDER_LEVEL.Subject) {
						promises.push(config.renderPromise(item));
					}
				})

				Promise.all(promises).then(() => {
					IndexFormHelper.handleInputsEnabled([CONDITION.BodyOfKnowledge]);
					IndexFormHelper.autoFill([RENDER_LEVEL.Subject]);

					// just for firing observer callback in the itemYear
					let span = document.createElement('span');
					component.container.appendChild(span);
					component.container.removeChild(span);
				});
			});
		});

		IndexFormHelper.inputEnabled(searchInput);
	},
	bodyOfKnowledge: (list) => {
		let html = '';
		let arr = Array.from(list).sort((a, b) => b.initiationYear - a.initiationYear);
		let searchInputSubject = DropdownComponentMap[CONDITION.Subject].input;
		let subjectId = searchInputSubject.getAttribute('subject-id');
		arr.forEach(item => {
			if (item.subjectId != subjectId) {
				return;
			}
			let nowChYear = CommonUtils.getNowAcademicChYear();
			let yearLimit = item.subjectId.startsWith(SUBJECT_PREFIX.Elementary) ? 6 : 3;
			if (item.initiationYear <= nowChYear - yearLimit || item.initiationYear > nowChYear || !item.name.includes("入學學程")) {
				return;
			}
			// custom attributes
			let knowledgeIds = [];
			let lessonIds = [];
			let recognitionIds = [];
			if (item.composition != null && item.composition.length > 0) {
				item.composition.forEach(composition => {
					if (composition.type == "knowledge") {
						knowledgeIds.push(composition.id);
					} else if (composition.type == "lesson") {
						lessonIds.push(composition.id);
					} else if (composition.type == "recognition") {
						recognitionIds.push(composition.id);
					}
				})
			}
			// default hide
			let customAttribute = `subject-id="${item.subjectId}" body-of-knowledge-id="${item.id}" knowledge-id="${knowledgeIds.join(',')}" lesson-id="${lessonIds.join(',')}" recognition-id="${recognitionIds.join(',')}" 
				${ATTRIBUTE.VALUE_OPTION}="${item.code}"`;
			html += `<div class="dropdown-item" ${customAttribute}><span class="span-info">${item.name}</span></div>`;
		})

		// 無學程
		let bodyOfKnowledgeIdsStr = "null"; // bodyOfKnowledgeIds.join('&bodyOfKnowledgeIds=');
		let customAttribute = `subject-id="null" body-of-knowledge-id="${bodyOfKnowledgeIdsStr}" knowledge-id="-1" lesson-id="-1" recognition-id="-1"
		${ATTRIBUTE.VALUE_OPTION}="${REQ_PAYLOAD_DEF.nullBodyOfKnowledgeCode}"`;
		html += `<div class="dropdown-item" ${customAttribute}><span class="span-info">無學程</span></div>`;

		let component = DropdownComponentMap[CONDITION.BodyOfKnowledge];
		let searchInput = component.input;
		let dropdownList = component.dropdownList;
		dropdownList.innerHTML = html;
		let dropdownItems = component.getDropdownItems();
		let conditionNames = IndexFormHelper.appendAllExclusiveConditionNames(IndexUtils.bodyOfKnowledgeCodeControlItems());
		// Show dropdown when input is focused
		searchInput.addEventListener('focus', (event) => {
			dropdownList.style.display = 'block';
		});
		let prevSelected = "";
		searchInput.addEventListener('focusout', (event) => {
			if (event.target.value != "") {
				event.target.value = prevSelected;
			} else {
				searchInput.removeAttribute(ATTRIBUTE.SUBMIT_TARGET);
				IndexFormHelper.handleInputsDisabled(conditionNames);
			}
			dropdownList.style.display = 'none';
		});
		searchInput.addEventListener('input', (event) => {
			let subjectId = searchInputSubject.getAttribute('subject-id');
			dropdownItems.forEach(item => {
				if (!item.textContent.includes(event.target.value)) {
					item.style.display = 'none';
				} else {
					item.style.display = null;
				}
			})
		});
		// Handle item click
		dropdownItems.forEach(item => {
			item.addEventListener('mousedown', () => {
				let selectedContent = item.textContent;
				if (prevSelected === selectedContent && searchInput.value != "") {
					return;
				}
				IndexFormHelper.handleInputsDisabled(conditionNames);
				dropdownList.style.display = 'none';
				prevSelected = selectedContent;

				setTimeout(() => {
					searchInput.value = selectedContent;
					// set custom attributes
					searchInput.setAttribute('submit-value', item.getAttribute(ATTRIBUTE.VALUE_OPTION));
				}, 0);

				let promises = [];
				ConditionConfigs.forEach(config => {
					if (config.renderLevel == RENDER_LEVEL.BodyOfKnowledge) {
						promises.push(config.renderPromise(item));
					}
				})

				Promise.all(promises).then(() => {
					IndexFormHelper.handleInputsEnabled(conditionNames);
					IndexFormHelper.autoFill([RENDER_LEVEL.BodyOfKnowledge]);
				});
			});
		});

		// IndexFormHelper.inputEnabled(searchInput);
	},
	itemYear: (list) => {
		let arr = Array.from(list);
		arr.sort((a, b) => b - a);

		let html = '';
		arr.forEach(item => {
			html += IndexRenderer.dropdownItemHtml(item, item);
		})
		IndexRenderer.multipleSelectDropdown(CONDITION.ItemYear, html);

		let component = DropdownComponentMap[CONDITION.ItemYear];
		// handle corresponding input elements that should be enabled
		let componentSubject = DropdownComponentMap[CONDITION.Subject];
		let conditionNames = IndexFormHelper.appendAllExclusiveConditionNames(IndexUtils.itemYearsControlItems());
		let mutationCallback = (componentSubject, component, component2) => {
			if (component2) {
				return (mutationsList) => {
					for (const mutation of mutationsList) {
						if (mutation.type === 'childList') {
							let choosenItems = component.getInnerSpanList();
							let choosenItems2 = component2.getInnerSpanList();
							if ((choosenItems.length > 0 || choosenItems2.length > 0) && componentSubject.input.value != null && componentSubject.input.value != "") {
								IndexFormHelper.handleInputsEnabled(conditionNames);
							} else {
								IndexFormHelper.handleInputsDisabled(conditionNames);
							}
						}
					}
				}
			}
			return (mutationsList) => {
				for (const mutation of mutationsList) {
					if (mutation.type === 'childList') {
						let choosenItems = component.getInnerSpanList();
						if ((choosenItems.length > 0) && componentSubject.input.value != null && componentSubject.input.value != "") {
							IndexFormHelper.handleInputsEnabled(conditionNames);
						} else {
							IndexFormHelper.handleInputsDisabled(conditionNames);
						}
					}
				}
			}
		};

		if (HAS_EXCLUSION.ItemYear) {
			let exclusionName = IndexUtils.getexclusionName(CONDITION.ItemYear);
			IndexRenderer.multipleSelectDropdown(exclusionName, html);

			let component2 = DropdownComponentMap[exclusionName];
			const observer = new MutationObserver(mutationCallback(componentSubject, component, component2));
			observer.observe(component.container, { childList: true });
			observer.observe(component2.container, { childList: true });
			observer.observe(componentSubject.container, { childList: true });
		} else {
			const observer = new MutationObserver(mutationCallback(componentSubject, component));
			observer.observe(component.container, { childList: true });
			observer.observe(componentSubject.container, { childList: true });
		}
	},
	product: (data) => {
		let html = '';
		data.collection.forEach(item => {
			html += IndexRenderer.dropdownItemHtml(item.code, `${item.code} ${item.name}`);
		})
		IndexRenderer.multipleSelectDropdown(CONDITION.Product, html);

		if (HAS_EXCLUSION.Product) {
			IndexRenderer.multipleSelectDropdown(IndexUtils.getexclusionName(CONDITION.Product), html);
		}
	},
	catalog: (list) => {
		let html = '';
		list.forEach(item => {
			html += IndexRenderer.dropdownItemHtml(item.id, item.name, item.year);
		})
		IndexRenderer.multipleSelectDropdown(CONDITION.Catalog, html);

		let conditionNames = [CONDITION.Catalog];
		if (HAS_EXCLUSION.Catalog) {
			conditionNames.push(IndexUtils.getexclusionName(CONDITION.Catalog));
			IndexRenderer.multipleSelectDropdown(IndexUtils.getexclusionName(CONDITION.Catalog), html);
		}

		// source's list filter by the choosen itemYear
		conditionNames.forEach(name => {
			let component = DropdownComponentMap[name];
			let searchInput = component.input;
			let dropdownItems = component.getDropdownItems();

			IndexRenderer.addEventListenerFilterByYear(searchInput, dropdownItems);
		})
	},
	publishSource: (list) => {
		let html = '';
		list.forEach(item => {
			html += IndexRenderer.dropdownItemHtml(item.name, item.name, item.year);
		})
		IndexRenderer.multipleSelectDropdown(CONDITION.PublishSource, html);

		let conditionNames = [CONDITION.PublishSource];
		if (HAS_EXCLUSION.PublishSource) {
			conditionNames.push(IndexUtils.getexclusionName(CONDITION.PublishSource));
			IndexRenderer.multipleSelectDropdown(IndexUtils.getexclusionName(CONDITION.PublishSource), html);
		}

		// source's list filter by the choosen itemYear
		conditionNames.forEach(name => {
			let component = DropdownComponentMap[name];
			let searchInput = component.input;
			let dropdownItems = component.getDropdownItems();

			IndexRenderer.addEventListenerFilterByYear(searchInput, dropdownItems);
		})
	},
	version: (list) => {
		let html = '';
		list.forEach(item => {
			html += IndexRenderer.dropdownItemHtml(item.id, `${item.id} ${item.name}`);
		})
		IndexRenderer.multipleSelectDropdown(CONDITION.Version, html);

		if (HAS_EXCLUSION.Version) {
			IndexRenderer.multipleSelectDropdown(IndexUtils.getexclusionName(CONDITION.Version), html);
		}
	},
	knowledge: (list) => {
		let html = '';
		list.forEach(item => {
			html += IndexRenderer.dropdownItemHtml(item.id, `${item.code} ${item.name}`);
		})
		IndexRenderer.multipleSelectDropdown(CONDITION.Knowledge, html);

		if (HAS_EXCLUSION.Knowledge) {
			IndexRenderer.multipleSelectDropdown(IndexUtils.getexclusionName(CONDITION.Knowledge), html);
		}
	},
	discreteKnowledge: (list) => {
		let html = '';
		list.forEach(item => {
			html += IndexRenderer.dropdownItemHtml(item.id, `${item.code} ${item.name}`);
		})
		IndexRenderer.multipleSelectDropdown(CONDITION.DiscreteKnowledge, html);

		if (HAS_EXCLUSION.DiscreteKnowledge) {
			IndexRenderer.multipleSelectDropdown(IndexUtils.getexclusionName(CONDITION.DiscreteKnowledge), html);
		}
	},
	lesson: (list) => {
		let html = '';
		list.forEach(item => {
			html += IndexRenderer.dropdownItemHtml(item.id, `${item.code} ${item.name}`);
		})
		IndexRenderer.multipleSelectDropdown(CONDITION.Lesson, html);

		if (HAS_EXCLUSION.Lesson) {
			IndexRenderer.multipleSelectDropdown(IndexUtils.getexclusionName(CONDITION.Lesson), html);
		}
	},
	discreteLesson: (list) => {
		let html = '';
		list.forEach(item => {
			html += IndexRenderer.dropdownItemHtml(item.id, `${item.code} ${item.name}`);
		})
		IndexRenderer.multipleSelectDropdown(CONDITION.DiscreteLesson, html);

		if (HAS_EXCLUSION.DiscreteLesson) {
			IndexRenderer.multipleSelectDropdown(IndexUtils.getexclusionName(CONDITION.DiscreteLesson), html);
		}
	},
	recognition: (list) => {
		let html = '';
		list.forEach(item => {
			html += IndexRenderer.dropdownItemHtml(item.id, `${item.code} ${item.name}`);
		})
		IndexRenderer.multipleSelectDropdown(CONDITION.Recognition, html);

		if (HAS_EXCLUSION.Recognition) {
			IndexRenderer.multipleSelectDropdown(IndexUtils.getexclusionName(CONDITION.Recognition), html);
		}
	},
	userType: (list) => {
		let html = '';
		list.forEach(item => {
			html += IndexRenderer.dropdownItemHtml(item.name, item.name, item.year);
		})
		IndexRenderer.multipleSelectDropdown(CONDITION.UserType, html);

		let conditionNames = [CONDITION.UserType];
		if (HAS_EXCLUSION.UserType) {
			conditionNames.push(IndexUtils.getexclusionName(CONDITION.UserType));
			IndexRenderer.multipleSelectDropdown(IndexUtils.getexclusionName(CONDITION.UserType), html);
		}

		// userType's list filter by the choosen itemYear
		conditionNames.forEach(name => {
			let component = DropdownComponentMap[name];
			let searchInput = component.input;
			let dropdownItems = component.getDropdownItems();

			IndexRenderer.addEventListenerFilterByYear(searchInput, dropdownItems);
		})
	},
	answeringMethod: (list) => {
		let html = '';
		list.forEach(item => {
			html += IndexRenderer.dropdownItemHtml(item, item);
		})
		IndexRenderer.multipleSelectDropdown(CONDITION.AnsweringMethod, html);

		if (HAS_EXCLUSION.AnsweringMethod) {
			IndexRenderer.multipleSelectDropdown(IndexUtils.getexclusionName(CONDITION.AnsweringMethod), html);
		}
	},
	hasSolution: (list) => {
		let html = '';
		list.forEach(item => {
			html += IndexRenderer.dropdownItemHtml(item, item);
		})
		IndexRenderer.singleSelectDropdown(CONDITION.HasSolution, html);

		if (HAS_EXCLUSION.HasSolution) {
			IndexRenderer.singleSelectDropdown(IndexUtils.getexclusionName(CONDITION.HasSolution), html);
		}
	},
	hasVideoUrl: (list) => {
		let html = '';
		list.forEach(item => {
			html += IndexRenderer.dropdownItemHtml(item, item);
		})
		IndexRenderer.singleSelectDropdown(CONDITION.HasVideoUrl, html);

		if (HAS_EXCLUSION.HasVideoUrl) {
			IndexRenderer.singleSelectDropdown(IndexUtils.getexclusionName(CONDITION.HasVideoUrl), html);
		}
	},
	isSet: (list) => {
		let html = '';
		list.forEach(item => {
			html += IndexRenderer.dropdownItemHtml(item, item);
		})
		IndexRenderer.singleSelectDropdown(CONDITION.IsSet, html);

		if (HAS_EXCLUSION.IsSet) {
			IndexRenderer.singleSelectDropdown(IndexUtils.getexclusionName(CONDITION.IsSet), html);
		}
	},
	onlineReadiness: (list) => {
		let html = '';
		list.forEach(item => {
			html += IndexRenderer.dropdownItemHtml(item, item);
		})
		IndexRenderer.singleSelectDropdown(CONDITION.OnlineReadiness, html);

		if (HAS_EXCLUSION.OnlineReadiness) {
			IndexRenderer.singleSelectDropdown(IndexUtils.getexclusionName(CONDITION.OnlineReadiness), html);
		}
	},
	productStatus: (list) => {
		let html = '';
		list.forEach(item => {
			html += IndexRenderer.dropdownItemHtml(item, item);
		})
		IndexRenderer.singleSelectDropdown(CONDITION.ProductStatus, html);

		if (HAS_EXCLUSION.ProductStatus) {
			IndexRenderer.singleSelectDropdown(IndexUtils.getexclusionName(CONDITION.ProductStatus), html);
		}
	},
	copyright: (list) => {
		let html = '';
		list.forEach(item => {
			html += IndexRenderer.dropdownItemHtml(item, item);
		})
		IndexRenderer.singleSelectDropdown(CONDITION.Copyright, html);

		if (HAS_EXCLUSION.Copyright) {
			IndexRenderer.singleSelectDropdown(IndexUtils.getexclusionName(CONDITION.Copyright), html);
		}
	},
	isLiteracy: (list) => {
		let html = '';
		list.forEach(item => {
			html += IndexRenderer.dropdownItemHtml(item, item);
		})
		IndexRenderer.singleSelectDropdown(CONDITION.IsLiteracy, html);

		if (HAS_EXCLUSION.IsLiteracy) {
			IndexRenderer.singleSelectDropdown(IndexUtils.getexclusionName(CONDITION.IsLiteracy), html);
		}
	},
	fileName: (url) => {
		IndexRenderer.multipleSelectDropdownAutoComplete(CONDITION.FileName, url);

		if (HAS_EXCLUSION.FileName) {
			IndexRenderer.multipleSelectDropdownAutoComplete(IndexUtils.getexclusionName(CONDITION.FileName), url);
		}
	},
	hasLatex: (list) => {
		let html = '';
		list.forEach(item => {
			html += IndexRenderer.dropdownItemHtml(item, item);
		})
		IndexRenderer.singleSelectDropdown(CONDITION.HasLatex, html);

		if (HAS_EXCLUSION.HasLatex) {
			IndexRenderer.singleSelectDropdown(IndexUtils.getexclusionName(CONDITION.HasLatex), html);
		}
	},
	topic: (list) => {
		let html = '';
		list.forEach(item => {
			html += IndexRenderer.dropdownItemHtml(item, item);
		})
		IndexRenderer.multipleSelectDropdown(CONDITION.Topic, html);

		if (HAS_EXCLUSION.Topic) {
			IndexRenderer.multipleSelectDropdown(IndexUtils.getexclusionName(CONDITION.Topic), html);
		}
	},

	// commonly used part
	/**
	 * commonly used for single select dropdown element
	 * @param {*} conditionName 
	 * @param {*} dropdownListHtmlString 
	 */
	dropdownItemHtml: (value, content, labelContent = null) => {
		if (labelContent) {
			return `<div class="dropdown-item" ${ATTRIBUTE.VALUE_OPTION}="${value}" ${ATTRIBUTE.VALUE_OPTION_CONTENT}="${content}" ${ATTRIBUTE.VALUE_OPTION_LABEL}="${labelContent}"><span class="label label-info">${labelContent}</span>` +
				`<span> </span><span class="span-info">${content}</span></div>`;
		}
		return `<div class="dropdown-item" ${ATTRIBUTE.VALUE_OPTION}="${value}" ${ATTRIBUTE.VALUE_OPTION_CONTENT}="${content}"><span class="span-info">${content}</span></div>`;
	},
	singleSelectDropdown: (conditionName, dropdownListHtmlString) => {
		let component = DropdownComponentMap[conditionName];
		let searchInput = component.input;
		let dropdownList = component.dropdownList;
		dropdownList.innerHTML = dropdownListHtmlString;
		let dropdownItems = component.getDropdownItems();
		// Show dropdown when input is focused
		searchInput.addEventListener('focus', () => {
			dropdownList.style.display = 'block';
		});
		searchInput.addEventListener('focusout', () => {
			dropdownList.style.display = 'none';
		});
		searchInput.addEventListener('input', (event) => {
			event.target.value = '';
		});
		// Handle item click
		dropdownItems.forEach(item => {
			item.addEventListener('mousedown', () => {
				searchInput.value = item.getAttribute(ATTRIBUTE.VALUE_OPTION);
				dropdownList.style.display = 'none';
			});
		});
	},
	/**
	 * commonly used for multiple select dropdown element
	 * @param {*} conditionName 
	 * @param {*} dropdownListHtmlString 
	 */
	multipleSelectDropdown: (conditionName, dropdownListHtmlString) => {
		let component = DropdownComponentMap[conditionName];
		let searchInput = component.input;
		let dropdownList = component.dropdownList;
		dropdownList.innerHTML = dropdownListHtmlString;
		let dropdownItems = component.getDropdownItems();
		// Show dropdown when input is focused
		searchInput.addEventListener('focus', () => {
			let choosenItems = component.getInnerSpanList();
			dropdownItems.forEach(item => {
				if (IndexUtils.checkItemExists(choosenItems, item.getAttribute(ATTRIBUTE.VALUE_OPTION))) {
					item.style.display = 'none';
				} else {
					item.style.display = null;
				}
			})
			dropdownList.style.display = 'block';
		});
		searchInput.addEventListener('input', (event) => {
			let choosenItems = component.getInnerSpanList();
			dropdownItems.forEach(item => {
				if (!item.textContent.includes(event.target.value) || IndexUtils.checkItemExists(choosenItems, item.getAttribute(ATTRIBUTE.VALUE_OPTION))) {
					item.style.display = 'none';
				} else {
					item.style.display = null;
				}
			})
		});
		// Handle item click
		dropdownItems.forEach(item => {
			item.addEventListener('mousedown', () => {
				searchInput.value = item.getAttribute(ATTRIBUTE.VALUE_OPTION);
				dropdownList.style.display = 'none';
			});
		});
	},
	/**
	 * commonly used for multiple select dropdown and auto complete element
	 * @param {*} conditionName 
	 * @param {*} url 
	 */
	multipleSelectDropdownAutoComplete: (conditionName, url) => {
		let component = DropdownComponentMap[conditionName];
		let searchInput = component.input;
		let dropdownList = component.dropdownList;

		// Show dropdown when input is focused
		searchInput.addEventListener('focus', () => {
			let choosenItems = component.getInnerSpanList();
			let dropdownItems = component.getDropdownItems();

			dropdownItems.forEach(item => {
				if (IndexUtils.checkItemExists(choosenItems, item.textContent)) {
					item.style.display = 'none';
				} else {
					item.style.display = null;
				}
			})
			dropdownList.style.display = 'block';
		});

		let requesting = false;
		searchInput.addEventListener('input', (event) => {
			let target = event.target;
			if (requesting || target.value == "") {
				return;
			}
			requesting = true;
			setTimeout(() => {
				requestGetMetadata(url + target.value, false, function (list) {
					let html = '';
					list.forEach(item => {
						html += IndexRenderer.dropdownItemHtml(item, item);
					})
					dropdownList.innerHTML = html;
				})

				// Handle item click
				let dropdownItems = component.getDropdownItems();
				dropdownItems.forEach(item => {
					item.addEventListener('mousedown', () => {
						searchInput.value = item.getAttribute(ATTRIBUTE.VALUE_OPTION);
						dropdownList.style.display = 'none';
					});
				});
				requesting = false;
			}, 800);
		});
	},
	/**
	 * this focus event needs to put after the common focus event, this must be fired later
	 */
	addEventListenerFilterByYear: (searchInput, dropdownItems) => {
		let callbackFunc = (isInputEvent) => {
			return (event) => {
				let yearsToShow = [];
				let itemYearSubmitValue = ConditionConfigs[ConfigIndexMap[CONDITION.ItemYear]].getSubmitValues(DropdownComponentMap);
				if (itemYearSubmitValue) {
					if (itemYearSubmitValue[0] && itemYearSubmitValue[0].length > 0) {
						yearsToShow = itemYearSubmitValue[0];
					}
					// exclusive year
					if (itemYearSubmitValue[1] && itemYearSubmitValue[1].length > 0) {
						yearsToShow = yearsToShow.length == 0 ? CommonUtils.getRecentAcademicChYears(3, true) : yearsToShow;
						itemYearSubmitValue[1].forEach(year => {
							if (yearsToShow.includes(year)) {
								yearsToShow.splice(yearsToShow.indexOf(year), 1);
							}
						})
					}
				}
				dropdownItems.forEach(item => {
					if (item.style.display == 'none') {
						return;
					}
					if (isInputEvent && !item.textContent.includes(event.target.value)) {
						item.style.display = 'none';
						return;
					}
					if (!yearsToShow.includes(item.getAttribute(ATTRIBUTE.VALUE_OPTION_LABEL))) {
						item.style.display = 'none';
						return;
					}

					item.style.display = null;
				})
			}
		}

		searchInput.addEventListener('focus', callbackFunc(false));
		searchInput.addEventListener('input', callbackFunc(true));
	},
}

if (!customElements.get(CUSTOM_ELEMENT_NAME_INDEX)) {
	customElements.define(CUSTOM_ELEMENT_NAME_INDEX, ItembankIndexForm);
}

let indexInstance = null;

// global variables for external files
const createIndexForm = (param = { searchId: null, onStateChangeCallback: null }) => {
	window.itembanksearch.searchId = param.searchId;
	window.itembanksearch.onStateChange = param.onStateChangeCallback;
	const element = document.createElement(CUSTOM_ELEMENT_NAME_INDEX);
	return element;
}

const removeIndexForm = () => {
	let instance = document.querySelector(CUSTOM_ELEMENT_NAME_INDEX);
	if (instance) {
		instance.remove();
	}
}

window.itembanksearch.createIndexForm = createIndexForm;
window.itembanksearch.removeIndexForm = removeIndexForm;
