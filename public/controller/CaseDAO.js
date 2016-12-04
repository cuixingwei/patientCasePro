/**
 * Created by Dell on 2016/3/27.
 */
var db = require('../../utils/msdb');
var excel = require("../../utils/excel");
var string = require("../../utils/string");
var util = require("../../utils/util");
var config = require('../../config/config.json');
var log = require('log4js').getLogger("CaseDAO");


/*历史事件查询*/
exports.getHistoryEvent = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var stationCode = req.body.stationCode;
    var carCode = req.body.carCode;
    var outResult = req.body.outResult;
    var eventType = req.body.eventType;
    var page = req.body.page;
    var rows = req.body.rows;

    var station_id;
    if (!string.isBlankOrEmpty(req.cookies.userInfo)) {
        var userInfo = req.cookies.userInfo;
        userInfo = eval("(" + userInfo + ")");
        station_id = userInfo.stationCode;
    }else {
        res.json([]);
        return;
    }
    console.log('分站编码:' + station_id);
    if (string.isBlankOrEmpty(station_id) || string.isEquals('1', userInfo.personType)) {
        station_id = config.stationCode;
    }

    var sql = 'select e.事件名称,a.呼救电话,convert(varchar(20),a.开始受理时刻,20) 受理时刻,m.姓名,am.实际标识,tr.NameM outResult,et.NameM acceptType,t.任务编码,t.任务序号     from AuSp120.tb_TaskV t    ' +
        'left outer join AuSp120.tb_AcceptDescriptV a on a.事件编码=t.事件编码 and a.受理序号=t.受理序号    ' +
        'left outer join AuSp120.tb_EventV e on e.事件编码=a.事件编码    ' +
        'left outer join AuSp120.tb_DTaskResult tr on tr.Code=t.结果编码  left outer join AuSp120.tb_Ambulance am on am.车辆编码=t.车辆编码  ' +
        'left outer join AuSp120.tb_DEventType et on et.Code=e.事件类型编码 left outer join AuSp120.tb_MrUser m on t.调度员编码=m.工号    ' +
        'where e.事件性质编码=1 and a.开始受理时刻 between @startTime and @endTime and t.分站编码=@station_id ';
    var params = [{"name": "startTime", "value": startTime}, {
        "name": "endTime",
        "value": endTime
    }, {"name": "station_id", "value": station_id}];
    if (!string.isEquals('999', stationCode) && !string.isBlankOrEmpty(stationCode)) {
        sql += " and t.分站编码=@stationCode";
        params.push({"name": "stationCode", "value": stationCode, "type": "varchar"});
    }
    if (!string.isBlankOrEmpty(carCode) && !string.isEquals('qb', carCode)) {
        sql += " and t.车辆编码=@carCode";
        params.push({"name": "carCode", "value": carCode, "type": "varchar"});
    }
    if (!string.isBlankOrEmpty(outResult) && !string.isEquals('qb', outResult)) {
        sql += " and t.结果编码=@outResult";
        params.push({"name": "outResult", "value": outResult, "type": "tinyint"});
    }
    if (!string.isBlankOrEmpty(eventType) && !string.isEquals('qb', eventType)) {
        sql += " and e.事件类型编码=@eventType";
        params.push({"name": "eventType", "value": eventType, "type": "tinyint"});
    }
    var sqlData = {
        statement: sql,
        params: params
    };
    db.select(sqlData, function (err, results) {
        if (err) {
            log.error(err+":"+results);
        } else {
            var result = [];
            var startIndex = (page - 1) * rows;
            var endIndex = page * rows <= results.length ? page * rows : results.length;
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "eventName": results[i][0].value,
                    "alarmPhone": results[i][1].value,
                    "acceptStartTime": results[i][2].value,
                    "dispatcher": results[i][3].value,
                    "carCode": results[i][4].value,
                    "outResult": results[i][5].value,
                    "eventType": results[i][6].value,
                    "taskCode": results[i][7].value,
                    "taskOrder": results[i][8].value
                });
            }
            var grid = {"total": results.length, "rows": result.slice(startIndex, endIndex)};
            res.json(grid);
        }
    });
};

/*获取指定病人的收费记录*/
exports.getChargeByID = function (req, res) {
    var taskCode = req.body.taskCode;
    var taskOrder = req.body.taskOrder;
    var patientCaseOrder = req.body.patientCaseOrder;
    var page = req.body.page;
    var rows = req.body.rows;

    var sql = 'select cr.收费项编码,dcxm.NameM,cr.收费金额,cr.ID from AuSp120.tb_ChargeRecord cr     left outer join AuSp120.tb_DChargeXMCode dcxm on dcxm.Code=cr.收费项编码' +
        '    where cr.任务序号=@taskOrder and cr.任务编码=@taskCode and cr.病历序号=@patientCaseOrder';
    var params = [{"name": "taskCode", "value": taskCode, "type": "varchar"}, {
        "name": "taskOrder",
        "value": taskOrder,
        "type": "int"
    }, {"name": "patientCaseOrder", "value": patientCaseOrder, "type": "int"}];
    var sqlData = {
        statement: sql,
        params: params
    };
    db.select(sqlData, function (err, results) {
        if (err) {
            log.error(err+":"+results);
        } else {
            var result = [];
            var startIndex = (page - 1) * rows;
            var endIndex = page * rows <= results.length ? page * rows : results.length;
            var totalMoney = 0;
            for (var i = 0; i < results.length; i++) {
                totalMoney += results[i][2].value;
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value,
                    "price": results[i][2].value,
                    "chargeID": results[i][3].value
                });
            }
            totalMoney = totalMoney.toFixed(2); //保留两位有效数字
            var grid = {"total": results.length, "rows": result.slice(startIndex, endIndex), "totalMoney": totalMoney};
            res.json(grid);
        }
    });
};

