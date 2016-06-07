var nowIndexVote = 0;
function replaceAll(str, searchStr, replaceStr) {
    return str.split(searchStr).join(replaceStr);
}

//-----------------------------------------------------------------------
// 2) Send a http request with AJAX http://api.jquery.com/jQuery.ajax/
//-----------------------------------------------------------------------
function loadmoreVote(divid, loadnum, url, htmlurl, groupname) {
    var div = document.getElementById(divid);
    $.ajax({
        url: url,                  //the script to call to get data          
        data: {
            start: nowIndexVote,
            num: loadnum,
            groupname: groupname
        },                        //you can insert url argumnets here to pass
        type: 'post',
        dataType: 'json',                //data format      
        success: function (dataarray)          //on recieve of reply
        {
            if (dataarray.length > 0) {
                curnodeid = dataarray[0].NodeID;
                nowIndexVote += dataarray.length;
                $.ajax({
                    url: htmlurl,                  //the script to call to get data
                    type: 'get',
                    dataType: 'text',
                    success: function (texthtml) {
                        texthtml = '\`' + texthtml + '\`';
                        texthtml = replaceAll(texthtml, '--+', '\`+');
                        texthtml = replaceAll(texthtml, '+--', '+\`');
                        dataarray.forEach(function (data) {
                            div.innerHTML += eval(texthtml);
                        });
                    }
                });
            }
        }
    });
}
