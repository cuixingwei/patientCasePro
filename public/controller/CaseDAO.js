/**
 * Created by Dell on 2016/3/27.
 */
var db = require('../../utils/msdb');
var excel = require("../../utils/excel");
var string = require("../../utils/string");
var util = require("../../utils/util");
var config = require('../../config/config.json');


/*历史事件查询*/
exports.getHistoryEvent = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var carCode = req.body.carCode;
    var dispatcher = req.body.dispatcher;
    var driver = req.body.driver;
    var doctor = req.body.doctor;
    var nurse = req.body.nurse;
    var localAddr = req.body.localAddr;
    var taskCode = req.body.taskCode;
    var page = req.body.page;
    var rows = req.body.rows;


    var station_id = req.session.stationCode;
    console.log('分站编码:' + station_id);
    if (string.isEquals('101', station_id)) {
        stationCode = req.body.station;
    } else {
        stationCode = station_id;
    }

    var sql = "select isnull(pc.病历个数,0),convert(varchar(20),a.开始受理时刻,20) 受理时刻,a.呼救电话,m.姓名,a.现场地址,pc.姓名,am.实际标识,pc.司机,   " +
        " tr.NameM outResult,t.任务编码,t.任务序号,pc.性别,pc.年龄,pc.病历序号,t.分站编码  from AuSp120.tb_TaskV t    left outer join AuSp120.tb_Ambulance am on am.车辆编码=t.车辆编码    " +
        "left outer join AuSp120.tb_AcceptDescriptV a on a.事件编码=t.事件编码 and a.受理序号=t.受理序号    " +
        "left outer join AuSp120.tb_EventV e on e.事件编码=a.事件编码    left outer join AuSp120.tb_DTaskResult tr on tr.Code=t.结果编码    " +
        "left outer join (select	任务编码,车辆标识,COUNT(*) 病历个数,姓名 = (stuff((select ',' + 姓名  from ausp120.tb_PatientCase where 任务编码 = pc.任务编码 and 车辆标识=pc.车辆标识 for xml path('')),1,1,'')),    " +
        "性别 = (stuff((select ',' + 性别  from ausp120.tb_PatientCase where 任务编码 = pc.任务编码 and 车辆标识=pc.车辆标识 for xml path('')),1,1,'')),    " +
        "年龄 = (stuff((select ',' + 年龄  from ausp120.tb_PatientCase where 任务编码 = pc.任务编码 and 车辆标识=pc.车辆标识 for xml path('')),1,1,''))," +
        "病历序号 = (stuff((select ',' + cast(序号 as varchar(20))  from ausp120.tb_PatientCase where 任务编码 = pc.任务编码 and 车辆标识=pc.车辆标识 for xml path('')),1,1,''))," +
        "随车医生 = (stuff((select ',' + 随车医生  from ausp120.tb_PatientCase where 任务编码 = pc.任务编码 and 车辆标识=pc.车辆标识 for xml path('')),1,1,'')),       " +
        "随车护士 = (stuff((select ',' + 随车护士  from ausp120.tb_PatientCase where 任务编码 = pc.任务编码 and 车辆标识=pc.车辆标识 for xml path('')),1,1,'')),    " +
        "司机 = (stuff((select ',' + 司机  from ausp120.tb_PatientCase where 任务编码 = pc.任务编码 and 车辆标识=pc.车辆标识 for xml path('')),1,1,''))     from ausp120.tb_PatientCase pc 		group by pc.任务编码,pc.车辆标识 ) pc on pc.任务编码=t.任务编码 and am.实际标识=pc.车辆标识    left outer join AuSp120.tb_MrUser m on t.调度员编码=m.工号    " +
        "where e.事件性质编码=1 and a.开始受理时刻 between @startTime and @endTime  ";
    var params = [{"name": "startTime", "value": startTime}, {
        "name": "endTime",
        "value": endTime
    }];
    if (!string.isBlankOrEmpty(stationCode) && !string.isEquals('qb', stationCode)) {
        sql += " and t.分站编码=@stationCode";
        params.push({"name": "stationCode", "value": stationCode, "type": "varchar"});
    }
    if (!string.isBlankOrEmpty(carCode) && !string.isEquals('qb', carCode)) {
        sql += " and t.车辆编码=@carCode";
        params.push({"name": "carCode", "value": carCode, "type": "varchar"});
    }
    if (!string.isBlankOrEmpty(dispatcher) && !string.isEquals('qb', dispatcher)) {
        sql += " and t.调度员编码=@dispatcher";
        params.push({"name": "dispatcher", "value": dispatcher, "type": "tinyint"});
    }
    if (!string.isBlankOrEmpty(driver)) {
        sql += " and pc.司机 like @driver";
        driver = '%' + driver + '%';
        params.push({"name": "driver", "value": driver, "type": "varchar"});
    }
    if (!string.isBlankOrEmpty(nurse)) {
        sql += " and pc.随车护士 like @nurse";
        nurse = '%' + nurse + '%';
        params.push({"name": "nurse", "value": nurse, "type": "varchar"});
    }
    if (!string.isBlankOrEmpty(doctor)) {
        sql += " and pc.随车医生 like @doctor";
        doctor = '%' + doctor + '%';
        params.push({"name": "doctor", "value": doctor, "type": "varchar"});
    }
    if (!string.isBlankOrEmpty(localAddr)) {
        sql += " and a.现场地址 like @localAddr";
        localAddr = '%' + localAddr + '%';
        params.push({"name": "localAddr", "value": localAddr, "type": "varchar"});
    }
    if (!string.isBlankOrEmpty(taskCode)) {
        sql += " and t.任务编码 like @taskCode";
        taskCode = '%' + taskCode + '%';
        params.push({"name": "taskCode", "value": taskCode, "type": "varchar"});
    }
    sql += ' order by a.开始受理时刻 ';
    var sqlData = {
        statement: sql,
        params: params
    };
    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = [];
            var startIndex = (page - 1) * rows;
            var endIndex = page * rows <= results.length ? page * rows : results.length;
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "caseNumbers": results[i][0].value,
                    "acceptStartTime": results[i][1].value,
                    "alarmPhone": results[i][2].value,
                    "dispatcher": results[i][3].value,
                    "localAddr": results[i][4].value,
                    "patientName": results[i][5].value,
                    "carIdentification": results[i][6].value,
                    "driver": results[i][7].value,
                    "outResult": results[i][8].value,
                    "taskCode": results[i][9].value,
                    "taskOrder": results[i][10].value,
                    "sex": results[i][11].value,
                    "age": results[i][12].value,
                    "pcOrder": results[i][13].value,
                    "stationCode": results[i][14].value
                });
            }
            var grid = {"total": results.length, "rows": result.slice(startIndex, endIndex)};
            res.json(grid);
        }
    });
};