/*获取指定任务信息*/
exports.getTaskByID = function (req, res) {
    var taskCode = req.body.taskCode;
    var taskOrder = req.body.taskOrder;

    var sql = 'select t.调度员编码,t.分站编码,t.车辆编码,convert(varchar(20),t.出车时刻,120),convert(varchar(20),t.到达现场时刻,120),convert(varchar(20),t.离开现场时刻,120),' +
        'convert(varchar(20),t.到达医院时刻,120),convert(varchar(20),t.完成时刻,120),    ' +
        'a.联系电话,a.联系人,a.现场地址,a.等车地址,am.实际标识 from AuSp120.tb_Task t left outer join AuSp120.tb_Ambulance am on am.车辆编码=t.车辆编码    ' +
        'left outer join AuSp120.tb_AcceptDescriptV a on a.受理序号=t.受理序号 and a.事件编码=t.事件编码   ' +
        'where t.任务序号=@taskOrder and t.任务编码=@taskCode ';
    var params = [{"name": "taskCode", "value": taskCode, "type": "varchar"}, {
        "name": "taskOrder",
        "value": taskOrder,
        "type": "int"
    }];
    var sqlData = {
        statement: sql,
        params: params
    };
    db.select(sqlData, function (err, results) {
        if (err) {
            log.error(err+":"+results);
        } else {
            var result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "dispatcherCode": results[i][0].value,
                    "stationCode": results[i][1].value,
                    "carCode": results[i][2].value,
                    "outCarTime": results[i][3].value,
                    "arriveSpotTime": results[i][4].value,
                    "leaveSpotTime": results[i][5].value,
                    "returnHospitalTime": results[i][6].value,
                    "completeTime": results[i][7].value,
                    "linkPhone": results[i][8].value,
                    "linkMan": results[i][9].value,
                    "localAddr": results[i][10].value,
                    "waitAddr": results[i][11].value,
                    "carIdentification": results[i][12].value
                });
            }
            res.json(result);
        }
    });
};

/*获取指定病人急救措施列表*/
exports.getCureMeasure = function (req, res) {
    var taskCode = req.body.taskCode;
    var taskOrder = req.body.taskOrder;
    var patientCaseOrder = req.body.patientCaseOrder;

    var sql = 'select * from AuSp120.tb_CureMeasure  where 任务序号=@taskOrder and 任务编码=@taskCode and 病例序号=@patientCaseOrder';
    var params = [{"name": "taskCode", "value": taskCode, "type": "varchar"}, {
        "name": "taskOrder",
        "value": taskOrder,
        "type": "int"
    }, {"name": "patientCaseOrder", "value": patientCaseOrder, "type": "int"}];
    var sqlData = {
        statement: sql,
        params: params
    };
    db.select(sqlData, function (err, results) {
        if (err) {
            log.error(err+":"+results);
        } else {
            var result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "ID": results[i][0].value,
                    "taskCode": results[i][1].value,
                    "patientCaseOrder": results[i][2].value,
                    "cureCode": results[i][3].value, //救治措施编码
                    "taskOrder": results[i][7].value
                });
            }
            res.json(result);
        }
    });
};

/*获取指定病例附表信息*/
exports.getPatientScheduleByID = function (req, res) {
    var taskCode = req.body.taskCode;
    var taskOrder = req.body.taskOrder;
    var patientCaseOrder = req.body.patientCaseOrder;

    var sql = 'select * from AuSp120.tb_PatientSchedule where 任务序号=@taskOrder and 任务编码=@taskCode and 病例序号=@patientCaseOrder';
    var params = [{"name": "taskCode", "value": taskCode, "type": "varchar"}, {
        "name": "taskOrder",
        "value": taskOrder,
        "type": "int"
    }, {"name": "patientCaseOrder", "value": patientCaseOrder, "type": "int"}];
    var sqlData = {
        statement: sql,
        params: params
    };
    db.select(sqlData, function (err, results) {
        if (err) {
            log.error(err+":"+results);
        } else {
            var result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "ID": results[i][0].ID,
                    "taskCode": results[i][1].value,
                    "patientCaseOrder": results[i][2].value, //病历序号
                    "BPH": results[i][3].value,
                    "BPL": results[i][4].value,
                    "P": results[i][5].value,
                    "R": results[i][6].value,
                    "HR": results[i][7].value,
                    "leftEye": results[i][8].value, //瞳孔左
                    "rightEye": results[i][9].value, //瞳孔右
                    "TI": results[i][10].value, //创伤指数
                    "general": results[i][11].value, //一般情况
                    "pathologicalReflex": results[i][12].value, //病理反射
                    "sense": results[i][13].value, //神志
                    "kczg": results[i][14].value, //口唇紫绀
                    "lightReflect": results[i][15].value, //对光反射
                    "leftLight": results[i][16].value, //左对光
                    "rightLight": results[i][17].value, //右对光
                    "heart": results[i][18].value, //心脏
                    "lung": results[i][19].value, //肺部
                    "head": results[i][20].value, //头颈
                    "breast": results[i][21].value, //胸部
                    "abdomen": results[i][22].value, //腹部
                    "spine": results[i][23].value, //脊柱
                    "limb": results[i][24].value, //四肢
                    "others": results[i][25].value, //其他
                    "cureMeasure": results[i][26].value, //治疗措施
                    "stationCode": results[i][27].value, //分站编码
                    "classType": results[i][28].value, //类别
                    "cycle": results[i][29].value, //循环
                    "breath": results[i][30].value, //呼吸
                    "conscious": results[i][31].value, //意识
                    "carIdentification": results[i][32].value, //车辆标识
                    "Flag": results[i][33].value,
                    "cyclePoints": results[i][34].value, //循环分数
                    "breathPoints": results[i][35].value, //呼吸分数
                    "abdomenPoints": results[i][36].value, //腹部分数
                    "motionPoints": results[i][37].value, //运动分数
                    "speechPoints": results[i][38].value,//言语分数
                    "CRAMS": results[i][39].value,
                    "arrivePatientTime": results[i][40].value, //到达病人身边时间
                    "T": results[i][41].value,//体温
                    "carCode": results[i][42].value, //车辆编码
                    "taskOrder": results[i][43].value //任务序号
                });
            }
            res.json(result);
        }
    });
};

