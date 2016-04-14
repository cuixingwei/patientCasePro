/**
 * Created by Dell on 2015/11/21.
 */
/**
 * 把秒格式化成几时几分几秒
 * @param second
 * @returns {string}
 */
exports.formatSecond = function (second) {
    var ss = '0秒';
    if (!isNaN(second)) {
        var hours = Math.floor(second / (60 * 60));
        var minutes = Math.floor(second / 60) - hours * 60;
        var seconds = second - minutes * 60 - hours * 60 * 60;
        console.log("hours:" + hours + ";minutes:" + minutes + ";seconds:" + seconds);
        if (hours > 0) {
            ss = hours + '时' + minutes + '分' + seconds + '秒';
        } else if (minutes > 0) {
            ss = minutes + '分' + seconds + '秒';
        } else {
            ss = seconds + '秒';
        }
    }
    return ss;
}
/**
 * 计算百分比
 * @param total
 * @param portion
 * @returns {string}
 */
exports.calculateRate = function (total, portion) {
    if (isNaN(total)) {
        total = 0;
    }
    if (isNaN(portion)) {
        portion = 0;
    }
    return (Math.round(portion / total * 10000) / 100.00 + "%");// 小数点后两位百分比
}

/**
 * 获取当前日期
 * @returns {string}
 */
exports.getCurrentTime = function () {
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