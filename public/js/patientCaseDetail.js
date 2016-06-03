/**
 * Created by Dell on 2016/5/1.
 */
var init = function () {
    $("#currentTime").html(getCurrentTime()); //填写时间
    /*民族*/
    $('#nationCode').combobox({
        url: '/dictionary/getDFolk',
        valueField: 'id',
        textField: 'name',
        panelHeight: 'auto',
        method: 'get',
        editable: false,
        onLoadSuccess: function (data) {
            if (data) {
                $('#nationCode').combobox('setValue', data[0].id);
            }
        }
    });
    /*分类统计*/
    $('#classCode').combobox({
        url: '/dictionary/getDDiseaseClassState',
        valueField: 'id',
        textField: 'name',
        method: 'get',
        editable: false
    });
    /*现场地点类型*/
    $('#localAddrType').combobox({
        url: '/dictionary/getDLocaleType',
        valueField: 'id',
        textField: 'name',
        method: 'get',
        panelHeight: 'auto',
        editable: false,
        onLoadSuccess: function (data) {
            if (data) {
                $('#localAddrType').combobox('setValue', data[0].id);
            }
        }
    });
    /*送往地点类型*/
    $('#toAddrType').combobox({
        url: '/dictionary/getDTakenPlaceType',
        valueField: 'id',
        textField: 'name',
        method: 'get',
        panelHeight: 'auto',
        editable: false,
        onLoadSuccess: function (data) {
            if (data) {
                $('#toAddrType').combobox('setValue', data[0].id);
            }
        }
    });
    /*医生签名*/
    $('#doctorSign').combobox({
        url: '/dictionary/getPerson?personType=7',
        valueField: 'id',
        textField: 'name',
        editable: false,
        method: 'get'
    });
    /*告知人签名--医生*/
    $('#tellerSign').combobox({
        url: '/dictionary/getPerson?personType=7',
        valueField: 'id',
        textField: 'name',
        editable: false,
        method: 'get'
    });
    /*护士签名*/
    $('#nurseSign').combobox({
        url: '/dictionary/getPerson?personType=8',
        valueField: 'id',
        textField: 'name',
        editable: false,
        method: 'get'
    });
    /*随车医生*/
    $('#doctor').combobox({
        url: '/dictionary/getPerson?personType=7',
        valueField: 'id',
        textField: 'name',
        editable: false,
        method: 'get'
    });
    /*随车护士*/
    $('#nurse').combobox({
        url: '/dictionary/getPerson?personType=8',
        valueField: 'id',
        textField: 'name',
        editable: false,
        method: 'get'
    });
    /*司机*/
    $('#driver').combobox({
        url: '/dictionary/getPerson?personType=6',
        valueField: 'id',
        textField: 'name',
        editable: false,
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
    /*呼救原因*/
    $('#patientReasonCode').combobox({
        url: '/dictionary/getDDiseaseReason',
        valueField: 'id',
        textField: 'name',
        method: 'get',
        panelHeight: 'auto',
        editable: false,
        onLoadSuccess: function (data) {
            if (data) {
                $('#patientReasonCode').combobox('setValue', data[0].id);
            }
        }
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
    /*年龄*/
    $('#age').combobox({
        url: '/dictionary/getDAge',
        valueField: 'id',
        textField: 'name',
        panelHeight: 'auto',
        method: 'get',
        onLoadSuccess: function (data) {
            if (data) {
                $('#age').combobox('setValue', data[0].id);
            }
        }
    });
    /*疾病科别*/
    $('#departmentCode').combobox({
        url: '/dictionary/getDDiseaseClass',
        valueField: 'id',
        textField: 'name',
        method: 'get',
        editable: false
    });
    /*分站编码*/
    $('#station').combobox({
        url: '/dictionary/getStations',
        valueField: 'id',
        textField: 'name',
        method: 'get',
        editable: false,
        onLoadSuccess: function (data) {
            if (data) {
                $('#station').combobox('setValue', data[0].id);
            }
        }
    });
    /*获取急救措施字典表*/
    $.get('/dictionary/getDCureMeasure', function (data, status) {
        var str = '';
        cureMeasures = data;
        $.each(data, function (i, ob) {
            str += '<span style="display: inline-block;width: 33%;"><input name="cureMeasure" type="checkbox" value="' + ob.id + '"/>&nbsp;&nbsp;&nbsp;' + ob.name + '</span>';
            if ((i + 1) % 3 == 0 && i > 0) {
                str += '<br/>';
            }
        });
        $("#cureMeasureDiv").empty().append(str);

    });
    /*获取用药字典表*/
    $.get('/dictionary/getDMedication', function (data, status) {
        var str = '';
        DMedications = data;
        $.each(data, function (i, ob) {
            str += '<span style="display: inline-block;width: 33%;"><input name="medicationRecord" type="checkbox" value="' + ob.id + '"/>&nbsp;&nbsp;&nbsp;' + ob.name + '</span>';
            if ((i + 1) % 3 == 0 && i > 0) {
                str += '<br/>';
            }
        });
        $("#medicationRecordDiv").empty().append(str);
    });
    /*处理选择点击事件绑定*/
    $("#handleBtn").click(function () {
        $('#handle_window').dialog('open');
    });
    /*处理选择对话框初始化*/
    $('#handle_window').show().dialog({
        modal: true,
        closable: true,
        buttons: [{
            text: '确定',
            handler: function () {
                var handles = [];
                var handlesName = '';
                $("input[name='cureMeasure']:checked").each(function () {
                    handles.push($(this).val());
                });
                console.log('handles:' + handles + 'handles的长度:' + handles.length);
                $.each(cureMeasures, function (i, ob) {
                    if (handles.indexOf(ob.id) >= 0) {
                        handlesName += ',' + ob.name;
                    }

                });
                if (handlesName != '') {
                    handlesName = handlesName.substr(1);
                }
                $("#handles").val('').html('<b>' + handlesName + '</b>');
                $("#handleString").val(handlesName); //赋值
                if ($("#handles").html() == '无') { //如果无标红
                    $("#handles").addClass("red");
                } else {
                    $("#handles").removeClass("red");
                }
                $('#handle_window').dialog('close');
            }
        }],
        onOpen: function () {

        }
    }).dialog('close');

    /*处理选择用药绑定*/
    $("#medicationBtn").click(function () {
        $('#medication_window').dialog('open');
    });
    /*处理选择用药对话框初始化*/
    $('#medication_window').show().dialog({
        modal: true,
        closable: true,
        buttons: [{
            text: '确定',
            handler: function () {
                var medications = [];
                var medicationName = '';
                $("input[name='medicationRecord']:checked").each(function () {
                    medications.push($(this).val());
                });
                console.log('medications:' + medications + 'medications的长度:' + medications.length);
                $.each(DMedications, function (i, ob) {
                    if (medications.indexOf(ob.id) >= 0) {
                        medicationName += ',' + ob.name;
                    }

                });
                if (medicationName != '') {
                    medicationName = medicationName.substr(1);
                }
                $("#medications").val('').html('<b>' + medicationName + '</b>');
                $("#medicationString").val(medicationName); //赋值
                if ($("#medications").html() == '无') { //如果无标红
                    $("#medications").addClass("red");
                } else {
                    $("#medications").removeClass("red");
                }
                $('#medication_window').dialog('close');
            }
        }],
        onOpen: function () {

        }
    }).dialog('close');

    initPoints();//初始化的得分值
};
/**
 * 初始化得分情况
 */
var initPoints = function () {
    $("#cyclePointsSpan").html($("#cyclePoints").combobox('getValue') == 0 ? 0 : $("#cyclePoints").combobox('getValue') - 1);
    $("#breathPointsSpan").html($("#breathPoints").combobox('getValue') == 0 ? 0 : $("#breathPoints").combobox('getValue') - 1);
    $("#motionPointsSpan").html($("#motionPoints").combobox('getValue') == 0 ? 0 : $("#motionPoints").combobox('getValue') - 1);
    $("#speechPointsSpan").html($("#speechPoints").combobox('getValue') == 0 ? 0 : $("#speechPoints").combobox('getValue') - 1);
    $("#abdomenPointsSpan").html($("#abdomenPoints").combobox('getValue') == 0 ? 0 : $("#abdomenPoints").combobox('getValue') - 1);
};
/**
 * 得分选择改变时
 * @param n
 * @param o
 * @param type
 */
var pointsChange = function (n, o, type) {
    if (type == 1) { //循环得分
        if (n != 0) {
            n = n - 1;
        }
        $("#cyclePointsSpan").html(n);
    }
    if (type == 2) { //呼吸得分
        if (n != 0) {
            n = n - 1;
        }
        $("#breathPointsSpan").html(n);
    }
    if (type == 3) { //运动得分
        if (n != 0) {
            n = n - 1;
        }
        $("#motionPointsSpan").html(n);
    }
    if (type == 4) { //言语得分
        if (n != 0) {
            n = n - 1;
        }
        $("#speechPointsSpan").html(n);
    }
    if (type == 5) { //胸腹得分
        if (n != 0) {
            n = n - 1;
        }
        $("#abdomenPointsSpan").html(n);
    }
};


/**
 * 加载任务相关信息
 */
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
                "aidAddr": data.localAddr,
                "arriveSpotTime": data.arriveSpotTime
            });
        }
    });
};