/*获取指定病人的护理观察记录信息*/
exports.getPatientNursing = function (req, res) {
    var taskCode = req.body.taskCode;
    var taskOrder = req.body.taskOrder;
    var patientCaseOrder = req.body.patientCaseOrder;
    var page = req.body.page;
    var rows = req.body.rows;

    var sql = 'select * from AuSp120.tb_PatientNursing  where 任务序号=@taskOrder and 任务编码=@taskCode and 病历序号=@patientCaseOrder order by 日期,时间  ';
    var params = [{"name": "taskCode", "value": taskCode, "type": "varchar"}, {
        "name": "taskOrder",
        "value": taskOrder,
        "type": "int"
    }, {"name": "patientCaseOrder", "value": patientCaseOrder, "type": "int"}];
    var sqlData = {
        statement: sql,
        params: params
    };
    db.select(sqlData, function (err, results) {
        if (err) {
            log.error(err+":"+results);
        } else {
            var result = [];
            var startIndex = (page - 1) * rows;
            var endIndex = page * rows <= results.length ? page * rows : results.length;
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "nurseRecordID": results[i][0].value,
                    "taskCode": results[i][1].value,
                    "taskOrder": results[i][2].value,
                    "carIdentification": results[i][3].value || '', //车辆标识
                    "patientCaseOrder": results[i][4].value,
                    "recordDate": results[i][5].value,
                    "recordTime": results[i][6].value,
                    "sense": results[i][7].value || '', //神志
                    "leftSize": results[i][8].value || '', //左大小
                    "leftReaction": results[i][9].value || '', //左反应
                    "rightSize": results[i][10].value || '', //右大小
                    "rightReaction": results[i][11].value || '',//右反应
                    "heartRate": results[i][12].value || '', //心率
                    "pulse": results[i][13].value || '', //脉搏
                    "breath": results[i][14].value || '', //呼吸
                    "bloodPressure": results[i][15].value || '', //血压
                    "sao2": results[i][16].value || '', //血氧饱和度
                    "nurseMeasure": results[i][17].value || '', //护理措施
                    "nurseSign": results[i][18].value || '', //护士签名
                    "recordDatetime": results[i][19].value || '', //记录时刻
                    "recorderCode": results[i][20].value || '',  //记录着编码
                    "carCode": results[i][21].value || '' //车辆编码
                });
            }
            var grid = {"total": results.length, "rows": result.slice(startIndex, endIndex)};
            res.json(grid);
        }
    });
};
/*获取指定病人病例信息*/
exports.getPatientsByID = function (req, res) {
    var taskCode = req.query.taskCode;
    var taskOrder = req.query.taskOrder;
    var sqlData = {
        statement: 'select pc.*,dp.NameM,di.NameM,ddc.NameM,ddr.NameM,dill.NameM,ddcs.NameM,dco.NameM,ddp.NameM,dr.NameM from AuSp120.tb_PatientCase pc         ' +
        'left outer join AuSp120.tb_DProfession dp on dp.Code=pc.职业编码    left outer join AuSp120.tb_DIdentity di on di.Code=pc.身份编码    ' +
        'left outer join AuSp120.tb_DDiseaseClass ddc on ddc.Code=pc.疾病科别编码    left outer join AuSp120.tb_DDiseaseReason ddr on ddr.Code=pc.病因编码    ' +
        'left outer join AuSp120.tb_DILLState dill on dill.Code=pc.病情编码    left outer join AuSp120.tb_DDiseaseClassState ddcs on ddcs.Code=pc.分类统计编码    ' +
        'left outer join AuSp120.tb_DCooperate dco on dco.Code=pc.病家合作编码    left outer join AuSp120.tb_DDeathProve ddp on ddp.Code=pc.死亡证明编码 ' +
        'left outer join AuSp120.tb_DResult dr on dr.Code=pc.救治结果编码 where pc.任务序号=@taskOrder and pc.任务编码=@taskCode',
        params: [{"name": "taskOrder", "value": taskOrder, "type": "int"}, {
            "name": "taskCode",
            "value": taskCode,
            "type": "char"
        }]
    };

    db.select(sqlData, function (err, results) {
        if (err) {
            log.error(err+":"+results);
        } else {
            var result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "ID": results[i][0].value,
                    "taskCode": results[i][1].value,
                    "pcOrder": results[i][2].value,
                    "patientName": results[i][3].value,
                    "sex": results[i][4].value,
                    "age": results[i][5].value,
                    "nationalityCode": results[i][6].value, //国籍编码
                    "identityCode": results[i][7].value, //身份编码
                    "workCode": results[i][8].value, //职业编码
                    "nationCode": results[i][9].value, //民族编码
                    "nation": results[i][10].value, //民族
                    "homeAddr": results[i][11].value,  //家庭住址
                    "linkMan": results[i][12].value, //联系人
                    "linkPhone": results[i][13].value,
                    "chiefComplaint": results[i][14].value, //病人主诉
                    "doctorDiagnosis": results[i][15].value, //医生诊断
                    "departmentCode": results[i][16].value, //疾病科别编码
                    "typeCode": results[i][17].value,  //疾病种类编码
                    "patientReasonCode": results[i][18].value, //病因编码
                    "classCode": results[i][19].value, //分类统计编码
                    "illnessCode": results[i][20].value, //病情编码
                    "presentIllness": results[i][21].value, //现病史
                    "pastHistory": results[i][22].value, //既往病史
                    "allergy": results[i][23].value, //过敏史
                    "middleChange": results[i][24].value, //途中变化记录
                    "treatResultCode": results[i][25].value, //救治结果编码
                    "toAddr": results[i][26].value, //送达地点
                    "toAddrTypeCode": results[i][27].value, //送往地点类型编码
                    "localAddr": results[i][28].value, //现场地点
                    "localAddrTypeCode": results[i][29].value, //现场地点类型编码
                    "treatEffectCode": results[i][30].value, //救治效果编码
                    "deathCode": results[i][31].value, //死亡证明编码
                    "patientCooperation": results[i][32].value, //病家合作编码
                    "remark": results[i][33].value, //备注
                    "stationChangeMark": results[i][34].value, //分站修改标致
                    "stationDispathcerCode": results[i][35].value, //分站调度员编码
                    "centerChangeMark": results[i][36].value, //中心修改标志
                    "formComplete": results[i][37].value, //表单完成
                    "recordTime": results[i][38].value, //记录时刻
                    "doctor": results[i][39].value, //随车医生
                    "nurse": results[i][40].value, //随车护士
                    "driver": results[i][41].value, //司机
                    "staionCode": results[i][42].value, //分站编码
                    "carIdentification": results[i][43].value, //车辆标识
                    "flag": results[i][44].value,
                    "outcomeCode": results[i][45].value, //出车结果
                    "deparment": results[i][46].value, //科室
                    "chargeOrder": results[i][47].value, //收费序号
                    "carCode": results[i][48].value, //车辆编码
                    "taskOrder": results[i][49].value, //任务序号
                    "finalChangeTime": results[i][50].value, //最后修改时间
                    "finalChangeDispacherCode": results[i][51].value, //最后修改者编码
                    "distance": results[i][52].value, //里程
                    "threeNO": results[i][53].value, //三无
                    "outAddr": results[i][54].value, //出诊医院
                    "doctorSign": results[i][55].value, //医生签名
                    "work": results[i][56].value, //职业
                    "identity": results[i][57].value, //身份
                    "department": results[i][58].value, //疾病科别
                    "patientReason": results[i][59].value, //病因
                    "illness": results[i][60].value, //病情
                    "class": results[i][61].value, //分类统计
                    "patientCooperationName": results[i][62].value, //病家合作
                    "death": results[i][63].value, //死亡证明
					"treatResult": results[i][64].value
                });
            }
            var grid = {"total": results.length, "rows": result};
            res.json(grid);
        }
    });
};

