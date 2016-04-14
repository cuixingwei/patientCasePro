/**
 * Created by Dell on 2015/9/19.
 */
var express = require('express');
var router = express.Router();
var CaseDAO = require('../public/controller/CaseDAO');
var string = require("../utils/string");

/*历史事件*/
router.post('/getHistoryEvent', function (req, res, next) {
    CaseDAO.getHistoryEvent(req, res);
});

/*获取病例信息*/
router.post('/getPatientsByID', function (req, res, next) {
    CaseDAO.getPatientsByID(req, res);
});

/*获取病例附表信息*/
router.post('/getPatientScheduleByID', function (req, res, next) {
    CaseDAO.getPatientScheduleByID(req, res);
});

/*获取收费记录信息*/
router.post('/getChargeByID', function (req, res, next) {
    CaseDAO.getChargeByID(req, res);
});

/*获取护理观察记录信息*/
router.post('/getPatientNursing', function (req, res, next) {
    CaseDAO.getPatientNursing(req, res);
});

/*获取急救措施信息*/
router.post('/getCureMeasure', function (req, res, next) {
    CaseDAO.getCureMeasure(req, res);
});

/*获取任务相关信息*/
router.post('/getTaskByID', function (req, res, next) {
    CaseDAO.getTaskByID(req, res);
});

/*添加收费项*/
router.post('/addCharge', function (req, res, next) {
    if (string.isBlankOrEmpty(req.session.userId)) {
        res.json({
            flag: 0 //无session
        });
    } else {
        CaseDAO.addCharge(req, res);
    }
});
/*删除收费项*/
router.post('/deleteCharge', function (req, res, next) {
    CaseDAO.deleteCharge(req, res);
});

/*添加护理观察记录*/
router.post('/addNurseRecord', function (req, res, next) {
    if (string.isBlankOrEmpty(req.session.userId)) {
        res.json({
            flag: 0 //无session
        });
    } else {
        CaseDAO.addNurseRecord(req, res, 1);
    }
});
/*编辑护理观察记录*/
router.post('/editNurseRecord', function (req, res, next) {
    if (string.isBlankOrEmpty(req.session.userId)) {
        res.json({
            flag: 0 //无session
        });
    } else {
        CaseDAO.addNurseRecord(req, res, 2);
    }
});
/*删除收费项*/
router.post('/deleteNurseRecord', function (req, res, next) {
    CaseDAO.deleteNurseRecord(req, res);
});

/*添加病历*/
router.post('/addPatientCase', function (req, res, next) {
    if (string.isBlankOrEmpty(req.session.userId)) {
        res.json({
            flag: 0 //无session
        });
    } else {
        CaseDAO.addPatientCase(req, res, 1);
    }
});
/*编辑病历*/
router.post('/editPatientCase', function (req, res, next) {
    if (string.isBlankOrEmpty(req.session.userId)) {
        res.json({
            flag: 0 //无session
        });
    } else {
        CaseDAO.addPatientCase(req, res, 2);
    }
});
/*删除病历*/
router.post('/deletePatientCase', function (req, res, next) {
    CaseDAO.deletePatientCase(req, res);
});

module.exports = router;