/*获取人员列表信息*/
exports.getPersons = function (req, res) {
    var username = req.body.username;
    var userId = req.body.userId;
    var personType = req.body.personType;
    var flag = req.body.flag;
    var station = req.body.station;
    var departmentCode = req.body.departmentCode;
    var page = req.body.page;
    var rows = req.body.rows;

    var sql = 'select ID,工号,姓名,密码,部门名称,单位编码,UserMark,人员类型,有效标志,在线标志,Flag,科室编码,驾驶证编码 from AuSp120.tb_MrUser where 姓名 like @username ';
    if (!string.isBlankOrEmpty(userId)) {
        userId = userId.trim();
        sql += ' and 工号=@userId ';
    }
    if (!string.isBlankOrEmpty(username)) {
        username = username.trim();
        username = '%' + username + '%';
    } else {
        username = '%%';
    }
    if (!string.isBlankOrEmpty(personType)) {
        sql += ' and 人员类型=@personType';
    }
    if (!string.isBlankOrEmpty(station)) {
        sql += ' and 单位编码=@station';
    }
    if (!string.isBlankOrEmpty(flag)) {
        sql += " and  Flag=@flag";
    }
    if (!string.isBlankOrEmpty(departmentCode)) {
        sql += " and  科室编码=@departmentCode";
    }
    var params = [{"name": "username", "value": username, "type": "varchar"}, {
        "name": "userId",
        "value": userId,
        "type": "varchar"
    }, {"name": "personType", "value": personType, "type": "tinyint"}, {"name": "flag", "value": flag, "type": "int"}, {
        "name": "station",
        "value": station,
        "type": "varchar"
    }, {"name": "departmentCode", "value": departmentCode, "type": "int"}];

    var sqlData = {
        statement: sql,
        params: params
    };
    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = [];
            var startIndex = (page - 1) * rows;
            var endIndex = page * rows <= results.length ? page * rows : results.length;
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "userId": results[i][1].value,
                    "username": results[i][2].value,
                    "password": results[i][3].value,
                    "station": results[i][4].value,
                    "stationCode": results[i][5].value,
                    "personType": results[i][6].value,
                    "personTypeCode": results[i][7].value,
                    "valid": results[i][8].value,
                    "online": results[i][9].value,
                    "flag": results[i][10].value,
                    "departmentCode": results[i][11].value,
                    "driverCode": results[i][12].value
                });
            }
            var grid = {"total": results.length, "rows": result.slice(startIndex, endIndex)};
            res.json(grid);
        }
    });
};

/*获取指定病人的收费记录*/
exports.getChargeByID = function (req, res) {
    var taskCode = req.query.taskCode;
    var carIdentification = req.query.carIdentification;
    var patientCaseOrder = req.query.patientCaseOrder;
    var page = req.body.page;
    var rows = req.body.rows;
    if (string.isBlankOrEmpty(taskCode)) {
        taskCode = '';
    }
    if (string.isBlankOrEmpty(carIdentification)) {
        carIdentification = '';
    }
    if (string.isBlankOrEmpty(patientCaseOrder)) {
        patientCaseOrder = '';
    }

    var sql = 'select cr.收费项编码,dcxm.NameM,cr.收费金额,cr.ID from AuSp120.tb_ChargeRecord cr     left outer join AuSp120.tb_DChargeXMCode dcxm on dcxm.Code=cr.收费项编码' +
        '    where cr.车辆标识=@carIdentification and cr.任务编码=@taskCode and cr.病例序号=@patientCaseOrder';
    var params = [{"name": "taskCode", "value": taskCode, "type": "varchar"}, {
        "name": "carIdentification",
        "value": carIdentification,
        "type": "varchar"
    }, {"name": "patientCaseOrder", "value": patientCaseOrder, "type": "varchar"}];
    var sqlData = {
        statement: sql,
        params: params
    };
    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
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
            console.log(results);
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
    var carIdentification = '%' + req.body.carIdentification.trim() + '%';
    var patientCaseOrder = req.body.patientCaseOrder;

    var sql = 'select cm.*,dm.NameM from AuSp120.tb_CureMeasure cm left outer join ausp120.tb_DMeasure dm on dm.Code=cm.救治措施编码  where cm.车辆标识 like @carIdentification and cm.任务编码=@taskCode and cm.病例序号=@patientCaseOrder';
    var params = [{"name": "taskCode", "value": taskCode, "type": "varchar"}, {
        "name": "carIdentification",
        "value": carIdentification,
        "type": "varchar"
    }, {"name": "patientCaseOrder", "value": patientCaseOrder, "type": "int"}];
    var sqlData = {
        statement: sql,
        params: params
    };
    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "ID": results[i][0].value,
                    "taskCode": results[i][1].value,
                    "patientCaseOrder": results[i][2].value,
                    "cureCode": results[i][3].value, //救治措施编码
                    "carIdentification": results[i][4].value,
                    "cureName": results[i][6].value
                });
            }
            res.json(result);
        }
    });
};

/*获取用药记录信息*/
exports.getMedicationRecord = function (req, res) {
    var taskCode = req.body.taskCode;
    var carIdentification = '%' + req.body.carIdentification.trim() + '%';
    var patientCaseOrder = req.body.patientCaseOrder;

    var sql = 'select * from AuSp120.tb_MedicationRecord  where 车辆标识 like @carIdentification and 任务编码=@taskCode and 病例序号=@patientCaseOrder';
    var params = [{"name": "taskCode", "value": taskCode, "type": "varchar"}, {
        "name": "carIdentification",
        "value": carIdentification,
        "type": "varchar"
    }, {"name": "patientCaseOrder", "value": patientCaseOrder, "type": "int"}];
    var sqlData = {
        statement: sql,
        params: params
    };
    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "ID": results[i][0].value,
                    "taskCode": results[i][1].value,
                    "patientCaseOrder": results[i][2].value,
                    "medicationCode": results[i][3].value, //药物编码
                    "carIdentification": results[i][4].carIdentification
                });
            }
            res.json(result);
        }
    });
};

/*获取病情告知信息*/
exports.getILLTeller = function (req, res) {
    var taskCode = req.body.taskCode;
    var carIdentification = '%' + req.body.carIdentification.trim() + '%';
    var patientCaseOrder = req.body.patientCaseOrder;
    console.log('病情告知信息查询');

    var sql = 'select il.*,dil.NameM,dil.type,s.分站名称 from AuSp120.tb_ILLTeller il  left outer join ausp120.tb_DILLTeller dil on dil.Code=il.病情告知编码 ' +
        ' left outer join ausp120.tb_Station s on s.分站编码=il.患者要求转的医院  ' +
        'where il.车辆标识 like @carIdentification and il.任务编码=@taskCode and il.病例序号=@patientCaseOrder order by dil.type';
    var params = [{"name": "taskCode", "value": taskCode, "type": "varchar"}, {
        "name": "carIdentification",
        "value": carIdentification,
        "type": "varchar"
    }, {"name": "patientCaseOrder", "value": patientCaseOrder, "type": "int"}];
    var sqlData = {
        statement: sql,
        params: params
    };
    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "ID": results[i][0].value,
                    "taskCode": results[i][1].value,
                    "patientCaseOrder": results[i][2].value,
                    "illTellerCode": results[i][3].value, //病情告知编码
                    "carIdentification": results[i][4].value,
                    "stationTransfer": results[i][5].value,
                    "relation": results[i][6].value,
                    "tellOthers": results[i][7].value,
                    "illTeller": results[i][8].value,
                    "type": results[i][9].value,
                    "station": results[i][10].value
                });
            }
            res.json(result);
        }
    });
};

