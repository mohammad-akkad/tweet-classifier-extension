$(document).ready(function () {

    chrome.storage.local.get(['sexist'], function (data) {
        $('#sexistCheckbox').prop('checked', data.sexist);
    });
    chrome.storage.local.get(['racist'], function (data) {
        $('#racistCheckbox').prop('checked', data.racist);
    });


    $('[type="checkBox"]').off('change').on('change', function () {
        chrome.storage.local.set({
            sexist: $('#sexistCheckbox').prop('checked'),
            racist: $('#racistCheckbox').prop('checked')
        })
        var tabId;
        chrome.tabs.query({
            active: true,
            windowType: "normal",
            currentWindow: true
        }, function (d) {
            tabId = d[0].id;
        });

        chrome.tabs.executeScript(tabId, {
            file: '/contentScript.js'
        }, function () {
            chrome.tabs.sendMessage(tabId, {
                sexism: $('#sexistCheckbox').prop('checked'),
                racism: $('#racistCheckbox').prop('checked')
            });
        });
    });
});