/*添加收费项*/
exports.addCharge = function (req, res) {
    if (!string.isBlankOrEmpty(req.cookies.userInfo)) {
        var userInfo = req.cookies.userInfo;
        userInfo = eval("(" + userInfo + ")");
        var sql = 'insert into AuSp120.tb_ChargeRecord (任务编码,任务序号,车辆编码,病历序号,车辆标识,收费时间,收费项编码,收费金额,收款员编码) values (@taskCode,@taskOrder,@carCode,' +
            '@patientCaseOrder,@carIdentification,@chargeTime,@chargeCode,@chargePrice,@userId)';
        var params = [{"name": "taskCode", "value": req.body.taskCode, "type": "char"}, {
            "name": "taskOrder",
            "value": req.body.taskOrder,
            "type": "int"
        }, {"name": "patientCaseOrder", "value": req.body.patientCaseOrder, "type": "int"}, {
            "name": "carCode",
            "value": req.body.carCode,
            "type": "varchar"
        }, {
            "name": "carIdentification",
            "value": req.body.carIdentification,
            "type": "varchar"
        }, {"name": "chargeTime", "value": util.getCurrentTime(), "type": "varchar"}, {
            "name": "chargeCode",
            "value": req.body.chargeCode,
            "type": "int"
        }, {"name": "chargePrice", "value": req.body.chargePrice, "type": "varchar"}, {
            "name": "userId",
            "value": userInfo.userId,
            "type": "varchar"
        }];
        var sqlData = {
            statement: sql,
            params: params
        };
        db.change(sqlData, function (err, results) {
            if (results > 0) {
                res.json({
                    flag: 1 //成功
                });
            } else {
                res.json({
                    flag: 2 //失败
                });
            }
        });
    }else {
        res.json({
            flag: 2 //失败
        });
    }
};

/*删除收费项*/
exports.deleteCharge = function (req, res) {
    console.log('chargeRecordID:' + req.body.chargeRecordID);
    var sql = 'delete from AuSp120.tb_ChargeRecord where ID=@chargeRecordID';
    var params = [{"name": "chargeRecordID", "value": req.body.chargeRecordID, "type": "int"}];
    var sqlData = {
        statement: sql,
        params: params
    };
    db.change(sqlData, function (err, results) {
        if (results > 0) {
            res.json({
                success: true //成功
            });
        } else {
            res.json({
                success: false //失败
            });
        }
    });
};

/**
 * 添加护理观察记录
 * @param req
 * @param res
 * @param flag 1添加 2编辑
 */