/*获取指定病例附表信息*/
exports.getPatientScheduleByID = function (req, res) {
    var taskCode = req.query.taskCode;
    var carIdentification = req.query.carIdentification;
    var patientCaseOrder = req.query.patientCaseOrder;
    console.log(taskCode + ';' + patientCaseOrder + ';' + carIdentification);

    var sql = 'select * from AuSp120.tb_PatientSchedule where 任务编码=@taskCode and 车辆标识=@carIdentification and 病例序号=@patientCaseOrder';
    var params = [{"name": "taskCode", "value": taskCode, "type": "varchar"}, {
        "name": "carIdentification",
        "value": carIdentification,
        "type": "varchar"
    }, {"name": "patientCaseOrder", "value": patientCaseOrder, "type": "int"}];
    var sqlData = {
        statement: sql,
        params: params
    };
    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
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
                    "senseSchedule": results[i][13].value, //神志
                    "kczg": results[i][14].value, //口唇紫绀
                    "eyeLight": results[i][15].value, //对光反射
                    "heart": results[i][16].value, //心脏
                    "lung": results[i][17].value, //肺部
                    "head": results[i][18].value, //头颈
                    "breast": results[i][19].value, //胸部
                    "abdomen": results[i][20].value, //腹部
                    "spine": results[i][21].value, //脊柱
                    "limb": results[i][22].value, //四肢
                    "others": results[i][23].value, //其他
                    "cureMeasure": results[i][24].value, //治疗措施
                    "stationCode": results[i][25].value, //分站编码
                    "classType": results[i][26].value, //类别
                    "cycle": results[i][27].value, //循环
                    "breath": results[i][28].value, //呼吸
                    "conscious": results[i][29].value, //意识
                    "carIdentification": results[i][30].value, //车辆标识
                    "Flag": results[i][31].value,
                    "cyclePoints": results[i][32].value, //循环分数
                    "breathPoints": results[i][33].value, //呼吸分数
                    "abdomenPoints": results[i][34].value, //腹部分数
                    "motionPoints": results[i][35].value, //运动分数
                    "speechPoints": results[i][36].value,//言语分数
                    "CRAMS": results[i][37].value,
                    "arrivePatientTime": results[i][38].value, //到达病人身边时间
                    "T": results[i][39].value,//体温
                    "eeg": results[i][40].value, //心电图
                    "sbgm": results[i][41].value //简易血糖仪
                });
            }
            res.json(result);
        }
    });
};

/*获取指定病人病例信息*/
exports.getPatientCases = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var taskCode = req.query.taskCode;
    var patientCaseOrder = req.query.patientCaseOrder; //病历序号
    var carIdentification = req.query.carIdentification; //车辆标识
    var patientName = req.body.patientName;
    var illnessCode = req.body.illnessCode;
    var station = req.body.station;
    var treatResultCode = req.body.treatResultCode;
    var page = req.body.page;
    var rows = req.body.rows;
    var sql = 'select pc.ID,pc.任务编码,pc.序号,pc.姓名,pc.性别,pc.年龄,pc.国籍编码,pc.身份编码,pc.职业编码,pc.民族编码,    ' +
        'df.NameM,pc.家庭住址,pc.联系人,pc.联系电话,pc.病人主诉,pc.医生诊断,pc.疾病科别编码,pc.疾病种类编码,        ' +
        'pc.病因编码,pc.分类统计编码,pc.病情编码,pc.现病史,pc.既往病史,pc.过敏史,pc.途中变化记录,pc.救治结果编码,       ' +
        ' pc.送往地点,pc.送往地点类型编码,pc.现场地点,pc.现场地点类型编码,pc.救治效果编码,pc.死亡证明编码,pc.病家合作编码,        ' +
        'pc.备注,pc.分站修改标志,pc.分站调度员编码,pc.中心修改标志,pc.表单完成,CONVERT(varchar(20),pc.记录时刻,120),pc.随车医生,pc.随车护士,        ' +
        'pc.司机,pc.分站编码,pc.车辆标识,pc.Flag,pc.转归编码,pc.科室,dp.NameM,di.NameM,ddc.NameM,ddr.NameM,   ' +
        'dill.NameM, ddcs.NameM, dco.NameM, ddp.NameM,dr.NameM,s.分站名称,CONVERT(varchar(20),a.开始受理时刻,120),pc.收费标志,pc.收费金额,' +
        'pc.医生签名,pc.护士签名,pc.告知人签字, CONVERT(varchar(20),pc.签字时间,120),CONVERT(varchar(20),pc.告知时间,120),pc.病历填写人,pc.病历提供人,pc.其他处理,pc.其他用药,pc.责任人签字,t.任务序号,dna.NameM  ' +
        'from AuSp120.tb_PatientCase  pc     ' +
        'left outer join AuSp120.tb_DProfession dp on dp.Code=pc.职业编码    left outer join AuSp120.tb_DIdentity di on di.Code=pc.身份编码    ' +
        'left outer join AuSp120.tb_DDiseaseClass ddc on ddc.Code=pc.疾病科别编码    left outer join AuSp120.tb_DDiseaseReason ddr on ddr.Code=pc.病因编码    ' +
        'left outer join AuSp120.tb_DILLState dill on dill.Code=pc.病情编码    left outer join AuSp120.tb_DDiseaseClassState ddcs on ddcs.Code=pc.分类统计编码    ' +
        'left outer join AuSp120.tb_DCooperate dco on dco.Code=pc.病家合作编码    left outer join AuSp120.tb_DDeathProve ddp on ddp.Code=pc.死亡证明编码 ' +
        'left outer join ausp120.tb_DFolk df on df.Code=pc.民族编码 left outer join ausp120.tb_DResult dr on dr.Code=pc.救治结果编码  ' +
        'left outer join ausp120.tb_Station s on s.分站编码=pc.分站编码  left outer join ausp120.tb_Ambulance am on am.实际标识=pc.车辆标识     ' +
        'left outer join ausp120.tb_Task t on t.车辆编码=am.车辆编码 and t.任务编码=pc.任务编码    ' +
        'left outer join ausp120.tb_AcceptDescript a on a.事件编码=t.事件编码 and t.受理序号=a.受理序号  ' +
        'left outer join ausp120.tb_DNationality dna on dna.Code=pc.国籍编码  ';

    if (string.isEquals('grid', req.query.type)) {
        sql += ' where a.开始受理时刻 between @startTime and @endTime ';
        if (!string.isBlankOrEmpty(patientName)) {
            patientName = '%' + patientName + '%';
            sql += ' and pc.姓名 like @patientName';
        } else {
            patientName = '%%';
            sql += ' and pc.姓名 like @patientName';
        }
        if (!string.isBlankOrEmpty(illnessCode)) {
            sql += ' and pc.病情编码=@illnessCode';
        }
        if (!string.isBlankOrEmpty(station)) {
            sql += ' and pc.分站编码=@station';
        }
        if (!string.isBlankOrEmpty(treatResultCode)) {
            sql += ' and pc.救治结果编码=@treatResultCode';
        }
    } else {
        sql += 'where  pc.任务编码=@taskCode and pc.序号=@patientCaseOrder and pc.车辆标识=@carIdentification';
    }
    var params = [{"name": "taskCode", "value": taskCode, "type": "char"}, {
        "name": "startTime",
        "value": startTime,
        "type": "varchar"
    }, {"name": "endTime", "value": endTime, "type": "varchar"}, {
        "name": "patientCaseOrder",
        "value": patientCaseOrder,
        "type": "tinyint"
    }, {"name": "carIdentification", "value": carIdentification, "type": "varchar"}, {
        "name": "patientName",
        "value": patientName,
        "type": "varchar"
    }, {"name": "illnessCode", "value": illnessCode, "type": "tinyint"}, {
        "name": "treatResultCode",
        "value": treatResultCode,
        "type": "tinyint"
    }, {"name": "station", "value": station, "type": "varchar"}];
    var sqlData = {
        statement: sql,
        params: params
    };

    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
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
                    "stationCode": results[i][42].value, //分站编码
                    "carIdentification": results[i][43].value, //车辆标识
                    "flag": results[i][44].value,
                    "outcomeCode": results[i][45].value, //出车结果
                    "departmentName": results[i][46].value, //科室
                    "work": results[i][47].value, //职业
                    "identity": results[i][48].value, //身份
                    "department": results[i][49].value, //疾病科别
                    "patientReason": results[i][50].value, //病因
                    "illness": results[i][51].value, //病情
                    "class": results[i][52].value, //分类统计
                    "patientCooperationName": results[i][53].value, //病家合作
                    "death": results[i][54].value, //死亡证明
                    "treatResult": results[i][55].value, //救治结果
                    "station": results[i][56].value, //分站名称
                    "acceptStartTime": results[i][57].value, //开始受理时间
                    "chargeFlag": results[i][58].value, //收费标志
                    "charge": results[i][59].value, //收费金额
                    "doctorSign": results[i][60].value, //医生签名
                    "nurseSign": results[i][61].value, //护士签名
                    "tellerSign": results[i][62].value, //告知人签名
                    "signTime": results[i][63].value, //签字时间
                    "tellTime": results[i][64].value, //告知时间
                    "caseWriter": results[i][65].value, //病历填写人
                    "caseProvider": results[i][66].value, //病历提供人
                    "otherHandle": results[i][67].value, //其他处理
                    "otherMedications": results[i][68].value, //其他用药
                    "responsiblePersonSign": results[i][69].value, //责任人签字
                    "taskOrder": results[i][70].value, //任务序号
                    "nationality": results[i][71].value //国籍
                });
            }

            if (!string.isBlankOrEmpty(page)) {
                var startIndex = (page - 1) * rows;
                var endIndex = page * rows <= results.length ? page * rows : results.length;
                var grid = {"total": results.length, "rows": result.slice(startIndex, endIndex)};
                res.json(grid);
            } else {
                res.json(result);
            }

        }
    });

};

