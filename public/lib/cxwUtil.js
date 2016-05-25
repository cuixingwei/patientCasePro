/* 本月第一天 */
function firstOfMouth() {
    var curr_time = new Date();
    var y = curr_time.getFullYear();
    var m = curr_time.getMonth() + 1;
    return y + '-' + (m < 10 ? ('0' + m) : m) + "-01 " + "00:00:00";
}
/* 当前日期 */
function getCurrentTime() {
    var curr_time = new Date();
    var y = curr_time.getFullYear();
    var m = curr_time.getMonth() + 1;
    var d = curr_time.getDate();
    var hh = curr_time.getHours();
    var mm = curr_time.getMinutes();
    var ss = curr_time.getSeconds();
    return y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d)
        + ' ' + (hh < 10 ? ('0' + hh) : hh) + ':'
        + (mm < 10 ? ('0' + mm) : mm) + ':' + (ss < 10 ? ('0' + ss) : ss);
}
/*判断字符串是否为空*/
function isBlankOrEmpty(data) {
    if (data == '' || data == undefined || data == null || data == 'undefined') {
        return true;
    } else {
        return false;
    }
}

/**
 * 计算与当前时间得差是否大于2两（48小时）
 * @param recordTime
 */
function isPassTwoDay(recordTime) {
    recordTime = recordTime.replace(/-/g, "/");
    recordTime = new Date(recordTime);
    var currentTime = getCurrentTime().replace(/-/g, "/");
    currentTime = new Date(currentTime);
    var date = 0; //时间差
    date = currentTime - recordTime;
    var hours = Math.floor(date / (3600 * 1000));
    if (hours > 48) {
        return true;
    } else {
        return false;
    }
}
