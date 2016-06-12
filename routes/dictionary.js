/**
 * Created by Dell on 2015/9/20.
 */
var express = require('express');
var db = require('../utils/msdb');
var string = require('../utils/string');
var config = require('../config/config.json');
var router = express.Router();

/*在查询添加加入全部选项，用于默认选择*/
var qb = {
    id: 'qb',
    name: '全部'
};
var defaultQb = {
    "id": '',
    "name": '--请选择--'
};

/*返回人员列表*/
router.get('/getDispatcher', function (req, res, next) {
    var sqlData = {
        statement: " select 工号,姓名 from ausp120.tb_MrUser where 人员类型=0 and 有效标志=1  ",
        params: []
    };
    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            result.unshift(defaultQb);
            res.json(result);
        }
    });
});

/*返回急救措施字典表*/
router.get('/getDCureMeasure', function (req, res, next) {
    var sqlData = {
        statement: " select Code,NameM from AuSp120.tb_DMeasure where Flag<>0 ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
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

/*返回用药字典表*/
router.get('/getDMedication', function (req, res, next) {
    var sqlData = {
        statement: " select Code,NameM from AuSp120.tb_DMedicine order by OrdNo  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
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
            console.log(error.message);
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

/*返回人员类型*/
router.get('/getPersonType', function (req, res, next) {
    var sql = 'select Code,NameM from AuSp120.tb_DPersonType ';
    console.log(req.session.personType);
    if (!string.isBlankOrEmpty(req.session.personType)) {
        if (string.isEquals("11", req.session.personType)) {
            sql += ' where Code not in (11,10)';
        } else if (string.isEquals("1", req.session.personType)) {
            sql += ' where Code not in (1,11,10)';
        } else if (string.isEquals("2", req.session.personType)) {
            sql += 'where Code not in (1,2,11,10)';
        } else if (string.isEquals("4", req.session.personType)) {
            sql += ' where Code not in (1,2,4,11,0,10)';
        } else if (string.isEquals("5", req.session.personType)) {
            sql += ' where Code not in (1,2,4,5,11,0,10)';
        }
    }
    var sqlData = {
        statement: sql,
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            if (string.isEquals('qb', req.query.type)) {
                result.unshift(defaultQb);
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
            console.log(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            result.unshift(defaultQb);
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
            console.log(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            if (string.isEquals('qb', req.query.type)) {
                result.unshift(defaultQb);
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
            console.log(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            result.unshift(defaultQb);
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
            console.log(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            result.unshift(defaultQb);
            res.json(result);
        }
    });
});
/*现场地点类型*/
router.get('/getDLocaleType', function (req, res, next) {
    var sqlData = {
        statement: " select Code,NameM from ausp120.tb_DLocaleType  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
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

/*送往地点类型*/
router.get('/getDTakenPlaceType', function (req, res, next) {
    var sqlData = {
        statement: " select Code,NameM from ausp120.tb_DTakenPlaceType  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
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
            console.log(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            result.unshift(defaultQb);
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
            console.log(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            result.unshift(defaultQb);
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
            console.log(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            result.unshift(defaultQb);
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
            console.log(error.message);
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

/*返回病情字典表*/
router.get('/getDILLState', function (req, res, next) {
    var sqlData = {
        statement: " select Code,NameM from AuSp120.tb_DILLState  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            result.unshift(defaultQb);
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
            console.log(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            result.unshift(defaultQb);
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
            console.log(error.message);
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
            console.log(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            result.unshift(defaultQb);
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
            console.log(error.message);
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
    var personType = req.query.personType; //7医生，8护士，6司机
    var station_id = req.session.stationCode;
    var sql = 'select 工号,姓名 from AuSp120.tb_MrUser where 人员类型=@personType and 审核状态=1 and 有效标志=1 ';
    var params = [{"name": "personType", "value": personType, "type": "tinyint"}];
    if (!string.isBlankOrEmpty(station_id) && !string.isEquals('101', station_id)) {
        sql += ' and 单位编码=@station_id';
        params.push({
            "name": "station_id",
            "value": station_id,
            "type": "varchar"
        });
    }
    var sqlData = {
        statement: sql,
        params: params
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][1].value,
                    "name": results[i][1].value
                });
            }
            result.unshift(defaultQb);
            res.json(result);
        }
    });
});

/*返回分站*/
router.get('/getStations', function (req, res, next) {
        var sql = 'SELECT 分站编码,分站名称 from AuSp120.tb_Station where 有效标志=1  ';
        if (string.isEquals("add", req.query.type)) {
            if (!string.isBlankOrEmpty(req.session.stationCode) && !string.isEquals("101", req.session.stationCode)) {
                sql += " and 分站编码=@stationCode";
            }
        }
        var sqlData = {
            statement: sql,
            params: [{"name": "stationCode", "value": req.session.stationCode, "type": "varchar"}]
        };

        db.select(sqlData, function (error, results) {
            if (error) {
                console.log(error.message);
            } else {
                result = [];
                for (var i = 0; i < results.length; i++) {
                    result.push({
                        "id": results[i][0].value,
                        "name": results[i][1].value
                    });
                }
                if (string.isEquals('101', req.session.stationCode) && string.isEquals("person", req.query.page)) {
                    result.unshift({
                        "id": "101",
                        "name": "中心"
                    });
                }
                if (string.isEquals('qb', req.query.type)) {
                    result.unshift(defaultQb);
                }
                if (string.isEquals('101', req.session.stationCode) && string.isEquals("add", req.query.type)) {
                    result.unshift({
                        "id": "101",
                        "name": "中心"
                    });
                }
                res.json(result);
            }
        });
    }
)
;

/*返回车辆列表*/
router.get('/getCars', function (req, res, next) {
    var stationCode = req.session.stationCode;
    var station_id = req.query.station_id;
    var sqlData;
    if (!string.isBlankOrEmpty(station_id) && !string.isEquals('qb', station_id)) {
        sqlData = {
            statement: "select 车辆编码 id,实际标识 plateNo from AuSp120.tb_Ambulance  where 分站编码=@station_id",
            params: [{"name": "station_id", "value": station_id, "type": "varchar"}]
        };
    } else if (!string.isBlankOrEmpty(stationCode) && !string.isEquals("101", stationCode)) {
        sqlData = {
            statement: "select 车辆编码 id,实际标识 plateNo from AuSp120.tb_Ambulance where 分站编码=@station_id ",
            params: [{"name": "station_id", "value": stationCode, "type": "varchar"}]
        };
    } else {
        sqlData = {
            statement: "select 车辆编码 id,实际标识 plateNo from AuSp120.tb_Ambulance  ",
            params: []
        };
    }

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
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
            console.log(error.message);
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
            console.log(error.message);
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
            console.log(error.message);
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