/**
 * 保存病历
 * @param type
 */
var savePatientCase = function (type) {
    $('#age').combobox('setValue', $('#age').combobox('getText'));
    $('#doctor').combobox('setValue', $('#doctor').combobox('getText'));
    $('#nurse').combobox('setValue', $('#nurse').combobox('getText'));
    $('#driver').combobox('setValue', $('#driver').combobox('getText'));
    $('#doctorSign').combobox('setValue', $('#doctorSign').combobox('getText'));
    $('#nurseSign').combobox('setValue', $('#nurseSign').combobox('getText'));
    $('#tellerSign').combobox('setValue', $('#tellerSign').combobox('getText'));
    if ($('#doctor').combobox('getText') == "--请选择--" || $('#nurse').combobox('getText') == "--请选择--" || $('#driver').combobox('getText') == "--请选择--") {
        $.messager.alert('提示', '请选择司机、医生、护士后再进行保存操作!', 'info');
    } else if ($("#patientCode").val() == '') {
        $.messager.alert('提示', '病历编码不能为空', 'info');
    } else {
        if (page == "add") {//添加病历
            var url;
            url = '/cases/addPatientCase?taskCode=' + taskCode + ' &taskOrder= ' + taskOrder + ' &caseNumbers= ' + caseNumbers + ' &carCode= ' + carCode + ' &carIdentification= ' + carIdentification + '&stationCode=' + stationCode;
            $.post(url, cxw.serializeObject($('form')), function (data) {
                if (data.flag == 1) {
                    $.cookie("refresh", "1");
                    caseNumbers = parseInt(caseNumbers) + 1; //添加成功后病历数增加1
                    $.messager.confirm('提示', '保存病历成功!点击确定退出该页面', function (r) {
                        if (r) {
                            window.close();
                        }
                    });
                } else if (data.flag == 2) {
                    $.messager.alert('提示', '保存病历失败!', 'info');
                } else {
                    $.messager.alert('警告', '登录超时，请重新登录!', 'info', function (r) {
                        window.location.href = "/";
                    });
                }
            });
        } else if (page == "edit") {//编辑病历
            var url = '/cases/editPatientCase?taskCode=' + taskCode + ' &patientCaseOrder= ' + pcOrder + ' &carIdentification= ' + carIdentification;
            $.post(url, cxw.serializeObject($('form')), function (data) {
                if (data.flag == 1) {
                    grid.datagrid('load');
                    $.messager.confirm('提示', '保存病历成功!点击确定退出该页面', function (r) {
                        if (r) {
                            window.close();
                        }
                    });
                } else if (data.flag == 2) {
                    $.messager.alert('提示', '保存病历失败!', 'info');
                } else {
                    $.messager.alert('警告', '登录超时，请重新登录!', 'info', function (r) {
                        window.location.href = "/";
                    });
                }
            });
        }
    }

};
/**
 * 点击未查选择框
 * @param target
 * @constructor
 */
