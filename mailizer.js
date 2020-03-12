function fillEmails(mails){
    console.log(mails)
    html=`
    <div class="filter-container">
        <div id="portal" class="autocomplete"><input class="filter-input portal" type="text" placeholder="Portal Name"></div>
        <div id="campaign" class="autocomplete"><input class="filter-input campaign" type="text" placeholder="Campaign Name"></div>
        <div id="content" class="autocomplete"><input class="filter-input content" type="text" placeholder="Content Type"></div>
    </div>
    
    <div class='mails-container'>`;
    let portals=[];
    let campaigns=[];
    let content=[];
    let index=0;
    for(const mail of mails){
        index++;
        if(mail.Id==="NULL")
        {
            continue;
        }
        if(mail.ContentId==="EmailTemplate"){
            continue;
        }
        if(!mail.PortalName){
            mail.PortalName="";
        }
        if(!mail.CampaignName){
            mail.CampaignName="";
        }
        if(!mail.ContentId){
            mail.ContentId="";
        }
        if(!mail.LayoutContentId){
            mail.LayoutContentId="";
        }
        if(!mail.Id){
            mail.Id="";
        }
        
        mail.Content = normalizeContent(mail.Content);
        if(index===259){
            debugger;
        }
        let endHtml=placeInLayout(mail.Content,mail.LayoutContentId,mails);
        portals.push(mail.PortalName);
        campaigns.push(mail.CampaignName);
        content.push(mail.ContentId);

        html+=`
            <div class='approved qatest' data-portal-name="${mail.PortalName.toLowerCase()}" data-campaign-name="${mail.CampaignName.toLowerCase()}" data-content-id="${mail.ContentId.toLowerCase()}">
                <input type="text" style="opacity: .01;height:0;position:absolute;z-index: -1;" id="update${mail.Id}" value="qwerasdf">
                <div class="wrap-collabsible">
                    <input id="collapsible${mail.Id}${index}" class="toggle" type="checkbox">
                    <label for="collapsible${mail.Id}${index}" class="lbl-toggle">${mail.PortalName} - ${mail.CampaignName} - ${mail.ContentId} <button class="get-update-query" data-id="${mail.Id}">Get update query</button></label>
                    <div class="collapsible-content">
                        <div class="content-inner">
                            <div class="mail-info">
                                <p><b style="font-weight:bold">Portal Link</b>: <a href="${mail.HttpLink}">${mail.HttpLink}</a></p>
                                <p><b style="font-weight:bold">Description</b>: ${mail.Description}</p>
                                <p><b style="font-weight:bold">Title</b>: ${mail.Title}</p>
                            </div>
                            <div class="iframe-container">
                                <iframe id="iframe${index}"></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        mail.endHtml=endHtml;
        mail.iframeId=`iframe${index}`;
    }
    document.querySelector(".result-container").innerHTML=html;
    for(mail of mails){
        iframeElement=document.getElementById(mail.iframeId);
        if(iframeElement){
            iframeElement.src = "about:blank";
            iframeElement.contentWindow.document.open();
            iframeElement.contentWindow.document.write(mail.endHtml);
            iframeElement.contentWindow.document.close();
        }
    }
    autocomplete(document.getElementById("portal"), portals.filter(onlyUnique));
    autocomplete(document.getElementById("campaign"), campaigns.filter(onlyUnique));
    autocomplete(document.getElementById("content"), content.filter(onlyUnique));

    bindEvents();
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function placeInLayout(html,layoutId,mails){
    if(html[0]==='"'){
        html=html.substring(1,html.length);
        html=html.substring(0,html.length-1);
    }
    if(layoutId.trim()==="NULL"){
        return html;
    }
    let layout=getLayoutHtml(layoutId,mails);
    if(layout){
        if(layout[0]==='"'){
            layout=layout.substring(1,layout.length);
            layout=layout.substring(0,layout.length-1);
        }
        return layout.replace("@RenderBody()",html);
    }
    else{
        return html;
    }
}

function getLayoutHtml(layoutId,mails){
    try{
        for(mail of mails){
            if(mail.Id.trim()===layoutId.trim()){
                mail.Content = normalizeContent(mail.Content);
                return mail.Content;
            }
        }
    }
    catch{

    }
}

function normalizeContent(html){
    if(html){
        html=replaceAll(html,"|COMMA|",",");
        html=replaceAll(html,'""','"');
        return html;
    }
    else{
        return "";
    }
}

function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function csvToHtml(e){
    file=e.target.files[0];
    var reader = new FileReader();
    reader.onload = (function(reader)
        {
            return function()
            {
                let mailsJson=JSON.parse(csvJSON(reader.result));
                fillEmails(mailsJson);
            }
        })(reader);
    reader.readAsText(file);
}

function csvJSON(csv){
  var lines=handleCommas(csv);
  lines=lines.split("|ROWEND|");
  var result = [];
  var headers=lines[0].split(",");
  for(var i=1;i<lines.length;i++){

      var obj = {};
      var currentline=lines[i].split(",");

      for(var j=0;j<headers.length;j++){
          obj[headers[j].trim()] = currentline[j];
      }

      result.push(obj);

  }

  //return result; //JavaScript object
  return JSON.stringify(result); //JSON
}

function handleCommas(lines){
    let inStringStatement=false;
    let inStringStartIndex=-1;

    for(var i=0; i < lines.length-1;i++){
        if(lines[i]==='"'){
            if(lines[i-1]===",")
            {
                inStringStatement=true;
                inStringStartIndex=i;
            }
            if(inStringStatement && lines[i+1]==="," && i!=inStringStartIndex){
                inStringStatement=false;
            }
        }

        if(inStringStatement===true && lines[i]===','){
            lines=replaceAt(lines,i,"|COMMA|");
        }
        if(inStringStatement===false && lines[i]==='\n'){
            lines=replaceAt(lines,i,"|ROWEND|");
        }
    }
    return lines;
}

function replaceAt(string, index, replace) {
  return string.substring(0, index) + replace + string.substring(index + 1);
}

function filter(e){
    let portalValue=document.getElementsByClassName("portal")[0].value.toLowerCase();
    let campaignValue=document.getElementsByClassName("campaign")[0].value.toLowerCase();
    let contentValue=document.getElementsByClassName("content")[0].value.toLowerCase();
    //data-portal-name="${mail.PortalName}" data-campaign-name="${mail.CampaignName} data-content-id
    document.querySelectorAll("[data-portal-name]").forEach(e=>{
        e.style.display="none";
    })

    let filterText="";

    if(portalValue.trim().length>0){
        filterText+=`[data-portal-name*='${portalValue}']`;
    }
    if(campaignValue.trim().length>0){
        filterText+=`[data-campaign-name*='${campaignValue}']`;
    }
    if(contentValue.trim().length>0){
        filterText+=`[data-content-id*='${contentValue}']`;
    }

    console.log(filterText);

    if(filterText.length===0){
        document.querySelectorAll("[data-portal-name]").forEach(e=>{
            e.style.display="block";
        })
    }
    else{
        document.querySelectorAll(filterText).forEach(e=>{
            e.style.display="block";
        })
    }
}

function getUpdateQuery(e){
     var copyText = document.getElementById(`update${e.target.getAttribute("data-id")}`);

    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /*For mobile devices*/

    /* Copy the text inside the text field */
    document.execCommand("copy");
}

function bindEvents() {
    let fileUpload = document.getElementById("csv-upload");
    if (fileUpload) {
        fileUpload.onchange = csvToHtml;
    }

    let filterInputs = document.getElementsByClassName("filter-input");
    [].forEach.call(filterInputs, function (el) {
        el.addEventListener("input", filter);
    });

    let update = document.getElementsByClassName("get-update-query");
    [].forEach.call(update, function (el) {
        el.addEventListener("click", getUpdateQuery);
    });
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild;
}

function compare(a, b) {
    if (a.result < b.result)
        return -1;
    if (a.result > b.result)
        return 1;
    return 0;
}

bindEvents();