exports.addNurseRecord = function (req, res, flag) {
    var nurseDateTime = req.body.nurseDateTime;
    var nurseDate = nurseDateTime.split(' ')[0];
    var nurseTime = nurseDateTime.split(' ')[1];
    var sql;
    var params;
    if (!string.isBlankOrEmpty(req.cookies.userInfo)) {
        var userInfo = req.cookies.userInfo;
        userInfo = eval("(" + userInfo + ")");
        if (flag == 1) {
            sql = 'insert into AuSp120.tb_PatientNursing (任务编码,任务序号,车辆标识,病历序号,日期,时间,神志,左大小,左反应,右大小,右反应,心率,脉搏,呼吸,血压,血氧饱和度,护理措施,护士签名,记录时刻,记录者编码,车辆编码) values' +
                ' (@taskCode,@taskOrder,@carIdentification,@patientCaseOrder,@nurseDate,@nurseTime,@sense,@leftSize,@leftReaction,@rightSize,@rightReaction,@heartRate,@pulse,@breath,' +
                '@bloodPressure,@sao2,@nurseMeasure,@nurseSign,@recordTime,@userId,@carCode)';
        } else {
            sql = 'update AuSp120.tb_PatientNursing set 日期=@nurseDate,时间=@nurseTime,神志=@sense,左大小=@leftSize,右大小=@rightSize,左反应=@leftReaction,右反应=@rightReaction,' +
                '心率=@heartRate,脉搏=@pulse,呼吸=@breath,血压=@bloodPressure,血氧饱和度=@sao2,护理措施=@nurseMeasure,护士签名=@nurseSign,记录时刻=@recordTime,记录者编码=@userId where ID=@nurseRecordID';
        }

        params = [{"name": "taskCode", "value": req.query.taskCode, "type": "char"}, {
            "name": "taskOrder",
            "value": req.query.taskOrder,
            "type": "int"
        }, {"name": "patientCaseOrder", "value": req.query.patientCaseOrder, "type": "int"}, {
            "name": "carCode",
            "value": req.query.carCode,
            "type": "varchar"
        }, {"name": "carIdentification", "value": req.query.carIdentification, "type": "varchar"}, {
            "name": "recordTime",
            "value": util.getCurrentTime(),
            "type": "varchar"
        }, {"name": "sense", "value": req.body.sense, "type": "varchar"}, {
            "name": "leftSize",
            "value": req.body.leftSize,
            "type": "varchar"
        }, {"name": "userId", "value": userInfo.userId, "type": "varchar"}, {
            "name": "leftReaction",
            "value": req.body.leftReaction,
            "type": "varchar"
        }, {"name": "rightSize", "value": req.body.rightSize, "type": "varchar"}, {
            "name": "rightReaction",
            "value": req.body.rightReaction,
            "type": "varchar"
        }, {"name": "heartRate", "value": req.body.heartRate, "type": "varchar"}, {
            "name": "pulse",
            "value": req.body.pulse,
            "type": "varchar"
        }, {"name": "breath", "value": req.body.breath, "type": "varchar"}, {
            "name": "bloodPressure",
            "value": req.body.bloodPressure,
            "type": "varchar"
        }, {"name": "sao2", "value": req.body.sao2, "type": "varchar"}, {
            "name": "nurseMeasure",
            "value": req.body.nurseMeasure,
            "type": "varchar"
        }, {"name": "nurseSign", "value": req.body.nurseSign, "type": "varchar"}, {
            "name": "nurseDate",
            "value": nurseDate,
            "type": "varchar"
        }, {"name": "nurseTime", "value": nurseTime, "type": "varchar"}, {
            "name": "nurseRecordID",
            "value": req.query.nurseRecordID,
            "type": "int"
        }];
        var sqlData = {
            statement: sql,
            params: params
        };
        db.change(sqlData, function (err, results) {
            if (results > 0) {
                res.json({
                    flag: 1 //成功
                });
            } else {
                res.json({
                    flag: 2 //失败
                });
            }
        });
    }else {
        res.json({
            flag: 2 //失败
        });
    }
};

/*删除护理记录项*/
exports.deleteNurseRecord = function (req, res) {
    var sql = 'delete from AuSp120.tb_PatientNursing where ID=@nurseRecordID';
    var params = [{"name": "nurseRecordID", "value": req.body.nurseRecordID, "type": "int"}];
    var sqlData = {
        statement: sql,
        params: params
    };
    db.change(sqlData, function (err, results) {
        if (results > 0) {
            res.json({
                success: true //成功
            });
        } else {
            res.json({
                success: false //失败
            });
        }
    });
};

/**
 * 添加病历
 * @param req
 * @param res
 * @param flag 1添加 2编辑
 */
