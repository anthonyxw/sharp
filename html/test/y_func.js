
String.prototype.startWith = function(str) {
	if (str == null || str == "" || this.length == 0) return false;
	var strs = str.split(";");
	for (var i=0; i<strs.length; i++) {
		if ((this.length >= strs[i].length) && (this.substr(0, strs[i].length) == strs[i])) return true;
	}
	return false;
}

String.prototype.endWith = function(str) {
	if (str == null || str == "" || this.length == 0) return false;
	var strs = str.split(";");
	for (var i=0; i<strs.length; i++) {
		if ((this.length >= strs[i].length) && (this.substr(this.length - strs[i].length) == strs[i])) 
			return true;
	}
	return false;
}

String.prototype.initialLower = function() {
	if (this == null || this == "" || this.length == 0) return "";
	var str = this.substr(0,1).toLowerCase();
	if (this.length > 1) 
		str += this.substr(1);
	return str;
}

String.prototype.toHTML = function() {
	if (this == null || this == "" || this.length == 0) return "";
	var str = this.replace(/\r|\n/g, "");
	str = str.replace(/</g, "&lt;");
	str = str.replace(/"/g, "&#34;");
	str = str.replace(/'/g, "&#39;");
	return str;
}

/**
 * 判断是否为空串、零长字符串(包括全都是空格)
 * @param {Object} str
 */
function isInvalid(str) {
	if (str == null || str == "") return true;
	if ($.trim(str) == "") return true;
	return false;
}

/**
 * 将全角字符串转化为半角字符串
 * @param {Object} str
 */
function halfWidth(str) {
	if (isInvalid(str)) return str;
	var hwstr = "";
	for (var i=0 ; i<str.length; i++){
		var c = str.charCodeAt(i);
		if (c == 12288) {
      		hwstr += " ";
			continue;
  		}
		if (c == 12290) {
      		hwstr += ".";
			continue;
  		}
		if (c > 65280 && c < 65375) {
       		hwstr += String.fromCharCode(c - 65248);
			continue;
  		}
  		hwstr += String.fromCharCode(c);
 	}
	return hwstr;
}

/**
 * 判断字符串是否为空，如果为空返回默认值；如果展示在页面，还需要做一些替换
 * @param {Object} str
 * @param {Object} defval
 * @param {Object} ishtml
 */
function nvl(str, defval, ishtml) {
	if (isInvalid(str)) return defval;
	return ishtml ? str.toHTML() : str;
}

/**
 * 用于单元格的显示，如果可能太长调用此方法截断
 * @param {Object} str
 * @param {Object} defval
 */
function omit(str, defval) {
	if (isInvalid(str)) return defval;
	var k = 0;
	var aleft = "";
	var aright = "";
	for (var i=0 ; i<str.length; i++){
		if (k > 50) {
			aleft = "<a href=\"javascript:void(0)\" onclick=\"showTip('" 
				+ str.toHTML() + "');return false;\">";
			str = str.substring(0, i) + "......";
			aright = "</a>";
			break;
		}
		var c = str.charCodeAt(i);
		if (c == 12288 || c == 12290 
			|| (c > 19967 && c < 40870) || (c > 65280 && c < 65375))
       		k += 3;
		else 
  			k += 1;
 	}
	return aleft + str.toHTML() + aright;
}

function showTip(str) {
	$("#tdTip").html(str);
	$("#divTip").dialog("open");
}

/**
 * 得到字符串的长度，字符的个数
 * @param {Object} str
 */
function getLength(str) {
	if (str == null || str == "") return 0;
	return str.length;
}

/**
 * 得到字符串的编码长度，中文为3位
 * @param {Object} str
 */
function getLens(str) {
	if (str == null || str == "") return 0;
	return str.replace(/[^\x00-\xff]/gi, 'zch').length;
}

/**
 * 判断字符串是否全部为英文字母
 * @param {Object} str
 */
function isEnglish(str) {
	if (str == null || str == "") return true;
	var myReg = /^([a-zA-Z]*)$/;
	return myReg.test(str);
}

/**
 * 判断字符串是否全部为数字，不含符号
 * @param {Object} str
 */
function isNumcode(str) {
	if (str == null || str == "") return false;
	var myReg = /^(0|([1-9]\d*))$/;
	return myReg.test(str);
}

/**
 * 判断是否为一个有效的double类型，含符号位
 * @param {Object} str
 */
function isDouble(str) {
	if (str == null || str == "") return false;
	var myReg = /^((-)?(0|([1-9]\d*))(\.\d{1,4})?)$/;
	return myReg.test(str);
}

/**
 * 对数字求和，精度为原数字中的最大精度
 * @param {Object} str1
 * @param {Object} str2
 * @param {Object} str3
 */
function sumFloat(str1, str2, str3) {
	var p = 0, i = 0, l = 0;
	for (var k = 1; k < 4; k++) {
		var s = eval("str" + k);
		i = s.indexOf(".");
		if (i == -1) continue;
		l = s.substr(i).length - 1;
		if (l > p) p = l;
	}
	return (parseFloat(str1||0) + parseFloat(str2||0) + parseFloat(str3||0)).toFixed(p);
}

/**
 * 将数字保留到小数点后4位
 * @param {Object} num
 */
function getPrecision(num) {
	return Math.round(num * 10000) / 10000;
}

/**
 * 得到百分比表示
 * @param {Object} num1
 * @param {Object} num2
 */
function getPercent(num1, num2) {
	if (num2 == 0) 
		return "-";
	return Math.round((num1 / num2) * 10000) / 100 + "%";
}

Date.prototype.dateAdd = function(interval,number) { 
    var d = this; 
    var k={'y':'FullYear', 'q':'Month', 'm':'Month', 'w':'Date', 'd':'Date', 'h':'Hours', 'n':'Minutes', 's':'Seconds', 'ms':'MilliSeconds'}; 
    var n={'q':3, 'w':7}; 
    eval('d.set'+k[interval]+'(d.get'+k[interval]+'()+'+((n[interval]||1)*number)+')'); 
    return d; 
} 

Date.prototype.dateDiff = function(interval,objDate2) { 
    var d=this, i={}, t=d.getTime(), t2=objDate2.getTime(); 
    i['y']=objDate2.getFullYear()-d.getFullYear(); 
    i['q']=i['y']*4+Math.floor(objDate2.getMonth()/4)-Math.floor(d.getMonth()/4); 
    i['m']=i['y']*12+objDate2.getMonth()-d.getMonth(); 
    i['ms']=objDate2.getTime()-d.getTime(); 
    i['w']=Math.floor((t2+345600000)/(604800000))-Math.floor((t+345600000)/(604800000)); 
    i['d']=Math.floor(t2/86400000)-Math.floor(t/86400000); 
    i['h']=Math.floor(t2/3600000)-Math.floor(t/3600000); 
    i['n']=Math.floor(t2/60000)-Math.floor(t/60000); 
    i['s']=Math.floor(t2/1000)-Math.floor(t/1000); 
    return i[interval]; 
} 

/**
 * 格式化时间<br>
 * 		yy : 4位的年<br>
 * 		mm : 2位的月份<br>
 * 		dd : 2位的日<br>
 * 		dt8f : 2010-01-01<br>
 * 		dt8 : 20100101<br>
 * 		dtcls : Date?2010/01/01 10:10:10<br>
 * 		dt14f : 2010-01-01 10:10:10<br>
 * 		dt14 : 20100101101010<br>
 * 		dt17f : 2010-01-01 10:10:10:123<br>
 * 		other : 20100101101010123<br>
 * @param {Object} fmt
 * @param {Object} dt
 */
function getTime(fmt, dt, allownull) {
	var d = new Date();
	if (!isInvalid(dt))
		d = new Date(dt);
	else if (allownull) return "";
	if (fmt == "utc") return d.getTime();
	var sy,sm,sd,sdy,sh,smi,ss,ms;
	sy = d.getYear(); if (sy < 1000) sy = "" + (1900 + sy);
	if (fmt == "yy") return sy;
	sm = d.getMonth()+1; if (sm < 10) sm = "0" + sm;
	if (fmt == "mm") return sm;
	sd = d.getDate(); if (sd < 10) sd = "0" + sd;
	if (fmt == "dd") return sd;
	if (fmt == "dt8f") return sy+"-"+sm+"-"+sd;
	if (fmt == "dt8") return sy+""+sm+""+sd;
	sh = d.getHours(); if (sh < 10) sh = "0" + sh;
	smi = d.getMinutes(); if (smi < 10) smi = "0" + smi;
	ss = d.getSeconds(); if (ss < 10) ss = "0" + ss;
	if (fmt == "dtcls") return "Date?"+sm+"/"+sd+"/"+sy+" "+sh+":"+smi+":"+ss;
	if (fmt == "dt14f") return sy+"-"+sm+"-"+sd+" "+sh+":"+smi+":"+ss;
	if (fmt == "dt14") return sy+""+sm+""+sd+""+sh+""+smi+""+ss;
	ms = d.getMilliseconds(); if (ms < 10) {ms = "00" + ms;} else if (ms < 100) {ms = "0" + ms;}
	if (fmt == "dt17f") return sy+"-"+sm+"-"+sd+" "+sh+":"+smi+":"+ss +":"+ms;
	return sy+""+sm+""+sd+""+sh+""+smi+""+ss +""+ms;
}

/**
 * 在ele中显示一个时钟
 * @param {Object} ele
 */
function timeLoad(ele) {
	if(typeof(ele) == "string") ele = document.getElementById(ele);
	if(!ele) return; 
	window.setInterval(
		function(){
			var d = new Date();
			ele.innerHTML = d.toLocaleString() + ' 星期'+'日一二三四五六'.charAt(d.getDay()); 
		},1000
	);
}

Array.prototype.inArray = function(e){
    for (i = 0; i < this.length; i++) {
        if (this[i] == e) 
            return true;
    }
    return false;
}
Array.prototype.remove = function(e){
	var idx = -1;
    for (i = 0; i < this.length; i++) {
        if (this[i] == e) {
			idx = i;
			break;
		}   
    }
	if (idx > -1) this.splice(i,1);
}

/**
 * 判断一个对象是否为空
 * @param {Object} obj
 */
function isNull(obj) {
	if (typeof(obj) == "undefined") return true;
	if (typeof(obj) == "object") return obj == null;
	return false;
}

/**
 * 判断一个对象是否为空，或者长度为0
 * @param {Object} obj
 */
function isEmpty(obj) {
	if (typeof(obj) == "undefined") return true;
	if (typeof(obj) == "object") return obj == null || JSON.stringify(obj)=="{}" || JSON.stringify(obj)=="[]";
	if (typeof(obj) == "string") return obj.length==0;
	return false;
}

/**
 * 将字符串转化为一个实际的对象
 * @param {Object} obj
 */
function expp(obj) {
	if (typeof(obj) == "string") {
		if (obj == "nvl") return null;
		if (obj == "[]") return new Array();
	}
	var str = createJsonStr(obj);
	if (str.indexOf("Date?") != -1) {
		var myReg = /(\"Date\?[\d\/\s\:]{0,19}?\")/g;
		str = str.replace(myReg, function($0) {
			var dt = new Date($0.substring(6, $0.length-1));
			return dt.getTime();
		});
		return getJsonVal(str);
	}
	return obj;
}

/**
 * 得到基本类型的自定义标签
 * @param {Object} ctype
 * @param {Object} cstatus
 */
function getTypeSymbol(ctype, cstatus) {
	var str = "O";
	if (cstatus != undefined) {
		str = (cstatus == "0" || cstatus.toUpperCase() == "N") ? "*" : "";
		str = str + ctype.charAt(0).toUpperCase();
		return str;
	}
	if (ctype == "java.lang.Boolean" || ctype == "boolean") return "B"; 
	if (ctype == "java.lang.Integer" || ctype == "int") return "I"; 
	if (ctype == "java.lang.Long" || ctype == "long") return "L"; 
	if (ctype == "java.lang.Double" || ctype == "double") return "D"; 
	if (ctype == "java.lang.String") return "S";
	if (ctype == "java.util.Date") return "T"; 
	return str;
}

/**
 * 得到基本类型的默认值
 * @param {Object} ctype
 * @param {Object} cdefault
 */
function getTypeDefVal(ctype, cdefault) {
	var str = "";
	if (cdefault != undefined) {
		str = (cdefault == null) ? "" : cdefault.replace(/DEFAULT|\s|\'*/g, '');
		if (str.indexOf("convert") != -1 || str.indexOf("to_char") != -1) str = getDT("dt14");
		return str;
	}
	if (ctype == "java.lang.Boolean" || ctype == "boolean") return "true"; 
	if (ctype == "java.lang.Integer" || ctype == "int") return "0"; 
	if (ctype == "java.lang.Long" || ctype == "long") return "0"; 
	if (ctype == "java.lang.Double" || ctype == "double") return "0.0"; 
	if (ctype == "java.lang.String") return "";
	if (ctype == "java.util.Date") return getDT("dtcls");
	return str;
}

/**
 * 判断是字符串还是对象
 * @param {Object} ptype
 */
function getTypeExpress(ptype) {
	var str = "S";
	if (ptype.charAt(0) == '&' || ptype.charAt(0) == '[' || ptype == "java.util.List") return "O";
	if (ptype.startWith("com.;net.;org.")) return "O";
	return str;
}

/**
 * 将对象填充到数组中，会循环子节点
 * @param {Object} obj
 * @param {Object} dataval
 */
function getObjectArray(obj, dataval) {
	if (obj instanceof Array) {
		if (obj.length == 0) return obj;
		if (typeof(obj[0]) != "object") {
			for (var i=0; i<obj.length; i++) {
				var p = {}; p["rtnval"] = obj[i]; obj[i] = p;
			}
			return obj;
		}
		return obj;
	}
	if (typeof(obj) != "object") {
		var p = {}; p["rtnval"] = obj; obj = p;
	}
	if (obj[dataval] != undefined) {
		return obj[dataval];
	}
	var arr = []; arr[0] = obj; obj = arr; 
	return obj;
}

/**
 * 将JSON串转化为对象
 * @param {Object} str
 */
function getJsonVal(str) {
	if (str == undefined) return ""; 
	var obj = str;
	var myReg = /^((\[|\{).*(\]|\}))$/;
	if (myReg.test(str)) {
		try {obj = eval("(" + str + ")");} catch(ex) {}
	}
	return obj;
}

/**
 * 将对象转化为JSON串
 * @param {Object} obj
 * @param {Object} ishtml
 * @param {Object} nullval
 */
function createJsonStr(obj, ishtml, nullval) {
	var str = "";
	if (obj == undefined) { // null also equal defined
		return str;
	}
	else if (typeof(obj) != "object") {
		str = obj;
	}
	else if (obj instanceof Array) {
		str = JSON.stringify(obj);
	}
	else if (obj.length != undefined) {
		var objs = [];
		for (var i=0; i<obj.length; i++)  objs[i] = obj[i];
		str = JSON.stringify(objs);
	}
	else if (nullval != undefined && nullval.length > 0) {
		obj[nullval] = undefined;
		str = JSON.stringify(obj);
	}
	else {
		str = JSON.stringify(obj);
	}
	if (ishtml) {
		try {
			str = str.replace(/\'/g, "&#39;");
		}
		catch (ex) {}
	}
	return str;
}

function jsonStringify(data,space){
    var seen=[];
    return JSON.stringify(data,function(key,val){
        if(!val||typeof val !=='object'){
            return val;
        }
        if(seen.indexOf(val)!==-1){
            return '[Circular]';
        }
        seen.push(val);
        return val;
    },space);
}

/**
 * 从href中获取所有参数值 
 * @param {Object} shref
 */
function getArgsFromHref(shref) {
	var obj = {};
	if (!shref) shref = decodeURI(window.location.href);
	var lrs = shref.split("?");
	if(lrs[0] == shref) {
　　		return obj;
	}
	var args = lrs[1].split("&");
	for(var i = 0; i < args.length; i++) {
		var kn = args[i].split("=");
		if(kn.length <= 1) continue;
		obj[kn[0]] = kn[1];
	}
	return obj;
}

/**
 * 从指定的href中获取指定的参数值 
 * @param {Object} key
 * @param {Object} defval
 * @param {Object} shref
 */
function getArgFromHref(key, defval, shref) {
	if (!defval) defval = "";
	var obj = getArgsFromHref(shref);
	if (obj == undefined || obj[key] == undefined) {
		return defval;
	}
	return obj[key];
}

function getWebAddr(key, shref) {
	if (!shref) shref = decodeURI(window.location.href);
	//alert(shref);
	return shref.substring(0, shref.indexOf(key));
}