var TCheckClick = function (target) {
    if (target.checked) {
        $("#TT").val('').attr("readonly", "readonly");
    } else {
        $("#TT").removeAttr("readonly");
    }
};
/**
 * 当患者要求转院时填写病历续页
 * @param target
 * @constructor
 */
var TransferStation = function (target) {
    if (target.checked) {
        if ($("#caseAdd").hasClass("none")) {
            $("#caseAdd").removeClass("none");
        }
    } else {
        if (!$("#caseAdd").hasClass("none")) { //隐藏病历续页
            $("#caseAdd").addClass("none");
        }
        $('form').form('load', {
            "outDoctor": '',
            "receiveDoctor": '',
            "transferTime": '',
            "mainIllState": ''
        });
    }
};

/**
 * 加载病历主表信息
 * @param taskCode
 * @param carIdentification
 * @param pcOrder
 */
var loadPatientCase = function (taskCode, carIdentification, pcOrder) {
    var url = '/cases/getPatientCases?patientCaseOrder=' + pcOrder + '&taskCode=' + taskCode + '&carIdentification=' + carIdentification;
    $.post(url, function (data) {
        if (data.length > 0) {
            data = data[0];
            $("#caseWriter").html(data.caseWriter);
            $("#currentTime").html(data.recordTime);
        } else {
            data = [];
        }
        if (data) {
            if (page == 'edit') { //修改病历时
                if (isPassTwoDay(data.recordTime)) {
                    $("#save_Btn").linkbutton({
                        disabled: true
                    });
                }
            }
        }
        if (page != 'add') {
            var pCode = data.patientCode;
            if (pCode) {
                pCode = pCode.split('-');
                $("#stationSpan").html(pCode[0]);
                $("#yearMonthSpan").html(pCode[1]);
                $("#patientCode").val(pCode[2]);
            }

        }
        $("form").form('load', {
            "patientName": data.patientName,
            "sex": data.sex,
            "departmentCode": data.departmentCode,
            "age": data.age,
            "nationalityCode": data.nationalityCode,
            "outcomeCode": data.outcomeCode,
            "toAddr": data.toAddr,
            "workCode": data.workCode,
            "identityCode": data.identityCode,
            "treatResultCode": data.treatResultCode,
            "patientCooperation": data.patientCooperation,
            "localAddrTypeCode": data.localAddrTypeCode,
            "nationCode": data.nationCode,
            "illnessCode": data.illnessCode,
            "deathCode": data.deathCode,
            "patientReasonCode": data.patientReasonCode,
            "classCode": data.classCode,
            "linkMan": data.linkMan,
            "linkPhone": data.linkPhone,
            "aidAddr": data.localAddr,
            "chiefComplaint": data.chiefComplaint,
            "presentIllness": data.presentIllness,
            "pastHistory": data.pastHistory,
            "allergy": data.allergy,
            "doctorDiagnosis": data.doctorDiagnosis,
            "remark": data.remark,
            "doctorSign": data.doctorSign,
            "nurseSign": data.nurseSign,
            "tellerSign": data.tellerSign,
            "signTime": data.signTime,
            "tellTime": data.tellTime,
            "caseProvider": data.caseProvider,
            "otherHandle": data.otherHandle,
            "otherMedications": data.otherMedications,
            "doctor": data.doctor,
            "driver": data.driver,
            "nurse": data.nurse,
            "outDoctor": data.outDoctor,
            "receiveDoctor": data.receiveDoctor,
            "transferTime": data.transferTime,
            "mainIllState": data.mainIllState
        });
    });
};

