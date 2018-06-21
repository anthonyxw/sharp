
var sysPageSize = 10; //每页默认显示的行数
var sysSelectAll = false; // 下拉框是否显示一个全部选择项
var sysAdminUser = 1;
var sysPassword = "123456"; //系统初始密码
var bizErr = {111:"增加失败!", 112:"修改失败!", 113:"删除失败!",
		501:"登录名已经存在!", 502:"密码错误!", 503:"用户已经被强制注销!", 504:"用户已经在ex登陆!", 505:"用户未注册!", 511:"用户登录失败!",
		601:"设备不存在!", 602:"已经绑定该设备!", 603:"设备已经被绑定!", 
		611:"设备绑定失败!", 612:"设备去绑定失败!", 615:"设备开机失败!", 
		621:"设备参数更新失败!", 622:"设备参数记录日志失败!"};

/**
 * 浏览器版本检查，兼容处理
 */
var YQ = {};
var ua = navigator.userAgent.toLowerCase(),
	browserRegExp = {
		ie:/msie[ ]([\w.]+)/,
		firefox:/firefox[ |\/]([\w.]+)/,
		chrome:/chrome[ |\/]([\w.]+)/,
		safari:/version[ |\/]([\w.]+)[ ]safari/,
		opera:/opera[ |\/]([\w.]+)/
	};
YQ.browser = 'unknow';
YQ.browserVersion = '0';
for(var i in browserRegExp){
	var match = browserRegExp[i].exec(ua);
	if(match){
		YQ.browser = i;
		YQ.browserVersion = match[1];
		break;	
	}
}

/**
 * 设置ajax缓存
 */
$.ajaxSetup({cache:false});

$.fn.serializeObject = function()
 {
     var o = {};
     var a = this.serializeArray();
     $.each(a, function() {
         if (o[this.name] !== undefined){
             if (!o[this.name].push) {
                 o[this.name] = [o[this.name]];
             }
             o[this.name].push(this.value || '');
         } else {
             o[this.name] = this.value || '';
         }
     });
     return o;
 };

/**
 * 注册DWR错误处理方法
 */
if (DWREngine)
	DWREngine.setErrorHandler(errHandle);

/**
 * 错误编码规则：-[funcid]+(CRUD)+(0-99)<br>
 * 	如-1101，指funcid=1的新增1型错误<br>
 *  -2，指(CRUD)没有权限<br>
 *  -1，指(SQL)异常<br>
 *  0，指(HTTP)异常<br>
 *  其他，指后台接口失败，由接口返回错误码和错误描述<br>
 */
function errHandle(message, ex) {
	if (!ex) {
		ex = "";
	} else if (typeof(ex) == "object") {
		ex = ex.description;
		if (ex == undefined) ex = "未知错误";
	} else 
		ex = "(" + ex + ")";
	var err = parseInt(message);
	if (err == 0) {
		alert("系统异常(0)," + ex + "，请检查网络连接状态!");
	} else if (err == -1) {
		alert("操作失败(1)," + ex + "，请检查数据库连接!");
	} else if (err == -2) {
		alert("相关操作的权限不足(2)!");
		// history.back();
		var id = ex.replace(".", "");
		parent.removeTab(id);
	} else if (err < 0) {
		alert(bizErr[-err].replace("ex", ex));
	} else {
		alert(ex + "(" + message + ")");
	}
}

/**
 * Cookie管理，默认有效期到session结束
 */
function setCookie(data) {
	$.cookie("userid", data.userid);
	$.cookie("loginname", data.loginname);
	$.cookie("powertype", data.powertype);
}

function getCookie(key) {
	return $.cookie(key);
}

function removeCookie() {
	$.cookie("userid", null);
	$.cookie("loginname", null);
	$.cookie("powertype", null);
}

/**
 * 页面级权限校验，如果没有权限提示并返回父页面
 * @param {Object} funcid
 * @param {Object} callback
 */
function checkUser(funcid, callback) {
	var uri = getWebAddr("/html/");
	var powertype = getCookie("powertype");
	if (isInvalid(powertype)) {
		window.top.location = uri + "/html/login.html";
		return;
	}
	if (!funcid || !haveRight(funcid)) {
		errHandle(-2, funcid);
		return;
	}
	buildFooterHTML(uri);
	if (callback) callback();
}

/**
 * 功能级权限校验，一般用来控制功能操作的显示状态
 * @param {Object} funcid
 */
function haveRight(funcid) {
	var rok = false;
	var powertype = getCookie("powertype");
	switch (parseInt(powertype)) {
		case 7 : 
			rok = !funcid.startWith("question.");
			break;
		case 3 : 
			rok = funcid.startWith("question.");
			break;
		default :
	}
	return rok;
}

