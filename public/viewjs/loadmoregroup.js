var div = document.getElementById("cgroup");
var nowIndex = 0;

//-----------------------------------------------------------------------
// 2) Send a http request with AJAX http://api.jquery.com/jQuery.ajax/
//-----------------------------------------------------------------------
function loadmore(loadnum) {
    $.ajax({
        url: '/joinable',                  //the script to call to get data          
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
                    div.innerHTML += '<li class="collection-item avatar" style="padding-left:90px; padding-right:60px; text-align:left;"> <img src="'
                    + group.GroupImageURL + '" alt="" class="circle responsive-img" style="margin:auto; width:65px; height:65px;"> <span class="title"><strong>'
    + group.Groupname + '</strong></span><p>Genre : '+ group.Genre + '<br>Second Line</p><a href="group?groupname=' + group.Groupname + '"class="secondary-content" style="margin:auto;"><i class="fa fa-sign-in fa-3x" aria-hidden="true"></i></a></li>';
                });
            }
        }
    });
}