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
                    div.innerHTML += `
<li class="collection-item avatar">
    <img src="`+ group.GroupImageURL + `" alt="" class="circle">
    <span class="title">`+ group.Groupname + `</span>
    <p>
    Genre : `+ group.Genre + `
    <br>
    Second Line
    </p>
    <a href="#!" class="secondary-content"><i class="medium material-icons">view_module</i></a>
</li>
`;
                });
            }
        }
    });
}