/**
 * 页面框架显示
 */
function buildFooterHTML(uri){
	var tbl = "<table width=\"90%\" border=\"0\" class=\"footer\">";
	tbl += "<tr>";
	tbl += "<td align=\"center\"><hr size=\"1\"><b>版权所有</b>&nbsp;<a href=\"" 
		+ uri + "\" target=\"new\">车载空气净化器</a></td>";
	tbl += "</tr>";
	tbl += "</table>";
	$("#footer").after(tbl);
}

/**
 * 查询无结果的表格处理
 */
function buildListsBlankHTML() {
	var atr = "<tr>";
	atr += "<td colspan=\"20\" align=\"center\">";
	atr += "没有可以操作的记录!";
	atr += "</td>";
	atr += "</tr>";
	$("#showlists").append(atr);
}

/**
 * 查询有数据时的表格处理
 * @param {Object} parent
 */
function buildListsStyle(){
	$("#showlists tr").bind({
		mouseover : function() {$(this).css("backgroundColor", "#cccccc")},
		mouseout : function() {$(this).css("backgroundColor", "")}
	});
}

function buildPagesHTML(url, count, page) {
	var pagecount = Math.floor(count / sysPageSize);
	if (count % sysPageSize != 0) {
		pagecount++;
	}
	page = parseInt(page);
	var atr = "<tr bgcolor=\"#cccccc\">";
	//atr += "<input type=\"hidden\" id=\"frmPage\" value=\"" + url + "\"/>";
	atr += "<form id=\"frmPage\" action=\"" + url + "\" method=\"post\" onsubmit=\"return false;\">";
	atr += "<td colspan=\"20\" align=\"right\">共有&nbsp;" 
		+ count + "&nbsp;条记录，每页&nbsp;" 
		+ sysPageSize + "&nbsp;条，这是第&nbsp;" 
		+ page + "/" + pagecount + "&nbsp;页";
	atr += "<button onclick=\"gotoPage(1)\">首 页</button>";
	atr += "<button " + (page==1 ? "disabled" : "onclick=\"gotoPage(" 
		+ (page-1) + ")\"") + ">上一页</button>";
	atr += "<button " + (page==pagecount ? " disabled" : "onclick=\"gotoPage(" 
		+ (page+1) + ")\"") + ">下一页</button>";
	atr += "<button onclick=\"gotoPage(" 
		+ pagecount + ")\">尾 页</button>";
	//atr += "<button onclick=\"gotoPage(0, " + pagecount + ")\">跳转到</button>";
	atr += "跳转到第&nbsp;<input type=\"text\" id=\"txtGoto\" name=\"txtGoto\" size=\"1\" value=\"" 
		+ page + "\" style=\"background-color:#ffffff\">&nbsp;页&nbsp;";
	atr += "<button onclick=\"gotoPage(0, " + pagecount + ")\">GO</button>&nbsp;&nbsp;";
	atr += "</td>";
	//atr += "</form>";
	atr += "</tr>";
	$("#showpages").append(atr);
}
function gotoPage(page, pagecount) {
	if (page == 0) {
		page = $("#showpages #txtGoto").val();
		if (isInvalid(page)) {
			alert("请输入要跳转的页数!");
			return false;
		} 
		page = parseInt(page);
		if (page < 1) page = 1;
		if (page > pagecount) page = pagecount;
	}
	// chrome会自动提交，必须要设置onsubmit=return false;
	var url = $("#frmPage")[0].action;
	//alert(url);
	if (url.indexOf("$") > -1) {
		// chrome会自动加上本窗口的http地址
		url = url.substr(url.indexOf("$") + 1).replace('?', page);
		eval(url);
	} else {
		url += (url.indexOf("?") > 0) ? "&page=" + page : "?page=" + page;
		$("#frmPage")[0].action = url;
		$("#frmPage")[0].submit();
	}
}

function buildPagesStyle() {
	var uri = getWebAddr("/html/");
	$("#showpages tr:last button").css({
		"font-size": "12px",
		"color" : "red",
		"background-color": "#cccccc",
		"background-image": "url(" + uri + "/css/former/images/blank.gif)",
		"border": "1px solid #cccccc",
		"padding-top" : "8px",
		"padding-left" : "4px",
		"padding-right" : "4px",
		"clip": "rect(100px auto auto auto)"
	}).bind({
		mouseover:function() {
			$(this).css({
				"cursor": "hand",
				"borderRight": "1px solid buttonshadow",
				"borderLeft": "1px solid buttonhighlight",
				"borderBottom": "1px solid buttonshadow",
				"borderTop": "1px solid buttonhighlight"
			});
		},
		mouseout:function() {$(this).css("border", "1px solid #cccccc");}
	});
}
