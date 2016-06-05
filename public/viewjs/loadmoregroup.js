var nowIndex = 0;

function replaceAll(str, searchStr, replaceStr) {
    return str.split(searchStr).join(replaceStr);
}

//-----------------------------------------------------------------------
// 2) Send a http request with AJAX http://api.jquery.com/jQuery.ajax/
//-----------------------------------------------------------------------
function loadmore(divid, loadnum, url, htmlurl) {
    var div = document.getElementById(divid);
    $.ajax({
        url: url,                  //the script to call to get data          
        data: {
            start: nowIndex,
            num: loadnum
        },                        //you can insert url argumnets here to pass
        type: 'post',
        dataType: 'json',                //data format      
        success: function (groups)          //on recieve of reply
        {
            if (groups.length > 0) {
                nowIndex += groups.length;
                $.ajax({
                    url: htmlurl,                  //the script to call to get data
                    type: 'get',
                    dataType: 'text',
                    success: function (texthtml) {
                        texthtml = '\`' + texthtml + '\`';
                        texthtml = replaceAll(texthtml, '--+', '\`+');
                        texthtml = replaceAll(texthtml, '+--', '+\`');
                        groups.forEach(function (group) {
                            div.innerHTML += eval(texthtml);
                        });
                    }
                });
            }
        }
    });
}