/**
 * 加载病历附表
 * @param taskCode
 * @param carIdentification
 * @param pcOrder
 */
var loadPatientSchedule = function (taskCode, carIdentification, pcOrder) {
    var url = '/cases/getPatientScheduleByID?patientCaseOrder=' + pcOrder + '&taskCode=' + taskCode + '&carIdentification=' + carIdentification;
    $.post(url, function (data) {
        if (data.length > 0) {
            data = data[0];
            $("#cyclePointsSpan").html(data.cyclePoints != 0 ? data.cyclePoints - 1 : 0);
            $("#breathPointsSpan").html(data.breathPoints != 0 ? data.breathPoints - 1 : 0);
            $("#abdomenPointsSpan").html(data.abdomenPoints != 0 ? data.abdomenPoints - 1 : 0);
            $("#motionPointsSpan").html(data.motionPoints != 0 ? data.motionPoints - 1 : 0);
            $("#speechPointsSpan").html(data.speechPoints != 0 ? data.speechPoints - 1 : 0);
        }
        $("form").form('load', {
            "BPH": data.BPH,
            "BPL": data.BPL,
            "P": data.P,
            "R": data.R,
            "leftEye": data.leftEye,
            "rightEye": data.rightEye,
            "general": data.general,
            "senseSchedule": data.senseSchedule,
            "kczg": data.kczg,
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
            "eyeLight": data.eyeLight,
            "arriveSpotTime": data.arrivePatientTime,
            "eeg": data.eeg,
            "sbgm": data.sbgm,
            "T": data.T
        });
    });
};

/**
 * 加载救治措施
 * @param taskCode
 * @param carIdentification
 * @param pcOrder
 */
