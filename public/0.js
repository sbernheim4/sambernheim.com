(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[0],{

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src/index.js!./node_modules/sass-loader/dist/cjs.js!./src/LandingPage/landingPage.scss":
/*!*********************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src!./node_modules/sass-loader/dist/cjs.js!./src/LandingPage/landingPage.scss ***!
  \*********************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// Imports\nvar ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/css-loader/dist/runtime/api.js\");\nexports = ___CSS_LOADER_API_IMPORT___(false);\n// Module\nexports.push([module.i, \"@-webkit-keyframes text {\\n  0% {\\n    transform: translatey(-40vh);\\n    color: white; }\\n  50% {\\n    color: white; }\\n  90% {\\n    transform: translatey(0); }\\n  100% {\\n    color: #5098c4;\\n    text-shadow: 2px 3px 9px black; } }\\n\\n@keyframes text {\\n  0% {\\n    transform: translatey(-40vh);\\n    color: white; }\\n  50% {\\n    color: white; }\\n  90% {\\n    transform: translatey(0); }\\n  100% {\\n    color: #5098c4;\\n    text-shadow: 2px 3px 9px black; } }\\n\\n.landing {\\n  --overlay: 0.75;\\n  position: relative;\\n  height: 100vh;\\n  background: linear-gradient(black, rgba(0, 0, 0, var(--overlay)), black), url(\\\"https://d2rx8thx7xqki2.cloudfront.net/background-image.jpg\\\") center no-repeat;\\n  background-size: cover;\\n  background-attachment: fixed;\\n  background-repeat: no-repeat; }\\n  .landing--text {\\n    position: fixed; }\\n    .landing--text h1 {\\n      margin: 30px 0 15px 30px;\\n      font-family: 'verlag', 'Lato', sans-serif;\\n      font-weight: 300;\\n      font-size: 80px;\\n      -webkit-animation: text 1.3s;\\n              animation: text 1.3s;\\n      -webkit-animation-fill-mode: both;\\n              animation-fill-mode: both;\\n      -webkit-animation-delay: .5s;\\n              animation-delay: .5s;\\n      color: #5098c4; }\\n      @media all and (max-width: 410px) {\\n        .landing--text h1 {\\n          font-size: 63px; } }\\n    .landing--text p {\\n      margin: 15px 0 0 30px;\\n      font-size: 18px;\\n      color: white; }\\n\", \"\"]);\n// Exports\nmodule.exports = exports;\n\n\n//# sourceURL=webpack:///./src/LandingPage/landingPage.scss?./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src!./node_modules/sass-loader/dist/cjs.js");

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src/index.js!./node_modules/sass-loader/dist/cjs.js!./src/Routes/Home/home.scss":
/*!**************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src!./node_modules/sass-loader/dist/cjs.js!./src/Routes/Home/home.scss ***!
  \**************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// Imports\nvar ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/css-loader/dist/runtime/api.js\");\nexports = ___CSS_LOADER_API_IMPORT___(false);\n// Module\nexports.push([module.i, \"\", \"\"]);\n// Exports\nmodule.exports = exports;\n\n\n//# sourceURL=webpack:///./src/Routes/Home/home.scss?./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src!./node_modules/sass-loader/dist/cjs.js");

/***/ }),

