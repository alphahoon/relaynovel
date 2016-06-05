var div = document.getElementById("cgroup");
var nowIndex = 0;

//-----------------------------------------------------------------------
// 2) Send a http request with AJAX http://api.jquery.com/jQuery.ajax/
//-----------------------------------------------------------------------
function loadmore(loadnum, url, html) {
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
                groups.forEach(function (group) {
                    div.innerHTML += eval(html);
                });
            }
        }
    });
}