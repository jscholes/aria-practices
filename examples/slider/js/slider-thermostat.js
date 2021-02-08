/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 *   File:   slider-thermostat.js
 *
 *   Desc:   Vertical and text slider widget that implements ARIA Authoring Practices
 */

'use strict';

class SliderThermostatVertical {
  constructor(domNode) {
    this.labelCelsiusAbbrev = '°C';
    this.labelCelsius = ' degrees celsius ';
    this.changeValue = 0.1;
    this.bigChangeValue = 20 * this.changeValue;

    this.domNode = domNode;

    this.isMoving = false;

    this.svgNode = domNode.querySelector('svg');
    this.svgPoint = this.svgNode.createSVGPoint();

    this.borderWidth = 2;
    this.borderWidth2 = 2 * this.borderWidth;

    this.railNode = domNode.querySelector('.rail');
    this.sliderNode = domNode.querySelector('[role=slider]');
    this.sliderValueNode = this.sliderNode.querySelector('.value');
    this.sliderFocusNode = this.sliderNode.querySelector('.focus');
    this.sliderThumbNode = this.sliderNode.querySelector('.thumb');

    // The input elements are optional to support mobile devices,
    // when a keyboard is not present
    this.outputNode = domNode.querySelector('.output-value output');

    // Dimensions of the slider focus ring, thumb and rail

    this.valueX = parseInt(this.sliderValueNode.getAttribute('x'));
    this.valueHeight = this.sliderValueNode.getBoundingClientRect().height;

    this.railHeight = parseInt(this.railNode.getAttribute('height'));
    this.railWidth = parseInt(this.railNode.getAttribute('width'));
    this.railY = parseInt(this.railNode.getAttribute('y'));
    this.railX = parseInt(this.railNode.getAttribute('x'));

    this.thumbY = parseInt(this.sliderThumbNode.getAttribute('y'));
    this.thumbWidth = parseInt(this.sliderThumbNode.getAttribute('width'));
    this.thumbHeight = parseInt(this.sliderThumbNode.getAttribute('height'));

    this.focusX = parseInt(this.sliderFocusNode.getAttribute('x'));
    this.focusWidth = parseInt(this.sliderFocusNode.getAttribute('width'));
    this.focusHeight = parseInt(this.sliderFocusNode.getAttribute('height'));

    this.thumbX = this.railX + this.railWidth / 2 - this.thumbWidth / 2;
    this.sliderThumbNode.setAttribute('x', this.thumbX);
    this.sliderValueNode.setAttribute('x', this.valueX);
    this.sliderFocusNode.setAttribute('x', this.focusX);

    this.railNode.addEventListener('click', this.onRailClick.bind(this));
    this.sliderNode.addEventListener(
      'keydown',
      this.onSliderKeydown.bind(this)
    );
    this.sliderNode.addEventListener(
      'pointerdown',
      this.onSliderPointerDown.bind(this)
    );

    // bind a pointermove event handler to move pointer
    this.svgNode.addEventListener('pointermove', this.onPointerMove.bind(this));

    // bind a pointerup event handler to stop tracking pointer movements
    document.addEventListener('pointerup', this.onPointerUp.bind(this));

    this.sliderNode.addEventListener('focus', this.onSliderFocus.bind(this));
    this.sliderNode.addEventListener('blur', this.onSliderBlur.bind(this));

    this.moveSliderTo(this.getValue());
  }

  // Get point in global SVG space
  getSVGPoint(event) {
    this.svgPoint.x = event.clientX;
    this.svgPoint.y = event.clientY;
    return this.svgPoint.matrixTransform(this.svgNode.getScreenCTM().inverse());
  }

  getValue() {
    return parseFloat(this.sliderNode.getAttribute('aria-valuenow'));
  }

  getValueMin() {
    return parseFloat(this.sliderNode.getAttribute('aria-valuemin'));
  }

  getValueMax() {
    return parseFloat(this.sliderNode.getAttribute('aria-valuemax'));
  }

  isInRange(value) {
    let valueMin = this.getValueMin();
    let valueMax = this.getValueMax();
    return value <= valueMax && value >= valueMin;
  }

  moveSliderTo(value) {
    var valueMax, valueMin, pos;

    valueMin = this.getValueMin();
    valueMax = this.getValueMax();

    if (value > valueMax) {
      value = valueMax;
    }

    if (value < valueMin) {
      value = valueMin;
    }

    let valueOutput = value.toFixed(1) + this.labelCelsiusAbbrev;

    let valueText = value.toFixed(1) + this.labelCelsius;

    this.outputNode.value = valueOutput;
    this.sliderNode.setAttribute('aria-valuenow', value);
    this.sliderNode.setAttribute('aria-valuetext', valueText);

    let height = this.railHeight - this.thumbHeight + this.borderWidth2;

    pos = this.railY + height - 1;
    pos -= Math.round(((value - valueMin) * height) / (valueMax - valueMin));
    this.sliderNode.setAttribute('y', pos);

    // update INPUT, label and ARIA attributes
    this.sliderValueNode.textContent = valueOutput;

    // move the SVG focus ring and thumb elements
    this.sliderFocusNode.setAttribute(
      'y',
      pos - (this.focusHeight - this.thumbHeight) / 2
    );
    this.sliderThumbNode.setAttribute('y', pos);

    // Position value
    this.sliderValueNode.setAttribute(
      'y',
      pos -
        this.borderWidth +
        this.thumbHeight -
        (this.valueHeight - this.thumbHeight) / 2
    );
  }

