/**
 * Created by Dell on 2016/3/30.
 */


/*加载病历附表内容*/
var loadPatientSchedule = function () {
    $.post('/cases/getPatientScheduleByID', {
        taskCode: taskCode,
        taskOrder: taskOrder,
        patientCaseOrder: patientCaseOrder
    }, function (result) {
        if (result.length > 0) {
            var data = result[0];
            $("#patientScheduleForm").form('load', {
                "BPH": data.BPH,
                "BPL": data.BPL,
                "P": data.P,
                "R": data.R,
                "leftEye": data.leftEye,
                "rightEye": data.rightEye,
                "general": data.general,
                "pathologicalReflex": data.pathologicalReflex,
                "senseSchedule": data.sense,
                "kczg": data.kczg,
                "leftLight": data.leftLight,
                "rightLight": data.rightLight,
                "heart": data.heart,
                "lung": data.lung,
                "head": data.head,
                "breast": data.breast,
                "abdomen": data.abdomen,
                "spine": data.spine,
                "limb": data.limb,
                "others": data.others,
                "cureMeasures": data.cureMeasure,
                "cyclePoints": data.cyclePoints,
                "breathPoints": data.breathPoints,
                "abdomenPoints": data.abdomenPoints,
                "motionPoints": data.motionPoints,
                "speechPoints": data.speechPoints,
                "CRAMS": data.CRAMS,
                "T": data.T
            });
        }
    });
};

/*加载任务相关信息*/
var loadTask = function () {
    $.post('/cases/getTaskByID', {
        taskCode: taskCode,
        taskOrder: taskOrder
    }, function (result) {
        if (result.length > 0) {
            data = result[0];
            carIdentification = data.carIdentification; //赋值车辆标识
            carCode = data.carCode; //赋值车辆编码
            stationCode = data.stationCode; //分站编码
            $("form").form('load', {
                "linkPhone": data.linkPhone,
                "localAddr": data.localAddr,
                "waitAddr": data.waitAddr,
                "outCarTime": data.outCarTime,
                "arriveSpotTime": data.arriveSpotTime,
                "leaveSpotTime": data.leaveSpotTime,
                "returnHospitalTime": data.returnHospitalTime,
                "completeTime": data.completeTime
            });
        }
    });
};