/*添加收费项*/
exports.addCharge = function (req, res) {
    /*添加收费记录*/
    var totalMoney = req.body.totalMoney;
    var chargePrice = req.body.chargePrice.trim();
    totalMoney = parseFloat(totalMoney) + parseFloat(chargePrice);
    console.log("总金额:" + totalMoney);
    var sql = 'insert into AuSp120.tb_ChargeRecord (任务编码,病例序号,车辆标识,收费时间,收费项编码,收费金额,收款员编码) values (@taskCode,@patientCaseOrder,' +
        '@carIdentification,@chargeTime,@chargeCode,@chargePrice,@userId)';
    var params = [{"name": "taskCode", "value": req.body.taskCode, "type": "char"}, {
        "name": "patientCaseOrder", "value": req.body.patientCaseOrder, "type": "int"
    }, {"name": "carIdentification", "value": req.body.carIdentification.trim(), "type": "varchar"}, {
        "name": "chargeTime", "value": util.getCurrentTime(), "type": "varchar"
    }, {"name": "chargeCode", "value": req.body.chargeCode, "type": "int"}, {
        "name": "chargePrice", "value": chargePrice, "type": "varchar"
    }, {"name": "userId", "value": req.session.userId, "type": "varchar"}, {
        "name": "totalMoney", "value": totalMoney, "type": "varchar"
    }];
    var sqlData = {
        statement: sql,
        params: params
    };
    var sqlBatch = [];
    sqlBatch.push(sqlData);
    sql = 'update ausp120.tb_PatientCase set 收费标志=1,收费金额=@totalMoney  where 任务编码=@taskCode and 序号=@patientCaseOrder and 车辆标识=@carIdentification';
    sqlData = {
        statement: sql,
        params: params
    };
    sqlBatch.push(sqlData);
    db.changeSeries(sqlBatch, function (err, results) {
        if (err) {
            res.json({
                flag: 2 //失败
            });
        } else {
            res.json({
                flag: 1 //成功
            });
        }
    });
};

