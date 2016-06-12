/**
 * Created by Dell on 2016/3/25.
 */
var connectionConfig = require('../config/sql.json'); //加载连接配置
var logger  = require("./log").logger; //日志

var ConnectionPool = require('tedious-connection-pool');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var async = require('async');

var poolConfig = {
    min: 2,
    max: 10,
    log: true
};

var pool = new ConnectionPool(poolConfig, connectionConfig);
//	执行查询
exports.select = function (trans, callback) {

    //acquire a connection
    pool.acquire(function (err, connection) {
        if (err) {
            logger.error('sqlsever 链接失败!');
            return callback(true, '数据库连接失败!' + err);
        }
        var result = [];
        //use the connection as normal
        var request = new Request(trans.statement, function (err, rowCount) {
            if (err) {
                logger.error(err);
                connection.release();
                return callback(true, '执行操作失败!!' + err);
            }
            //release the connection back to the pool when finished
            connection.release();
            callback(null, result);
        });

        //添加参数
        for (i = 0; i < trans.params.length; i++) {
            var data = trans.params[i];
            request.addParameter(data.name, TYPES.NVarChar, data.value);
        }

        request.on('row', function (columns) {
            result.push(columns);
        });
        connection.execSql(request);
    });
    pool.on('error', function (err) {
        logger.error(err);
    });
};

//	修改、插入、删除
exports.change = function (trans, callback) {
    //acquire a connection
    pool.acquire(function (err, connection) {
        if (err) {
            logger.error('sqlsever 链接失败!');
            return callback(true, '数据库连接失败!' + err);
        }
        //use the connection as normal
        var request = new Request(trans.statement, function (err, rowCount) {
            if (err) {
				logger.error('数据库修改时出错'+err);
                connection.release();
                return callback(true, '操作失败!!' + err);
            }
            //release the connection back to the pool when finished
            connection.release();
            callback(null, rowCount);
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
                case "money":
                    request.addParameter(data.name, TYPES.Money, data.value);
                    break;
                default :
                    request.addParameter(data.name, TYPES.NVarChar, data.value);
            }
        }

        connection.execSql(request);
    });
    pool.on('error', function (err) {
		logger.error('数据库修改时出错'+err);
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
            logger.error('sqlsever 链接失败!');
            return callback(true, '数据库连接失败!' + err);
        }
        //开启事务
        connection.beginTransaction(function (err) {
            if (err) {
				logger.error('数据库批量修改时开启事务出错'+err);
                connection.release();
                return callback(true, err);
            }
            var result = [];
            async.eachSeries(trans, function (item, cb) {
                //use the connection as normal
                var request = new Request(item.statement, function (err, rowCount) {
                    if (err) {
                        logger.error('数据库批量修改时出错'+err);
                        return cb(err);
                    }
                    result.push(rowCount);
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
                        case "money":
                            request.addParameter(data.name, TYPES.Money, data.value);
                            break;
                        default :
                            request.addParameter(data.name, TYPES.NVarChar, data.value);
                    }
                }

                connection.execSql(request);
            }, function (err) {
                if (err) {
					logger.error('数据库批量修改时出错'+err);
                    connection.rollbackTransaction(function (err) {
                        connection.release();
                        logger.error('回滚失败');
                        callback(true, '回滚失败-' + err);
                    });
                } else {
                    connection.commitTransaction(function (err) {
                        logger.error('执行完成，开始提交err' + err);
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
		logger.error('数据库批量修改时出错'+err);
    });
};