/*加载救治措施*/
var loadCureMeasure = function () {
    $.post('/cases/getCureMeasure', {
        taskCode: taskCode,
        taskOrder: taskOrder,
        patientCaseOrder: patientCaseOrder
    }, function (result) {
        if (result.length > 0) {
            /*全不选，初始化*/
            $("[name = cureMeasure]:checkbox").attr("checked", false);
            var boxes = document.getElementsByName("cureMeasure");
            for (var j = 0; j < boxes.length; j++) {
                for (var i = 0; i < result.length; i++) {
                    //$("[name = cureMeasure][value = " + result[i].cureCode + "]:checkbox").attr("checked", true);
                    if (boxes[j].value == result[i].cureCode) {
                        boxes[j].checked = true;
                        break;
                    }
                }
            }
        } else {
            /*全不选，初始化*/
            $("[name = cureMeasure]:checkbox").attr("checked", false);
        }
    });
};
/*加载病例信息*/
var loadPatientCase = function (data) {
    if (data.doctor != '' && data.doctor != null) {
        $('#doctor').combobox('setValues', data.doctor.split(';'));
    } else {
        $('#doctor').combobox('setValues', '');
    }
    if (data.nurse != '' && data.nurse != null) {
        $('#nurse').combobox('setValues', data.nurse.split(';'));
    } else {
        $('#nurse').combobox('setValues', '');
    }
    if (data.driver != '' && data.driver != null) {
        $('#driver').combobox('setValues', data.driver.split(';'));
    } else {
        $('#driver').combobox('setValues', '');
    }
    $("form").form('load', {
        "patientName": data.patientName,
        "sex": data.sex,
        "departmentCode": data.departmentCode,
        "outAddr": data.outAddr,
        "age": data.age,
        "nationalityCode": data.nationalityCode,
        "outcomeCode": data.outcomeCode,
        "toAddr": data.toAddr,
        "workCode": data.workCode,
        "identityCode": data.identityCode,
        "treatResultCode": data.treatResultCode,
        "patientCooperation": data.patientCooperation,
        "nationCode": data.nation,
        "illnessCode": data.illnessCode,
        "deathCode": data.deathCode,
        "patientReasonCode": data.patientReasonCode,
        "classCode": data.classCode,
        "linkMan": data.linkMan,
        "linkPhone": data.linkPhone,
        "threeNO": data.threeNO,
        "localAddr": data.localAddr,
        "distance": data.distance,
        "chiefComplaint": data.chiefComplaint,
        "presentIllness": data.presentIllness,
        "pastHistory": data.pastHistory,
        "allergy": data.allergy,
        "doctorDiagnosis": data.doctorDiagnosis,
        "middleChange": data.middleChange,
        "remark": data.remark,
        "doctorSign": data.doctorSign
    });
};
/*加载护理信息列表*/
var loadNurseDetail = function (row) {
    $('#nurseRecordForm').form('load', {
        "sense": row.sense,
        "leftSize": row.leftSize,
        "leftReaction": row.leftReaction,
        "rightSize": row.rightSize,
        "rightReaction": row.rightReaction,
        "heartRate": row.heartRate,
        "pulse": row.pulse,
        "breath": row.breath,
        "bloodPressure": row.bloodPressure,
        "sao2": row.sao2,
        "nurseMeasure": row.nurseMeasure,
        "nurseSign": row.nurseSign,
        "recordDatetime": row.recordDatetime,
        "nurseDateTime": row.recordDate + ' ' + row.recordTime
    });
};
/*添加收费项*/
var addCharge = function () {
    var data = $('#chargeName').combobox('getData');
    if (data.length > 0) {
        $('#chargeName').combobox('setValue', data[0].id);
    }
    $("#chargePrice").val('');
    addChargeFlag = 1;
};
/*保存收费项*/
var saveCharge = function () {
    if (addChargeFlag == 1) {
        $.post('/cases/addCharge', {
            "taskCode": taskCode,
            "taskOrder": taskOrder,
            "patientCaseOrder": patientCaseOrder,
            "carCode": carCode,
            "carIdentification": carIdentification,
            "chargeCode": $("#chargeName").combobox('getValue'),
            "chargePrice": $("#chargePrice").val()
        }, function (data) {
            if (data.flag == 1) {
                /*加载收费信息列表*/
                chargeListGrid.datagrid('load', {
                    taskCode: taskCode,
                    taskOrder: taskOrder,
                    patientCaseOrder: patientCaseOrder
                });
                addChargeFlag = 0;
            } else if (data.flag == 2) {
                $.messager.alert('提示', '添加收费项失败!', 'info');
            } else {
                $.messager.alert('警告', '登录超时，请重新登录!', 'info', function (r) {
                    window.location.href = "/";
                });
            }
        });
    }
};
/*删除收费*/
var deleteCharge = function () {
    if (chargeRecordID == -1) {
        $.messager.alert('提示', '请选择你要删除的记录!', 'info');
    } else {
        $.messager.alert('警告', '你确定要删除该条记录嘛!', 'info', function (r) {
            $.post('/cases/deleteCharge', {"chargeRecordID": chargeRecordID}, function (data) {
                if (data.success) {
                    /*加载收费信息列表*/
                    chargeListGrid.datagrid('load', {
                        taskCode: taskCode,
                        taskOrder: taskOrder,
                        patientCaseOrder: patientCaseOrder
                    });
                } else {
                    $.messager.alert('提示', '删除收费项失败!', 'info');
                    chargeRecordID = -1;
                }
            });
        });
    }
};
/*添加护理观察项*/
var addNurseRecord = function () {
    if (patientCaseNumber == 0) {
        $.messager.alert('提示', '还没有病历，请先添加病历!', 'info');
    } else {
        addNurseFlag = 1;

        var data = {
            leftReaction: '++',
            rightReaction: '++',
            sense: '清楚'
        };
        loadNurseDetail(data);
        /**
         * 重置表单
         */
        $('#nurseDateTime').datetimebox({
            value: getCurrentTime()
        });

    }
};
/*保存护理记录项*/
var saveNurseRecord = function () {
    $('#nurseSign').combobox('setValue', $('#nurseSign').combobox('getText'));
    if (addNurseFlag == 1) { //添加

        var url;
        url = '/cases/addNurseRecord?taskCode=' + taskCode + '&taskOrder=' + taskOrder + '&patientCaseOrder=' + patientCaseOrder + '&carCode=' + carCode + '&carIdentification=' + carIdentification;
        $.post(url, cxw.serializeObject($('#nurseRecordForm')), function (data) {
            if (data.flag == 1) {
                /*加载护理信息列表*/
                nurseObserveRecordGrid.datagrid('load', {
                    taskCode: taskCode,
                    taskOrder: taskOrder,
                    patientCaseOrder: patientCaseOrder
                });
                addNurseFlag = 0;
            } else if (data.flag == 2) {
                $.messager.alert('提示', '添加护理记录项失败!', 'info');
            } else {
                $.messager.alert('警告', '登录超时，请重新登录!', 'info', function (r) {
                    window.location.href = "/";
                });
            }
        });
    } else if (addNurseFlag != 1 && nurseRecordID != -1) {
        url = '/cases/editNurseRecord?taskCode=' + taskCode + '&taskOrder=' + taskOrder + '&patientCaseOrder=' + patientCaseOrder + '&carCode=' + carCode + '&carIdentification=' + carIdentification + '&nurseRecordID=' + nurseRecordID;
        $.post(url, cxw.serializeObject($('#nurseRecordForm')), function (data) {
            if (data.flag == 1) {
                /*加载护理信息列表*/
                nurseObserveRecordGrid.datagrid('load', {
                    taskCode: taskCode,
                    taskOrder: taskOrder,
                    patientCaseOrder: patientCaseOrder
                });
                addNurseFlag = 0;
            } else if (data.flag == 2) {
                $.messager.alert('提示', '修改护理记录项失败!', 'info');
            } else {
                $.messager.alert('警告', '登录超时，请重新登录!', 'info', function (r) {
                    window.location.href = "/";
                });
            }
        });
    } else {
        $.messager.alert('提示', '你还没有观察记录，不能修改，请先添加！', 'info');
    }
};
/*删除护理记录*/
var deleteNurseRecord = function () {
    if (nurseRecordID == -1) {
        $.messager.alert('提示', '请选择你要删除的记录!', 'info');
    } else {
        $.messager.alert('警告', '你确定要删除该条记录嘛!', 'info', function (r) {
            $.post('/cases/deleteNurseRecord', {"nurseRecordID": nurseRecordID}, function (data) {
                if (data.success) {
                    /*加载护理信息列表*/
                    nurseObserveRecordGrid.datagrid('load', {
                        taskCode: taskCode,
                        taskOrder: taskOrder,
                        patientCaseOrder: patientCaseOrder
                    });
                    nurseRecordID = -1;
                } else {
                    $.messager.alert('提示', '删除护理记录失败!', 'info');
                    nurseRecordID = -1;
                }
            });
        });
    }
};
/*添加病历*/
var addPatientCase = function () {
    addPatientCaseFlag = 1;
    /**
     * 重置表单
     */
    $("[name = cureMeasure]:checkbox").attr("checked", false);
    var data = {
        general: '无',
        pathologicalReflex: '无',
        kczg: '无',
        senseSchedule: '清楚',
        leftLight: '存在',
        rightLight: '存在',
        sex: '不祥',
        departmentCode: '17',
        outAddr: '三峡中心医院急救分院',
        age: '不祥',
        outcomeCode: '8',
        toAddr: '急救急诊科',
        workCode: '5',
        identityCode: '3',
        treatResultCode: '8',
        patientCooperation: '5',
        nation: '汉族',
        illnessCode: '1',
        deathCode: '1',
        patientReasonCode: '2',
        classCode: '21'
    };
    $("#patientScheduleForm").form('load', {
        "BPH": data.BPH,
        "BPL": data.BPL,
        "P": data.P,
        "R": data.R,
        "leftEye": data.leftEye,
        "rightEye": data.rightEye,
        "general": data.general,
        "pathologicalReflex": data.pathologicalReflex,
        "senseSchedule": data.senseSchedule,
        "kczg": data.kczg,
        "leftLight": data.leftLight,
        "rightLight": data.rightLight,
        "heart": data.heart,
        "lung": data.lung,
        "head": data.head,
        "breast": data.breast,
        "abdomen": data.abdomen,
        "spine": data.spine,
        "limb": data.limb,
        "others": data.others,
        "cureMeasures": data.cureMeasure,
        "cyclePoints": data.cyclePoints,
        "breathPoints": data.breathPoints,
        "abdomenPoints": data.abdomenPoints,
        "motionPoints": data.motionPoints,
        "speechPoints": data.speechPoints,
        "CRAMS": data.CRAMS,
        "T": data.T
    });
    loadPatientCase(data);
    loadTask();
};
/*保存病历*/
var savePatientCase = function () {
    $('#age').combobox('setValue', $('#age').combobox('getText'));
    $('#outAddr').combobox('setValue', $('#outAddr').combobox('getText'));
    $('#nationCode').combobox('setValue', $('#nationCode').combobox('getText'));
    $('#doctor').combobox('setValue', $('#doctor').combobox('getText'));
    $('#nurse').combobox('setValue', $('#nurse').combobox('getText'));
    $('#driver').combobox('setValue', $('#driver').combobox('getText'));
    $('#doctorSign').combobox('setValue', $('#doctorSign').combobox('getText'));
    if (addPatientCaseFlag == 1) { //添加
        var url;
        url = '/cases/addPatientCase?taskCode=' + taskCode + ' &taskOrder= ' + taskOrder + ' &patientCaseOrder= ' + patientCaseOrder + ' &patientCaseNumber= ' + patientCaseNumber + ' &carCode= ' + carCode + ' &carIdentification= ' + carIdentification + ' &patientCaseID= ' + patientCaseID + '&stationCode=' + stationCode;
        $.post(url, cxw.serializeObject($('form')), function (data) {
            if (data.flag == 1) {
                patientsGrid.datagrid('load', {}); //加载病历
                patientsListGrid.datagrid('load', {}); //加载病人列表
                /*加载病历附表*/
                loadPatientSchedule();
                /*加载急救措施*/
                loadCureMeasure();
                /*加载收费信息列表*/
                chargeListGrid.datagrid('load', {
                    taskCode: taskCode,
                    taskOrder: taskOrder,
                    patientCaseOrder: patientCaseOrder
                });
                /*加载护理信息列表*/
                nurseObserveRecordGrid.datagrid('load', {
                    taskCode: taskCode,
                    taskOrder: taskOrder,
                    patientCaseOrder: patientCaseOrder
                });
                addPatientCaseFlag = 0;
            } else if (data.flag == 2) {
                $.messager.alert('提示', '添加病历失败!', 'info');
            } else {
                $.messager.alert('警告', '登录超时，请重新登录!', 'info', function (r) {
                    window.location.href = "/";
                });
            }
        });
    } else if (addPatientCaseFlag != 1 && addPatientCaseFlag != -1) {
        url = '/cases/editPatientCase?taskCode= ' + taskCode + ' &taskOrder= ' + taskOrder + ' &patientCaseOrder= ' + patientCaseOrder + ' &patientCaseNumber= ' + patientCaseNumber + ' &carCode= ' + carCode + ' &carIdentification= ' + carIdentification + ' &patientCaseID= ' + patientCaseID + '&stationCode=' + stationCode;
        $.post(url, cxw.serializeObject($('form')), function (data) {
            if (data.flag == 1) {
                patientsGrid.datagrid('load', {}); //加载病历
                /*加载病历附表*/
                loadPatientSchedule();
                /*加载急救措施*/
                loadCureMeasure();
                addPatientCaseFlag = 0;
            } else if (data.flag == 2) {
                $.messager.alert('提示', '修改病历失败!', 'info');
            } else {
                $.messager.alert('警告', '登录超时，请重新登录!', 'info', function (r) {
                    window.location.href = "/";
                });
            }
        });
    } else {
        $.messager.alert('提示', '你还没有添加病历，不能修改，请先添加！', 'info');
    }
};
/*删除病历*/
var deletePatientCase = function () {
    if (patientCaseID == -1) {
        $.messager.alert('提示', '请选择你要删除的记录!', 'info');
    } else {
        $.messager.alert('警告', '你确定要删除该条记录嘛!', 'info', function (r) {
            $.post('/cases/deletePatientCase', {
                "taskCode": taskCode,
                'taskOrder': taskOrder,
                'patientCaseOrder': patientCaseOrder
            }, function (data) {
                if (data.success) {
                    patientsGrid.datagrid('load', {}); //加载病历
                    patientsListGrid.datagrid('load', {}); //加载病人列表
                    /*加载病历附表*/
                    loadPatientSchedule();
                    /*加载急救措施*/
                    loadCureMeasure();
                    /*加载收费信息列表*/
                    chargeListGrid.datagrid('load', {
                        taskCode: taskCode,
                        taskOrder: taskOrder,
                        patientCaseOrder: patientCaseOrder
                    });
                    /*加载护理信息列表*/
                    nurseObserveRecordGrid.datagrid('load', {
                        taskCode: taskCode,
                        taskOrder: taskOrder,
                        patientCaseOrder: patientCaseOrder
                    });
                    patientCaseID = -1;
                } else {
                    $.messager.alert('提示', '删除病历失败!', 'info');
                    patientCaseID = -1;
                }
            });
        });
    }
};

