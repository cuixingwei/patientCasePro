/**
 * Created by Dell on 2016/3/25.
 */
var connectionConfig = require('../config/sql.json'); //加载连接配置

var ConnectionPool = require('tedious-connection-pool');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var async = require('async');
var log = require('log4js').getLogger("msdb");

var poolConfig = {
    min: 2,
    max: 4,
    log: true
};

var pool = new ConnectionPool(poolConfig, connectionConfig);
//	执行查询
exports.select = function (trans, callback) {

    //acquire a connection
    pool.acquire(function (err, connection) {
        if (err) {
            log.error('sqlsever 链接失败!');
            return callback(true, '数据库连接失败!' + err);
        }
        console.log("数据库连接成功!");
        var result = [];
        //use the connection as normal
        var request = new Request(trans.statement, function (err, rowCount) {
            if (err) {
                log.error(err);
                return callback(true, '执行操作失败!!' + err);
            }
            callback(null, result);
            console.log('rowCount: ' + rowCount);
            //release the connection back to the pool when finished
            connection.release();
        });

        //添加参数
        for (i = 0; i < trans.params.length; i++) {
            var data = trans.params[i];
            request.addParameter(data.name, TYPES.NVarChar, data.value);
        }

        request.on('row', function (columns) {
            //callback(null, columns);
            result.push(columns);
        });
        connection.execSql(request);
    });
    pool.on('error', function (err) {
        log.error(err);
    });
};

//	修改、插入、删除
exports.change = function (trans, callback) {
    //acquire a connection
    pool.acquire(function (err, connection) {
        if (err) {
            log.error('sqlsever 链接失败!');
            return callback(true, '数据库连接失败!' + err);
        }
        console.log("数据库连接成功!");
        //use the connection as normal
        var request = new Request(trans.statement, function (err, rowCount) {
            if (err) {
                log.error(err);
                return callback(true, '操作失败!!' + err);
            }
            console.log('改变行数 : ' + rowCount);
            callback(null, rowCount);
            //release the connection back to the pool when finished
            connection.release();
        });
        //添加参数
        for (i = 0; i < trans.params.length; i++) {
            var data = trans.params[i];
            switch (data.type) {
                case "tinyint":
                    request.addParameter(data.name, TYPES.TinyInt, data.value);
                    break;
                case "char":
                    request.addParameter(data.name, TYPES.Char, data.value);
                    break;
                case "int":
                    request.addParameter(data.name, TYPES.Int, data.value);
                    break;
                default :
                    request.addParameter(data.name, TYPES.NVarChar, data.value);
            }
        }

        connection.execSql(request);
    });
    pool.on('error', function (err) {
        console.error(err);
    });
};
/**
 * 批量操作
 * @param trans
 * @param callback
 */
exports.changeSeries = function (trans, callback) {
    //acquire a connection
    pool.acquire(function (err, connection) {
        if (err) {
            log.error('sqlsever 链接失败!');
            return callback(true, '数据库连接失败!' + err);
        }
        console.log("数据库连接成功!");
        //开启事务
        connection.beginTransaction(function (err) {
            if (err) {
                console.log('sql beginTransaction err:' + err);
                connection.release();
                return callback(true, err);
            }
            console.log('开启事务成功');
            var result = [];
            async.eachSeries(trans, function (item, cb) {
                //use the connection as normal
                var request = new Request(item.statement, function (err, rowCount) {
                    if (err) {
                        log.error(err);
                        return cb(err);
                    }
                    result.push(rowCount);
                    console.log('执行成功一条,结果rowCount=' + rowCount);
                    cb();
                });
                //添加参数
                for (i = 0; i < item.params.length; i++) {
                    var data = item.params[i];
                    switch (data.type) {
                        case "tinyint":
                            request.addParameter(data.name, TYPES.TinyInt, data.value);
                            break;
                        case "char":
                            request.addParameter(data.name, TYPES.Char, data.value);
                            break;
                        case "int":
                            request.addParameter(data.name, TYPES.Int, data.value);
                            break;
                        default :
                            request.addParameter(data.name, TYPES.NVarChar, data.value);
                    }
                }

                connection.execSql(request);
            }, function (err) {
                console.log('全部执行结束，还未提交!err=' + err);
                if (err) {
                    connection.rollbackTransaction(function (err) {
                        console.log('star rollback');
                        callback(true, '回滚失败-' + err);
                    });
                } else {
                    console.log('执行完成，开始提交之前');
                    connection.commitTransaction(function (err) {
                        console.log('执行完成，开始提交');
                        if (err) {
                            connection.rollbackTransaction(function (err) {
                                callback(true, '回滚失败-' + err);
                            });
                        }
                    });
                    callback(err, result);
                }
                connection.release();
            });
        });

    });
    pool.on('error', function (err) {
        log.error(err);
    });
};

