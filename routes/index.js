var express = require('express');
var router = express.Router();
var logger = require("../utils/log").logger; //日志

var menu = require("../config/menu.json");

var db = require('../utils/msdb');

var string = require('../utils/string');

var util = require('../utils/util');


/* GET home page. */

router.get('/', function (req, res, next) {
    if (!string.isBlankOrEmpty(req.session.username)) {
        res.render('main', {title: '主页面', username: req.session.username, center: req.session.center});
    } else {
        res.render('login', {});
    }
});
/**
 * 跳转打印病历页面
 */
router.get('/printPatientCase', function (req, res, next) {
    console.log('掉转到打印病历页面');
    res.render('case/printPatientCase', {
        title: '打印病历页面',
        taskCode: req.query.taskCode,
        carIdentification: req.query.carIdentification,
        patientCaseOrder: req.query.patientCaseOrder,
        taskOrder: req.query.taskOrder
    });
});


/*登录成功后跳转到主页面*/
router.get('/main', function (req, res, next) {
    if (!string.isBlankOrEmpty(req.session.username)) {
        res.render('main', {
            title: '主页面',
            username: req.session.username,
            center: req.session.center
        });
    } else {
        res.render('login', {});
    }
});

/*退出*/
router.get('/logOut', function (req, res, next) {
    logger.info(req.session.center + '的' + req.session.username + '退出登录');
    req.session.destroy(function (err) {
        if (err) {
            console.log(err.message);
        } else {
            res.render('login', {title: 'Express'});
        }
    })
});

/*改密*/
router.post('/changePwd', function (req, res, next) {
    var userId = req.session.userId;
    var password = req.body.dataPwd;
    var sqlData = {
        statement: "update AuSp120.tb_MrUser set 密码=@pwd where 工号=@userId",
        params: [{"name": "userId", "value": userId}, {"name": "pwd", "value": password}]
    };
    db.change(sqlData, function (err, results) {
        if (err) {
            console.info("操作失败!");
        } else {
            if (results == 0) {
                res.json({
                    success: false
                });
            } else {
                res.json({
                    success: true
                });
            }
        }
    });
});


/*获取菜单*/
router.get('/menu', function (req, res, next) {
    var role_id = req.session.personType; //人员类型
    var sql = 'select * from ausp120.tb_Resourse where (ID in (select Resourse_ID from ausp120.tb_Role_Resourse where Role_ID=@role_id) ' +
        '    or Resourse_ID in (select Resourse_ID from ausp120.tb_Role_Resourse where Role_ID=@role_id)) and flag=1';
    var sqlData = {
        statement: sql,
        params: [{"name": "role_id", "value": role_id, "type": "varchar"}]
    };
    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "iconCls": results[i][2].value,
                    "text": results[i][3].value,
                    "target": results[i][5].value,
                    "url": results[i][7].value,
                    "pid": results[i][8].value,
                    "flag": results[i][9].value
                });
            }
            res.json(result);
        }
    });
});


/*病历填写*/
router.get('/HistoryEvent', function (req, res, next) {
    res.render('case/HistoryEvent', {
        stationCode: req.session.stationCode
    });
});
/*病历管理*/
router.get('/PatientCaseManage', function (req, res, next) {
    res.render('case/PatientCaseManage', {
        stationCode: req.session.stationCode
    });
});
/*人员管理*/
router.get('/PersonManage', function (req, res, next) {
    res.render('case/PersonManage', {personType: req.session.personType, stationCode: req.session.stationCode});
});

/*病历详情页*/
router.get('/patientCaseDetail', function (req, res, next) {
    var title = '';
    var patientCode = 0;
    if (string.isEquals('add', req.query.page)) {
        title = '新增患者信息';
    }
    if (string.isEquals('view', req.query.page)) {
        title = '查看患者信息';
    }
    if (string.isEquals('edit', req.query.page)) {
        title = '编辑患者信息';
    }
    var taskCode = req.query.taskCode; //任务编码
    var stationCode = req.query.stationCode; //分站编码
    var currentTime = util.getCurrentTime();
    var currentDate = currentTime.split(" ")[0];
    var sql = "select MAX(序号) from ausp120.tb_PatientCase where 分站编码=@stationCode and convert(varchar(20),记录时刻,23)=@currentDate ";
    var sqlData = {
        statement: sql,
        params: [{"name": "stationCode", "value": stationCode, "type": "varchar"}, {
            "name": "currentDate",
            "value": currentDate,
            "type": "varchar"
        }]
    };
    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            for (var i = 0; i < results.length; i++) {
                patientCode = results[0][0].value;
            }
            if (isNaN(patientCode) || string.isBlankOrEmpty(patientCode)) {
                patientCode = 0;
            }
            patientCode = parseInt(patientCode) + 1;
            if (patientCode < 10) {
                patientCode = "0" + patientCode;
            }
            res.render('case/patientCaseDetail', {
                taskCode: taskCode,
                page: req.query.page,
                caseNumbers: req.query.caseNumbers,
                title: title,
                patientCode: patientCode,
                carIdentification: req.query.carIdentification,
                username: req.session.username,
                pcOrder: req.query.pcOrder,
                taskOrder: req.query.taskOrder,
                stationCode: stationCode
            });
        }
    });
});


