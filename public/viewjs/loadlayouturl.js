var div1 = document.getElementById("bestgroups");
var div2 = document.getElementById("recentgroups");
var nowIndex = 0;

//-----------------------------------------------------------------------
// 2) Send a http request with AJAX http://api.jquery.com/jQuery.ajax/
//-----------------------------------------------------------------------
function loadlinks() {
    $.ajax({
        url: '/layout',                  //the script to call to get data          
        type: 'post',
        dataType: 'json',                //data format      
        success: function (groups)          //on recieve of reply
        {
        // var items = [];
        // $.each(groups[0], function(key, val) { // 배열로 저장
        //     items.push = val;
        //     alert(key + ' = ' + val);
        // });          
            for (var i=0; i<groups.length/2; i++) {
                var recent =  '<li><form id="group' + i + '" action="/group" method="get"><input type="hidden" name="groupname" value="' +groups[i]+'"/><a style="color:white" href="#" onclick="document.getElementById(\'group'+ i + '\').submit();" class="waves-effect">' + groups[i] +'</a></form></li>';
                var best =  '<li><form id="group' + (i+4) + '" action="/group" method="get"><input type="hidden" name="groupname" value="' +groups[i+4]+'"/><a style="color:white" href="#" onclick="document.getElementById(\'group'+ (i+4) + '\').submit();" class="waves-effect">' + groups[i+4] +'</a></form></li>';
                div2.innerHTML += recent;
                div1.innerHTML += best;
            }         
    //         if (groups.length > 0) {
    //             nowIndex += groups.length;
    //             groups.forEach(function (group) {
    //                 div.innerHTML += '<li class="collection-item avatar" style="padding-left:90px; padding-right:60px; text-align:left;">    <img src="'
    //                 + group.GroupImageURL + '" alt="" class="circle responsive-img" style="margin:auto; width:65px; height:65px;"> <span class="title"><strong>'
    // + group.Groupname + '</strong></span><p>Genre : '+ group.Genre + '<br>Second Line</p><a href="group?groupname=' + group.Groupname + '"class="secondary-content" style="margin:auto;"><i class="fa fa-sign-in fa-3x" aria-hidden="true"></i></a></li>';
    //             });
    //         }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
            alert("Status: " + textStatus); alert("Error: " + errorThrown); 
        }               
    });
}

