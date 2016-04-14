var express = require('express');
var router = express.Router();

var menu = require("../config/menu.json");

var db = require('../utils/msdb');

var string = require('../utils/string');


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
        taskOrder: req.query.taskOrder,
        patientCaseOrder: req.query.patientCaseOrder
    });
});

/**
 * 跳转打印护理观察记录
 */
router.get('/printNurseRecord', function (req, res, next) {
    console.log('跳转打印护理观察记录');
    res.render('case/printNurseRecord', {
        title: '打印护理观察记录',
        taskCode: req.query.taskCode,
        taskOrder: req.query.taskOrder,
        patientCaseOrder: req.query.patientCaseOrder
    });
});

/*登录成功后跳转到主页面*/
router.get('/main', function (req, res, next) {
    if (!string.isBlankOrEmpty(req.session.username)) {
        res.render('main', {title: '主页面', username: req.session.username, center: req.session.center});
    } else {
        res.render('login', {});
    }
});

/*退出*/
router.get('/logOut', function (req, res, next) {
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
    res.json(menu);
});


/*历史事件*/
router.get('/HistoryEvent', function (req, res, next) {
    res.render('case/HistoryEvent', {title: ''});
});

/*院前急救病历主页面*/
router.get('/CaseMain', function (req, res, next) {
    var taskCode = req.query.taskCode;
    var taskOrder = req.query.taskOrder;
    res.render('case/CaseMain', {title: '院前急救病历', taskCode: taskCode, taskOrder: taskOrder});
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