/*振铃到接听大于X秒页面*/
router.get('/RingToAnswerTimes', function (req, res, next) {
    res.render('page/RingToAnswerTimes', {title: ''});
});

/*受理时长大于X秒页面*/
router.get('/AcceptStartToEndTime', function (req, res, next) {
    res.render('page/AcceptStartToEndTime', {title: ''});
});

/*通话时长大于X秒页面*/
router.get('/talkTime', function (req, res, next) {
    res.render('page/talkTime', {title: ''});
});

/*事件类型统计页面*/
router.get('/EventType', function (req, res, next) {
    res.render('page/EventType', {title: ''});
});

/*受理时间统计页面*/
router.get('/AcceptTime', function (req, res, next) {
    res.render('page/AcceptTime', {title: ''});
});

/*呼救历史查询页面*/
router.get('/CallHistory', function (req, res, next) {
    res.render('page/CallHistory', {title: ''});
});
/*呼救历史查询详情页面*/
router.get('/eventDetail', function (req, res, next) {
    var acceptCount = req.query.acceptCount;
    var taskCount = req.query.taskCount;
    var event_id = req.query.event_id;
    res.render('page/eventDetail', {acceptCount: acceptCount, taskCount: taskCount, event_id: event_id});
});

/*病历详情页面*/
router.get('/patientCaseDetail', function (req, res, next) {
    var event_id = req.query.event_id;
    res.render('page/patientCaseDetail', {event_id: event_id});
});

/*重大紧急事件情况统计页面*/
router.get('/Accident', function (req, res, next) {
    res.render('page/Accident', {title: ''});
});

/*调度员工作统计页面*/
router.get('/DispatcherWorkload', function (req, res, next) {
    res.render('page/DispatcherWorkload', {title: ''});
});

/*出车记录表页面*/
router.get('/OutCarRecord', function (req, res, next) {
    res.render('page/OutCarRecord', {title: ''});
});

/*中止任务信息统计页面*/
router.get('/StopTask', function (req, res, next) {
    res.render('page/StopTask', {title: ''});
});

/*中止任务原因统计页面*/
router.get('/StopTaskReason', function (req, res, next) {
    res.render('page/StopTaskReason', {title: ''});
});

/*车辆暂停调用情况页面*/
router.get('/CarPause', function (req, res, next) {
    res.render('page/CarPause', {title: ''});
});

/*挂起事件流水统计页面*/
router.get('/HungEvent', function (req, res, next) {
    res.render('page/HungEvent', {title: ''});
});

/*挂起原因统计页面*/
router.get('/HungEventReason', function (req, res, next) {
    res.render('page/HungEventReason', {title: ''});
});

/*中心接警情况统计页面*/
router.get('/AnswerAlarm', function (req, res, next) {
    res.render('page/AnswerAlarm', {title: ''});
});

/*急救站出诊情况查询页面*/
router.get('/SubstationVisit', function (req, res, next) {
    res.render('page/SubstationVisit', {title: ''});
});

/*急救站晚出诊统计页面*/
router.get('/SubstationLateVisit', function (req, res, next) {
    res.render('page/SubstationLateVisit', {title: ''});
});

/*司机工作情况查询页面*/
router.get('/DriverWork', function (req, res, next) {
    res.render('page/DriverWork', {title: ''});
});

/*医生工作情况查询页面*/
router.get('/DoctorWork', function (req, res, next) {
    res.render('page/DoctorWork', {title: ''});
});

/*护士工作情况查询页面*/
router.get('/NurseWork', function (req, res, next) {
    res.render('page/NurseWork', {title: ''});
});

module.exports = router;
