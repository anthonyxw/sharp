
/**
 * 兼容Chrome浏览器，location.href在frame时返回about:blank，只能处理location对象
 * @param {Object} ifrm
 * @param {Object} params
 */
function hrefHandle(ifrm, params) {
	var url = ifrm.location.href;
	if (url == "about:blank") // YQ.browser == "chrome"
		url = ifrm.location;
	url = url.substring(0, url.indexOf("?")) + params;
	ifrm.location = url;
}

/**
 * 控制下拉框，如果有defval，那么设置并触发change事件；否则切换显示和隐藏<br>
 * 由于兼容性的问题，在ie6时必须使用定时器处理
 * @param {Object} obj
 * @param {Object} defval
 * @param {Object} chg
 */
function selHandle(obj, defval, chg) {
	if (YQ.browser == "ie" && YQ.browserVersion == "6.0")
		setTimeout(function() {
			if (defval != undefined) {
				obj.val(defval);
				if (chg) try {obj.change();} catch (e) {}
			}
			else 
				if (obj.is(":visible")) obj.hide(); else obj.show();
		},1);
	else {
		if (defval != undefined) {
			obj.val(defval);
			if (chg) try {obj.change();} catch (e) {}
		}
		else 
			if (obj.is(":visible")) obj.hide(); else obj.show();
	}
}

/**
 * 根据字典创建下拉框
 * @param {Object} obj 下拉框ID
 * @param {Object} defval 默认值
 */
function createSelObj(obj, defval) {
	var dictObj = eval(obj.attr("name").replace("sel", "dict"));
	obj.empty();
	if (sysSelectAll) obj.append("<option value='0'>全部</option>");
	for(var key in dictObj) {
		obj.append("<option value='" + key + "'>" + dictObj[key] + "</option>");
	}
	if (defval) selHandle(obj, defval);
	if (!obj.attr("rele"))
		return obj;

	obj.unbind("change").bind("change", function() { // 如果有关联元素操作
		var reles = $(this).attr("rele").split(";");
		var relv = $(this).attr("relv");
		for (var i = 0; i < reles.length; i++) {
			if (reles[i].charAt(0) != '#') 
				reles[i] = "#" + reles[i];
			if (reles[i].startWith("#tr")) { // 如果关联的是tr，那么控制其显示隐藏
				if ($(this).val() == relv) {
					$(reles[i]).show();
				} else {
					$(reles[i]).hide();
				}
			} else if (reles[i].startWith("#sel")) { // 如果关联的是sel，那么控制其值，并触发change事件
				selHandle($(reles[i]), ($(this).val() == relv) ? 1 : 0, true);
			} else { // 否则仅仅是将当前值返回
				$(reles[i]).val($(this).val());
			}
		}
	});
	return obj;
}

/**
 * 创建单选框组
 * @param {Object} obj 行ID
 * @param {Object} defval 默认值
 */
function createRadObj(obj, defval) {
	var name = obj.attr("name").substr(2);
	var dictObj = eval("dict" + name);
	obj.empty();
	var str = "";
	for(var key in dictObj) {
		str += "<input type=\"radio\" name=\"rad" 
			+ name + "\" value=\"" + key + "\"" 
			+ (key == defval ? " checked" : " ") + ">" 
			+ dictObj[key] + "</input>&nbsp;";
	}
	obj.html(str);
	obj.find(":radio").addClass("ReadOnlyYes");
	if (!obj.attr("rele"))
		return obj;

	obj.find(":radio").click(function() { // 如果有关联元素操作
		var curval = obj.find(":radio:checked").val(); // radio取值比较特殊
		var reles = obj.attr("rele").split(";");
		var relv = obj.attr("relv");
		for (var i = 0; i < reles.length; i++) {
			if (reles[i].charAt(0) != '#') 
				reles[i] = "#" + reles[i];
			if (reles[i].startWith("#tr")) { // 如果关联的是tr，那么控制其显示隐藏
				if (curval == relv) {
					$(reles[i]).show();
				} else {
					$(reles[i]).hide();
				}
			} else { // 否则仅仅是将当前值返回
				$(reles[i]).val(curval);
			}
		}
	});
	obj.find(":radio:checked").click(); // 手工触发一次，select赋值的时候会主动触发
	return obj;
}

/**
 * 创建复选框组
 * @param {Object} obj 行ID
 * @param {Object} defvals 默认值集合，前后必须加逗号
 */
function createChkObj(obj, defvals) {
	var name = obj.attr("name").substr(2);
	var dictObj = eval("dict" + name);
	obj.empty();
	var defstr = "," + defvals;
	var str = "";
	var i = 1;
	for(var key in dictObj) {
		str += "<input type=\"checkbox\" name=\"chk" 
			+ name + (i++) + "\" value=\"" + key + "\"" 
			+ (defstr.indexOf("," + key + ",")>-1 ? " checked" : " ") + ">" 
			+ dictObj[key] + "</input>&nbsp;";
	}
	obj.html(str);
	return obj;
}

