/**
 * Created by Dell on 2015/9/20.
 */
var express = require('express');
var db = require('../utils/msdb');
var string = require('../utils/string');
var config = require('../config/config.json');
var router = express.Router();
var log = require('log4js').getLogger("dictionary");

/*在查询添加加入全部选项，用于默认选择*/
var qb = {
    id: 'qb',
    name: '全部'
};

/*返回人员列表*/
router.get('/getDispatcher', function (req, res, next) {

});

/*返回急救措施字典表*/
router.get('/getDCureMeasure', function (req, res, next) {
    var sqlData = {
        statement: " select Code,NameM from AuSp120.tb_DMeasure  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            res.json(result);
        }
    });
});

/*返回年龄字典表*/
router.get('/getDAge', function (req, res, next) {
    var sqlData = {
        statement: " select Code,NameM from AuSp120.tb_DAge  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][1].value,
                    "name": results[i][1].value
                });
            }
            res.json(result);
        }
    });
});

/*返回疾病科别字典表*/
router.get('/getDDiseaseClass', function (req, res, next) {
    var sqlData = {
        statement: " select Code,NameM from AuSp120.tb_DDiseaseClass  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            res.json(result);
        }
    });
});

/*返回出诊医院字典表*/
router.get('/getDHospitalTriage', function (req, res, next) {
    var sqlData = {
        statement: " select Code,NameM from AuSp120.tb_DHospitalTriage  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][1].value,
                    "name": results[i][1].value
                });
            }
            res.json(result);
        }
    });
});

/*返回科室字典表*/
router.get('/getDDepartment', function (req, res, next) {
    var sqlData = {
        statement: " select Code,NameM from AuSp120.tb_DDepartment  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            res.json(result);
        }
    });
});

/*返回病人转归字典表*/
router.get('/getDOutCome', function (req, res, next) {
    var sqlData = {
        statement: " select Code,NameM from AuSp120.tb_DOutCome  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            res.json(result);
        }
    });
});

/*返回送达地点字典表*/
router.get('/getDHospitalSend', function (req, res, next) {
    var sqlData = {
        statement: " select Code,NameM from AuSp120.tb_DHospitalSend  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][1].value,
                    "name": results[i][1].value
                });
            }
            res.json(result);
        }
    });
});

/*返回职业字典表*/
router.get('/getDProfession', function (req, res, next) {
    var sqlData = {
        statement: " select Code,NameM from AuSp120.tb_DProfession  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            res.json(result);
        }
    });
});

/*返回身份字典表*/
router.get('/getDIdentity', function (req, res, next) {
    var sqlData = {
        statement: " select Code,NameM from AuSp120.tb_DIdentity  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            res.json(result);
        }
    });
});

/*返回救治结果字典表*/
router.get('/getDResult', function (req, res, next) {
    var sqlData = {
        statement: " select Code,NameM from AuSp120.tb_DResult  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            res.json(result);
        }
    });
});

/*返回病家合作字典表*/
router.get('/getDCooperate', function (req, res, next) {
    var sqlData = {
        statement: " select Code,NameM from AuSp120.tb_DCooperate  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            res.json(result);
        }
    });
});

/*返回民族字典表*/
router.get('/getDFolk', function (req, res, next) {
    var sqlData = {
        statement: " select Code,NameM from AuSp120.tb_DFolk  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][1].value,
                    "name": results[i][1].value
                });
            }
            res.json(result);
        }
    });
});

/*返回病情字典表*/
router.get('/getDILLState', function (req, res, next) {
    var sqlData = {
        statement: " select Code,NameM from AuSp120.tb_DILLState  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            res.json(result);
        }
    });
});

/*返回死亡证明字典表*/
router.get('/getDDeathProve', function (req, res, next) {
    var sqlData = {
        statement: " select Code,NameM from AuSp120.tb_DDeathProve  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            res.json(result);
        }
    });
});

/*返回收费项字典表*/
router.get('/getDChargeXMCode', function (req, res, next) {
    var sqlData = {
        statement: " select Code,NameM from AuSp120.tb_DChargeXMCode  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            res.json(result);
        }
    });
});

/*返回分类统计字典表*/
router.get('/getDDiseaseClassState', function (req, res, next) {
    var sqlData = {
        statement: " select Code,NameM from AuSp120.tb_DDiseaseClassState  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            res.json(result);
        }
    });
});

/*返回呼救原因字典表*/
router.get('/getDDiseaseReason', function (req, res, next) {
    var sqlData = {
        statement: "select Code,NameM from AuSp120.tb_DDiseaseReason  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            res.json(result);
        }
    });
});

/*返回分站人员*/
router.get('/getPerson', function (req, res, next) {
    var personType = req.query.personType; //1医生，2护士，3司机
    var station_id = req.session.stationCode;
    if (string.isBlankOrEmpty(station_id)) {
        station_id = config.stationCode;
    }
    var sqlData = {
        statement: "select 编码,姓名 from AuSp120.tb_Person where 人员类型编码=@personType and 所属分站编码=@station_id ",
        params: [{"name": "personType", "value": personType, "type": "tinyint"}, {
            "name": "station_id",
            "value": station_id,
            "type": "varchar"
        }]
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][1].value,
                    "name": results[i][1].value
                });
            }
            res.json(result);
        }
    });
});

/*返回分站*/
router.get('/getStations', function (req, res, next) {
    var sqlData = {
        statement: " SELECT 分站编码,分站名称 from AuSp120.tb_Station  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            res.json(result);
        }
    });
});

/*返回车辆列表*/
router.get('/getCars', function (req, res, next) {
    var station_id = req.session.stationCode;
    if (string.isBlankOrEmpty(station_id) || string.isEquals('1',req.session.personType)) {
        station_id = config.stationCode;
    }
    var sqlData;
    if (string.isEquals("999", station_id) || string.isBlankOrEmpty(station_id)) {
        sqlData = {
            statement: "select 车辆编码 id,实际标识 plateNo from AuSp120.tb_Ambulance ",
            params: []
        };
    } else {
        sqlData = {
            statement: "select 车辆编码 id,实际标识 plateNo from AuSp120.tb_Ambulance where 分站编码=@station_id ",
            params: [{"name": "station_id", "value": station_id, "type": "varchar"}]
        };
    }

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            var qb = {
                id: 'qb',
                plateNo: '全部'
            };
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "plateNo": results[i][1].value
                });
            }
            result.unshift(qb);
            res.json(result);
        }
    });
});

/*返回受理类型*/
router.get('/getAcceptType', function (req, res, next) {
    var sqlData = {
        statement: "select Code,NameM from AuSp120.tb_DAcceptDescriptType ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            result.unshift(qb);
            res.json(result);
        }
    });
});

/*事件类型*/
router.get('/getEventType', function (req, res, next) {
    var sqlData = {
        statement: "select Code,NameM from AuSp120.tb_DEventType ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            result.unshift(qb);
            res.json(result);
        }
    });
});

/*出车结果*/
router.get('/getOutResult', function (req, res, next) {
    var sqlData = {
        statement: "select Code,NameM from AuSp120.tb_DTaskResult ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            log.error(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            result.unshift(qb);
            res.json(result);
        }
    });
});


module.exports = router;
