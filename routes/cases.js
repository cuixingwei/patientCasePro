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


/*获取人员列表信息*/
router.post('/getPersons', function (req, res, next) {
    CaseDAO.getPersons(req, res);
});

/*获取病例信息*/
router.post('/getPatientCases', function (req, res, next) {
    CaseDAO.getPatientCases(req, res);
});

/*获取病例附表信息*/
router.post('/getPatientScheduleByID', function (req, res, next) {
    CaseDAO.getPatientScheduleByID(req, res);
});

/*获取收费记录信息*/
router.post('/getChargeByID', function (req, res, next) {
    CaseDAO.getChargeByID(req, res);
});


/*获取急救措施信息*/
router.post('/getCureMeasure', function (req, res, next) {
    CaseDAO.getCureMeasure(req, res);
});

/*获取用药记录信息*/
router.post('/getMedicationRecord', function (req, res, next) {
    CaseDAO.getMedicationRecord(req, res);
});

/*获取病情告知信息*/
router.post('/getILLTeller', function (req, res, next) {
    CaseDAO.getILLTeller(req, res);
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

/*添加人员*/
router.post('/addPerson', function (req, res, next) {
    CaseDAO.addPerson(req, res);
});

/*编辑人员信息*/
router.post('/editPerson', function (req, res, next) {
    CaseDAO.addPerson(req, res);
});

/*获取指定人员信息*/
router.post('/getPersonById', function (req, res, next) {
    CaseDAO.getPersonById(req, res);
});

/*获取病历修改记录*/
router.post('/getPatientCaseAlterRecord', function (req, res, next) {
    CaseDAO.getPatientCaseAlterRecord(req, res);
});


module.exports = router;