exports.addPatientCase = function (req, res, flag) {
    //处理前台页面得分没选的情况
    var sqlBatch = [];
    var cyclePoints = req.body.cyclePoints;
    var breathPoints = req.body.breathPoints;
    var abdomenPoints = req.body.abdomenPoints;
    var motionPoints = req.body.motionPoints;
    var speechPoints = req.body.speechPoints;
    if (!string.isBlankOrEmpty(req.cookies.userInfo)) {
        var userInfo = req.cookies.userInfo;
        userInfo = eval("(" + userInfo + ")");
        var CRAMS = 0;
        if (string.isBlankOrEmpty(cyclePoints)) {
            cyclePoints = 0;
        } else {
            cyclePoints = parseInt(cyclePoints.trim());
            CRAMS = CRAMS + cyclePoints - 1;
        }
        if (string.isBlankOrEmpty(breathPoints)) {
            breathPoints = 0;
        } else {
            breathPoints = parseInt(breathPoints.trim());
            CRAMS = CRAMS + breathPoints - 1;
        }
        if (string.isBlankOrEmpty(abdomenPoints)) {
            abdomenPoints = 0;
        } else {
            abdomenPoints = parseInt(abdomenPoints.trim());
            CRAMS = CRAMS + abdomenPoints - 1;
        }
        if (string.isBlankOrEmpty(motionPoints)) {
            motionPoints = 0;
        } else {
            motionPoints = parseInt(motionPoints.trim());
            CRAMS = CRAMS + motionPoints - 1;
        }
        if (string.isBlankOrEmpty(speechPoints)) {
            speechPoints = 0;
        } else {
            speechPoints = parseInt(speechPoints.trim());
            CRAMS = CRAMS + speechPoints - 1;
        }
        console.log('CRAMS:' + CRAMS);
        var patientCaseNumbers = parseInt(req.query.patientCaseNumber) + 1;
        var patientCaseID = req.query.patientCaseID.trim(); //主表ID
        var threeNO = req.body.threeNO; //三无
        var carCode = req.query.carCode.trim(); //防止车辆编码过长，操作失败
        var stationCode; //分站编码
        if (!string.isBlankOrEmpty(req.query.stationCode)) {
            stationCode = req.query.stationCode.trim();
        }
        var stationAlterFlag = '是';//分站修改标志
        var centerAlterFlag = '否';//中心修改标志
        var formComplete = '是'; //表单完成

        var doctor = req.body.doctor;
        var nurse = req.body.nurse;
        var driver = req.body.driver;
        if (!string.isBlankOrEmpty(doctor)) {
            if (string.isEquals(doctor.trim().substring(0, 1), ';')) {
                doctor = doctor.trim().substring(1);
            }
        }
        if (!string.isBlankOrEmpty(nurse)) {
            if (string.isEquals(nurse.trim().substring(0, 1), ';')) {
                nurse = nurse.trim().substring(1);
            }
        }
        if (!string.isBlankOrEmpty(driver)) {
            if (string.isEquals(driver.trim().substring(0, 1), ';')) {
                driver = driver.trim().substring(1);
            }
        }

        if (string.isBlankOrEmpty(threeNO)) { //三无标志
            threeNO = 0;
        } else {
            threeNO = 1;
        }
        var taskCode = req.query.taskCode.trim();
        var taskOrder = req.query.taskOrder.trim();
        var patientCaseOrder = req.query.patientCaseOrder.trim();
        var sql;
        var params;
        params = [{"name": "taskCode", "value": taskCode, "type": "char"}, {
            "name": "taskOrder",
            "value": taskOrder,
            "type": "int"
        }, {"name": "patientCaseOrder", "value": patientCaseOrder, "type": "tinyint"}, {
            "name": "carCode",
            "value": carCode,
            "type": "varchar"
        }, {"name": "carIdentification", "value": req.query.carIdentification, "type": "varchar"}, {
            "name": "alterTime",
            "value": util.getCurrentTime(),
            "type": "varchar"
        }, {"name": "patientName", "value": req.body.patientName, "type": "varchar"}, {
            "name": "sex",
            "value": req.body.sex,
            "type": "varchar"
        }, {"name": "userId", "value": userInfo.userId, "type": "varchar"}, {
            "name": "age",
            "value": req.body.age,
            "type": "varchar"
        }, {"name": "identityCode", "value": req.body.identityCode, "type": "tinyint"}, {
            "name": "workCode",
            "value": req.body.workCode,
            "type": "tinyint"
        }, {"name": "nationCode", "value": req.body.nationCode, "type": "varchar"}, {
            "name": "waitAddr",
            "value": req.body.waitAddr,
            "type": "varchar"
        }, {"name": "linkMan", "value": req.body.linkMan, "type": "varchar"}, {
            "name": "linkPhone",
            "value": req.body.linkPhone,
            "type": "varchar"
        }, {"name": "chiefComplaint", "value": req.body.chiefComplaint, "type": "varchar"}, {
            "name": "doctorDiagnosis",
            "value": req.body.doctorDiagnosis,
            "type": "varchar"
        }, {"name": "departmentCode", "value": req.body.departmentCode, "type": "varchar"}, {
            "name": "patientReasonCode",
            "value": req.body.patientReasonCode,
            "type": "tinyint"
        }, {"name": "presentIllness", "value": req.body.presentIllness, "type": "varchar"}, {
            "name": "pastHistory",
            "value": req.body.pastHistory,
            "type": "varchar"
        }, {"name": "allergy", "value": req.body.allergy, "type": "varchar"}, {
            "name": "middleChange",
            "value": req.body.middleChange,
            "type": "varchar"
        }, {"name": "treatResultCode", "value": req.body.treatResultCode, "type": "tinyint"}, {
            "name": "toAddr",
            "value": req.body.toAddr,
            "type": "varchar"
        }, {"name": "localAddr", "value": req.body.localAddr, "type": "varchar"}, {
            "name": "deathCode",
            "value": req.body.deathCode,
            "type": "tinyint"
        }, {"name": "patientCooperation", "value": req.body.patientCooperation, "type": "tinyint"}, {
            "name": "remark",
            "value": req.body.remark,
            "type": "varchar"
        }, {"name": "doctor", "value": doctor, "type": "varchar"}, {
            "name": "nurse",
            "value": nurse,
            "type": "varchar"
        }, {"name": "driver", "value": driver, "type": "varchar"}, {
            "name": "stationCode",
            "value": stationCode,
            "type": "varchar"
        }, {"name": "outcomeCode", "value": req.body.outcomeCode, "type": "tinyint"}, {
            "name": "distance",
            "value": req.body.distance,
            "type": "varchar"
        }, {"name": "threeNO", "value": threeNO, "type": "varchar"}, {
            "name": "outAddr",
            "value": req.body.outAddr,
            "type": "varchar"
        }, {"name": "doctorSign", "value": req.body.doctorSign, "type": "varchar"}, {
            "name": "patientCaseID",
            "value": patientCaseID,
            "type": "int"
        }, {"name": "BPH", "value": req.body.BPH, "type": "varchar"}, {
            "name": "BPL",
            "value": req.body.BPL,
            "type": "varchar"
        }, {"name": "P", "value": req.body.P, "type": "varchar"}, {
            "name": "R",
            "value": req.body.R,
            "type": "varchar"
        }, {"name": "leftEye", "value": req.body.leftEye, "type": "varchar"}, {
            "name": "rightEye",
            "value": req.body.rightEye,
            "type": "varchar"
        }, {"name": "general", "value": req.body.general, "type": "varchar"}, {
            "name": "pathologicalReflex",
            "value": req.body.pathologicalReflex,
            "type": "varchar"
        }, {"name": "senseSchedule", "value": req.body.senseSchedule, "type": "varchar"}, {
            "name": "kczg",
            "value": req.body.kczg,
            "type": "varchar"
        }, {"name": "leftLight", "value": req.body.leftLight, "type": "varchar"}, {
            "name": "rightLight",
            "value": req.body.rightLight,
            "type": "varchar"
        }, {"name": "heart", "value": req.body.heart, "type": "varchar"}, {
            "name": "lung",
            "value": req.body.lung,
            "type": "varchar"
        }, {"name": "head", "value": req.body.head, "type": "varchar"}, {
            "name": "breast",
            "value": req.body.breast,
            "type": "varchar"
        }, {"name": "abdomen", "value": req.body.abdomen, "type": "varchar"}, {
            "name": "spine",
            "value": req.body.spine,
            "type": "varchar"
        }, {"name": "others", "value": req.body.others, "type": "varchar"}, {
            "name": "cureMeasure",
            "value": req.body.cureMeasures,
            "type": "varchar"
        }, {"name": "cyclePoints", "value": cyclePoints, "type": "int"}, {
            "name": "speechPoints",
            "value": speechPoints,
            "type": "int"
        }, {"name": "abdomenPoints", "value": abdomenPoints, "type": "int"}, {
            "name": "motionPoints",
            "value": motionPoints,
            "type": "int"
        }, {"name": "CRAMS", "value": CRAMS, "type": "int"}, {
            "name": "T",
            "value": req.body.T,
            "type": "varchar"
        }, {"name": "patientCaseNumbers", "value": patientCaseNumbers, "type": "varchar"}, {
            "name": "stationAlterFlag",
            "value": stationAlterFlag,
            "type": "varchar"
        }, {"name": "centerAlterFlag", "value": centerAlterFlag, "type": "varchar"}, {
            "name": "formComplete",
            "value": formComplete,
            "type": "varchar"
        }, {"name": "limb", "value": req.body.limb, "type": "varchar"}, {
            "name": "breathPoints",
            "value": breathPoints,
            "type": "int"
        }, {"name": "classCode", "value": req.body.classCode, "type": "tinyint"}, {
            "name": "illnessCode",
            "value": req.body.illnessCode,
            "type": "tinyint"
        }];

        if (flag == 1) {
            //插入病历主表
            sql = 'insert into AuSp120.tb_PatientCase (任务编码,序号,姓名,性别,年龄,身份编码,职业编码,民族,家庭住址,联系人,联系电话,病人主诉,医生诊断,疾病科别编码, 病因编码,' +
                '分类统计编码, 病情编码, 现病史, 既往病史, 过敏史, 途中变化记录, 救治结果编码, 送往地点, 现场地点, 死亡证明编码, 病家合作编码, 分站修改标志, 分站调度员编码,中心修改标志, ' +
                '表单完成, 记录时刻, 随车医生, 随车护士, 司机, 分站编码, 车辆标识, 转归编码, 车辆编码, 任务序号, 里程, 三无标志, 出诊地址, 医生签名,备注 )  values(@taskCode,@patientCaseNumbers,' +
                '@patientName,@sex,@age,@identityCode,@workCode,@nationCode,@waitAddr,@linkMan,@linkPhone,@chiefComplaint,@doctorDiagnosis,@departmentCode,@patientReasonCode,' +
                '@classCode,@illnessCode,@presentIllness,@pastHistory,@allergy,@middleChange,@treatResultCode,@toAddr,@localAddr,@deathCode,@patientCooperation,' +
                '@stationAlterFlag,@userId,@centerAlterFlag,@formComplete,@alterTime,@doctor,@nurse,@driver,@stationCode,@carIdentification,@outcomeCode,@carCode,@taskOrder,@distance,' +
                '@threeNO,@outAddr,@doctorSign,@remark)';
            sqlData = {
                statement: sql,
                params: params
            };
            sqlBatch.push(sqlData);
            //插入病历附表
            console.log('taskCode:' + req.query.taskCode + ';taskOrder:' + req.query.taskOrder + ';patientCaseOrder:' + req.query.patientCaseOrder + ';patientCaseID:' + req.query.patientCaseID);
            sql = 'insert into AuSp120.tb_PatientSchedule (任务编码,病例序号,BPH,BPL,P,R,瞳孔左,瞳孔右,一般情况,病理反射,神志, 口唇紫绀,左对光,右对光,心脏,肺部,腹部,' +
                '脊柱,四肢,其它 ,治疗措施,分站编码,车辆标识,循环分值,呼吸分值,胸腹分值,运动分值,言语分值,CRAMS,T,车辆编码,任务序号) values (@taskCode,@patientCaseNumbers,' +
                '@BPH,@BPL,@P,@R,@leftEye,@rightEye,@general,@pathologicalReflex,@senseSchedule,@kczg,@leftLight,@rightLight,@heart,@lung,@abdomen,@spine,@limb,@others,' +
                '@cureMeasure,@stationCode,@carIdentification,@cyclePoints,@breathPoints,@abdomenPoints,@motionPoints,@speechPoints,@CRAMS,@T,@carCode,@taskOrder)';
            var sqlData = {
                statement: sql,
                params: params
            };
            sqlBatch.push(sqlData);
            //插入救治措施
            var cureMeasure = req.body.cureMeasure;
            if (!string.isBlankOrEmpty(cureMeasure)) {
                var length = cureMeasure.split(',').length;
                for (i = 0; i < length; i++) {
                    console.log('cureCode:' + cureMeasure.split(',')[i]);
                    sql = 'insert into AuSp120.tb_CureMeasure (任务编码,病例序号,救治措施编码,车辆标识,车辆编码,任务序号)  ' +
                        'values(@taskCode,@patientCaseNumbers,@cureCode,@carIdentification,@carCode,@taskOrder)';
                    params = [{"name": "taskCode", "value": taskCode, "type": "char"}, {
                        "name": "taskOrder",
                        "value": taskOrder,
                        "type": "int"
                    }, {"name": "patientCaseNumbers", "value": patientCaseNumbers, "type": "tinyint"}, {
                        "name": "carCode",
                        "value": carCode,
                        "type": "varchar"
                    }, {
                        "name": "carIdentification",
                        "value": req.query.carIdentification,
                        "type": "varchar"
                    }, {
                        "name": "cureCode",
                        "value": cureMeasure.split(',')[i].trim(),
                        "type": "tinyint"
                    }];
                    sqlData = {
                        statement: sql,
                        params: params
                    };
                    sqlBatch.push(sqlData);
                }
            }
            db.changeSeries(sqlBatch, function (err, result) {
                console.log('执行结果:' + result);
                if (result.length >= 0) {
                    log.info(userInfo.center+"的"+userInfo.username+"添加"+req.body.patientName+"病例成功");
                    res.json({
                        flag: 1 //成功
                    });
                } else {
                    res.json({
                        flag: 2 //失败
                    });
                }
            });
        }
        else {
            //修改病历主表
            sql = 'update AuSp120.tb_PatientCase set 姓名=@patientName,性别=@sex,年龄=@age,身份编码=@identityCode,职业编码=@workCode,民族=@nationCode,家庭住址=@waitAddr,' +
                '联系人=@linkMan,联系电话=@linkPhone, 病人主诉=@chiefComplaint,医生诊断=@doctorDiagnosis,疾病科别编码=@departmentCode,分类统计编码=@classCode,病因编码=@patientReasonCode,现病史=@presentIllness,' +
                '既往病史=@pastHistory,病情编码=@illnessCode,过敏史=@allergy,途中变化记录=@middleChange,救治结果编码=@treatResultCode,送往地点=@toAddr,现场地点=@localAddr,死亡证明编码=@deathCode,' +
                '病家合作编码=@patientCooperation,备注=@remark,分站修改标志=@stationAlterFlag,随车医生=@doctor,随车护士=@nurse,司机=@driver, ' +
                '转归编码=@outcomeCode,最后修改时刻=@alterTime,最后修改者编码=@userId,里程=@distance,三无标志=@threeNO,出诊地址=@outAddr,医生签名=@doctorSign where ID=@patientCaseID';
            sqlData = {
                statement: sql,
                params: params
            };
            sqlBatch.push(sqlData);
            //修改病历附表
            console.log('taskCode:' + req.query.taskCode + ';taskOrder:' + req.query.taskOrder + ';patientCaseOrder:' + req.query.patientCaseOrder + ';patientCaseID:' + req.query.patientCaseID);
            sql = 'update AuSp120.tb_PatientSchedule set BPH=@BPH,BPL=@BPL,P=@P,R=@R,瞳孔左=@leftEye,瞳孔右=@rightEye,一般情况=@general,病理反射=@pathologicalReflex,神志=@senseSchedule,' +
                '口唇紫绀=@kczg,左对光=@leftLight,右对光=@rightLight,心脏=@heart,肺部=@lung,头颈=@head,胸部=@breast,腹部=@abdomen,脊柱=@spine,四肢=@limb,其它=@others,' +
                '治疗措施=@cureMeasure,分站编码=@stationCode,车辆标识=@carIdentification,循环分值=@cyclePoints, 呼吸分值=@breathPoints,胸腹分值=@abdomenPoints,' +
                '运动分值=@motionPoints,言语分值=@speechPoints,CRAMS=@CRAMS,T=@T,车辆编码=@carCode where 任务编码=@taskCode and 任务序号=@taskOrder and 病例序号=@patientCaseOrder';
            sqlData = {
                statement: sql,
                params: params
            };
            sqlBatch.push(sqlData);
            //删除救治措施
            sql = 'delete from AuSp120.tb_CureMeasure where 任务序号=@taskOrder and 任务编码=@taskCode and 病例序号=@patientCaseOrder';
            sqlData = {
                statement: sql,
                params: params
            };
            sqlBatch.push(sqlData);
            //插入救治措施
            cureMeasure = req.body.cureMeasure;
            if (!string.isBlankOrEmpty(cureMeasure)) {
                length = cureMeasure.split(',').length;
                for (var i = 0; i < length; i++) {
                    console.log('cureCode:' + cureMeasure.split(',')[i]);
                    sql = 'insert into AuSp120.tb_CureMeasure (任务编码,病例序号,救治措施编码,车辆标识,车辆编码,任务序号)  ' +
                        'values(@taskCode,@patientCaseOrder,@cureCode,@carIdentification,@carCode,@taskOrder)';
                    params = [{"name": "taskCode", "value": taskCode, "type": "char"}, {
                        "name": "taskOrder",
                        "value": taskOrder,
                        "type": "int"
                    }, {"name": "patientCaseOrder", "value": patientCaseOrder, "type": "tinyint"}, {
                        "name": "carCode",
                        "value": carCode,
                        "type": "varchar"
                    }, {
                        "name": "carIdentification",
                        "value": req.query.carIdentification,
                        "type": "varchar"
                    }, {
                        "name": "cureCode",
                        "value": cureMeasure.split(',')[i].trim(),
                        "type": "tinyint"
                    }];
                    sqlData = {
                        statement: sql,
                        params: params
                    };
                    sqlBatch.push(sqlData);
                }

            }
            db.changeSeries(sqlBatch, function (err, result) {
                if (result.length >= 0) {
                    log.info(userInfo.center+"的"+userInfo.username+"修改"+req.body.patientName+"病例成功");
                    res.json({
                        flag: 1 //成功
                    });
                } else {
                    res.json({
                        flag: 2 //失败
                    });
                }
            });
        }
    }else {
        res.json({
            flag: 2 //失败
        });
    }

};

