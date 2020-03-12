chrome.browserAction.onClicked.addListener(function(activeTab)
{
    var newURL = "./mailizer.html";
    chrome.tabs.create({ url: newURL });
});