/*删除收费项*/
exports.deleteCharge = function (req, res) {
    console.log('chargeRecordID:' + req.body.chargeRecordID);
    var totalMoney = parseFloat(req.body.totalMoney);
    var chargeNumbers = parseInt(req.body.chargeNumbers);
    var chargePrice = parseFloat(req.body.chargePrice);
    totalMoney = parseFloat(totalMoney) - parseFloat(chargePrice);
    var flag = 1;
    if (chargeNumbers == 1) {
        flag = 0;
        totalMoney = 0;
    }
    var sql = 'delete from AuSp120.tb_ChargeRecord where ID=@chargeRecordID';
    var params = [{"name": "taskCode", "value": req.body.taskCode, "type": "char"}, {
        "name": "patientCaseOrder", "value": req.body.patientCaseOrder, "type": "int"
    }, {"name": "carIdentification", "value": req.body.carIdentification.trim(), "type": "varchar"}, {
        "name": "totalMoney", "value": totalMoney, "type": "varchar"
    }, {"name": "chargeRecordID", "value": req.body.chargeRecordID, "type": "int"}, {
        "name": "flag", "value": flag, "type": "int"
    }];
    var sqlData = {
        statement: sql,
        params: params
    };
    var sqlBatch = [];
    sqlBatch.push(sqlData);

    sql = 'update ausp120.tb_PatientCase set 收费标志=@flag,收费金额=@totalMoney  where 任务编码=@taskCode and 序号=@patientCaseOrder and 车辆标识=@carIdentification';
    sqlData = {
        statement: sql,
        params: params
    };
    sqlBatch.push(sqlData);

    db.changeSeries(sqlBatch, function (err, results) {
        if (err) {
            res.json({
                success: false //失败
            });
        } else {
            res.json({
                success: true //成功
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
    var username = req.session.username;
    var CRAMS = 0;
    if (!string.isEquals(cyclePoints, '0')) {
        cyclePoints = parseInt(cyclePoints.trim());
        CRAMS = CRAMS + cyclePoints - 1;
    }
    if (!string.isEquals(breathPoints, '0')) {
        breathPoints = parseInt(breathPoints.trim());
        CRAMS = CRAMS + breathPoints - 1;
    }
    if (!string.isEquals(abdomenPoints, '0')) {
        abdomenPoints = parseInt(abdomenPoints.trim());
        CRAMS = CRAMS + abdomenPoints - 1;
    }
    if (!string.isEquals(motionPoints, '0')) {
        motionPoints = parseInt(motionPoints.trim());
        CRAMS = CRAMS + motionPoints - 1;
    }
    if (!string.isEquals(speechPoints, '0')) {
        speechPoints = parseInt(speechPoints.trim());
        CRAMS = CRAMS + speechPoints - 1;
    }
    console.log('CRAMS:' + CRAMS);
    var patientCaseNumbers = req.query.caseNumbers;
    if (!string.isBlankOrEmpty(patientCaseNumbers)) {
        patientCaseNumbers = parseInt(req.query.caseNumbers) + 1;
    }
    var stationCode = req.query.stationCode; //分站编码
    if (!string.isBlankOrEmpty(stationCode)) {
        stationCode = req.query.stationCode.trim();
    }
    var stationAlterFlag = '1';//分站修改标志
    var centerAlterFlag = '0';//中心修改标志
    var formComplete = '否'; //表单完成
    if (string.isEquals('101', req.session.stationCode)) {
        centerAlterFlag = '1';
    }

    var doctor = string.isEquals('--请选择--', req.body.doctor) ? '' : req.body.doctor;
    var nurse = string.isEquals('--请选择--', req.body.nurse) ? '' : req.body.nurse;
    var driver = string.isEquals('--请选择--', req.body.driver) ? '' : req.body.driver;
    var doctorSign = string.isEquals('--请选择--', req.body.doctorSign) ? '' : req.body.doctorSign;
    var nurseSign = string.isEquals('--请选择--', req.body.nurseSign) ? '' : req.body.nurseSign;
    var tellerSign = string.isEquals('--请选择--', req.body.tellerSign) ? '' : req.body.tellerSign;

    var chargeFlag = '0'; //收费标志，默认为0
    var charge = '0.00'; //收费金额,默认为0

    var kczg = 0; //口唇紫绀选项
    if (!string.isBlankOrEmpty(req.body.kczg)) {
        kczg = 1;
    }
    var eeg = 0; //心电图
    if (!string.isBlankOrEmpty(req.body.eeg)) {
        eeg = 1;
    }

    var sbgm = 0; //简易血糖仪
    if (!string.isBlankOrEmpty(req.body.sbgm)) {
        sbgm = 1;
    }

    var taskCode = req.query.taskCode.trim();
    var carIdentification = req.query.carIdentification;
    if (!string.isBlankOrEmpty(carIdentification)) {
        carIdentification = carIdentification.trim();
    }
    var patientCaseOrder = req.query.patientCaseOrder;//编辑时传值
    if (!string.isBlankOrEmpty(patientCaseOrder)) {
        patientCaseOrder = patientCaseOrder.trim();
    }
    var sql;
    var params;
    params = [{"name": "taskCode", "value": taskCode, "type": "char"}, {
        "name": "patientCaseOrder", "value": patientCaseOrder, "type": "tinyint"
    }, {"name": "carIdentification", "value": carIdentification, "type": "varchar"}, {
        "name": "patientName", "value": req.body.patientName, "type": "varchar"
    }, {"name": "sex", "value": req.body.sex, "type": "varchar"}, {
        "name": "userId", "value": req.session.userId, "type": "varchar"
    }, {"name": "age", "value": req.body.age, "type": "varchar"}, {
        "name": "identityCode", "value": req.body.identityCode, "type": "tinyint"
    }, {"name": "workCode", "value": req.body.workCode, "type": "tinyint"}, {
        "name": "nationCode", "value": req.body.nationCode, "type": "varchar"
    }, {"name": "aidAddr", "value": req.body.aidAddr, "type": "varchar"}, {
        "name": "linkMan", "value": req.body.linkMan, "type": "varchar"
    }, {"name": "linkPhone", "value": req.body.linkPhone, "type": "varchar"}, {
        "name": "chiefComplaint", "value": req.body.chiefComplaint, "type": "varchar"
    }, {"name": "doctorDiagnosis", "value": req.body.doctorDiagnosis, "type": "varchar"}, {
        "name": "departmentCode", "value": req.body.departmentCode, "type": "varchar"
    }, {"name": "patientReasonCode", "value": req.body.patientReasonCode, "type": "tinyint"}, {
        "name": "presentIllness", "value": req.body.presentIllness, "type": "varchar"
    }, {"name": "pastHistory", "value": req.body.pastHistory, "type": "varchar"}, {
        "name": "allergy", "value": req.body.allergy, "type": "varchar"
    }, {"name": "middleChange", "value": req.body.middleChange, "type": "varchar"}, {
        "name": "treatResultCode", "value": req.body.treatResultCode, "type": "tinyint"
    }, {"name": "toAddr", "value": req.body.toAddr, "type": "varchar"}, {
        "name": "localAddr", "value": req.body.localAddr, "type": "varchar"
    }, {"name": "deathCode", "value": req.body.deathCode, "type": "tinyint"}, {
        "name": "patientCooperation", "value": req.body.patientCooperation, "type": "tinyint"
    }, {"name": "remark", "value": req.body.remark, "type": "varchar"}, {
        "name": "doctor", "value": doctor, "type": "varchar"
    }, {"name": "nurse", "value": nurse, "type": "varchar"}, {
        "name": "driver", "value": driver, "type": "varchar"
    }, {"name": "stationCode", "value": stationCode, "type": "varchar"}, {
        "name": "outcomeCode", "value": req.body.outcomeCode, "type": "tinyint"
    }, {"name": "doctorSign", "value": doctorSign, "type": "varchar"}, {
        "name": "BPH", "value": req.body.BPH, "type": "varchar"
    }, {
        "name": "BPL", "value": req.body.BPL, "type": "varchar"
    }, {"name": "P", "value": req.body.P, "type": "varchar"}, {
        "name": "R", "value": req.body.R, "type": "varchar"
    }, {"name": "leftEye", "value": req.body.leftEye, "type": "varchar"}, {
        "name": "rightEye", "value": req.body.rightEye, "type": "varchar"
    }, {"name": "general", "value": req.body.general, "type": "varchar"}, {
        "name": "senseSchedule", "value": req.body.senseSchedule, "type": "varchar"
    }, {
        "name": "kczg", "value": kczg, "type": "varchar"
    }, {"name": "heart", "value": req.body.heart, "type": "varchar"}, {
        "name": "lung", "value": req.body.lung, "type": "varchar"
    }, {"name": "head", "value": req.body.head, "type": "varchar"}, {
        "name": "breast", "value": req.body.breast, "type": "varchar"
    }, {"name": "abdomen", "value": req.body.abdomen, "type": "varchar"}, {
        "name": "spine", "value": req.body.spine, "type": "varchar"
    }, {"name": "others", "value": req.body.others, "type": "varchar"}, {
        "name": "cureMeasure", "value": req.body.cureMeasures, "type": "varchar"
    }, {"name": "cyclePoints", "value": cyclePoints, "type": "int"}, {
        "name": "speechPoints", "value": speechPoints, "type": "int"
    }, {"name": "abdomenPoints", "value": abdomenPoints, "type": "int"}, {
        "name": "motionPoints", "value": motionPoints, "type": "int"
    }, {"name": "CRAMS", "value": CRAMS, "type": "int"}, {
        "name": "T", "value": req.body.T, "type": "varchar"
    }, {"name": "patientCaseNumbers", "value": patientCaseNumbers, "type": "varchar"}, {
        "name": "stationAlterFlag", "value": stationAlterFlag, "type": "varchar"
    }, {"name": "centerAlterFlag", "value": centerAlterFlag, "type": "varchar"}, {
        "name": "formComplete", "value": formComplete, "type": "varchar"
    }, {"name": "limb", "value": req.body.limb, "type": "varchar"}, {
        "name": "breathPoints", "value": breathPoints, "type": "int"
    }, {"name": "classCode", "value": req.body.classCode, "type": "tinyint"}, {
        "name": "illnessCode", "value": req.body.illnessCode, "type": "tinyint"
    }, {"name": "arriveSpotTime", "value": req.body.arriveSpotTime, "type": "varchar"}, {
        "name": "nationality", "value": req.body.nationality, "type": "varchar"
    }, {"name": "caseProvider", "value": req.body.caseProvider, "type": "varchar"}, {
        "name": "localAddrType", "value": req.body.localAddrType, "type": "tinyint"
    }, {"name": "toAddrType", "value": req.body.toAddrType, "type": "varchar"}, {
        "name": "eyeLight", "value": req.body.eyeLight, "type": "varchar"
    }, {"name": "eeg", "value": eeg, "type": "varchar"}, {
        "name": "sbgm", "value": sbgm, "type": "varchar"
    }, {"name": "otherHandle", "value": req.body.otherHandle, "type": "varchar"}, {
        "name": "otherMedications", "value": req.body.otherMedications, "type": "varchar"
    }, {
        "name": "signTime", "value": req.body.signTime, "type": "varchar"
    }, {"name": "nurseSign", "value": nurseSign, "type": "varchar"}, {
        "name": "responsiblePersonSign", "value": req.body.responsiblePersonSign, "type": "varchar"
    }, {"name": "tellerSign", "value": tellerSign, "type": "varchar"}, {
        "name": "tellTime", "value": req.body.tellTime, "type": "varchar"
    }, {"name": "recordTime", "value": util.getCurrentTime(), "type": "varchar"}, {
        "name": "charge", "value": charge, "type": "varchar"
    }, {"name": "chargeFlag", "value": chargeFlag, "type": "int"}, {
        "name": "username", "value": username, "type": "varchar"
    }];

    if (flag == 1) {
        //插入病历主表
        sql = 'insert into AuSp120.tb_PatientCase (任务编码,序号,姓名,性别,年龄,身份编码,职业编码,民族编码,家庭住址,联系人,联系电话,病人主诉,医生诊断,疾病科别编码, 病因编码,' +
            '分类统计编码, 病情编码, 现病史, 既往病史, 过敏史, 途中变化记录, 救治结果编码, 送往地点, 现场地点, 死亡证明编码, 病家合作编码, 分站修改标志, 分站调度员编码,中心修改标志, ' +
            '表单完成, 记录时刻, 随车医生, 随车护士, 司机, 分站编码, 车辆标识, 转归编码,医生签名,备注,国籍编码,送往地点类型编码,现场地点类型编码,收费标志,收费金额,护士签名,' +
            '告知人签字,责任人签字,签字时间,告知时间,病历提供人,其他处理,其他用药,病历填写人)  values(@taskCode,@patientCaseNumbers,' +
            '@patientName,@sex,@age,@identityCode,@workCode,@nationCode,@aidAddr,@linkMan,@linkPhone,@chiefComplaint,@doctorDiagnosis,@departmentCode,@patientReasonCode,' +
            '@classCode,@illnessCode,@presentIllness,@pastHistory,@allergy,@middleChange,@treatResultCode,@toAddr,@aidAddr,@deathCode,@patientCooperation,' +
            '@stationAlterFlag,@userId,@centerAlterFlag,@formComplete,@recordTime,@doctor,@nurse,@driver,@stationCode,@carIdentification,@outcomeCode,@doctorSign,@remark,@nationality,' +
            '@toAddrType,@localAddrType,@chargeFlag,@charge,@nurseSign,@tellerSign,@responsiblePersonSign,@signTime,@tellTime,@caseProvider,@otherHandle,@otherMedications,@username)';
        sqlData = {
            statement: sql,
            params: params
        };
        sqlBatch.push(sqlData);
        //插入病历附表
        console.log('taskCode:' + req.query.taskCode + ';taskOrder:' + req.query.taskOrder + ';patientCaseOrder:' + req.query.patientCaseOrder + ';patientCaseID:' + req.query.patientCaseID);
        sql = 'insert into AuSp120.tb_PatientSchedule (任务编码,病例序号,BPH,BPL,P,R,瞳孔左,瞳孔右,一般情况,神志, 口唇紫绀,心脏,肺部,腹部,' +
            '脊柱,四肢,其它 ,治疗措施,分站编码,车辆标识,循环分值,呼吸分值,胸腹分值,运动分值,言语分值,CRAMS,T,到达病人身边时间,心电图,简易血糖仪,对光反射,头颈,胸部) values (@taskCode,@patientCaseNumbers,' +
            '@BPH,@BPL,@P,@R,@leftEye,@rightEye,@general,@senseSchedule,@kczg,@heart,@lung,@abdomen,@spine,@limb,@others,' +
            '@cureMeasure,@stationCode,@carIdentification,@cyclePoints,@breathPoints,@abdomenPoints,@motionPoints,@speechPoints,@CRAMS,@T,@arriveSpotTime,@eeg,@sbgm,@eyeLight,@head,@breast)';
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
                sql = 'insert into AuSp120.tb_CureMeasure (任务编码,病例序号,救治措施编码,车辆标识)  ' +
                    'values(@taskCode,@patientCaseNumbers,@cureCode,@carIdentification)';
                params = [{"name": "taskCode", "value": taskCode, "type": "char"}, {
                    "name": "patientCaseNumbers", "value": patientCaseNumbers, "type": "tinyint"
                }, {"name": "carIdentification", "value": req.query.carIdentification.trim(), "type": "varchar"}, {
                    "name": "cureCode", "value": cureMeasure.split(',')[i].trim(), "type": "tinyint"
                }];
                sqlData = {
                    statement: sql,
                    params: params
                };
                sqlBatch.push(sqlData);
            }
        }

        //插入用药
        var medicationRecord = req.body.medicationRecord;
        if (!string.isBlankOrEmpty(medicationRecord)) {
            length = medicationRecord.split(',').length;
            for (i = 0; i < length; i++) {
                console.log('medicationRecordCode:' + medicationRecord.split(',')[i]);
                sql = 'insert into AuSp120.tb_MedicationRecord (任务编码,病例序号,药物编码,车辆标识)  ' +
                    'values(@taskCode,@patientCaseNumbers,@medicationRecordCode,@carIdentification)';
                params = [{"name": "taskCode", "value": taskCode, "type": "char"}, {
                    "name": "patientCaseNumbers", "value": patientCaseNumbers, "type": "tinyint"
                }, {"name": "carIdentification", "value": req.query.carIdentification.trim(), "type": "varchar"}, {
                    "name": "medicationRecordCode",
                    "value": medicationRecord.split(',')[i].trim(),
                    "type": "tinyint"
                }];
                sqlData = {
                    statement: sql,
                    params: params
                };
                sqlBatch.push(sqlData);
            }
        }

        //插入病情告知
        var truthTelling = req.body.truthTelling;
        if (!string.isBlankOrEmpty(truthTelling)) {
            length = truthTelling.split(',').length;
            var tellOthers;
            var relation;
            var stationTransfer;
            for (i = 0; i < length; i++) {
                console.log('truthTellingCode:' + truthTelling.split(',')[i]);
                if (string.isEquals(truthTelling.split(',')[i].trim(), '5')) {
                    stationTransfer = req.body.stationTransfer;
                    relation = '';
                    tellOthers = '';
                }
                if (string.isEquals(truthTelling.split(',')[i].trim(), '6')) {
                    relation = req.body.relation;
                    stationTransfer = '';
                    tellOthers = '';
                }
                if (string.isEquals(truthTelling.split(',')[i].trim(), '7')) {
                    tellOthers = req.body.tellOthers;
                    stationTransfer = '';
                    relation = '';
                }
                sql = 'insert into AuSp120.tb_ILLTeller (任务编码,病例序号,病情告知编码,车辆标识,患者要求转的医院,与患者关系,其他)  ' +
                    'values(@taskCode,@patientCaseNumbers,@truthTellingCode,@carIdentification,@stationTransfer,@relation,@tellOthers)';
                params = [{"name": "taskCode", "value": taskCode, "type": "char"}, {
                    "name": "patientCaseNumbers", "value": patientCaseNumbers, "type": "tinyint"
                }, {"name": "carIdentification", "value": req.query.carIdentification.trim(), "type": "varchar"}, {
                    "name": "truthTellingCode", "value": truthTelling.split(',')[i].trim(), "type": "tinyint"
                }, {"name": "stationTransfer", "value": stationTransfer, "type": "varchar"}, {
                    "name": "relation", "value": relation, "type": "varchar"
                }, {"name": "tellOthers", "value": tellOthers, "type": "varchar"}];
                sqlData = {
                    statement: sql,
                    params: params
                };
                sqlBatch.push(sqlData);
            }
        }
        db.changeSeries(sqlBatch, function (err, result) {
            console.log('执行结果:' + result);
            if (err) {
                res.json({
                    flag: 2 //失败
                });
            } else {
                res.json({
                    flag: 1 //成功
                });
            }
        });
    } else {
        //修改病历主表
        sql = 'update AuSp120.tb_PatientCase set 姓名=@patientName,性别=@sex,年龄=@age,身份编码=@identityCode,职业编码=@workCode,民族编码=@nationCode,家庭住址=@aidAddr,' +
            '联系人=@linkMan,联系电话=@linkPhone, 病人主诉=@chiefComplaint,医生诊断=@doctorDiagnosis,疾病科别编码=@departmentCode,分类统计编码=@classCode,病因编码=@patientReasonCode,现病史=@presentIllness,' +
            '既往病史=@pastHistory,病情编码=@illnessCode,过敏史=@allergy,救治结果编码=@treatResultCode,送往地点=@toAddr,现场地点=@aidAddr,死亡证明编码=@deathCode,' +
            '病家合作编码=@patientCooperation,备注=@remark,分站修改标志=@stationAlterFlag,随车医生=@doctor,随车护士=@nurse,司机=@driver, ' +
            '转归编码=@outcomeCode,医生签名=@doctorSign,现场地点类型编码=@localAddrType,送往地点类型编码=@toAddrType,护士签名=@nurseSign,告知人签字=@tellerSign,责任人签字=@responsiblePersonSign,告知时间=@tellTime,病历提供人=@caseProvider,' +
            '其他处理=@otherHandle,其他用药=@otherMedications,签字时间=@signTime where 任务编码=@taskCode and 序号=@patientCaseOrder and 车辆标识=@carIdentification';
        sqlData = {
            statement: sql,
            params: params
        };
        console.log('修改病历:' + carIdentification + ';' + taskCode + ';' + patientCaseOrder);
        sqlBatch.push(sqlData);
        //修改病历附表
        sql = 'update AuSp120.tb_PatientSchedule set BPH=@BPH,BPL=@BPL,P=@P,R=@R,瞳孔左=@leftEye,瞳孔右=@rightEye,一般情况=@general,神志=@senseSchedule,' +
            '口唇紫绀=@kczg,对光反射=@eyeLight,心脏=@heart,肺部=@lung,头颈=@head,胸部=@breast,腹部=@abdomen,脊柱=@spine,四肢=@limb,其它=@others,' +
            '循环分值=@cyclePoints, 呼吸分值=@breathPoints,胸腹分值=@abdomenPoints,运动分值=@motionPoints,言语分值=@speechPoints,CRAMS=@CRAMS,T=@T,' +
            '到达病人身边时间=@arriveSpotTime,心电图=@eeg,简易血糖仪=@sbgm where 任务编码=@taskCode and 车辆标识=@carIdentification and 病例序号=@patientCaseOrder';
        sqlData = {
            statement: sql,
            params: params
        };
        sqlBatch.push(sqlData);
        //删除救治措施
        sql = 'delete from AuSp120.tb_CureMeasure where 车辆标识=@carIdentification and 任务编码=@taskCode and 病例序号=@patientCaseOrder';
        sqlData = {
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
                sql = 'insert into AuSp120.tb_CureMeasure (任务编码,病例序号,救治措施编码,车辆标识)  ' +
                    'values(@taskCode,@patientCaseOrder,@cureCode,@carIdentification)';
                params = [{"name": "taskCode", "value": taskCode, "type": "char"}, {
                    "name": "patientCaseOrder", "value": patientCaseOrder, "type": "tinyint"
                }, {"name": "carIdentification", "value": carIdentification, "type": "varchar"}, {
                    "name": "cureCode", "value": cureMeasure.split(',')[i].trim(), "type": "tinyint"
                }];
                sqlData = {
                    statement: sql,
                    params: params
                };
                sqlBatch.push(sqlData);
            }
        }

        //删除用药记录
        sql = 'delete from AuSp120.tb_MedicationRecord where 车辆标识=@carIdentification and 任务编码=@taskCode and 病例序号=@patientCaseOrder';
        sqlData = {
            statement: sql,
            params: params
        };
        sqlBatch.push(sqlData);
        //插入用药
        var medicationRecord = req.body.medicationRecord;
        if (!string.isBlankOrEmpty(medicationRecord)) {
            length = medicationRecord.split(',').length;
            for (i = 0; i < length; i++) {
                console.log('medicationRecordCode:' + medicationRecord.split(',')[i]);
                sql = 'insert into AuSp120.tb_MedicationRecord (任务编码,病例序号,药物编码,车辆标识)  ' +
                    'values(@taskCode,@patientCaseOrder,@medicationRecordCode,@carIdentification)';
                params = [{"name": "taskCode", "value": taskCode, "type": "char"}, {
                    "name": "patientCaseOrder", "value": patientCaseOrder, "type": "tinyint"
                }, {"name": "carIdentification", "value": carIdentification, "type": "varchar"}, {
                    "name": "medicationRecordCode",
                    "value": medicationRecord.split(',')[i].trim(),
                    "type": "tinyint"
                }];
                sqlData = {
                    statement: sql,
                    params: params
                };
                sqlBatch.push(sqlData);
            }
        }

        //删除用药记录
        sql = 'delete from AuSp120.tb_ILLTeller where 车辆标识=@carIdentification and 任务编码=@taskCode and 病例序号=@patientCaseOrder';
        sqlData = {
            statement: sql,
            params: params
        };
        sqlBatch.push(sqlData);
        //插入病情告知
        var truthTelling = req.body.truthTelling;
        if (!string.isBlankOrEmpty(truthTelling)) {
            length = truthTelling.split(',').length;
            var tellOthers;
            var relation;
            var stationTransfer;
            for (i = 0; i < length; i++) {
                console.log('truthTellingCode:' + truthTelling.split(',')[i]);
                if (string.isEquals(truthTelling.split(',')[i].trim(), '5')) {
                    stationTransfer = req.body.stationTransfer;
                    relation = '';
                    tellOthers = '';
                }
                if (string.isEquals(truthTelling.split(',')[i].trim(), '6')) {
                    relation = req.body.relation;
                    stationTransfer = '';
                    tellOthers = '';
                }
                if (string.isEquals(truthTelling.split(',')[i].trim(), '7')) {
                    tellOthers = req.body.tellOthers;
                    stationTransfer = '';
                    relation = '';
                }
                sql = 'insert into AuSp120.tb_ILLTeller (任务编码,病例序号,病情告知编码,车辆标识,患者要求转的医院,与患者关系,其他)  ' +
                    'values(@taskCode,@patientCaseOrder,@truthTellingCode,@carIdentification,@stationTransfer,@relation,@tellOthers)';
                params = [{"name": "taskCode", "value": taskCode, "type": "char"}, {
                    "name": "patientCaseOrder", "value": patientCaseOrder, "type": "tinyint"
                }, {"name": "carIdentification", "value": carIdentification, "type": "varchar"}, {
                    "name": "truthTellingCode", "value": truthTelling.split(',')[i].trim(), "type": "tinyint"
                }, {"name": "stationTransfer", "value": stationTransfer, "type": "varchar"}, {
                    "name": "relation", "value": relation, "type": "varchar"
                }, {"name": "tellOthers", "value": tellOthers, "type": "varchar"}];
                sqlData = {
                    statement: sql,
                    params: params
                };
                sqlBatch.push(sqlData);
            }
        }
        db.changeSeries(sqlBatch, function (err, result) {
            console.log('执行结果:' + result);
            if (err) {
                res.json({
                    flag: 2 //失败
                });
            } else {
                res.json({
                    flag: 1 //成功
                });
            }
        });

    }

};


/*删除病历*/
exports.deletePatientCase = function (req, res) {

    var taskCode = req.query.taskCode.trim();
    var carIdentification = req.query.carIdentification.trim();
    var patientCaseOrder = req.query.pcOrder.trim();
    var sqlBatch = [];
    //删除救治措施
    var sql = 'delete from AuSp120.tb_CureMeasure  where 任务编码=@taskCode and 病例序号=@patientCaseOrder and 车辆标识=@carIdentification';
    var params = [{"name": "taskCode", "value": taskCode, "type": "char"}, {
        "name": "carIdentification",
        "value": carIdentification,
        "type": "varchar"
    }, {"name": "patientCaseOrder", "value": patientCaseOrder, "type": "tinyint"}];
    var sqlData = {
        statement: sql,
        params: params
    };
    sqlBatch.push(sqlData);
    //删除收费记录
    sql = 'delete from AuSp120.tb_ChargeRecord  where 任务编码=@taskCode and 病例序号=@patientCaseOrder and 车辆标识=@carIdentification';
    sqlData = {
        statement: sql,
        params: params
    };
    sqlBatch.push(sqlData);
    //删除用药记录
    sql = 'delete from AuSp120.tb_MedicationRecord  where 任务编码=@taskCode and 病例序号=@patientCaseOrder and 车辆标识=@carIdentification';
    sqlData = {
        statement: sql,
        params: params
    };
    sqlBatch.push(sqlData);
    //删除病人告知
    sql = 'delete from AuSp120.tb_ILLTeller  where 任务编码=@taskCode and 病例序号=@patientCaseOrder and 车辆标识=@carIdentification';
    sqlData = {
        statement: sql,
        params: params
    };
    sqlBatch.push(sqlData);
    //删除病历附表内容
    sql = 'delete from AuSp120.tb_PatientSchedule  where 任务编码=@taskCode and 病例序号=@patientCaseOrder and 车辆标识=@carIdentification';
    sqlData = {
        statement: sql,
        params: params
    };
    sqlBatch.push(sqlData);
    //删除病历主表
    sql = 'delete from AuSp120.tb_PatientCase where  任务编码=@taskCode and 序号=@patientCaseOrder and 车辆标识=@carIdentification';
    sqlData = {
        statement: sql,
        params: params
    };
    sqlBatch.push(sqlData);
    db.changeSeries(sqlBatch, function (err, results) {
        console.log(results);
        if (err) {
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

/*添加编辑人员*/
exports.addPerson = function (req, res) {
    var id = req.query.id;
    var operate = req.query.operate;//1添加2编辑
    var stationName = req.body.stationName;
    var station = req.body.station;
    var personTypeCode = req.body.personTypeCode.trim();
    var departmentName = req.body.departmentName;
    var departmentCode = req.body.departmentCode;
    var username = req.body.username;
    var userId = req.body.userId;
    var flag = req.body.flag;
    var password = req.body.password;
    var driverCode = req.body.driverCode;
    var userMark;
    if (string.isBlankOrEmpty(station)) { //默认中心
        station = '101';
        stationName = '中心';
    }
    console.log(departmentCode);
    if (string.isBlankOrEmpty(departmentCode)) { //默认科室为空
        departmentCode = 0;
        departmentName = '';
    }
    console.log(departmentCode);
    switch (personTypeCode) {
        case '7':
            userMark = '医生';
            break;
        case '8':
            userMark = '护士';
            break;
        case '6':
            userMark = '司机';
            break;
        case '0':
            userMark = '中心调度员';
            station = '101';
            stationName = '中心';
            departmentCode = 0;
            departmentName = '';
            break;
        case '3':
            userMark = '分站调度员';
            break;
        case '9':
            userMark = '急救员';
            break;
        case '10':
            userMark = '其他';
            break;
    }

    var params = [{"name": "stationName", "value": stationName, "type": "varchar"}, {
        "name": "station",
        "value": station,
        "type": "varchar"
    }, {"name": "personTypeCode", "value": personTypeCode, "type": "varchar"}, {
        "name": "userMark",
        "value": userMark,
        "type": "varchar"
    }, {"name": "departmentName", "value": departmentName, "type": "varchar"}, {
        "name": "departmentCode",
        "value": departmentCode,
        "type": "int"
    }, {"name": "username", "value": username, "type": "varchar"}, {
        "name": "userId",
        "value": userId,
        "type": "varchar"
    }, {"name": "flag", "value": flag, "type": "int"}, {
        "name": "password",
        "value": password,
        "type": "varchar"
    }, {"name": "driverCode", "value": driverCode, "type": "int"}, {
        "name": "createTime",
        "value": util.getCurrentTime(),
        "type": "varchar"
    }, {"name": "id", "value": id, "type": "int"}];
    var sql = '';
    if (string.isEquals('1', operate)) {
        sql = 'insert into ausp120.tb_MrUser (工号,姓名,密码,部门名称,单位编码,创建日期,UserMark,人员类型,有效标志,Flag,科室编码,驾驶证编码,科室) values(' +
            '@userId,@username,@password,@stationName,@station,@createTime,@userMark,@personTypeCode,0,@flag,@departmentCode,@driverCode,@departmentName)';
    } else if (string.isEquals('2', operate) && !string.isBlankOrEmpty(id)) {
        sql = 'update ausp120.tb_MrUser set 工号=@userId,姓名=@username,密码=@password,部门名称=@stationName,单位编码=@station,UserMark=@userMark,' +
            '人员类型=@personTypeCode,Flag=@flag,科室编码=@departmentCode,驾驶证编码=@driverCode,科室=@departmentName where ID=@id';
    }
    var sqlData = {
        statement: sql,
        params: params
    };
    db.change(sqlData, function (err, results) {
        if (err) {
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

/*获取指定人员信息*/
exports.getPersonById = function (req, res) {
    var id = req.query.id.trim();
    var sql = 'select ID,工号,姓名,密码,部门名称,单位编码,UserMark,人员类型,有效标志,在线标志,Flag,科室编码,驾驶证编码 from AuSp120.tb_MrUser where ID=@id ';
    var params = [{"name": "id", "value": id, "type": "int"}];
    var sqlData = {
        statement: sql,
        params: params
    };
    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "userId": results[i][1].value,
                    "username": results[i][2].value,
                    "password": results[i][3].value,
                    "station": results[i][4].value,
                    "stationCode": results[i][5].value,
                    "personType": results[i][6].value,
                    "personTypeCode": results[i][7].value,
                    "valid": results[i][8].value,
                    "online": results[i][9].value,
                    "flag": results[i][10].value,
                    "departmentCode": results[i][11].value,
                    "driverCode": results[i][12].value
                });
            }
            res.json(result);
        }
    });
};

/*审核人员信息*/
exports.reviewPerson = function (req, res) {
    var id = req.query.id.trim();
    var sql = 'update ausp120.tb_MrUser set 有效标志=1 where ID=@id ';
    var params = [{"name": "id", "value": id, "type": "int"}];
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