  onSliderKeydown(event) {
    var flag = false;
    var value = this.getValue();
    var valueMin = this.getValueMin();
    var valueMax = this.getValueMax();

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        this.moveSliderTo(value - this.changeValue);
        flag = true;
        break;

      case 'ArrowRight':
      case 'ArrowUp':
        this.moveSliderTo(value + this.changeValue);
        flag = true;
        break;

      case 'PageDown':
        this.moveSliderTo(value - this.bigChangeValue);
        flag = true;
        break;

      case 'PageUp':
        this.moveSliderTo(value + this.bigChangeValue);
        flag = true;
        break;

      case 'Home':
        this.moveSliderTo(valueMin);
        flag = true;
        break;

      case 'End':
        this.moveSliderTo(valueMax);
        flag = true;
        break;

      default:
        break;
    }

    if (flag) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  onSliderFocus() {
    this.domNode.classList.add('focus');
  }

  onSliderBlur() {
    this.domNode.classList.remove('focus');
  }

  calcValue(y) {
    let min = this.getValueMin();
    let max = this.getValueMax();
    let diffY = y - this.railY;
    return max - (diffY * (max - min)) / this.railHeight;
  }

  onRailClick(event) {
    var value = this.calcValue(this.getSVGPoint(event).y);
    this.moveSliderTo(value);

    event.preventDefault();
    event.stopPropagation();

    // Set focus to the clicked handle
    this.sliderNode.focus();
  }

  onSliderPointerDown(event) {
    this.isMoving = true;

    event.preventDefault();
    event.stopPropagation();

    // Set focus to the clicked handle
    this.sliderNode.focus();
  }

  onPointerMove(event) {
    if (this.isMoving) {
      var value = this.calcValue(this.getSVGPoint(event).y);
      this.moveSliderTo(value);

      event.preventDefault();
      event.stopPropagation();
    }
  }

  onPointerUp() {
    this.isMoving = false;
  }
}

/*
 *   Desc: Text slider widget that implements ARIA Authoring Practices
 */

class SliderThermostatText {
  constructor(domNode) {
    this.domNode = domNode;

    this.isMoving = false;

    this.svgNode = domNode.querySelector('svg');
    this.svgPoint = this.svgNode.createSVGPoint();

    this.railNode = domNode.querySelector('.rail');
    this.sliderNode = domNode.querySelector('[role=slider]');
    this.sliderFocusNode = this.sliderNode.querySelector('.focus');
    this.sliderThumbNode = this.sliderNode.querySelector('.thumb');

    this.buttonNodes = domNode.querySelectorAll('.labels button');

    // Dimensions of the slider focus ring, thumb and rail

    this.railHeight = parseInt(this.railNode.getAttribute('height'));
    this.railWidth = parseInt(this.railNode.getAttribute('width'));
    this.railY = parseInt(this.railNode.getAttribute('y'));
    this.railX = parseInt(this.railNode.getAttribute('x'));

    this.thumbWidth = parseInt(this.sliderThumbNode.getAttribute('width'));
    this.thumbHeight = parseInt(this.sliderThumbNode.getAttribute('height'));

    this.focusHeight = parseInt(this.sliderFocusNode.getAttribute('height'));
    this.focusWidth = parseInt(this.sliderFocusNode.getAttribute('width'));

    this.thumbY = this.railY + this.railHeight / 2 - this.thumbHeight / 2;
    this.sliderThumbNode.setAttribute('y', this.thumbY);

    this.focusY = this.railY + this.railHeight / 2 - this.focusHeight / 2;
    this.sliderFocusNode.setAttribute('y', this.focusY);

    this.railNode.setAttribute('y', this.railY);
    this.railNode.setAttribute('x', this.railX);
    this.railNode.setAttribute('height', this.railHeight);
    this.railNode.setAttribute('width', this.railWidth);

    // define possible slider positions

    this.railNode.addEventListener('click', this.onRailClick.bind(this));
    this.sliderNode.addEventListener(
      'keydown',
      this.onSliderKeydown.bind(this)
    );

    this.sliderNode.addEventListener(
      'pointerdown',
      this.onSliderPointerDown.bind(this)
    );

    // bind a pointermove event handler to move pointer
    this.svgNode.addEventListener('pointermove', this.onPointerMove.bind(this));

    // bind a pointerup event handler to stop tracking pointer movements
    document.addEventListener('pointerup', this.onPointerUp.bind(this));

    this.sliderNode.addEventListener('focus', this.onSliderFocus.bind(this));
    this.sliderNode.addEventListener('blur', this.onSliderBlur.bind(this));

    let deltaPosition =
      this.railWidth / (this.getValueMax() - this.getValueMin());
    let position = this.railY;
    this.positions = [];
    this.textValues = [];
    for (let i = 0; i < this.buttonNodes.length; i++) {
      let buttonNode = this.buttonNodes[i];
      this.textValues.push(buttonNode.textContent.trim());
      buttonNode.addEventListener('click', this.onButtonClick.bind(this));
      buttonNode.addEventListener('focus', this.onSliderFocus.bind(this));
      buttonNode.addEventListener('blur', this.onSliderBlur.bind(this));

      let width = buttonNode.getBoundingClientRect().width;
      buttonNode.style.left = position - width / 2 + 'px';

      this.positions.push(position);
      position += deltaPosition;
    }

    this.moveSliderTo(this.getValue());
  }

