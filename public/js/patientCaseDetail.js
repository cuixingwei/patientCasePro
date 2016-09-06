/**
 * Created by Dell on 2016/5/1.
 */

/*添加用药项*/
var addMedication = function () {
    if (page == 'add') {
        if (flag != 1) {
            $.messager.alert('提示', '请先添加病历,然后在添加用药信息!', 'info');
        } else {
            var data = $('#medicationMethod').combobox('getData');
            if (data.length > 0) {
                $('#medicationMethod').combobox('setValue', data[0].id);
            }
            $('#medicationName').combobox('setText', '');
            addMedicationFlag = 1;
        }
    } else {
        var data = $('#medicationMethod').combobox('getData');
        if (data.length > 0) {
            $('#medicationMethod').combobox('setValue', data[0].id);
        }
        $('#medicationName').combobox('setText', '');
        addMedicationFlag = 1;
    }

};
/*保存用药项*/
var saveMedication = function () {
    if (page == 'add') {
        pcOrder = parseInt(caseNumbers) + 1;
    }
    if (addMedicationFlag == 1) {
        $.post('/cases/addMedication', {
            "taskCode": taskCode,
            "carIdentification": carIdentification,
            "patientCaseOrder": pcOrder,
            "medicationMethod": $("#medicationMethod").combobox('getValue'),
            "medicationName": $("#medicationName").combobox('getText'),
            "medicationString": $("#medicationString").val()
        }, function (data) {
            if (data.flag == 1) {
                /*加载用药记录列表*/
                medicationListGrid.datagrid('load', {
                    "pcOrder": pcOrder
                });
                addMedicationFlag = 0;
            } else if (data.flag == 2) {
                addMedicationFlag = 0;
                $.messager.alert('提示', '添加用药记录失败!', 'info');
            } else {
                $.messager.alert('警告', '登录超时，请重新登录!', 'info', function (r) {
                    window.location.href = "/";
                });
            }
        });
    } else {
        $.messager.alert('提示', '请先点击添加!', 'info');
    }
};
/*删除用药记录项*/
var deleteMedication = function () {
    if (page == 'add') {
        pcOrder = parseInt(caseNumbers) + 1;
    }
    if (medicationRecordID == -1) {
        $.messager.alert('提示', '请选择你要删除的记录!', 'info');
    } else {
        $.messager.alert('警告', '你确定要删除该条记录嘛!', 'info', function (r) {
            $.post('/cases/deleteMedication', {
                "medicationRecordID": medicationRecordID,
                "taskCode": taskCode,
                "carIdentification": carIdentification,
                "patientCaseOrder": pcOrder,
                "medicationString": $("#medicationString").val()
            }, function (data) {
                if (data.flag == 1) {
                    /*加载用药记录项*/
                    pcOrder = parseInt(caseNumbers) + 1;
                    medicationListGrid.datagrid('load');
                } else {
                    $.messager.alert('提示', '删除用药记录项失败!', 'info');
                    medicationRecordID = -1;
                }
            });
        });
    }
};
var init = function () {
    /*用药记录对话框初始化*/
    $('#medication_window').show().dialog({
        modal: true,
        closable: true,
        buttons: [{
            text: '关闭',
            left: true,
            handler: function () {
                $('#medication_window').dialog('close');
            }
        }],
        onOpen: function () {
            /*用药列表*/
            medicationListGrid = $('#medicationList').datagrid(
                {
                    url: '/cases/getMedicationRecord?taskCode=' + taskCode + '&carIdentification=' + carIdentification + '&patientCaseOrder=' + pcOrder,
                    pagePosition: 'bottom',
                    pagination: true,
                    striped: true,
                    singleSelect: true,
                    rownumbers: true,
                    idField: 'acceptTime',
                    pageSize: 20,
                    pageList: [10, 20, 30, 40, 50, 100, 200, 300, 400, 500],
                    columns: [[{
                        field: 'method',
                        title: '用药方式',
                        width: "35%",
                        align: 'center'
                    }, {
                        field: 'medication',
                        title: '药物名称',
                        width: "64%",
                        align: 'center'
                    }]],
                    onLoadSuccess: function (data) {
                        var str = "";
                        if (data.rows.length > 0) {
                            $("#medicationMethod").combobox('setValue', data.rows[0].method);
                            $("#medicationName").combobox('setText', data.rows[0].medication);
                            medicationRecordID = data.rows[0].ID;
                            medicationListGrid.datagrid('selectRow', 0);//光标指向第一个
                            for (var i = 0; i < data.rows.length; i++) {
                                str += "," + data.rows[i].medication;
                            }
                            $("#medications").html(str.substr(1)).removeClass("red");
                            $("#medicationString").val(str.substr(1));
                        } else {
                            medicationRecordID = -1;
                            $("#medicationName").val('');
                            $("#medicationMethod").combobox('setValue', 1);
                            $("#medications").html('无').addClass("red");
                        }

                    },
                    onClickRow: function (rowIndex, rowData) {
                        $("#medicationMethod").combobox('setValue', rowData.method);
                        $("#medicationName").combobox('setText', rowData.medication);
                        addMedicationFlag = 0;
                        medicationRecordID = rowData.ID;
                    }
                });
        }
    }).dialog('close');

    /*点击用药*/
    $("#medicationBtn").click(function () {
        $('#medication_window').dialog('open');
    });

    $("#currentTime").html(getCurrentTime()); //填写时间
    /*用药方式*/
    $('#medicationMethod').combobox({
        url: '/dictionary/getDMedicationMethod',
        valueField: 'id',
        textField: 'name',
        panelHeight: 'auto',
        method: 'get',
        editable: false,
        onLoadSuccess: function (data) {
            if (data) {
                $('#medicationMethod').combobox('setValue', data[0].id);
            }
        }
    });

    /*用药历史*/
    $('#medicationName').combobox({
        url: '/dictionary/getMedicineHistory',
        valueField: 'id',
        textField: 'name',
        panelHeight: 'auto',
        method: 'get'
    });
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
    /*告知人签名--医生*/
    $('#tellerSign').combobox({
        url: '/dictionary/getPerson?personType=7',
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
                var sCode = isBlankOrEmpty(stationCode) ? '999' : stationCode;
                $('#station').combobox('setValue', sCode);
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
            if (page == 'add') {
                $("#aidAddr").val(data.localAddr);
                $("#linkPhone").val(data.linkPhone);
                $("#arrivePatientTime").datetimebox('setValue', data.arriveSpotTime);
                if (data.outCarTime != '') {
                    currentTime = data.outCarTime.split(' ')[0];
                }
                $("#yearMonthSpan").html(currentTime.split('-')[0] + currentTime.split('-')[1] + currentTime.split('-')[2]);
            }
            $("form").form('load', {
                "arriveSpotTime": data.arriveSpotTime,
                "outCarTime": data.outCarTime,
                "leaveSpotTime": data.leaveSpotTime,
                "returnHospitalTime": data.returnHospitalTime
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
    $('#tellerSign').combobox('setValue', $('#tellerSign').combobox('getText'));
    if ($('#doctor').combobox('getText') == "--请选择--" || $('#nurse').combobox('getText') == "--请选择--" || $('#driver').combobox('getText') == "--请选择--") {
        $.messager.alert('提示', '请选择司机、医生、护士后再进行保存操作!', 'info');
    } else if ($("#patientCode").val() == '') {
        $.messager.alert('提示', '病历编码不能为空', 'info');
    } else if ($("#patientName").val() == '' || $('#age').combobox('getText') == '') {
        $.messager.alert('提示', '病人姓名年龄不能为空', 'info');
    } else {
        if (page == "add") {//添加病历
            if (flag == 1) {
                $.messager.alert('提示', '你已经添加过该病例,请不要重复添加!', 'info');
            } else {
                var url;
                url = '/cases/addPatientCase?taskCode=' + taskCode + ' &taskOrder= ' + taskOrder + ' &caseNumbers= ' + caseNumbers + ' &carCode= ' + carCode + ' &carIdentification= ' + carIdentification + '&stationCode=' + stationCode;
                $.post(url, cxw.serializeObject($('form')), function (data) {
                    if (data.flag == 1) {
                        $.cookie("refresh", "1");
                        flag = 1;
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

        } else if (page == "edit") {//编辑病历
            var url = '/cases/editPatientCase?taskCode=' + taskCode + ' &patientCaseOrder= ' + pcOrder + ' &carIdentification= ' + carIdentification + ' &taskOrder= ' + taskOrder;
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
            $("#currentTime").html(data.recordTime);
            $("#usernameSpan").html(data.caseWriter);
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
            "treatResultCode": data.treatResultCode,
            "patientCooperation": data.patientCooperation,
            "localAddrType": data.localAddrTypeCode,
            "toAddrType": data.toAddrTypeCode,
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
            "responsiblePersonSign": data.responsiblePersonSign,
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
            if (data.T == '未查') {
                $("#noCheck").attr("checked", true);
            } else {
                $("#T").val(data.T);
            }
        }
        $("form").form('load', {
            "BPH": data.BPH,
            "BPL": data.BPL,
            "P": data.P,
            "T": data.T,
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
            "arrivePatientTime": data.arrivePatientTime,
            "eeg": data.eeg,
            "sbgm": data.sbgm,
            "checkTime": data.checkTime,
            "checkResult": data.checkResult
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
