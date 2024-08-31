import { MULTISELECT_TYPE, IndexUtils, ATTRIBUTE, SPECIAL_CASE_CONDITION } from "../utils/index-util.js";

/**
 * 頁面：條件輸入框
 */
export class DropdownComponent {
	container;
	input;
	dropdownList;
	name;
	exclusionName;
	multipleSelectType;
	// continuous press count
	#backspacePressCount = 0;
	getDropdownItems() { return this.dropdownList.querySelectorAll('.dropdown-item'); }
	getDropdownItemSpans() { return this.dropdownList.querySelectorAll('.dropdown-item span.span-info'); }
	getSpanList() { return this.container.querySelectorAll('.ui-select-match-item'); }
	getInnerSpanList() { return this.container.querySelectorAll('.ui-select-match-item span[uis-transclude-append]'); }
	/**
	 * get item span values that have selected by user
	 */
	getSelectedItemSpanValues() {
		let items = Array.from(this.getInnerSpanList());
		if (items.length) {
			let values = items.map(item => { return item.getAttribute(ATTRIBUTE.SUBMIT_TARGET) });
			return values;
		}
		return [];
	}
	getInputBox() { return this.input; }

	insertElementBeforeInput(element) {
		this.container.insertBefore(element, this.input);
	}
	insertElementAfterInput(element) {
		this.container.insertBefore(element, this.input.nextSibling);
	}
	/**
	 * fixed contruction flow
	 * @param {ConditionConfig} config 
	 */
	constructor(config) {
		this.#createContainer(config);
		this.#createInput(config);
		this.#createDropdownList();
		this.#createNoteText(config);
		this.#bindEvents(config);
		this.container.appendChild(this.input);
		this.container.appendChild(this.dropdownList);
		this.multipleSelectType = config.multipleSelectType;
	}

