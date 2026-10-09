/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["ztodo/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
