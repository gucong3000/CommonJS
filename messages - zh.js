"use strict";

var _ = require("lodash");

var errors = {
  // JSHint options
  E001: "错误的选项: '{a}'",
  E002: "错误的选项值",

  // JSHint input
  E003: "应该是一个JSON值",
  E004: "输入是既不是一个字符串，也不是一个字符串数组",
  E005: "输入为空",
  E006: "意外的过早结束程序",

  // Strict mode
  E007: "缺少 \"use strict\"声明",
  E008: "违反严格模式",
  E009: "选项'validthis'不能使用在全局范围内使用",
  E010: "'with' 不允许在严格模式下使用",

  // Constants
  E011: "'{a}' 已声明",
  E012: "const '{a}'不应初始化为 undefined",
  E013: "试图重写'{a}'这是一个常量",

  // Regular expressions
  E014: "'/=' 会与正则表达式产生语义歧义",
  E015: "未关闭的正则表达式",
  E016: "无效正则表达式",

  // Tokens
  E017: "未关闭的注释",
  E018: "开头未关闭的注释",
  E019: "不匹配的 '{a}'",
  E020: "'{a}'应该与{c}行的'{b}'匹配，但却与'{d}'匹配",
  E021: "应该为'{a}'，而非'{b}'",
  E022: "换行错误'{a}'",
  E023: "{a}丢失",
  E024: "意外的{a}.",
  E025: "case语句中丢掉了':'",
  E026: "{a}行的'{'缺失了与之匹配的'}'",
  E027: "{a}行的'['缺失了与之匹配的']'",
  E028: "非法的逗号",
  E029: "未关闭的字符串",

  // Everything else
  E030: "应为标识符，而非'{a}'",
  E031: "错误的赋值", // FIXME: Rephrase
  E032: "此处应为小整数或false，而非'{a}'",
  E033: "此处应为运算符，而非'{a}'",
  E034: "get/set 是ES5的功能",
  E035: "缺少属性名称",
  E036: "此处应为声明语句而非块语句",
  E037: null,
  E038: null,
  E039: "此处是函数声明而不是调用。应该用括号包裹整个函数",
  E040: "每个值都应有其自己的case标签",
  E041: "不可恢复的语法错误",
  E042: "正在停止",
  E043: "错误过多",
  E044: null,
  E045: "无效的 for each 循环",
  E046: "yield 语句应内一个生成器函数内(用`function*`语法)",
  E047: null,
  E048: "{a}不应直接在块内声明",
  E049: "{a}不能命名为'{b}'",
  E050: "此处Mozilla要求yield表达要带圆括号",
  E051: null,
  E052: "未关闭的模板字符串",
  E053: "export命令必须处于全局作用域",
  E054: "类的属性必须是函数。应该用'('而非'{a}'",
  E055: "在选项'{a}'后无法设置任何可执行代码",
  E056: "使用'{a}'前未声明，这是非法的'{b}'变量",
  E057: "无效的元素属性' {a}.{b}'.",
  E058: "缺少分号",
  E059: "'{a}'和'{b}'是不兼容的语法分析选项"
};

