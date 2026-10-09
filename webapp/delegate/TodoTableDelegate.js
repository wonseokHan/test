sap.ui.define([
    "sap/ui/mdc/odata/v4/TableDelegate",
    "sap/ui/mdc/table/Column",
    "sap/m/Input",
    "sap/m/Text",
    "sap/base/i18n/ResourceBundle"
], (ODataTableDelegate, Column, Input, Text, ResourceBundle) => {
    "use strict";

    const TodoTableDelegate = Object.assign({}, ODataTableDelegate);

    /**
     * 테이블이 알고 있는 속성 목록 (p13n 의 컬럼/정렬 대화상자에 사용됨).
     */
    TodoTableDelegate.fetchProperties = async function () {
        const oBundle = await ResourceBundle.create({ bundleName: "ztodo.i18n.i18n", async: true });
        return [{
            key: "Todo",
            path: "Todo",
            label: oBundle.getText("todo"),
            dataType: "sap.ui.model.odata.type.String",
            sortable: true,
            filterable: true
        }, {
            key: "LocalCreatedBy",
            path: "LocalCreatedBy",
            label: oBundle.getText("createdBy"),
            dataType: "sap.ui.model.odata.type.String",
            sortable: true,
            filterable: true
        }, {
            key: "LocalCreatedAt",
            path: "LocalCreatedAt",
            label: oBundle.getText("createdAt"),
            dataType: "sap.ui.model.odata.type.DateTimeOffset",
            sortable: true,
            filterable: true
        }, {
            key: "LocalLastChangedAt",
            path: "LocalLastChangedAt",
            label: oBundle.getText("changedAt"),
            dataType: "sap.ui.model.odata.type.DateTimeOffset",
            sortable: true,
            filterable: true
        }];
    };

    /**
     * 사용자가 p13n 대화상자에서 (XML 에 없는) 컬럼을 다시 추가할 때 호출됨.
     */
    TodoTableDelegate.addItem = async function (oTable, sPropertyKey) {
        const aProperties = await this.fetchProperties(oTable);
        const oProperty = aProperties.find((oProp) => oProp.key === sPropertyKey);
        const oTemplate = sPropertyKey === "Todo"
            ? new Input({ value: "{Todo}", editable: "{ui>/editMode}" })
            : new Text({ text: "{" + oProperty.path + "}" });

        return new Column(oTable.getId() + "--col-" + sPropertyKey, {
            propertyKey: sPropertyKey,
            header: oProperty.label,
            template: oTemplate
        });
    };

    /**
     * 테이블이 rows 를 바인딩하기 직전에 호출됨.
     * 필터바 조건/정렬은 기본 delegate 가 채워주고, 여기선 경로와 V4 파라미터만 추가.
     */
    TodoTableDelegate.updateBindingInfo = function (oTable, oBindingInfo) {
        ODataTableDelegate.updateBindingInfo.apply(this, arguments);

        const oPayload = oTable.getPayload();
        oBindingInfo.path = oPayload.collectionPath;
        oBindingInfo.parameters = Object.assign({}, oBindingInfo.parameters, {
            $count: true,
            // 이 바인딩에서 발생하는 모든 변경을 deferred 그룹에 모음 → Save 시 일괄 전송
            $$updateGroupId: oPayload.updateGroupId
        });
    };

    return TodoTableDelegate;
});
