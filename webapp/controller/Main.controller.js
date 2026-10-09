sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Messaging",
    "sap/ui/core/message/MessageType",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/base/Log"
], (Controller, JSONModel, Messaging, MessageType, MessageToast, MessageBox, Log) => {
    "use strict";

    // Table delegate payload 의 updateGroupId 와 동일해야 함.
    // '$' 로 시작하지 않는 그룹은 기본적으로 deferred(submitBatch 호출 시에만 전송)
    const UPDATE_GROUP = "todoGroup";

    // resetChanges() 로 취소된 create/delete Promise 는 canceled 에러로 reject 되므로 무시
    const ignoreCanceled = (oError) => {
        if (!oError.canceled) {
            Log.error(oError);
        }
    };

    return Controller.extend("ztodo.controller.Main", {
        onInit() {
            // JSONModel 은 화면 상태(UI state) 용도로만 사용.
            // 트랜잭션 데이터(변경/생성/삭제)는 OData V4 모델이 직접 관리한다.
            this.getView().setModel(new JSONModel({
                editMode: false,
                hasSelection: false
            }), "ui");
        },

        onEdit() {
            this._setEditMode(true);
        },

        onAdd() {
            const oBinding = this._getTable().getRowBinding();
            if (!oBinding) {
                return;
            }
            this._setEditMode(true);
            // deferred 그룹이므로 POST 는 아직 나가지 않고 transient 행으로만 추가됨
            oBinding.create({ Todo: "" }).created().catch(ignoreCanceled);
        },

        onDelete() {
            const oTable = this._getTable();
            this._setEditMode(true);
            // 바인딩의 update group(todoGroup)으로 삭제 예약 → Save 시 DELETE 전송
            oTable.getSelectedContexts().forEach((oContext) => {
                oContext.delete().catch(ignoreCanceled);
            });
            oTable.clearSelection();
            this._setHasSelection(false);
        },

        async onSave() {
            const oModel = this.getView().getModel();
            if (!oModel.hasPendingChanges(UPDATE_GROUP)) {
                this._setEditMode(false);
                return;
            }

            Messaging.removeAllMessages();
            this.getView().setBusy(true);
            try {
                // 누적된 POST/PATCH/DELETE 를 하나의 $batch(changeset)로 전송
                await oModel.submitBatch(UPDATE_GROUP);
            } finally {
                this.getView().setBusy(false);
            }

            // submitBatch 는 개별 요청이 실패해도 resolve 됨 → 메시지/잔여 변경으로 판단
            const aErrors = Messaging.getMessageModel().getData()
                .filter((oMessage) => oMessage.getType() === MessageType.Error);
            if (aErrors.length || oModel.hasPendingChanges(UPDATE_GROUP)) {
                MessageBox.error(aErrors[0]?.getMessage() ?? this._getText("saveError"));
                return;
            }

            MessageToast.show(this._getText("saveSuccess"));
            this._setEditMode(false);
        },

        onCancel() {
            // 그룹 단위로 모든 미저장 변경을 되돌림 (transient 행 제거, 삭제 예약 복원 포함)
            this.getView().getModel().resetChanges(UPDATE_GROUP);
            Messaging.removeAllMessages();
            this._setEditMode(false);
        },

        onSelectionChange() {
            this._setHasSelection(this._getTable().getSelectedContexts().length > 0);
        },

        _getTable() {
            return this.byId("todoTable");
        },

        _setEditMode(bEditMode) {
            this.getView().getModel("ui").setProperty("/editMode", bEditMode);
        },

        _setHasSelection(bHasSelection) {
            this.getView().getModel("ui").setProperty("/hasSelection", bHasSelection);
        },

        _getText(sKey, aArgs) {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey, aArgs);
        }
    });
});