var warnings = {
  W001: "不应使用'hasOwnProperty'作为名字",
  W002: "变量'{a}'的值可能会在IE(<=8)中被覆盖",
  W003: "'{a}'使用前未定义",
  W004: "'{a}'已经定义过了",
  W005: "数字后面的一个点会被误认为是十进制的小数点",
  W006: "语义不清晰的负数表达+",
  W007: "语义不清晰的正数表达+",
  W008: "'{a}'容易与前置小数点的写法发生语义歧义",
  W009: "数组应使用[]表示",
  W010: "对象应使用{}表示",
  W011: null,
  W012: null,
  W013: null,
  W014: "不应在’{a}’之前换行",
  W015: null,
  W016: "不应该使用'{a}'",
  W017: "错误的操作数",
  W018: "语义不清晰的使用 '{a}'",
  W019: "应使用isNaN函数来比较NaN",
  W020: "只读属性",
  W021: "不应为{a}赋值，这是一个{a}" +
    "应var或'let'来声明才能改变变量值",
  W022: "不应覆盖异常参数",
  W023: "应为赋值语句标识符，而非一个函数调用",
  W024: "应为赋值语句标识符，而非'{a}'(保留的字)",
  W025: "声明函数时丢失了函数名",
  W026: "内部函数的声明应该放在外部函数的顶部",
  W027: "在'{b}'之后无法访问'{a}'",
  W028: "标签 '{a}' 在 {b} 声明",
  W030: "应该是赋值或者函数调用，而非表达式",
  W031: "不应使用 'new' 语句",
  W032: "不必要的分号",
  W033: "缺少分号",
  W034: "不必要的指令 '{a}'",
  W035: "空的模块",
  W036: "不用使用 /* 成员 '{a}'",
  W037: "'{a}' 是声明标签",
  W038: "'{a}' 在作用域外使用",
  W039: "'{a}' 不是允许的",
  W040: "可能违反严格模式",
  W041: "应利用'{a}' 与 '{b}'比较",
  W042: "应避免使用行结尾转义",
  W043: "错误的行结尾转义。如果需要请使用选项 multistr",
  W044: "错误或不必要的转义",
  /* TODO(caitp): remove W044 */
  W045: "错误的数字'{a}'",
  W046: "不应使用额外前导0'{a}'",
  W047: "小数点的位置可能会产生歧义{a}",
  W048: "正则表达式不应使的控制字符",
  W049: "正则表达式中不应使用转义字符'{a}'",
  W050: "JavaScript URL",
  W051: "变量不能被删除",
  W052: "意外'{a}'",
  W053: "不应用{a}作为构造函数",
  W054: "Function的构造函数是eval的另一种形式",
  W055: "构造函数的名称应以大写字母开头",
  W056: "错误的构造函数",
  W057: "奇怪的构造函数。无法确认'new'是否必要的",
  W058: "使用构造函数时丢掉了'()'",
  W059: "不应使用arguments.{a}, 会让js引擎效率降低10倍",
  W060: "document.write是eval的另一种形式",
  W061: "eval is evil. eval是恶魔，千万远离他！！",
  W062: "应该用括号包裹立即执行函数" +
    "以便读者理解表达式" +
    "是一个函数的结果，而不是函数本身",
  W063: "Math不是一个函数",
  W064: "使用构造函数时，丢掉了'new'命令",
  W065: "丢失了基数跟参数，请用`parseInt(\"10\", 10)`形式",
  W066: "eval的另一种形式。应该传递函数而不是字符串",
  W067: "错误的调用",
  W068: "不应使用括号包裹非立即执行函数",
  W069: "不应使用['{a}']，请使用'.{a}'",
  W070: "多余的逗号(IE 5\\6\\7 下会报错)",
  W071: "此函数的声明过多 ({a})",
  W072: "此函数的参数过多 ({a})",
  W073: "块嵌套太深。({a})",
  W074: "这个函数的圈复杂度过高。({a})",
  W075: "{a}与'{b}'重复",
  W076: "get {b}函数不应该有参数",
  W077: "set {a}函数应该只有一个参数",
  W078: "定义了Setter，但未定义getter.",
  W079: "重新定义了'{a}'",
  W080: "'{a}'不应要初始化为undefined",
  W081: null,
  W082: "函数的声明不应该放置在块内。" +
    "应使用函数表达式或将声明语句移到" +
    "外层函数的顶部",
  W083: "不要在循环内部声明函数",
  W084: "应为条件表达式，而非赋值",
  W085: "不要用'with'，太耗js引擎资源了",
  W086: "'{a}'之前应有一个'break'语句。考虑使用`/* falls through */`",
  W087: "是否忘记了声明'debugger'？",
  W088: "不该创建全局var 变量。应该写'for (var ...'",
  W089: "for in的循环体内部，应该包裹一个if判断语句，" +
    "用以过滤掉从原型中继承的成员",
  W090: "'{a}'不是一个语句标签",
  W091: null,
  W093: "不应在返回值的同时赋值",
  W094: "不应该为逗号",
  W095: "应为一个字符串，而非{a}",
  W096: "'{a}'键可能会产生意外的结果",
  W097: "应在函数内使用\"use strict\"",
  W098: "'{a}'被定义以后，从未使用过",
  W099: null,
  W100: "这个特征可能会被一个或多个浏览器自动删除",
  W101: "行超长",
  W102: null,
  W103: "'{a}'属性是不推荐的",
  W104: "'{a}'只能在ES{b}或Mozilla JS扩展中使用。如果需要请使用选项 'esversion: {b}'或'moz'",
  W105: "不该在'{b}'中使用{a}",
  W106: "标识符'{a}'应该使用驼峰命名法",
  W107: "不得使用 Script URL",
  W108: "字符串必须使用双引号",
  W109: "字符串必须使用单引号",
  W110: "不得混用双引号和单引号，请统一",
  W112: "未关闭的字符串",
  W113: "字符串中不该有控制字符: {a}",
  W114: "不应使用{a}",
  W115: "严格模式下不允许控制字符{a}",
  W116: "应该为'{a}'，而非'{b}'",
  W117: "'{a}'未定义",
  W118: "'{a}'只能在Mozilla JS扩展中使用。如果需要请使用选项 'moz'",
  W119: "'{a}'只能在ES{b}中使用。如果需要请使用选项 'esversion: {b}'",
  W120: "这里可能泄漏一个变量({a})",
  W121: "不该扩展原生对象的原型: '{a}'",
  W122: "无效的typeof值 '{a}'",
  W123: "'{a}'已经在外部作用域定义",
  W124: "Generator函数至少应该有一个yield语句",
  W125: "此行含有“不换行空格”，此种字符由Mac下敲入，有可能造成诡异的bug",
  W126: "不应使用分组操作符",
  W127: "不应使用逗号操作符",
  W128: "空数组隐式=true",
  W129: "'{a}' 在未来版本的JavaScript中已被定义。应换一个" +
    "不同的变量名，以避免升级问题",
  W130: "rest元素后，不得再写新的元素",
  W131: "rest参数后，不得再写新的参数",
  W132: "已禁用`var`声明，应该用`let`或`const`代替",
  W133: "Invalid for-{a} loop left-hand-side: {b}.",
  W134: "选项'{a}'仅可在ECMAScript {b}代码代码中使用",
  W135: "'{a}'可能不支持非浏览器环境",
  W136: "'{a}'必须在函数的内部使用",
  W137: "空的解构赋值",
  W138: "常规参数不应该放在定义了默认值的参数之后"
};

var info = {
  I001: "Comma warnings can be turned off with 'laxcomma'.",
  I002: null,
  I003: "ES5 option is now set per default"
};

exports.errors = {};
exports.warnings = {};
exports.info = {};

_.each(errors, function(desc, code) {
  exports.errors[code] = {
    code: code,
    desc: desc
  };
});

_.each(warnings, function(desc, code) {
  exports.warnings[code] = {
    code: code,
    desc: desc
  };
});

_.each(info, function(desc, code) {
  exports.info[code] = {
    code: code,
    desc: desc
  };
});