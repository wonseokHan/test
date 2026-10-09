sap.ui.define([
    "sap/ui/mdc/FilterBarDelegate",
    "sap/base/i18n/ResourceBundle"
], (FilterBarDelegate, ResourceBundle) => {
    "use strict";

    const TodoFilterBarDelegate = Object.assign({}, FilterBarDelegate);

    /**
     * 필터바가 다룰 수 있는 속성 목록. key 가 OData 속성명과 같아야
     * 테이블 delegate 가 조건(conditions)을 $filter 로 변환할 수 있다.
     */
    TodoFilterBarDelegate.fetchProperties = async function () {
        const oBundle = await ResourceBundle.create({ bundleName: "ztodo.i18n.i18n", async: true });
        return [{
            key: "Todo",
            label: oBundle.getText("todo"),
            dataType: "sap.ui.model.type.String",
            maxConditions: -1
        }, {
            key: "LocalCreatedBy",
            label: oBundle.getText("createdBy"),
            dataType: "sap.ui.model.type.String",
            maxConditions: -1
        }];
    };

    return TodoFilterBarDelegate;
});