/***/ "./src/LandingPage/LandingPage.jsx":
/*!*****************************************!*\
  !*** ./src/LandingPage/LandingPage.jsx ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return LandingPage; });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _landingPage_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./landingPage.scss */ \"./src/LandingPage/landingPage.scss\");\n/* harmony import */ var _landingPage_scss__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_landingPage_scss__WEBPACK_IMPORTED_MODULE_1__);\n\n\nvar isMobile = {\n  Android: function Android() {\n    return navigator.userAgent.match(/Android/i);\n  },\n  BlackBerry: function BlackBerry() {\n    return navigator.userAgent.match(/BlackBerry/i);\n  },\n  iOS: function iOS() {\n    return navigator.userAgent.match(/iPhone|iPad|iPod/i);\n  },\n  Opera: function Opera() {\n    return navigator.userAgent.match(/Opera Mini/i);\n  },\n  Windows: function Windows() {\n    return navigator.userAgent.match(/IEMobile/i);\n  },\n  any: function any() {\n    return isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows();\n  }\n};\nfunction LandingPage() {\n  var landingPageSection = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createRef();\n\n  var updateBackgroundImage = function updateBackgroundImage() {\n    var element = landingPageSection.current;\n    var parallaxEffect = -.2;\n    var offset = 0;\n\n    if (!isMobile.any()) {\n      element.style.backgroundPositionY = \"calc(\".concat(parallaxEffect * window.scrollY, \"px + \").concat(offset, \"px)\");\n    }\n  };\n\n  Object(react__WEBPACK_IMPORTED_MODULE_0__[\"useEffect\"])(function () {\n    window.addEventListener('scroll', updateBackgroundImage);\n    return window.removeEventListener('scroll', updateBackgroundImage);\n  }, []);\n  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"section\", {\n    ref: landingPageSection,\n    className: \"landing\"\n  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"div\", {\n    className: \"landing--text\"\n  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"h1\", null, \"Samuel Bernheim\"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"p\", null, \"Software Engineer at Twitter\")));\n}\n\n//# sourceURL=webpack:///./src/LandingPage/LandingPage.jsx?");

/***/ }),

/***/ "./src/LandingPage/landingPage.scss":
/*!******************************************!*\
  !*** ./src/LandingPage/landingPage.scss ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var api = __webpack_require__(/*! ../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ \"./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js\");\n            var content = __webpack_require__(/*! !../../node_modules/css-loader/dist/cjs.js!../../node_modules/postcss-loader/src!../../node_modules/sass-loader/dist/cjs.js!./landingPage.scss */ \"./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src/index.js!./node_modules/sass-loader/dist/cjs.js!./src/LandingPage/landingPage.scss\");\n\n            content = content.__esModule ? content.default : content;\n\n            if (typeof content === 'string') {\n              content = [[module.i, content, '']];\n            }\n\nvar options = {};\n\noptions.insert = \"head\";\noptions.singleton = false;\n\nvar update = api(content, options);\n\n\n\nmodule.exports = content.locals || {};\n\n//# sourceURL=webpack:///./src/LandingPage/landingPage.scss?");

/***/ }),

/***/ "./src/Routes/Home/Home.jsx":
/*!**********************************!*\
  !*** ./src/Routes/Home/Home.jsx ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _home_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./home.scss */ \"./src/Routes/Home/home.scss\");\n/* harmony import */ var _home_scss__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_home_scss__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _LandingPage_LandingPage_jsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../LandingPage/LandingPage.jsx */ \"./src/LandingPage/LandingPage.jsx\");\n\n\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (function () {\n  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(\"section\", {\n    className: \"home\"\n  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_LandingPage_LandingPage_jsx__WEBPACK_IMPORTED_MODULE_2__[\"default\"], null));\n});\n\n//# sourceURL=webpack:///./src/Routes/Home/Home.jsx?");

/***/ }),

/***/ "./src/Routes/Home/home.scss":
/*!***********************************!*\
  !*** ./src/Routes/Home/home.scss ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var api = __webpack_require__(/*! ../../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ \"./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js\");\n            var content = __webpack_require__(/*! !../../../node_modules/css-loader/dist/cjs.js!../../../node_modules/postcss-loader/src!../../../node_modules/sass-loader/dist/cjs.js!./home.scss */ \"./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src/index.js!./node_modules/sass-loader/dist/cjs.js!./src/Routes/Home/home.scss\");\n\n            content = content.__esModule ? content.default : content;\n\n            if (typeof content === 'string') {\n              content = [[module.i, content, '']];\n            }\n\nvar options = {};\n\noptions.insert = \"head\";\noptions.singleton = false;\n\nvar update = api(content, options);\n\n\n\nmodule.exports = content.locals || {};\n\n//# sourceURL=webpack:///./src/Routes/Home/home.scss?");

/***/ })

}]);