var loadCureMeasure = function (taskCode, carIdentification, pcOrder) {
    $.post('/cases/getCureMeasure', {
        taskCode: taskCode,
        carIdentification: carIdentification,
        patientCaseOrder: pcOrder
    }, function (result) {
        cureMeasureRecord = result;
        /*初始化选中的急救措施*/
        if (cureMeasureRecord.length > 0) {
            /*全不选，初始化*/
            $("[name = cureMeasure]:checkbox").attr("checked", false);
            var boxes = document.getElementsByName("cureMeasure");
            for (var j = 0; j < boxes.length; j++) {
                for (var i = 0; i < cureMeasureRecord.length; i++) {
                    if (boxes[j].value == cureMeasureRecord[i].cureCode) {
                        boxes[j].checked = true;
                        break;
                    }
                }
            }
        } else {
            /*全不选，初始化*/
            $("[name = cureMeasure]:checkbox").attr("checked", false);
        }//end
        if (result.length > 0) { //初始化handles Span
            var handles = [];
            var handlesName = '';
            $.each(result, function (i, ob) {
                handles.push(ob.cureCode);
            });
            console.log('handles:' + handles);
            $.each(cureMeasures, function (i, ob) {
                for (var n = 0; n < handles.length; n++) {
                    if (handles[n] == ob.id) {
                        handlesName += ',' + ob.name;
                    }
                }
            });
            console.log('handlesName:' + handlesName);
            if (handlesName != '') {
                handlesName = handlesName.substr(1);
            }
            $("#handles").val('').html('<b>' + handlesName + '</b>');
            $("#handleString").val(handlesName); //赋值
            if ($("#handles").html() == '无') { //如果无标红
                $("#handles").addClass("red");
            } else {
                $("#handles").removeClass("red");
            }
        }
    });
};

/**
 * 加载用药记录
 * @param taskCode
 * @param carIdentification
 * @param pcOrder
 */
var loadMedicationRecord = function (taskCode, carIdentification, pcOrder) {
    $.post('/cases/getMedicationRecord', {
        taskCode: taskCode,
        carIdentification: carIdentification,
        patientCaseOrder: pcOrder
    }, function (result) {
        medicationsRecord = result;
        /*初始化选中的急救措施*/
        if (medicationsRecord.length > 0) {
            /*全不选，初始化*/
            $("[name = medicationRecord]:checkbox").attr("checked", false);
            var boxes = document.getElementsByName("medicationRecord");
            for (var j = 0; j < boxes.length; j++) {
                for (var i = 0; i < medicationsRecord.length; i++) {
                    if (boxes[j].value == medicationsRecord[i].medicationCode) {
                        boxes[j].checked = true;
                        break;
                    }
                }
            }
        } else {
            /*全不选，初始化*/
            $("[name = medicationRecord]:checkbox").attr("checked", false);
        }//end
        if (result.length > 0) { //初始化medications Span
            var medications = [];
            var medicationsName = '';
            $.each(medicationsRecord, function (i, ob) {
                medications.push(ob.medicationCode);
            });
            $.each(DMedications, function (i, ob) {
                for (var n = 0; n < medications.length; n++) {
                    if (medications[n] == ob.id) {
                        medicationsName += ',' + ob.name;
                    }
                }
            });
            if (medicationsName != '') {
                medicationsName = medicationsName.substr(1);
            }
            $("#medications").val('').html('<b>' + medicationsName + '</b>');
            $("#medicationString").val(medicationsName); //赋值用药记录
            if ($("#medications").html() == '无') { //如果无标红
                $("#medications").addClass("red");
            } else {
                $("#medications").removeClass("red");
            }
        }
    });
};

/**
 * 加载病情告知
 * @param taskCode
 * @param carIdentification
 * @param pcOrder
 */
var loadILLTeller = function (taskCode, carIdentification, pcOrder) {
    $.post('/cases/getILLTeller', {
        taskCode: taskCode,
        carIdentification: carIdentification,
        patientCaseOrder: pcOrder
    }, function (result) {
        if (result.length > 0) {
            /*全不选，初始化*/
            $("[name = truthTelling]:checkbox").attr("checked", false);
            var boxes = document.getElementsByName("truthTelling");
            for (var j = 0; j < boxes.length; j++) {
                for (var i = 0; i < result.length; i++) {
                    if (boxes[j].value == result[i].illTellerCode.trim()) {
                        boxes[j].checked = true;
                        if (result[i].illTellerCode.trim() == 5) { //转院
                            $("form").form('load', {
                                "stationTransfer": result[i].stationTransfer
                            });
                        }
                        if (result[i].illTellerCode.trim() == 6) { //与患者关系
                            $("form").form('load', {
                                "relation": result[i].relation
                            });
                        }
                        if (result[i].illTellerCode.trim() == 7) { //其他备注
                            $("form").form('load', {
                                "tellOthers": result[i].tellOthers
                            });
                        }
                        break;
                    }
                }
            }
        } else {
            /*全不选，初始化*/
            $("[name = truthTelling]:checkbox").attr("checked", false);
        }
    });
};