  // Get point in global SVG space
  getSVGPoint(event) {
    this.svgPoint.x = event.clientX;
    this.svgPoint.y = event.clientY;
    return this.svgPoint.matrixTransform(this.svgNode.getScreenCTM().inverse());
  }

  getValue() {
    return parseInt(this.sliderNode.getAttribute('aria-valuenow'));
  }

  getValueMin() {
    return parseInt(this.sliderNode.getAttribute('aria-valuemin'));
  }

  getValueMax() {
    return parseInt(this.sliderNode.getAttribute('aria-valuemax'));
  }

  isInRange(value) {
    let valueMin = this.getValueMin();
    let valueMax = this.getValueMax();
    return value <= valueMax && value >= valueMin;
  }

  moveSliderTo(value) {
    var valueMax, valueMin;

    valueMin = this.getValueMin();
    valueMax = this.getValueMax();

    if (value > valueMax) {
      value = valueMax;
    }

    if (value < valueMin) {
      value = valueMin;
    }

    this.sliderNode.setAttribute('aria-valuenow', value);
    this.sliderNode.setAttribute('aria-valuetext', this.textValues[value]);

    // move the SVG focus ring and thumb elements
    this.sliderFocusNode.setAttribute(
      'x',
      this.positions[value] - this.focusWidth / 2
    );
    this.sliderThumbNode.setAttribute(
      'x',
      this.positions[value] - this.thumbWidth / 2
    );
  }

  onSliderKeydown(event) {
    var flag = false;
    var value = this.getValue();
    var valueMin = this.getValueMin();
    var valueMax = this.getValueMax();

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        this.moveSliderTo(value - 1);
        flag = true;
        break;

      case 'ArrowRight':
      case 'ArrowUp':
        this.moveSliderTo(value + 1);
        flag = true;
        break;

      case 'PageDown':
        this.moveSliderTo(value - 10);
        flag = true;
        break;

      case 'PageUp':
        this.moveSliderTo(value + 10);
        flag = true;
        break;

      case 'Home':
        this.moveSliderTo(valueMin);
        flag = true;
        break;

      case 'End':
        this.moveSliderTo(valueMax);
        flag = true;
        break;

      default:
        break;
    }

    if (flag) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  onSliderFocus() {
    this.domNode.classList.add('focus');
  }

  onSliderBlur() {
    this.domNode.classList.remove('focus');
  }

  onRailClick(event) {
    var x = this.getSVGPoint(event).x;
    var min = this.getValueMin();
    var max = this.getValueMax();
    var diffX = x - this.railX;
    var value = Math.round((diffX * (max - min)) / this.railWidth);
    this.moveSliderTo(value);

    event.preventDefault();
    event.stopPropagation();

    // Set focus to the clicked handle
    this.sliderNode.focus();
  }

  onSliderPointerDown(event) {
    this.isMoving = true;

    event.preventDefault();
    event.stopPropagation();

    // Set focus to the clicked handle
    this.sliderNode.focus();
  }

  onPointerMove(event) {
    if (this.isMoving) {
      var x = this.getSVGPoint(event).x;
      var min = this.getValueMin();
      var max = this.getValueMax();
      var diffX = x - this.railX;
      var value = Math.round((diffX * (max - min)) / this.railWidth);
      this.moveSliderTo(value);

      event.preventDefault();
      event.stopPropagation();
    }
  }

  onPointerUp() {
    this.isMoving = false;
  }

  onButtonClick(event) {
    var tgt = event.currentTarget;
    var value = parseInt(tgt.getAttribute('data-value'));
    this.moveSliderTo(value);
    this.sliderNode.focus();
    event.preventDefault();
    event.stopPropagation();
  }
}

// Initialize Vertical Slider widgets on the page
window.addEventListener('load', function () {
  var slidersVertical = document.querySelectorAll(
    '.slider-thermostat-vertical'
  );

  for (let i = 0; i < slidersVertical.length; i++) {
    new SliderThermostatVertical(slidersVertical[i]);
  }
});

// Initialize Text Slider widgets on the page
window.addEventListener('load', function () {
  var slidersText = document.querySelectorAll('.slider-thermostat-text');

  for (let i = 0; i < slidersText.length; i++) {
    new SliderThermostatText(slidersText[i]);
  }
});