/*删除病历*/
exports.deletePatientCase = function (req, res) {
    //删除救治措施
    console.log('taskCode:' + req.body.taskCode + ';taskOrder:' + req.body.taskOrder + ';patientCaseOrder:' + req.body.patientCaseOrder);
    var taskCode = req.body.taskCode.trim();
    var taskOrder = req.body.taskOrder.trim();
    var patientCaseOrder = req.body.patientCaseOrder.trim();
    var sqlBatch = [];
    var sql = 'delete from AuSp120.tb_CureMeasure  where 任务编码=@taskCode and 病例序号=@patientCaseOrder and 任务序号=@taskOrder';
    var params = [{"name": "taskCode", "value": taskCode, "type": "char"}, {
        "name": "taskOrder",
        "value": taskOrder,
        "type": "int"
    }, {"name": "patientCaseOrder", "value": patientCaseOrder, "type": "tinyint"}];
    var sqlData = {
        statement: sql,
        params: params
    };
    sqlBatch.push(sqlData);
    //删除收费记录
    sql = 'delete from AuSp120.tb_ChargeRecord  where 任务编码=@taskCode and 病历序号=@patientCaseOrder and 任务序号=@taskOrder';
    sqlData = {
        statement: sql,
        params: params
    };
    sqlBatch.push(sqlData);
    //删除护理观察记录
    sql = 'delete from AuSp120.tb_PatientNursing  where 任务编码=@taskCode and 病历序号=@patientCaseOrder and 任务序号=@taskOrder';
    sqlData = {
        statement: sql,
        params: params
    };
    sqlBatch.push(sqlData);
    //删除病历附表内容
    sql = 'delete from AuSp120.tb_PatientSchedule  where 任务编码=@taskCode and 病例序号=@patientCaseOrder and 任务序号=@taskOrder';
    sqlData = {
        statement: sql,
        params: params
    };
    sqlBatch.push(sqlData);
    //删除病历主表
    sql = 'delete from AuSp120.tb_PatientCase where  任务编码=@taskCode and 序号=@patientCaseOrder and 任务序号=@taskOrder';
    sqlData = {
        statement: sql,
        params: params
    };
    sqlBatch.push(sqlData);
    db.changeSeries(sqlBatch, function (err, results) {
        console.log(results);
        if (results.length > 0) {
            res.json({
                success: true //成功
            });
        } else {
            res.json({
                success: false //失败
            });
        }
    });
};
