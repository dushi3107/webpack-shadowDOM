import MathQuill from "mathquill-node";

// MathQuill
const MQ = MathQuill.getInterface(2);

class MathQuillButtonConfig {
	name;
	formula;
	subjectMembers;
	instance;
	constructor(name, formula, subjectMembers, a) {
		this.name = name;
		this.formula = formula;
		this.subjectMembers = subjectMembers;
	}
}

const subs = {
	ALL: 'ALL 全部',
	EMA: 'E-MA',
	JMA: 'J-MA',
	HMA: 'H-MA',
	JPY: 'J-PY',
	HCE: 'H-CE',
	HPH: 'H-PH',
	JBI: 'J-BI',
	HBI: 'H-BI',
	HNA: 'H-NA',
	JNA: 'J-NA',
}

const mathQuillButtonConfigs = [
	// [subs.EMA, subs.JMA, subs.HMA, subs.JPY, subs.HCE, subs.HPH, subs.JBI, subs.HBI, subs.HNA, subs.JNA]
	new MathQuillButtonConfig('fraction', '\\frac{x}{y}', [subs.EMA, subs.JMA, subs.HMA, subs.JPY, subs.HCE, subs.HPH, subs.JBI, subs.HBI, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('integral', '\\int_{x}^{y}', [subs.HMA]),
	new MathQuillButtonConfig('superscript-subscript', 'x_z^y', [subs.HCE, subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('superscript-subscript2', '_b^aY_d^c', [subs.HCE, subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('coordinate', '\\left(x,y\\right)', [subs.JMA]),
	new MathQuillButtonConfig('overline', '\\overline{x}', [subs.EMA, subs.JMA, subs.HMA, subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('underline', '\\underline{x}', [subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('power', '\{x}^{y}', [subs.JMA, subs.HMA, subs.JPY, subs.HCE, subs.HPH, subs.JBI, subs.HBI, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('subscript', '\{x}_{y}', [subs.JPY, subs.HCE, subs.HPH, subs.JBI, subs.HBI, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('log', '\\log_{y}x', [subs.HMA, subs.HCE, subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('square-root', '\\sqrt{x}', [subs.JMA, subs.HMA, subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('nth-root', '\\sqrt[y]{x}', [subs.HMA, subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('pi', '\\pi', [subs.JMA, subs.HMA, subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('plus-minus', '\\pm', [subs.JMA, subs.HMA, subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('times', '\\times', [subs.JMA, subs.HMA, subs.JPY, subs.HCE, subs.HPH, subs.HBI, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('division', '\\div', [subs.JMA, subs.HMA, subs.JPY, subs.HCE, subs.HPH, subs.HBI, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('not-equal', '\\ne', [subs.JMA, subs.HMA, subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('less-or-equal', '\\le', [subs.JMA, subs.HMA, subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('greater-or-equal', '\\ge', [subs.JMA, subs.HMA, subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('absolute', '\\left|x\\right|', [subs.JMA, subs.HMA, subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('belong-to', '\\in', [subs.HMA]),
	new MathQuillButtonConfig('not-belong-to', '\\notin', [subs.HMA]),
	new MathQuillButtonConfig('intersection', '\\bigcap', [subs.HMA]),
	new MathQuillButtonConfig('union', '\\bigcup', [subs.HMA]),
	new MathQuillButtonConfig('subset', '\\subseteq', [subs.HMA]),
	new MathQuillButtonConfig('approximately-equal-to', '\\cong', [subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('direct-proportion', '\\prop', [subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('therefore', '\\therefor', [subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('because', '\\cuz', [subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('much-greater-than', '\\gg', [subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('much-less-than', '\\ll', [subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('alpha', '\\alpha', [subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('beta', '\\beta', [subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('gamma', '\\gamma', [subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('delta', '\\delta', [subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('°', '°', [subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('Delta', '\\Delta', [subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('theta', '\\theta', [subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('mu', '\\mu', [subs.JPY, subs.HCE, subs.HPH, subs.HBI, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('f', '\\f', [subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('lambda', '\\lambda', [subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('upsilon', '\\upsilon', [subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('rho', '\\rho', [subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('Omega', '\\Omega', [subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('longleftarrow', '\\longleftarrow', [subs.JPY, subs.HCE, subs.HPH, subs.HBI, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('longrightarrow', '\\longrightarrow', [subs.JPY, subs.HCE, subs.HPH, subs.HBI, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('longleftrightarrow', '\\longleftrightarrow', [subs.JPY, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('downarrow', '\\downarrow', [subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('uparrow', '\\uparrow', [subs.JPY, subs.HCE, subs.HPH, subs.HNA, subs.JNA]),
	new MathQuillButtonConfig('asymptotically-equal-to', '\\simeq', [subs.HCE, subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('almost-equal-to', '\\approx', [subs.HCE, subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('equivalence', '\\equiv', [subs.HCE, subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('eta', '\\eta', [subs.HCE, subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('nu', '\\nu', [subs.HCE, subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('sigma', '\\sigma', [subs.HCE, subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('varphi', '\\varphi', [subs.HCE, subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('varepsilon', '\\varepsilon', [subs.HCE, subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('tau', '\\tau', [subs.HCE, subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('kappa', '\\kappa', [subs.HCE, subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('angstrom', '\\AA', [subs.HCE, subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('Sigma', '\\Sigma', [subs.HCE, subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('cdot', '\\cdot', [subs.HCE, subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('bracket', '\\left[x\\right]', [subs.HCE, subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('omega', '\\omega', [subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('phi', '\\phi', [subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('Lambda', '\\Lambda', [subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('psi', '\\psi', [subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('ell', '\\ell', [subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('vec', '\\vec{x}', [subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('overleftarrow', '\\overleftarrow{xy}', [subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('overrightarrow', '\\overrightarrow{xy}', [subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('nearrow', '\\nearrow', [subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('searrow', '\\searrow', [subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('swarrow', '\\swarrow', [subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('nwarrow', '\\nwarrow', [subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('summation', '\\sum_{x}^{y}z', [subs.HMA, subs.JPY, subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('summation', '\\sum_{k=1}^Nk^2', [subs.HPH, subs.HNA]),
	new MathQuillButtonConfig('integral-formula', '\int_{-N}^Ne^xdx', [subs.HPH, subs.HNA]),
];

const MathQuillKeyboardConfigs = {
	ButtonConfigs: mathQuillButtonConfigs,
	SubjectFilters: Object.values(subs),
};

export class MathQuillKeyboardComponent {
	mathQuillKeyboard;
	mathQuillKeyboardHeader;
	mathQuillKeyboardContent;
	mathQuillTarget;
	clicked = false;
	constructor() {
		this.mathQuillKeyboard = document.createElement('ib-mathquill-keyboard');
		this.mathQuillKeyboard.classList.add('draggable');
		this.mathQuillKeyboard.addEventListener('mousedown', () => {
			this.clicked = true;
		})
		this.mathQuillKeyboard.style.display = 'none';

		// header
		this.mathQuillKeyboardHeader = document.createElement('div');
		this.mathQuillKeyboardHeader.classList.add('draggable-header');
		this.mathQuillKeyboardHeader.innerHTML = '拖曳移動';
		this.mathQuillKeyboard.appendChild(this.mathQuillKeyboardHeader);
		// content
		let span = document.createElement('span');
		span.innerHTML = '科目設定';
		span.classList.add('sm-title');
		this.mathQuillKeyboard.appendChild(document.createElement('br'));
		this.mathQuillKeyboard.appendChild(span);
		this.selectDropdown = document.createElement('select');
		this.selectDropdown.style.fontSize = '12px';
		this.selectDropdown.addEventListener('change', (event) => {
			this.render(event.target.value);
		})
		this.mathQuillKeyboard.appendChild(this.selectDropdown);
		this.mathQuillKeyboardContent = document.createElement('div');
		this.mathQuillKeyboardContent.classList.add('draggable-content');
		this.mathQuillKeyboard.appendChild(this.mathQuillKeyboardContent);
		this.render();
	}

	generateFilterOptions(subjectMap) {
		MathQuillKeyboardConfigs.SubjectFilters.forEach(subject => {
			let name = subjectMap[subject];
			let option = document.createElement('option');
			option.value = subject;
			option.innerHTML = subject + (name ? " " + name : "");
			this.selectDropdown.appendChild(option);
		})
	}

	render(selectedSubject = null) {
		this.mathQuillKeyboardContent.innerHTML = '';

		let configs = MathQuillKeyboardConfigs.ButtonConfigs;
		if (selectedSubject && selectedSubject != subs.ALL) {
			configs = [];
			MathQuillKeyboardConfigs.ButtonConfigs.forEach(config => {
				if (config.subjectMembers.includes(selectedSubject)) {
					configs.push(config);
				}
			})
		}

		let i = 0;
		let btnGroup;
		configs.forEach(config => {
			if (i % 5 == 0) {
				btnGroup = document.createElement('div');
				btnGroup.className = 'btn-group';
				this.mathQuillKeyboardContent.appendChild(btnGroup);
				let br = document.createElement('br');
				this.mathQuillKeyboardContent.appendChild(br);
			}

			let span = document.createElement('span');
			let button = document.createElement('button');
			button.type = 'button';
			button.classList.add('btn', 'btn-keyboard', 'btn-sm', 'btn-outline-dark', config.fontSize);
			button.style.fontSize = "14px";
			button.style.padding = "0px";
			button.innerHTML = config.formula;
			MQ.StaticMath(button);
			button.addEventListener('mousedown', () => {
				this.clicked = true;
				this.inputFormula(config.formula);
			});
			span.appendChild(button);
			btnGroup.appendChild(span);

			i++;
		})
	}

	inputFormula(str) {
		this.mathQuillTarget.inputFormula(str);
	}

	show(mathQuillTarget) {
		if (this.mathQuillTarget != mathQuillTarget) {
			let targetRect = mathQuillTarget.mathQuillInput.getBoundingClientRect();
			let top = targetRect.top + window.scrollY + targetRect.height * 0.8;
			let left = targetRect.left + window.scrollX + targetRect.width * 0.5;

			this.mathQuillKeyboard.style.top = `${top}px`;
			this.mathQuillKeyboard.style.left = `${left}px`;
		}

		this.mathQuillTarget = mathQuillTarget;
		this.mathQuillKeyboard.style.display = 'block';
	}

	hide() {
		this.mathQuillKeyboard.style.display = 'none';
	}
}

export class MathQuillInputComponent {
	mathQuillInput;
	mathFieldSpan;
	mathField;
	constructor(keyboardComponent, id, dropdownComponent) {
		this.mathQuillInput = document.createElement('ib-mathquill-input');
		this.mathFieldSpan = document.createElement('span');
		this.mathFieldSpan.id = 'mq-editable-field-' + id;
		this.mathFieldSpan.classList.add('ib-mathquill-input');
		this.mathFieldSpan.style.display = 'none';
		this.mathQuillInput.appendChild(this.mathFieldSpan);

		// bind event to dropdown component
		this.mathFieldSpan.addEventListener('focusin', () => {
			keyboardComponent.show(this);
		});
		this.mathFieldSpan.addEventListener('focusout', (event) => {
			if (keyboardComponent.clicked) {
				this.mathField.focus();
				keyboardComponent.clicked = false;
				return;
			}
			keyboardComponent.hide(this);
			dropdownComponent.eventHandlers.focusout_multi_select(event);
		});
		this.mathFieldSpan.addEventListener('keydown', (event) => {
			// event.target.value = mathField.latex();
			dropdownComponent.eventHandlers.keydown_multi_select(event);
		});

		let mathField = MQ.MathField(this.mathFieldSpan, {
			spaceBehavesLikeTab: true,
			handlers: {
				// edit: function () {
				// 	console.log(mathField.latex());
				// },
				enter: function () {
					let middleEvent = {
						key: 'Enter',
						target: {
							value: mathField.latex()
						}
					};
					dropdownComponent.eventHandlers.keydown_typing(middleEvent)
				}
			},
		});

		this.mathField = mathField;
	}
	inputFormula(str) {
		this.mathField.write(str);
		this.mathField.focus();
	}
}