	#createContainer(config) {
		const div = document.createElement('div');
		div.classList.add('dropdown-container');
		this.container = div;
		this.name = config.enName;
		if (config.hasExclusiveCondition) {
			this.exclusionName = IndexUtils.getexclusionName(config.enName);
		}
	}
	#createInput(config) {
		const input = document.createElement('input');
		input.classList.add('search-input');
		input.type = 'text';
		input.disabled = config.disabled;
		if (config.placeholder == null) {
			switch (config.multipleSelectType) {
				case MULTISELECT_TYPE.SINGLE:
				case MULTISELECT_TYPE.DROPDOWN:
					input.placeholder = `選取${config.name}`;
					break;
				case MULTISELECT_TYPE.TYPING:
				case MULTISELECT_TYPE.AUTOCOMPLETE:
					input.placeholder = `請輸入${config.name}`;
					break;
			}
		} else {
			input.placeholder = config.placeholder;
		}
		this.input = input;
	}
	#createDropdownList() {
		const dropdownList = document.createElement('div');
		dropdownList.classList.add('dropdown-content');
		dropdownList.style.display = 'none';
		this.dropdownList = dropdownList;
	}
	#createNoteText(config) {
		if (config.note != null || config.note != undefined) {
			const noteText = document.createElement('div');
			noteText.classList.add('note-text');
			noteText.innerHTML = config.note;
			this.container.appendChild(noteText);
		}
	}
	/**
	 * the selected item span form the dropdown that allowing multiple selection
	 */
	#insertSelectedItemSpan(value, text) {
		const span = document.createElement('span');
		span.classList.add('ui-select-match-item', 'wrap-span', 'btn-default', 'btn-xs');
		span.setAttribute('tabindex', '-1');
		span.setAttribute('type', 'button');
		// Create close button
		const closeBtn = document.createElement('span');
		closeBtn.classList.add('close', 'ui-select-match-close');
		closeBtn.innerHTML = '&nbsp;×';
		closeBtn.addEventListener('click', function () {
			span.remove();
		});
		// Create text span
		const textSpan = document.createElement('span');
		textSpan.setAttribute('uis-transclude-append', '');
		textSpan.setAttribute(ATTRIBUTE.SUBMIT_TARGET, value);
		textSpan.innerHTML = `<span>${text}</span>`;

		// Append close button and text span to new item
		span.appendChild(closeBtn);
		span.appendChild(textSpan);

		this.container.insertBefore(span, this.input);
	}
	eventHandlers = {
		focusout_multi_select: (event) => {
			// remove special effect
			if (this.#backspacePressCount > 0) {
				this.#backspacePressCount = 0;
				let spanList = this.getSpanList();
				if (spanList.length == 0) {
					return 0;
				}
				let lastSpan = spanList[spanList.length - 1];
				lastSpan.classList.remove('btn-primary');
			}
			event.target.value = '';
			this.dropdownList.style.display = 'none';
		},
		mousedown_multi_select_dropdown: (event) => {
			let target = event.target;
			let found = false;
			if (!target.hasAttribute(ATTRIBUTE.VALUE_OPTION)) {
				let tmpTarget = event.target;
				while (tmpTarget.parentElement) {
					tmpTarget = tmpTarget.parentElement;
					if (tmpTarget.hasAttribute(ATTRIBUTE.VALUE_OPTION)) {
						target = tmpTarget;
						found = true;
						break;
					}
				}
				if (!found) {
					return;
				}
			}
			let value = target.getAttribute(ATTRIBUTE.VALUE_OPTION);
			let text = target.getAttribute(ATTRIBUTE.VALUE_OPTION_CONTENT);
			if (value !== "" && !this.#checkItemSpanDuplicated(value)) {
				this.#insertSelectedItemSpan(value, text);
			}
			this.input.value = '';
		},
		keydown_general: (event) => {
			if (event.key == 'Escape') {
				this.input.blur();
			}
		},
		keydown_typing: (event) => {
			if (event.isComposing || event.keyCode === 229) {
				// IME input is still ongoing, so do not process the enter key
				return;
			}

			let text = event.target.value;
			// enter condition
			if (event.key === 'Enter' && text !== "") {
				if (!this.#checkItemSpanDuplicated(text)) {
					this.#insertSelectedItemSpan(text, text);
				}
				event.target.value = "";
			}
		},
		keydown_typing_split: (event) => {
			if (event.isComposing || event.keyCode === 229) {
				// IME input is still ongoing, so do not process the enter key
				return;
			}

			let text = event.target.value;
			// enter condition
			if (event.key === 'Enter' && text !== "") {
				let regexPattern = text.includes(',') ? '\r?\n' : ' |\r?\n';
				text = text.replace(new RegExp(regexPattern, 'g'), ",");
				let rows = text.split(',');
				rows.forEach((row) => {
					if (row !== "" && !this.#checkItemSpanDuplicated(row)) {
						this.#insertSelectedItemSpan(row, row);
					}
				})
				event.target.value = "";
			}
		},
		keydown_multi_select: (event) => {
			this.#handleRemoveSpan(event.key, event.target.value);
		},
		paste_multi_select_dropdown: (event) => {
			let target = event.target;
			setTimeout(() => {
				target.value = "";
			}, 0);
			let text = event.clipboardData.getData('Text');
			if (text !== "") {
				let regexPattern = text.includes(',') ? '\r?\n' : ' |\r?\n';
				text = text.replace(new RegExp(regexPattern, 'g'), ",");
				let inputs = text.split(',');
				let dropdownItems = this.getDropdownItems();
				inputs.forEach((input) => {
					if (input.indexOf(' ') > 0) {
						input = input.substring(0, input.indexOf(' '));
					}
					for (let i = 0; i < dropdownItems.length; i++) {
						let dropdownItem = dropdownItems[i];
						let content = dropdownItem.getAttribute(ATTRIBUTE.VALUE_OPTION_CONTENT);
						if (content.indexOf(' ') > 0) {
							content = content.substring(0, content.indexOf(' '));
						}
						if (input == content) {
							dropdownItem.dispatchEvent(new Event('mousedown', {
								bubbles: true,
								cancelable: true,
								view: window
							}));
							break;
						}
					}
					// if (row !== "" && !this.#checkItemSpanDuplicated(row)) {
					// 	this.#insertSelectedItemSpan(row, row);
					// }
				})
			}
		},
		paste_typing: (event) => {
			let target = event.target;
			setTimeout(() => {
				target.value = "";
			}, 0);
			let text = event.clipboardData.getData('Text');
			if (text !== "" && !this.#checkItemSpanDuplicated(text)) {
				this.#insertSelectedItemSpan(text, text);
			}
		},
		paste_typing_split: (event) => {
			let target = event.target;
			setTimeout(() => {
				target.value = "";
			}, 0);
			let text = event.clipboardData.getData('Text');
			if (text !== "") {
				let regexPattern = text.includes(',') ? '\r?\n' : ' |\r?\n';
				text = text.replace(new RegExp(regexPattern, 'g'), ",");
				let rows = text.split(',');
				rows.forEach((row) => {
					if (row !== "" && !this.#checkItemSpanDuplicated(row)) {
						this.#insertSelectedItemSpan(row, row);
					}
				})
			}
		}
	}
	#bindEvents(config) {
		this.input.addEventListener('keydown', this.eventHandlers.keydown_general)
		if (config.multipleSelectType === MULTISELECT_TYPE.SINGLE) {
			if (config.note) {
				this.container.classList.add('down-arrow2');
			} else {
				this.container.classList.add('down-arrow');
			}
		} else if (config.multipleSelectType === MULTISELECT_TYPE.DROPDOWN
			|| config.multipleSelectType === MULTISELECT_TYPE.TYPING
			|| config.multipleSelectType === MULTISELECT_TYPE.AUTOCOMPLETE) {
			this.input.addEventListener('focusout', this.eventHandlers.focusout_multi_select);
			this.input.addEventListener('keydown', this.eventHandlers.keydown_multi_select);

			// MULTISELECT_TYPE.DROPDOWN
			if (config.multipleSelectType === MULTISELECT_TYPE.DROPDOWN || config.multipleSelectType === MULTISELECT_TYPE.AUTOCOMPLETE) {
				this.dropdownList.addEventListener('mousedown', this.eventHandlers.mousedown_multi_select_dropdown);
				if (config.specialCaseConditionInput == SPECIAL_CASE_CONDITION.INPUT_DROPDOWN_ALLOW_PASTE) {
					this.input.addEventListener('paste', this.eventHandlers.paste_multi_select_dropdown);
				}
			} else {
				// MULTISELECT_TYPE.TYPING
				if (config.specialCaseConditionInput == SPECIAL_CASE_CONDITION.INPUT_TYPING_PASS_SPLIT) {
					this.input.addEventListener('keydown', this.eventHandlers.keydown_typing);
					this.input.addEventListener('paste', this.eventHandlers.paste_typing);
				} else {
					this.input.addEventListener('keydown', this.eventHandlers.keydown_typing_split);
					this.input.addEventListener('paste', this.eventHandlers.paste_typing_split);
				}
			}
		}
	}
	/**
	 * Checks if the input text or click item text is existing in the multiple selected span list
	 */
	#checkItemSpanDuplicated(text) {
		return IndexUtils.checkItemExists(this.getInnerSpanList(), text);
	}
	/**
	 * check if backspace has been pressed twice then remove those span items that the conditions user typing or choose
	 */
	#handleRemoveSpan(keydown, inputValue) {
		if (keydown == 'Backspace' && inputValue == "") {
			// add special effect or remove item
			this.#backspacePressCount++;
			let spanList = this.getSpanList();
			if (spanList.length == 0) {
				this.#backspacePressCount = 0;
				return;
			}
			let lastSpan = spanList[spanList.length - 1];
			lastSpan.classList.add('btn-primary');
			if (this.#backspacePressCount <= 1) {
				return;
			}
			this.container.removeChild(lastSpan);
			this.dropdownList.style.display = 'none';
		} else if (this.#backspacePressCount > 0) {
			// remove special effect, if cnt greater than 0 and user press any other keys
			let spanList = this.getSpanList();
			if (spanList.length == 0) {
				this.#backspacePressCount = 0;
				return;
			}
			let lastSpan = spanList[spanList.length - 1];
			lastSpan.classList.remove('btn-primary');
		}
		this.#backspacePressCount = 0;
	}
}

/**
 * 頁面：切換開關按鈕
 */
export class ToggleCheckboxComponent {
	titleSpan;
	toggle;
	constructor(title, id, clickCallback) {
		// create toggle for formula input
		let titleSpan = document.createElement('span');
		titleSpan.classList.add('sm-title');
		titleSpan.style.transform = 'translateY(-6px)';
		titleSpan.innerHTML = title;
		let toggle = document.createElement('span');
		toggle.classList.add('checkbox-toggle');
		toggle.addEventListener('click', clickCallback);
		let checkbox = document.createElement('input');
		let toggleId = `toggle-${id}`;
		checkbox.id = toggleId;
		checkbox.type = "checkbox";
		let label = document.createElement('label');
		label.setAttribute('for', toggleId);
		toggle.appendChild(checkbox);
		toggle.appendChild(label);

		this.titleSpan = titleSpan;
		this.toggle = toggle;
	}
}