var bloodCheckClick = function (target) {
    if (target.checked) {
        $("#BPH").val('').attr("readonly", "readonly");
        $("#BPL").val('').attr("readonly", "readonly");
    } else {
        $("#BPH").removeAttr("readonly");
        $("#BPL").removeAttr("readonly");
    }
};
/* 初始化页面标签 */
function init() {
    /*获取急救措施字典表*/
    $.get('/dictionary/getDCureMeasure', function (data, status) {
        $.each(data, function (i, ob) {
            $("#cureMeasureDiv").append('<input name="cureMeasure" type="checkbox" value="' + ob.id + '"/>&nbsp;&nbsp;&nbsp;' + ob.name + '<br/>');
        });
    });
    /*疾病科别*/
    $('#departmentCode').combobox({
        url: '/dictionary/getDDiseaseClass',
        valueField: 'id',
        textField: 'name',
        method: 'get',
        editable: false
    });
    /*出诊医院*/
    $('#outAddr').combobox({
        url: '/dictionary/getDHospitalTriage',
        valueField: 'id',
        textField: 'name',
        panelHeight: 'auto',
        method: 'get'
    });
    /*年龄*/
    $('#age').combobox({
        url: '/dictionary/getDAge',
        valueField: 'id',
        textField: 'name',
        panelHeight: 'auto',
        method: 'get'
    });
    /*病人转归*/
    $('#outcomeCode').combobox({
        url: '/dictionary/getDOutCome',
        valueField: 'id',
        textField: 'name',
        method: 'get',
        panelHeight: 'auto',
        editable: false
    });
    /*送达地点*/
    $('#toAddr').combobox({
        url: '/dictionary/getDHospitalSend',
        valueField: 'id',
        textField: 'name',
        method: 'get'
    });
    /*职业*/
    $('#workCode').combobox({
        url: '/dictionary/getDProfession',
        valueField: 'id',
        textField: 'name',
        method: 'get',
        panelHeight: 'auto',
        editable: false
    });
    /*身份*/
    $('#identityCode').combobox({
        url: '/dictionary/getDIdentity',
        valueField: 'id',
        textField: 'name',
        method: 'get',
        panelHeight: 'auto',
        editable: false
    });
    /*救治结果*/
    $('#treatResultCode').combobox({
        url: '/dictionary/getDResult',
        valueField: 'id',
        textField: 'name',
        method: 'get',
        panelHeight: 'auto',
        editable: false
    });
    /*病家合作*/
    $('#patientCooperation').combobox({
        url: '/dictionary/getDCooperate',
        valueField: 'id',
        textField: 'name',
        method: 'get',
        panelHeight: 'auto',
        editable: false
    });
    /*民族*/
    $('#nationCode').combobox({
        url: '/dictionary/getDFolk',
        valueField: 'id',
        textField: 'name',
        panelHeight: 'auto',
        method: 'get'
    });
    /*病情*/
    $('#illnessCode').combobox({
        url: '/dictionary/getDILLState',
        valueField: 'id',
        textField: 'name',
        method: 'get',
        panelHeight: 'auto',
        editable: false
    });
    /*病情死亡证明*/
    $('#deathCode').combobox({
        url: '/dictionary/getDDeathProve',
        valueField: 'id',
        textField: 'name',
        method: 'get',
        panelHeight: 'auto',
        editable: false
    });

    /*性别*/
    $('#sex').combobox({
        valueField: 'label',
        textField: 'value',
        method: 'get',
        panelHeight: 'auto',
        editable: false,
        data: [{label: '不祥', value: '不祥'},
            {label: '男', value: '男'}, {label: '女', value: '女'}]
    });

    /*呼救原因*/
    $('#patientReasonCode').combobox({
        url: '/dictionary/getDDiseaseReason',
        valueField: 'id',
        textField: 'name',
        method: 'get',
        panelHeight: 'auto',
        editable: false
    });
    /*分类统计*/
    $('#classCode').combobox({
        url: '/dictionary/getDDiseaseClassState',
        valueField: 'id',
        textField: 'name',
        method: 'get',
        editable: false
    });
    /*医生签名*/
    $('#doctorSign').combobox({
        url: '/dictionary/getPerson?personType=1',
        valueField: 'id',
        textField: 'name',
        method: 'get'
    });
    /*护士签名*/
    $('#nurseSign').combobox({
        url: '/dictionary/getPerson?personType=2',
        valueField: 'id',
        textField: 'name',
        method: 'get'
    });
    /*随车医生*/
    $('#doctor').combobox({
        url: '/dictionary/getPerson?personType=1',
        valueField: 'id',
        textField: 'name',
        multiple: true,
        separator: ';',
        method: 'get'
    });
    /*随车护士*/
    $('#nurse').combobox({
        url: '/dictionary/getPerson?personType=2',
        valueField: 'id',
        textField: 'name',
        multiple: true,
        separator: ';',
        method: 'get'
    });
    /*司机*/
    $('#driver').combobox({
        url: '/dictionary/getPerson?personType=3',
        valueField: 'id',
        textField: 'name',
        multiple: true,
        separator: ';',
        method: 'get'
    });
    /*收费项字典表*/
    $('#chargeName').combobox({
        url: '/dictionary/getDChargeXMCode',
        valueField: 'id',
        textField: 'name',
        method: 'get',
        panelHeight: 'auto',
        editable: false
    });
    patientsGrid = $('#patientsGrid').datagrid(
        {
            url: '/cases/getPatientsByID?taskCode=' + taskCode + '&taskOrder=' + taskOrder,
            striped: true,
            singleSelect: true,
            rownumbers: true,
            idField: 'acceptTime',
            columns: [[{
                field: 'patientName',
                title: '姓名',
                width: "10%",
                align: 'center'
            }, {
                field: 'sex',
                title: '性别',
                width: "10%",
                align: 'center'
            }, {
                field: 'age',
                title: '年龄',
                width: "15%",
                align: 'center'
            }, {
                field: 'doctorDiagnosis',
                title: '医生诊断',
                width: "20%",
                align: 'center'
            }, {
                field: 'localAddr',
                title: '现场地点',
                width: "20%",
                align: 'center'
            }, {
                field: 'toAddr',
                title: '送达地点',
                width: "18%",
                align: 'center'
            }]],
            onLoadSuccess: function (data) {
                if (data.rows.length > 0) {
                    patientCaseNumber = data.rows.length;
                    patientCaseOrder = data.rows[0].pcOrder;
                    patientCaseID = data.rows[0].ID;
                    patientsGrid.datagrid('selectRow', 0);//光标指向第一个
                    loadPatientCase(data.rows[0]); //加载病例
                    /*加载病历附表*/
                    loadPatientSchedule();
                    /*加载急救措施*/
                    loadCureMeasure();
                    $("#btn_printCase").linkbutton('enable');
                } else {
                    $("#btn_printCase").linkbutton('disable');
                }
            },
            onClickRow: function (rowIndex, rowData) {
                patientCaseID = rowData.ID;
                patientCaseOrder = rowData.pcOrder;
                loadPatientCase(rowData); //加载病例
                /*加载病历附表*/
                loadPatientSchedule();
                /*加载急救措施*/
                loadCureMeasure();
            }
        });
    patientsListGrid = $('#patientsList').datagrid(
        {
            url: '/cases/getPatientsByID?taskCode=' + taskCode + '&taskOrder=' + taskOrder,
            pagePosition: 'bottom',
            pagination: true,
            striped: true,
            singleSelect: true,
            rownumbers: true,
            idField: 'acceptTime',
            pageSize: 20,
            pageList: [10, 20, 30, 40, 50, 100, 200, 300, 400, 500],
            columns: [[{
                field: 'patientName',
                title: '姓名',
                width: "30%",
                align: 'center'
            }, {
                field: 'localAddr',
                title: '现场地点',
                width: "55%",
                align: 'center'
            }]],
            onLoadSuccess: function (data) {
                if (data.rows.length > 0) {
                    patientCaseNumber = data.rows.length;
                }
                patientsListGrid.datagrid('selectRow', 0);//光标指向第一个
            },
            onClickRow: function (rowIndex, rowData) {
                patientCaseOrder = rowData.pcOrder;
                /*加载收费信息列表*/
                chargeListGrid.datagrid('load', {
                    taskCode: taskCode,
                    taskOrder: taskOrder,
                    patientCaseOrder: patientCaseOrder
                });
                /*加载护理信息列表*/
                nurseObserveRecordGrid.datagrid('load', {
                    taskCode: taskCode,
                    taskOrder: taskOrder,
                    patientCaseOrder: patientCaseOrder
                });
            }
        });
    chargeListGrid = $('#chargeList').datagrid(
        {
            url: '/cases/getChargeByID',
            pagePosition: 'bottom',
            pagination: true,
            striped: true,
            singleSelect: true,
            rownumbers: true,
            idField: 'acceptTime',
            pageSize: 20,
            pageList: [10, 20, 30, 40, 50, 100, 200, 300, 400, 500],
            columns: [[{
                field: 'name',
                title: '收费项',
                width: "30%",
                align: 'center'
            }, {
                field: 'price',
                title: '金额',
                width: "55%",
                align: 'center'
            }]],
            toolbar: '#toolbar',
            onLoadSuccess: function (data) {
                if (data.rows.length > 0) {
                    $("#totalMoney").html(data.totalMoney);
                    $("#chargeName").combobox('setValue', data.rows[0].id);
                    $("#chargePrice").val(data.rows[0].price);
                    chargeRecordID = data.rows[0].chargeID;
                    chargeListGrid.datagrid('selectRow', 0);//光标指向第一个
                }
            },
            onClickRow: function (rowIndex, rowData) {
                $("#chargeName").combobox('setValue', rowData.id);
                $("#chargePrice").val(rowData.price);
                addChargeFlag = 0;
                chargeRecordID = rowData.chargeID;
            }
        });
    nurseObserveRecordGrid = $('#nurseObserveRecord').datagrid(
        {
            url: '/cases/getPatientNursing',
            pagePosition: 'bottom',
            pagination: true,
            striped: true,
            singleSelect: true,
            rownumbers: true,
            idField: 'acceptTime',
            pageSize: 20,
            pageList: [10, 20, 30, 40, 50, 100, 200, 300, 400, 500],
            columns: [[{
                field: 'recordTime',
                title: '时间',
                width: "15%",
                align: 'center'
            }, {
                field: 'sense',
                title: '神志',
                width: "10%",
                align: 'center'
            }, {
                field: 'heartRate',
                title: '心率',
                width: "10%",
                align: 'center'
            }, {
                field: 'pulse',
                title: '脉搏',
                width: "10%",
                align: 'center'
            }, {
                field: 'breath',
                title: '呼吸',
                width: "10%",
                align: 'center'
            }, {
                field: 'bloodPressure',
                title: '血压',
                width: "10%",
                align: 'center'
            }, {
                field: 'sao2',
                title: '血氧饱和度',
                width: "15%",
                align: 'center'
            }]],
            toolbar: '#toolbar',
            onLoadSuccess: function (data) {
                if (data.rows.length > 0) {
                    var row = data.rows[0];
                    loadNurseDetail(row);
                    nurseRecordID = data.rows[0].nurseRecordID;
                    $("#btn_printNurse").linkbutton('enable');
                    nurseObserveRecordGrid.datagrid('selectRow', 0);//光标指向第一个
                } else {
                    loadNurseDetail([]);
                    $("#btn_printNurse").linkbutton('disable');
                }
            },
            onClickRow: function (rowIndex, row) {
                loadNurseDetail(row);
                addNurseFlag = 0;
                nurseRecordID = row.nurseRecordID;
            }
        });
    //初始化护理记录时间
    $('#nurseDateTime').datetimebox({
        value: getCurrentTime()
    });
}