/**
 * 创建智能处理表单类
 * @param {Object} name
 */
function autoForm(name) {
	this.name = name;
}
autoForm.prototype = {
	/**
	 * 初始化表单
	 * @param {Object} data 初始化数据
	 */
	init : function(data) {
		var obj = this.name;
		// alert($(obj).html());
		$(obj).find("input:hidden,:text,:password,:file").each(function() {
			var tname = $(this).attr("name").substr(3).initialLower();
			if (tname in data) {
				// 如果存在ref属性，那么从字典解释
				if ($(this).attr("ref")) { 
					var dictObj = eval("dict" + $(this).attr("name").substr(3));
					$(this).val(dictObj[data[tname]]);
				} else
					// 这里不能使用attr("value", v)赋值，这种方法只对attribute有效，页面加载时没有问题
					// 但是对properties无效，即对加载之后的dom树无效
					// 只有input的attribute和properties不同步，前者用作表单的默认值!
					$(this).val(data[tname]);
			}
		});
		// 如果和上面的一起查找，有时会失败
		var hobj = $(obj).find("input[type=hidden]");
		if (hobj) {
			hobj.each(function(){
				var tname = $(this).attr("name").substr(3).initialLower();
				if (tname in data) {
					// 如果存在ref属性，那么从字典解释
					if ($(this).attr("ref")) {
						var dictObj = eval("dict" + $(this).attr("name").substr(3));
						$(this).val(dictObj[data[tname]]);
					} else
						$(this).val(data[tname]);
				}
			});
		}
		// alert("textarea");
		$(obj).find("textarea").each(function() {
			var tname = $(this).attr("name").substr(2).initialLower();
			if (tname in data) {
				$(this).val(data[tname]);
			}
		});
		// alert("select");
		$(obj).find("select").each(function() {
			var tname = $(this).attr("name").substr(3).initialLower();
			if ($(this).attr("ref")) { // 除非固定下拉框，否则必然需要解释
				var ref = $(this).attr("ref");
				var str = ref + "($(this)";
				if (tname in data) {
					str += ", '" + data[tname] + "'";
					if (ref.endWith("Class")) { // 如果是一级下拉框，那么需要给定二级下拉框的默认值
						str += ", '" + data[tname.substr(0, tname.length - 5)] + "'";
					}
				}
				eval(str + ")");
			} else {
				if (tname in data) selHandle($(this), data[tname]);
			}
		});
		$(obj).find("td[ref]").each(function() {
			var tname = $(this).attr("name").substr(2).initialLower();
			var ref = $(this).attr("ref");
			var str = ref + "($(this)";
			if (tname in data)
				str += ", '" + data[tname] + "'";
			eval(str + ")");
		});
	},
	/**
	 * 重置表单，注意select和textarea的特殊处理
	 * @param {Object} obj 表单ID
	 */
	reset : function() {
		var obj = this.name;
		$(obj)[0].reset();
		$(obj).find("select").each(function() {
			var tname = $(this).attr("name").replace("sel", "txt");
			if (tname.endWith("Class")) { // 如果是一级下拉框，则需要重新创建二级下拉框
				var ref = $(this).attr("ref");
				eval(ref.substr(0, ref.length-5) 
					+ "($(this).next(), $(obj).find(\"#" 
					+ tname + "\").val(), $(obj).find(\"#" 
					+ tname.substr(0, tname.length-5) + "\").val())");
			}
			selHandle($(this), $(obj).find("#" + tname).val());
		});
		$(obj).find("textarea").each(function() {
			var tname = $(this).attr("name").replace("ta", "txt");
			$(this).val($(obj).find("#" + tname).val());
		});
	},
	/**
	 * 创建表单提交对象
	 * @param {Object} obj
	 */
	toBean : function() {
		var data = {};
		var obj = this.name;
		$(obj).find("input:hidden,:text,:password,:file").each(function() {
			var type = $(this).attr("type");
			if (type == "radio" || type == "checkbox") 
				return true;
			// 字典解释的字段不取
			var name = $(this).attr("name");
			if (name.startWith("ref")) 
				return true;
			var tname = name.substr(3).initialLower();
			data[tname] = $.trim($(this).val());
		});
		// 如果和上面的一起查找，有时会失败
		var hobj = $(obj).find("input[type=hidden]");
		if (hobj) {
			hobj.each(function() {
				// 字典解释的字段不取
				var name = $(this).attr("name");
				if (name.startWith("ref")) 
					return true;
				var tname = name.substr(3).initialLower();
				data[tname] = $.trim($(this).val());
			});
		}
		$(obj).find("textarea").each(function() {
			var tname = $(this).attr("name").substr(2).initialLower();
			data[tname] = $.trim($(this).val());
		});
		$(obj).find("select").each(function() {
			var tname = $(this).attr("name").substr(3).initialLower();
			data[tname] = $(this).val();
		});
		$(obj).find("input[type=radio]:checked").each(function() {
			var tname = $(this).attr("name").substr(3).initialLower();
			data[tname] = $(this).val();
		});
		var chk = {};
		$(obj).find("input[type=checkbox]:checked").each(function() {
			var tname = $(this).attr("name");
			tname = tname.substring(3, tname.length - 1).initialLower();
			if (tname in chk) {
				chk[tname] += "," + $(this).val();
			} else {
				chk[tname] = $(this).val();
			}
		});
		for (var key in chk) {
			data[key] = "[" + chk[key] + "]";
		}
		return data;
	},
	/**
	 * 根据输入框前列的label标签校验输入是否合法
	 * @param {Object} obj 表单ID
	 */
	valid : function() {
		var obj = this.name;
		var aok = true;
		$(obj).find("label[class^=is]").each(function() {
			if ($(this).parent().parent().is(":hidden")) { // 行是否隐藏
				return true;
			}
			var tcls = $(this).attr("class");
			var tok = $(this).html() == "*"; // 是否必须填写
			
			var tstr = $.trim($(this).parent().text());
			if (tstr.startWith("其中")) {
				tstr = tstr.substr(3);
			}
			tstr = tstr.substr(0, tstr.indexOf("："));
			
			var tobj, tval, tmax;
			if (tcls.startWith("isNumcode")) {
			    tobj = $(this).parent().next().find("input");
				tval = $.trim($(tobj).val());
				if (tok) {
					aok = aok && !isInvalid(tval);
					tstr += "必须填写，且";
				}
				aok = aok && isNumcode(tval);
				tstr += "必须为数字！";
				if (tcls.length > 9) {
					tval = parseInt(tval);
					tmax = parseInt(tcls.substr(9));
					aok = aok && (tval >= 0) && (tval <= tmax);
					tstr += "范围[0~" + tmax + "]";
				}
			} else if (tcls.startWith("isDouble")) {
				tobj = $(this).parent().next().find("input");
				tval = $.trim($(tobj).val());
				if (tok) {
					aok = aok && !isInvalid(tval);
					tstr += "必须填写，且";
				}
				aok = aok && isDouble(tval);
				tstr += "必须为数字，小数点后最多保留4位！";
				if (tcls.length > 8) {
					tval = parseFloat(tval);
					tmax = parseFloat(tcls.substr(8));
					aok = aok && (tval >= 0) && (tval <= tmax);
					tstr += "范围[0~" + tmax + "]";
				}
			} else if (tcls.startWith("isInput")) {
				tobj = $(this).parent().next().find("input");
				tval = $.trim($(tobj).val());
				if (tok) {
					aok = aok && !isInvalid(tval);
					tstr += "必须填写";
				}
				if (tcls.length > 7) {
					tmax = parseInt(tcls.substr(7));
					aok = aok && (getLength(tval) <= tmax);
					if (tok) {
						tstr += "，且";
					}
					tstr += "最多" + tmax + "个字符！";
				}
			} else if (tcls.startWith("isSelect")) {
				tobj = $(this).parent().next().find("select:last");
				tval = $(tobj).val();
				if (tok) {
					aok = aok && !isInvalid(tval);
					tstr = "请选择" + tstr + "！";
				}
			} else if (tcls.startWith("isTextarea")) {
				tobj = $(this).parent().next().find("textarea");
				tval = $.trim($(tobj).val());
				if (tok) {
					aok = aok && !isInvalid(tval);
					tstr += "必须填写";
				}
				if (tcls.length > 10) {
					tmax = parseInt(tcls.substr(10));
					aok = aok && (getLength(tval) <= tmax);
					if (tok) {
						tstr += "，且";
					}
					tstr += "最多" + tmax + "个字符！";
				}				
			}

			if (!aok) {
				alert(tstr);
				$(tobj).focus();
				return aok;
			}
		});
		return aok;
	},
	/**
	 * 输入框设置为只读格式
	 */
	readonly : function(e) {
		var obj = this.name;
		if (e) {
			var o = $(obj).find(e);
			o.css("text-align", "left").attr("readonly", true).addClass("ReadOnlyYes");
			var d = Math.max(o.attr("size"), getLens(o.val()));
			o.attr("size", d);
			return;
		};
		// alert(e);
		$(obj).find("input:visible").each(function() {
			$(this).css("text-align", "left").attr("readonly", true).addClass("ReadOnlyYes");
			var d = Math.max($(this).attr("size"), getLens($(this).val()));
			$(this).attr("size", d);
		});
		$(obj).find("textarea:visible").each(function() {
			// $(this).attr("rows", "3");
			$(this).attr("readonly", true).addClass("ReadOnlyYes");
		});		
	},
	writable : function(e) {
		var obj = this.name;
		$(obj).find(e).removeClass("ReadOnlyYes").removeAttr("readonly");
	}
}